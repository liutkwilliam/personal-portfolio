import { auth, db, waitForAuthenticatedUser } from "../config/firebase";
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  limit,
  query,
  serverTimestamp,
  updateDoc,
  where,
} from "firebase/firestore";
import { cloudflareStorage } from "../config/cloudflareStorage";

const portfolioCollectionName = "items";
const portfolioCollection = collection(db, portfolioCollectionName);
const storageImageFolder = cloudflareStorage.imageFolder;
const urlPattern = /^(https?:|data:|blob:)/i;

export const categoryOptions = [
  { label: "Design", value: "Design", path: "/portfolio" },
  { label: "Developer", value: "Developer", path: "/developer" },
  { label: "Photography", value: "Photography", path: "/photography" },
];

const getDocumentData = (document) => ({
  id: document.id,
  ...document.data(),
});

const getStorageUrl = async (value) => {
  if (!value || typeof value !== "string" || urlPattern.test(value)) return value || "";
  return cloudflareStorage.getPublicUrl(value);
};

const resolveImageRecord = async (image) => {
  if (typeof image === "string") {
    return { url: await getStorageUrl(image) };
  }

  if (!image) return null;

  const storagePath = image.storagePath || image.fullPath || image.path || image.image_path || image.url;

  return {
    ...image,
    storagePath: image.storagePath || image.fullPath || image.path || "",
    url: await getStorageUrl(storagePath),
  };
};

const resolveStorageUrls = async (item) => {
  const savedImages = Array.isArray(item.images) && item.images.length > 0
    ? item.images
    : Array.isArray(item.imageUrls)
      ? item.imageUrls
      : [];
  const images = (await Promise.all(savedImages.map(resolveImageRecord))).filter(Boolean);
  const coverImageUrl = await getStorageUrl(item.coverImageUrl || item.coverImagePath || images[0]?.url);

  return {
    ...item,
    coverImageUrl,
    imageUrls: images.map((image) => image.url).filter(Boolean),
    images,
  };
};

const sortByNewestDate = (first, second) =>
  (second.date?.getTime?.() || getPortfolioItemDate(second)?.getTime() || 0) -
  (first.date?.getTime?.() || getPortfolioItemDate(first)?.getTime() || 0);

const getStoredDateMillis = (item) =>
  item?.updatedAt?.toMillis?.() ?? item?.createdAt?.toMillis?.() ?? getPortfolioItemDate(item)?.getTime() ?? 0;

const getStorageImageName = (path = "") => decodeURIComponent(path.split("/").pop() || path);

const sanitizeFileName = (fileName = "") => fileName.replace(/[^a-zA-Z0-9._-]/g, "-");

export const getPortfolioItemDate = (item) => {
  const value = item?.date || item?.updatedAt || item?.createdAt;
  if (!value) return null;

  const date = typeof value.toDate === "function" ? value.toDate() : new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
};

export const getPortfolioItemType = (item) => {
  if (item?.categoryPath === "/portfolio" || item?.category === "Design") return "portfolio";
  if (item?.categoryPath === "/developer" || item?.category === "Developer") return "developer";
  return "portfolio";
};

export const getPortfolioItemSlug = (item) => item?.slug || item?.id;

export const getPhotoId = (prefix, value) => {
  const uniqueId = typeof crypto !== "undefined" && crypto.randomUUID
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(36).slice(2)}`;

  return `${prefix}-${uniqueId}-${value}`;
};

export const getExistingPhotos = (images = [], imageUrls = []) => {
  const savedImages = Array.isArray(images) && images.length > 0
    ? images
    : imageUrls.map((url) => ({ url }));

  return savedImages
    .map((image, index) => {
      const url = typeof image === "string" ? image : image?.url || image?.image_path;
      if (!url) return null;

      return {
        id: getPhotoId("existing", index),
        previewUrl: url,
        url,
        alt: image?.alt || `Existing photo ${index + 1}`,
        description: image?.description || image?.caption || image?.title || "",
      };
    })
    .filter(Boolean);
};

export const formatStoredDate = (value) => {
  const date = getPortfolioItemDate({ date: value });
  if (!date) return "N/A";

  const pad = (number) => String(number).padStart(2, "0");
  return [
    pad(date.getDate()),
    pad(date.getMonth() + 1),
    String(date.getFullYear()).slice(-2),
  ].join("/") + ` ${pad(date.getHours())}:${pad(date.getMinutes())}`;
};

export const normalizePortfolioItem = (item) => {
  const type = getPortfolioItemType(item);
  const basePath = type === "gallery" ? "/photography" : `/${type}`;
  const date = getPortfolioItemDate(item);
  const savedImages = Array.isArray(item.images) && item.images.length > 0
    ? item.images
    : (Array.isArray(item.imageUrls) ? item.imageUrls : []).map((url) => ({ url }));
  const images = savedImages
    .map((image) => {
      const imagePath = typeof image === "string" ? image : image?.url || image?.image_path;
      if (!imagePath) return null;

      return {
        image_path: imagePath,
        isExternal: true,
        title: image?.description || image?.caption || image?.title || "",
      };
    })
    .filter(Boolean);
  const slug = getPortfolioItemSlug(item);

  return {
    ...item,
    type,
    slug,
    date,
    description: item.shortDescription || item.description || "",
    categories: item.category ? [item.category] : [],
    images,
    content: item.content || "",
    coverImage: item.coverImageUrl || images[0]?.image_path || "",
    href: item.entryUrl || `${basePath}/${slug}`,
    hidden: item.hidden === true,
  };
};

const fetchProjectsByType = async (type, { includeHidden = false } = {}) => {
  const items = await fetchPortfolio();

  return items
    .filter((item) => getPortfolioItemType(item) === type)
    .map(normalizePortfolioItem)
    .filter((item) => includeHidden || !item.hidden)
    .sort(sortByNewestDate);
};

export const fetchPortfolioProjects = (options) => fetchProjectsByType("portfolio", options);
export const fetchDeveloperProjects = (options) => fetchProjectsByType("developer", options);
export const fetchAllEntries = async (options) => {
  const items = await fetchPortfolio();

  return items
    .map(normalizePortfolioItem)
    .filter((item) => options?.includeHidden || !item.hidden)
    .sort(sortByNewestDate);
};

// fetch portfolios
export const fetchPortfolio = async () => {
  const snapshot = await getDocs(portfolioCollection);
  const items = snapshot.docs.map(getDocumentData);

  const resolvedItems = await Promise.all(items.map(resolveStorageUrls));
  return resolvedItems.sort((first, second) => getStoredDateMillis(second) - getStoredDateMillis(first));
};

// create portfolio entry
export const addPortfolioItem = async (data) => {
  const document = await addDoc(portfolioCollection, {
    ...data,
    createdAt: data.createdAt || serverTimestamp(),
    updatedAt: data.updatedAt || serverTimestamp(),
  });
  return document.id;
};

export const fetchPortfolioItem = async (id) => {
  const portfolioDocument = doc(db, portfolioCollectionName, id);
  const snapshot = await getDoc(portfolioDocument);

  if (!snapshot.exists()) return null;

  return resolveStorageUrls(getDocumentData(snapshot));
};

export const fetchPortfolioItemBySlug = async (slug) => {
  const portfolioQuery = query(portfolioCollection, where("slug", "==", slug), limit(1));
  const snapshot = await getDocs(portfolioQuery);

  if (!snapshot.empty) {
    return resolveStorageUrls(getDocumentData(snapshot.docs[0]));
  }

  return fetchPortfolioItem(slug);
};

// update portfolio entry
export const updatePortfolioItem = async (id, data) => {
  const portfolioDocument = doc(db, portfolioCollectionName, id);
  await updateDoc(portfolioDocument, {
    ...data,
    updatedAt: data.updatedAt || serverTimestamp(),
  });
};

// delete portfolio entry
export const deletePortfolioItem = async (id) => {
  const portfolioDocument = doc(db, portfolioCollectionName, id);
  await deleteDoc(portfolioDocument);
};

export const loadStorageImages = async () => {
  await waitForAuthenticatedUser();

  try {
    const paths = await cloudflareStorage.listImages(storageImageFolder);
    return paths.map((path) => ({
      id: path,
      name: getStorageImageName(path),
      path,
      url: cloudflareStorage.getPublicUrl(path),
    }));
  } catch (error) {
    error.storagePath = storageImageFolder;
    throw error;
  }
};

export const getStorageErrorMessage = (error) => {
  const debugInfo = {
    storageBucket: cloudflareStorage.config.bucketName,
    currentUser: auth.currentUser
      ? {
        uid: auth.currentUser.uid,
        email: auth.currentUser.email,
      }
      : null,
  };
  const details = [
    error?.code && `code: ${error.code}`,
    error?.storagePath && `path: ${error.storagePath}`,
    debugInfo.storageBucket && `bucket: ${debugInfo.storageBucket}`,
    debugInfo.currentUser?.email && `user: ${debugInfo.currentUser.email}`,
    error?.serverResponse && `server: ${error.serverResponse}`,
  ]
    .filter(Boolean)
    .join(" | ");

  if (error?.code === "storage/unauthorized") return `Cloudflare R2 denied access. ${details}`;

  if (error?.message) return details ? `${error.message} ${details}` : error.message;

  return details ? `Cloudflare R2 could not be accessed. ${details}` : "Cloudflare R2 could not be accessed. Please try again.";
};

export const uploadPortfolioFile = async (file, index = 0, onProgress) => {
  await waitForAuthenticatedUser();

  const storagePath = `${storageImageFolder}/${Date.now()}_${index}_${sanitizeFileName(file.name)}`;
  const downloadUrl = await cloudflareStorage.uploadFile(file, storagePath);
  onProgress?.(100);
  return downloadUrl;
};

export const uploadPortfolioImages = async (photos, onProgress) => {
  const uploadPromises = photos.map(async (photo, index) => {
    const imageUrl = photo.url || await uploadPortfolioFile(photo.file, index, onProgress);

    return {
      url: imageUrl,
      description: (photo.description || "").trim(),
    };
  });

  return Promise.all(uploadPromises);
};

export const buildPortfolioItemData = ({
  title,
  description,
  category,
  live,
  date,
  slug,
  content,
  tags,
  coverImageUrl,
  images,
}) => ({
  title: title.trim(),
  description: description.trim(),
  category: category.trim(),
  live: live === true,
  date: date.trim(),
  slug: slug.trim(),
  content: content.trim(),
  tags,
  coverImageUrl,
  imageUrls: images.map((image) => image.url),
  images,
});

export const savePortfolioItem = async ({ id, itemData }) => {
  if (id) {
    await updatePortfolioItem(id, itemData);
    return id;
  }

  return addPortfolioItem(itemData);
};

export const portfolioProjects = [];
export const developerProjects = [];
export const galleryProjects = [];
export const blogPosts = [];
export const allEntries = [];
export const visiblePortfolioProjects = [];
export const visibleDeveloperProjects = [];
