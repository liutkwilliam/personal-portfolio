import React from "react";

const PhotoGallery = ({ images = [] }) => (
  <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
    <h2 className="text-2xl font-bold mb-6 text-center">Photo Gallery</h2>
    <div
      className="
        columns-1
        sm:columns-2
        md:columns-3
        gap-4
        [column-gap:1rem]
      "
    >
      {images.map((src, index) => (
        <div
          key={index}
          className="break-inside-avoid overflow-hidden rounded-lg shadow-lg"
        >
          <img
            src={src}
            alt={`Gallery image ${index + 1}`}
            className="w-full object-cover transition-transform duration-300 hover:scale-105"
            style={{ display: "block" }}
          />
        </div>
      ))}
    </div>
  </div>
);

export default PhotoGallery;
