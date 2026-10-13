const defaultImageFolder = "portfolio/images";
const emptyPayloadHash = "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855";

const config = {
  accountId: import.meta.env.VITE_CLOUDFLARE_ACCOUNT_ID || "",
  bucketName: import.meta.env.VITE_CLOUDFLARE_R2_BUCKET_NAME || "",
  accessKeyId: import.meta.env.VITE_CLOUDFLARE_R2_ACCESS_KEY_ID || "",
  secretAccessKey: import.meta.env.VITE_CLOUDFLARE_R2_SECRET_ACCESS_KEY || "",
  publicBaseUrl: (import.meta.env.VITE_CLOUDFLARE_R2_PUBLIC_URL || "").replace(/\/$/, ""),
  imageFolder: import.meta.env.VITE_CLOUDFLARE_R2_IMAGE_FOLDER || defaultImageFolder,
};

const region = "auto";
const service = "s3";
const unsignedPayload = "UNSIGNED-PAYLOAD";

const toHex = (buffer) =>
  Array.from(new Uint8Array(buffer))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");

const encodePathPart = (value) =>
  value
    .split("/")
    .map((part) => encodeURIComponent(part))
    .join("/");

const hmac = async (key, value) => {
  const cryptoKey = await crypto.subtle.importKey(
    "raw",
    typeof key === "string" ? new TextEncoder().encode(key) : key,
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );

  return crypto.subtle.sign("HMAC", cryptoKey, new TextEncoder().encode(value));
};

const sha256 = async (value) => {
  const data = typeof value === "string" ? new TextEncoder().encode(value) : value;
  return toHex(await crypto.subtle.digest("SHA-256", data));
};

const ensureConfigured = () => {
  const missing = [
    !config.accountId && import.meta.env.VITE_CLOUDFLARE_ACCOUNT_ID,
    !config.bucketName && import.meta.env.VITE_CLOUDFLARE_R2_BUCKET_NAME,
    !config.accessKeyId && import.meta.env.VITE_CLOUDFLARE_R2_ACCESS_KEY_ID,
    !config.secretAccessKey && import.meta.env.VITE_CLOUDFLARE_R2_SECRET_ACCESS_KEY,
  ].filter(Boolean);

  if (missing.length > 0) {
    throw new Error(`Cloudflare R2 is missing configuration: ${missing.join(", ")}`);
  }
};

const getSigningKey = async (dateStamp) => {
  const dateKey = await hmac(`AWS4${config.secretAccessKey}`, dateStamp);
  const regionKey = await hmac(dateKey, region);
  const serviceKey = await hmac(regionKey, service);
  return hmac(serviceKey, "aws4_request");
};

const getAmzDate = (date = new Date()) => {
  const iso = date.toISOString().replace(/[:-]|\.\d{3}/g, "");
  return {
    amzDate: iso,
    dateStamp: iso.slice(0, 8),
  };
};

const signRequest = async ({ method, objectPath = "", queryString = "", headers = {}, payloadHash = emptyPayloadHash }) => {
  ensureConfigured();

  const { amzDate, dateStamp } = getAmzDate();
  const host = `${config.accountId}.r2.cloudflarestorage.com`;
  const canonicalUri = `/${encodeURIComponent(config.bucketName)}${objectPath ? `/${encodePathPart(objectPath)}` : ""}`;
  const requestHeaders = {
    host,
    "x-amz-content-sha256": payloadHash,
    "x-amz-date": amzDate,
    ...headers,
  };
  const sortedHeaderKeys = Object.keys(requestHeaders).map((key) => key.toLowerCase()).sort();
  const canonicalHeaders = sortedHeaderKeys.map((key) => `${key}:${String(requestHeaders[key]).trim()}`).join("\n");
  const signedHeaders = sortedHeaderKeys.join(";");
  const canonicalRequest = [method, canonicalUri, queryString, canonicalHeaders, "", signedHeaders, payloadHash].join("\n");
  const credentialScope = `${dateStamp}/${region}/${service}/aws4_request`;
  const stringToSign = ["AWS4-HMAC-SHA256", amzDate, credentialScope, await sha256(canonicalRequest)].join("\n");
  const signature = toHex(await hmac(await getSigningKey(dateStamp), stringToSign));

  return {
    url: `https://${host}${canonicalUri}${queryString ? `?${queryString}` : ""}`,
    headers: {
      ...headers,
      "x-amz-content-sha256": payloadHash,
      "x-amz-date": amzDate,
      Authorization: `AWS4-HMAC-SHA256 Credential=${config.accessKeyId}/${credentialScope}, SignedHeaders=${signedHeaders}, Signature=${signature}`,
    },
  };
};

export const cloudflareStorage = {
  config,
  imageFolder: config.imageFolder,

  getPublicUrl(path) {
    if (!path) return "";
    if (/^(https?:|data:|blob:)/i.test(path)) return path;
    if (!config.publicBaseUrl) return path;
    return `${config.publicBaseUrl}/${encodePathPart(path)}`;
  },

  async uploadFile(file, path) {
    const { url, headers } = await signRequest({
      method: "PUT",
      objectPath: path,
      headers: { "content-type": file.type || "application/octet-stream" },
      payloadHash: unsignedPayload,
    });
    const response = await fetch(url, { method: "PUT", headers, body: file });

    if (!response.ok) {
      throw new Error(`Cloudflare R2 upload failed with ${response.status}: ${await response.text()}`);
    }

    return this.getPublicUrl(path);
  },

  async listImages(prefix = config.imageFolder) {
    const queryString = new URLSearchParams({
      "list-type": "2",
      prefix: prefix.endsWith("/") ? prefix : `${prefix}/`,
    }).toString();
    const { url, headers } = await signRequest({ method: "GET", queryString });
    const response = await fetch(url, { headers });

    if (!response.ok) {
      throw new Error(`Cloudflare R2 list failed with ${response.status}: ${await response.text()}`);
    }

    const document = new DOMParser().parseFromString(await response.text(), "application/xml");
    return Array.from(document.querySelectorAll("Contents"))
      .map((node) => node.querySelector("Key")?.textContent || "")
      .filter(Boolean);
  },
};
