import React, { useState, useEffect, useCallback } from "react";
import Button from "./Button";

interface Project {
  id: string;
  title: string;
  role: string;
  summary: string;
  techStack: string[];
  liveUrl?: string;
  githubUrl?: string;
  imageUrl: string;
  projectUrl?: string;
}

const PROJECTS: Project = {
  id: "photo-gallery",
  title: "Photography Gallery Web App",
  role: "Full Stack Developer",
  summary:
    "High-performance interactive photography archive featuring client-side EXIF metadata parsing, dynamic filtering, and interactive Leaflet map markers.",
  techStack: ["Next.js", "TypeScript", "Leaflet", "exifr", "REST APIs"],
  liveUrl: "https://photography-gallery-william-liu.vercel.app/",
  projectUrl: "/developer/photography-gallery-web-app",
  imageUrl:
    "https://pub-aa4aef0e7c174ddcbb741f264c1229da.r2.dev/portfolio/images/1792470887345_cover_photography-gallery-webapp-mockup.jpg",
};

export default function FeaturedProject() {
  return (
    <section className="relative w-full overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-sm p-4 grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-8">
      <div>
        <p className="text-xl font-bold text-neutral-900">{PROJECTS.title}</p>
        <p className="text-sm font-semibold uppercasetext-neutral-500">
          {PROJECTS.role}
        </p>

        <p className="text-base leading-relaxed py-2">{PROJECTS.summary}</p>

        {/* Tech Stack Pills */}
        <ul
          className="flex flex-wrap gap-2 py-2"
          aria-label="Technologies used"
        >
          {PROJECTS.techStack.map((tech) => (
            <li
              key={tech}
              className="rounded-full bg-neutral-100 px-3 py-1 text-sm font-medium text-neutral-700"
            >
              {tech}
            </li>
          ))}
        </ul>
        {/* Action Links */}
        <div className="flex gap-2 pt-2">
          {PROJECTS.liveUrl && (
            <Button
              size="md"
              target="_blank"
              href={PROJECTS.liveUrl}
              content="Live Demo"
              children={undefined}
              to={undefined}
            />
          )}
          {PROJECTS.githubUrl && (
            <Button
              size="md"
              target="_blank"
              href={PROJECTS.githubUrl}
              variant="secondary"
              content="GitHub Repo"
              children={undefined}
              to={undefined}
            />
          )}
          {PROJECTS.projectUrl && (
            <Button
              size="md"
              target="_blank"
              href={PROJECTS.projectUrl}
              variant="secondary"
              content="Project Site"
              children={undefined}
              to={undefined}
            />
          )}
        </div>
      </div>
      {/* Project Preview Image */}
      <div className="relative w-full overflow-hidden rounded-xl">
        <img
          src={PROJECTS.imageUrl}
          alt={`${PROJECTS.title} interface preview`}
          className="h-full w-full object-cover"
          loading="lazy"
        />
      </div>
    </section>
  );
}
