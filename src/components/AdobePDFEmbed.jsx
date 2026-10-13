import React, { useEffect, useRef } from "react";

export const AdobePDFEmbed = ({ url, fileName = "Document.pdf" }) => {
  const containerRef = useRef(null);

  useEffect(() => {
    // Generate a unique ID to avoid collision if multiple PDFs are on the page
    const viewId = `adobe-pdf-view-${Math.random().toString(36).substr(2, 9)}`;
    if (containerRef.current) {
      containerRef.current.id = viewId;
    }

    const loadAdobeViewer = () => {
      if (window.AdobeDC) {
        const adobeDCView = new window.AdobeDC.View({
          clientId: "YOUR_ADOBE_CLIENT_ID", // ⚠️ Replace with your Client ID
          divId: viewId,
        });
        
        adobeDCView.previewFile({
          content: { location: { url: url } },
          metaData: { fileName: fileName }
        }, {
          embedMode: "SIZED_CONTAINER",
          showAnnotationTools: false,
          showLeftHandPanel: false
        });
      }
    };

    // 1. Check if the global script is already loaded
    if (window.AdobeDC) {
      loadAdobeViewer();
    } else {
      // 2. Wait for Adobe's initialization event if script is still loading
      document.addEventListener("adobe_dc_view_sdk.ready", loadAdobeViewer);
    }

    return () => {
      document.removeEventListener("adobe_dc_view_sdk.ready", loadAdobeViewer);
    };
  }, [url, fileName]);

  return (
    <div 
      ref={containerRef} 
      style={{ width: "100%", height: "600px", margin: "20px 0" }} 
    />
  );
};
