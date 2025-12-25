import React from "react";
import Link from "next/link";
import { client } from "../../../sanity/lib/client";
import { PROJECTS_QUERY, WORK_PAGE_QUERY } from "../../../sanity/lib/queries";
import type { Project, WorkPage as WorkPageType } from "../../../types";
import { PROJECTS as FALLBACK_PROJECTS, WORK_PAGE_FALLBACK } from "../../../constants";

const WorkPage = async () => {
  const [projects, workPageData] = await Promise.all([
    client.fetch<Project[]>(PROJECTS_QUERY),
    client.fetch<WorkPageType | null>(WORK_PAGE_QUERY),
  ]);
  const safeProjects = projects.length ? projects : FALLBACK_PROJECTS;
  const pageData = workPageData || WORK_PAGE_FALLBACK;

  return (
    <div className="w-full bg-brand-white min-h-screen">
      {/* Hero Section */}
      <section className="min-h-[70vh] relative overflow-hidden flex flex-col justify-between">
        <div className="w-full py-20">
          {/* Small eyebrow */}
          <div className="mb-8 px-6 md:px-12 opacity-0 animate-[fadeInUp_0.4s_cubic-bezier(0.33,0,0.2,1)_0s_both]">
            <span className="text-sm md:text-xs font-medium uppercase tracking-[0.25em] text-brand-graphite">
              {pageData.topLabel}
            </span>
          </div>

          {/* Main content wrapper */}
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-8 px-6 md:px-12">
            <div className="flex-1">
              {/* Main Headline */}
              <h1 className="font-sans font-semibold text-[clamp(3.5rem,12vw,11rem)] leading-[0.9] tracking-tighter mb-16 text-brand-black opacity-0 animate-[fadeInUp_0.6s_cubic-bezier(0.33,0,0.2,1)_0.1s_both]">
                {pageData.heroTitle}
              </h1>

              {/* Subtitle */}
              <p className="text-lg md:text-lg font-sans text-brand-graphite max-w-4xl leading-relaxed opacity-0 animate-[fadeInUp_0.4s_cubic-bezier(0.33,0,0.2,1)_0.35s_both]">
                {pageData.heroDescription}
              </p>
            </div>

            {/* Count indicator - Desktop only */}
            <div className="hidden md:block text-base font-medium text-brand-graphite pb-2 opacity-0 animate-[fadeInUp_0.4s_cubic-bezier(0.33,0,0.2,1)_0.45s_both]">
              {safeProjects.length} Projects
            </div>
          </div>
        </div>

        {/* Count indicator - Mobile only, at bottom */}
        <div className="md:hidden pb-12 px-6 opacity-0 animate-[fadeInUp_0.4s_cubic-bezier(0.33,0,0.2,1)_0.45s_both]">
          <div className="text-lg font-medium text-brand-graphite">
            {safeProjects.length} Projects
          </div>
        </div>
      </section>

      {/* Divider */}
      <div className="border-t border-brand-border" />

      <section className="py-12 px-6 md:px-12 max-w-[1920px] mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-24">
          {safeProjects.map((project) => (
            <Link
              href={`/work/${project.slug}`}
              key={project.slug}
              className="group block"
            >
              <div className="relative overflow-hidden mb-6 aspect-[4/3] bg-brand-offwhite">
                <img
                  src={project.thumbnail}
                  alt={project.title}
                  className="object-cover w-full h-full transform transition-all duration-500 ease-out group-hover:scale-[1.02] group-hover:brightness-95 group-hover:contrast-[1.05]"
                />
              </div>

              <div className="flex flex-col gap-3 border-t border-brand-border pt-4">
                <div className="flex justify-between items-baseline">
                  <h3 className="font-sans text-2xl md:text-3xl font-bold transition-colors duration-300 group-hover:text-brand-blue">
                    {project.title}
                  </h3>
                  <span className="text-sm font-sans text-brand-graphite hidden md:inline-block transition-colors duration-300 group-hover:text-brand-blue">
                    {project.year}
                  </span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {project.services.map((service, sIndex) => (
                    <span
                      key={sIndex}
                      className="px-3 py-1 rounded-full border border-brand-border text-xs font-medium text-brand-graphite uppercase tracking-wider bg-transparent transition-all duration-300 group-hover:border-brand-blue group-hover:text-brand-blue"
                    >
                      {service}
                    </span>
                  ))}
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
};

export default WorkPage;


