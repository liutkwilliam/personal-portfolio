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

const PROJECTS: Project[] = [
  {
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
  },
  {
    id: "renopilot",
    title: "Bathroom Design & Cost Web App (RenoPilot)",
    role: "Lead Frontend & Integration Developer",
    summary:
      "Client-facing capstone application built with an 8-person team, featuring a modular UI component library, room design workflow, and conditional cost calculations.",
    techStack: ["Next.js", "TypeScript", "Tailwind CSS", "Git"],
    imageUrl: "https://pub-aa4aef0e7c174ddcbb741f264c1229da.r2.dev/portfolio/images/capstone-project-renopilot-bathroom.jpg",
  },
  {
    id: "ecommerce-platform",
    title: "Second-Hand Mobile E-Commerce Platform",
    role: "Frontend Developer",
    summary:
      "User-facing shopping interface and administrative management portal engineered with reusable React components and collaborative Git workflows.",
    techStack: ["React.js", "JavaScript", "Node.js", "Express.js"],
    projectUrl: "https://www.liutkwilliam.com/developer/full-stack-web-app",
    imageUrl:
      "https://pub-aa4aef0e7c174ddcbb741f264c1229da.r2.dev/portfolio/images/1791800032259_cover_full-stack-web-app_01.png",
  },
];

export default function VerticalProjectSlideshow() {
  const [activeIndex, setActiveIndex] = useState(0);

  const goToNext = useCallback(() => {
    setActiveIndex((prev) => (prev + 1) % PROJECTS.length);
  }, []);

  const goToPrev = useCallback(() => {
    setActiveIndex((prev) => (prev - 1 + PROJECTS.length) % PROJECTS.length);
  }, []);

  // Keyboard navigation for WCAG accessibility
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowDown") {
        e.preventDefault();
        goToNext();
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        goToPrev();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [goToNext, goToPrev]);

  return (
    <section
      aria-label="Featured Projects Slideshow"
      className="relative mx-auto w-full max-w-5xl overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-sm"
    >
      {/* Slideshow Viewport */}
      <div className="relative h-[520px] w-full overflow-hidden md:h-[50vh]">
        <div
          className="flex h-full flex-col transition-transform duration-500 ease-in-out"
          style={{ transform: `translateY(-${activeIndex * 100}%)` }}
        >
          {PROJECTS.map((project, index) => (
            <article
              key={project.id}
              aria-hidden={activeIndex !== index}
              className="grid h-full w-full shrink-0 grid-cols-1 gap-6 p-6"
            >
              {/* Project Info */}
              <div className="flex flex-col justify-center space-y-2">
                <span className="text-xl font-bold text-primary">
                   Highlighted Project 0{index + 1} / 0{PROJECTS.length}
                </span>
                <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
                  <div>
                    <p className="text-sm font-bold tracking-tight text-neutral-900">
                      {project.title}
                    </p>
                    <p className="text-xs font-semibold uppercase tracking-wider text-neutral-500">
                      {project.role}
                    </p>

                    {/* <p className="text-sm leading-relaxed text-neutral-600 md:text-base">
                  {project.summary}
                </p> */}

                    {/* Tech Stack Pills */}
                    {/* <ul className="flex flex-wrap gap-2 pt-1" aria-label="Technologies used">
                  {project.techStack.map((tech) => (
                    <li
                      key={tech}
                      className="rounded-full bg-neutral-100 px-3 py-1 text-xs font-medium text-neutral-700"
                    >
                      {tech}
                    </li>
                  ))}
                </ul> */}
                  </div>
                  {/* Action Links */}
                  <div className="flex justify-end gap-2 pt-2">
                    {project.liveUrl && (
                      <Button
                        size="sm"
                        target="_blank"
                        href={project.liveUrl}
                        content="Live Demo" children={undefined} to={undefined}/>
                    )}
                    {project.githubUrl && (
                      <Button
                        size="sm"
                        target="_blank"
                        href={project.githubUrl}
                        variant='secondary'
                        content="GitHub Repo" children={undefined} to={undefined}/>
                    )}
                    {project.projectUrl && (
                      <Button
                        size="sm"
                        target="_blank"
                        href={project.projectUrl }
                        variant='secondary'
                        content="Project Site" children={undefined} to={undefined}/>
                    )}
                  </div>
                </div>
              </div>
              {/* Project Preview Image */}
              <div className="relative h-full w-full overflow-hidden rounded-xl bg-neutral-100">
                <img
                  src={project.imageUrl}
                  alt={`${project.title} interface preview`}
                  className="h-full w-full object-cover"
                  loading="lazy"
                />
              </div>
            </article>
          ))}
        </div>
      </div>

      {/* Vertical Navigation Controls (Right Edge) */}
      <div className="absolute right-4 top-1/2 flex -translate-y-1/2 flex-col items-center gap-3">
        <button
          type="button"
          onClick={goToPrev}
          aria-label="Previous project"
          className="rounded-full border border-neutral-200 bg-white/90 p-1.5 text-neutral-700 shadow-sm backdrop-blur transition hover:bg-neutral-100 cursor-pointer"
        >
          ▲
        </button>

        {/* Dot Indicators */}
        <div
          className="flex flex-col gap-2"
          role="tablist"
          aria-label="Select project slide"
        >
          {PROJECTS.map((project, index) => (
            <button
              key={project.id}
              type="button"
              role="tab"
              aria-selected={activeIndex === index}
              aria-label={`View ${project.title}`}
              onClick={() => setActiveIndex(index)}
              className={`h-2.5 w-2.5 rounded-full transition-all cursor-pointer ${
                activeIndex === index
                  ? "scale-125 bg-blue-600"
                  : "bg-neutral-300 hover:bg-neutral-400"
              }`}
            />
          ))}
        </div>

        <button
          type="button"
          onClick={goToNext}
          aria-label="Next project"
          className="rounded-full border border-neutral-200 bg-white/90 p-1.5 text-neutral-700 shadow-sm backdrop-blur transition hover:bg-neutral-100 cursor-pointer"
        >
          ▼
        </button>
      </div>
    </section>
  );
}
