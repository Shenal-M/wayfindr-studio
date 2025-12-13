"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import type { Brand, Project, Testimonial } from "../../types";

type Props = {
  homepageTitle?: string | null;
  heroLine1?: string | null;
  heroLine2?: string | null;
  heroLine3?: string | null;
  brands: Brand[];
  projects: Project[];
  testimonials: Testimonial[];
};

const HomePage: React.FC<Props> = ({
  homepageTitle: rawHomepageTitle,
  heroLine1,
  heroLine2,
  heroLine3,
  brands,
  projects,
  testimonials,
}) => {
  const homepageTitle =
    typeof rawHomepageTitle === "string" && rawHomepageTitle.trim().length > 0
      ? rawHomepageTitle
      : undefined;
  const [offsetY, setOffsetY] = useState(0);

  useEffect(() => {
    const handleScroll = () => setOffsetY(window.scrollY);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className="w-full bg-brand-white overflow-hidden">
      <section className="min-h-[90vh] flex items-end pb-24 px-6 md:px-12 relative">
        <div className="max-w-[1920px] mx-auto w-full z-10">
          <h1 className="font-sans font-extrabold md:font-bold text-[15vw] md:text-[11vw] leading-[0.85] md:leading-[0.9] tracking-tighter text-brand-black uppercase hyphens-auto break-words">
            <span className="block overflow-hidden pb-[2vw] -mb-[2vw]">
              <span className="block animate-[slideUp_0.8s_cubic-bezier(0.16,1,0.3,1)_both]">
                {heroLine1 || "Navigating"}
              </span>
            </span>
            <span className="block overflow-hidden md:ml-[10vw] pb-[2vw] -mb-[2vw]">
              <span className="block animate-[slideUp_0.8s_cubic-bezier(0.16,1,0.3,1)_0.1s_both]">
                {heroLine2 || "Brands"}
              </span>
            </span>
            <span className="block overflow-hidden text-brand-blue pb-[2vw] -mb-[2vw]">
              <span className="block animate-[slideUp_0.8s_cubic-bezier(0.16,1,0.3,1)_0.2s_both]">
                {heroLine3 || "Thru Chaos."}
              </span>
            </span>
          </h1>
        </div>

        <div
          className="absolute bottom-8 right-6 md:right-12 text-sm font-bold uppercase tracking-widest text-brand-graphite animate-bounce"
          style={{ opacity: Math.max(0, 1 - offsetY / 200) }}
        >
          Scroll
        </div>
      </section>

      <section className="bg-brand-white">
        {/* First project - full width */}
        {projects.length > 0 && (
          <Link
            href={`/work/${projects[0].slug}`}
            key={projects[0].slug}
            className="group block"
          >
            <div className="relative overflow-hidden w-full aspect-[4/3] md:aspect-auto md:min-h-[85vh] bg-brand-offwhite">
                <img
                  src={projects[0].thumbnail}
                  alt={projects[0].title}
                  className="object-cover w-full h-full transform transition-all duration-500 ease-out group-hover:scale-[1.02] group-hover:brightness-95 group-hover:contrast-[1.05]"
                />
              </div>

              <div className="border-t border-brand-border pt-6 px-6 md:px-12">
                <div className="flex flex-col md:flex-row md:justify-between md:items-end gap-3 md:gap-4">
                  <h2 className="font-sans text-3xl md:text-6xl font-medium transition-colors duration-300 group-hover:text-brand-blue">
                    {projects[0].title}
                  </h2>
                  <div className="flex flex-wrap gap-2 md:justify-end">
                    {projects[0].services.map((service, sIndex) => (
                      <span
                        key={sIndex}
                        className="px-3 py-1 rounded-full border border-brand-border text-xs font-medium text-brand-graphite uppercase tracking-wider bg-transparent transition-all duration-300 group-hover:border-brand-blue group-hover:text-brand-blue"
                      >
                        {service}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
          </Link>
        )}

        <div className="px-6 md:px-12 pt-12">
          <div className="max-w-[1920px] mx-auto">
            {/* Remaining projects - grid layout */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-12">
            {projects.slice(1, 3).map((project, index) => (
              <Link
                href={`/work/${project.slug}`}
                key={project.slug}
                className={`group block ${index % 2 !== 0 ? "md:mt-24" : ""}`}
              >
                <div className="relative overflow-hidden mb-3 aspect-[4/3] bg-brand-offwhite">
                  <img
                    src={project.thumbnail}
                    alt={project.title}
                    className="object-cover w-full h-full transform transition-all duration-500 ease-out group-hover:scale-[1.02] group-hover:brightness-95 group-hover:contrast-[1.05]"
                  />
                </div>

                <div className="flex flex-col gap-3 pt-2">
                  <div className="flex justify-between items-baseline">
                    <h3 className="font-sans text-3xl md:text-4xl font-semibold transition-colors duration-300 group-hover:text-brand-blue">
                      {project.title}
                    </h3>
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

            {/* View All button at the bottom */}
            <div className="flex justify-center mt-12 mb-12">
            <Link
              href="/work"
              className="group relative inline-flex items-center gap-2 px-5 py-2.5 font-sans text-sm font-bold uppercase tracking-widest text-brand-black bg-transparent border border-brand-black rounded-full overflow-hidden transition-all duration-300 hover:text-brand-white hover:border-brand-blue active:scale-95"
            >
              <span className="absolute inset-0 bg-brand-blue transform -translate-x-full group-hover:translate-x-0 transition-transform duration-300 ease-out" />
              <span className="relative z-10">View All</span>
              <svg 
                className="relative z-10 w-4 h-4 transform transition-transform duration-300 group-hover:translate-x-1" 
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="py-12 border-t border-b border-brand-border bg-brand-offwhite overflow-hidden">
        <div className="flex animate-[scrollMarquee_30s_linear_infinite]">
          {/* First set */}
          {[...brands, ...brands].map((brand, i) => (
            <span
              key={`${brand.id}-${i}`}
              className="mx-8 md:mx-16 select-none flex items-center justify-center flex-shrink-0"
            >
              {brand.logoUrl ? (
                <img 
                  src={brand.logoUrl} 
                  alt={brand.name}
                  className="h-8 md:h-12 w-auto object-contain opacity-40"
                />
              ) : (
                <span className="font-sans font-bold text-4xl md:text-6xl text-brand-graphite opacity-30 uppercase whitespace-nowrap">
                  {brand.name}
                </span>
              )}
            </span>
          ))}
          {/* Duplicate set for seamless loop */}
          {[...brands, ...brands].map((brand, i) => (
            <span
              key={`${brand.id}-${i}-dup`}
              className="mx-8 md:mx-16 select-none flex items-center justify-center flex-shrink-0"
              aria-hidden="true"
            >
              {brand.logoUrl ? (
                <img 
                  src={brand.logoUrl} 
                  alt={brand.name}
                  className="h-8 md:h-12 w-auto object-contain opacity-40"
                />
              ) : (
                <span className="font-sans font-bold text-4xl md:text-6xl text-brand-graphite opacity-30 uppercase whitespace-nowrap">
                  {brand.name}
                </span>
              )}
            </span>
          ))}
        </div>
      </section>

      <section className="py-32 px-6 md:px-12 bg-brand-white">
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-2xl md:text-4xl leading-tight font-sans font-medium text-brand-black">
            Wayfindr Studio is a strategic design agency. We combine <span className="font-serif italic font-normal">Swiss precision</span> with unexpected wit to build high-end digital experiences for reliable brands.
          </p>
          <div className="mt-12">
            <Link
              href="/agency"
              className="inline-block px-8 py-4 border border-brand-black text-brand-black font-bold uppercase tracking-widest hover:bg-brand-black hover:text-white transition-all duration-300"
            >
              Our Philosophy
            </Link>
          </div>
        </div>
      </section>

      <section className="py-32 px-6 md:px-12 bg-brand-offwhite mt-12">
        <div className="max-w-[1920px] mx-auto">
          <h2 className="font-sans text-sm font-bold uppercase tracking-widest mb-16 border-b border-brand-graphite/20 pb-4">
            Client Words
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            {testimonials.map((t, i) => (
              <div key={i} className="flex flex-col justify-between">
                <blockquote className="font-serif text-2xl text-brand-black leading-relaxed mb-8">
                  "{t.quote}"
                </blockquote>
                <div>
                  <cite className="not-italic font-bold font-sans text-brand-black block">
                    {t.author}
                  </cite>
                  <span className="text-sm font-sans text-brand-graphite uppercase tracking-wide">
                    {t.role}, {t.company}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;


