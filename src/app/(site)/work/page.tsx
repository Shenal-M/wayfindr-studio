import React from "react";
import Link from "next/link";
import { client } from "../../../sanity/lib/client";
import { PROJECTS_QUERY } from "../../../sanity/lib/queries";
import type { Project } from "../../../types";
import { PROJECTS as FALLBACK_PROJECTS } from "../../../constants";

const WorkPage = async () => {
  const projects = await client.fetch<Project[]>(PROJECTS_QUERY);
  const safeProjects = projects.length ? projects : FALLBACK_PROJECTS;

  return (
    <div className="w-full bg-brand-white min-h-screen">
      {/* Hero Section */}
      <section className="min-h-[70vh] relative overflow-hidden flex flex-col justify-between">
        {/* Top label */}
        <div className="pt-32 px-6 md:px-12 max-w-[1920px] mx-auto w-full">
          <span className="text-xs font-bold uppercase tracking-[0.3em] text-brand-graphite">
            The Work
          </span>
        </div>

        {/* Main content */}
        <div className="px-6 md:px-12 max-w-[1920px] mx-auto w-full relative z-10">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-end">
            <div className="md:col-span-7">
              <h1 className="font-sans font-bold text-[13vw] md:text-[8vw] leading-[0.9] tracking-tighter uppercase">
                <span className="block overflow-hidden pb-[2vw] -mb-[2vw]">
                  <span className="block animate-[slideUp_0.8s_cubic-bezier(0.16,1,0.3,1)_both]">
                    Selected
                  </span>
                </span>
                <span className="block overflow-hidden text-brand-blue pb-[2vw] -mb-[2vw]">
                  <span className="block animate-[slideUp_0.8s_cubic-bezier(0.16,1,0.3,1)_0.1s_both]">
                    Projects.
                  </span>
                </span>
              </h1>
            </div>
            <div className="md:col-span-5 pb-4">
              <p className="text-lg md:text-xl leading-relaxed font-sans text-brand-graphite max-w-md">
                A collection of strategic interventions, digital products, and brand identities.
              </p>
            </div>
          </div>
        </div>

        {/* Bottom descriptor */}
        <div className="pb-12 px-6 md:px-12 max-w-[1920px] mx-auto w-full flex justify-between items-end">
          <p className="font-serif italic text-brand-graphite text-base md:text-lg max-w-sm">
            Each project is a unique collaboration between <span className="text-brand-blue">strategy</span> and craft.
          </p>
          <span className="text-xs font-bold uppercase tracking-widest text-brand-graphite hidden md:block">
            {safeProjects.length} Projects
          </span>
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
                  <h3 className="font-sans text-2xl md:text-3xl font-bold transition-colors duration-300 group-hover:text-brand-black">
                    {project.title}
                  </h3>
                  <span className="text-sm font-sans text-brand-graphite hidden md:inline-block transition-colors duration-300 group-hover:text-brand-black">
                    {project.year}
                  </span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {project.services.map((service, sIndex) => (
                    <span
                      key={sIndex}
                      className="px-3 py-1 rounded-full border border-brand-border text-xs font-medium text-brand-graphite uppercase tracking-wider bg-transparent transition-all duration-300 group-hover:border-brand-black group-hover:text-brand-black group-hover:translate-y-[-2px]"
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


