"use client";

import React, { useRef } from "react";
import Link from "next/link";
import { gsap, useGSAP, ScrollTrigger } from "../lib/gsap";
import Marquee from "../components/Marquee";
import type { Brand, Project, Testimonial } from "../types";

type Props = {
  heroLine1?: string | null;
  heroLine2?: string | null;
  heroLine3?: string | null;
  brands: Brand[];
  projects: Project[];
  testimonials: Testimonial[];
};

const HomePage: React.FC<Props> = ({
  heroLine1,
  heroLine2,
  heroLine3,
  brands,
  projects,
  testimonials,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const heroRef = useRef<HTMLElement>(null);
  const scrollHintRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const root = containerRef.current;
      if (!root) return;

      const mm = gsap.matchMedia();

      // Under reduced motion none of this is created, and the CSS start states
      // fall back to fully visible.
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        // autoAlpha (not opacity) because CSS hides these with visibility, and
        // autoAlpha is what flips it back. immediateRender applies the start
        // state before paint, so the lines are never seen in place first.
        //
        // y:0 on both ends is load-bearing. GSAP reads an existing transform
        // back from the computed matrix as pixels, so if this effect re-runs
        // (Strict Mode, fast refresh) it would parse the previous pass's
        // translate as y:158px and animate yPercent on top of it, leaving the
        // line stranded a full line-height down. Pinning y makes the tween
        // independent of whatever transform it finds.
        gsap.fromTo(
          gsap.utils.toArray<HTMLElement>(".hero-line", root),
          { yPercent: 100, y: 0, autoAlpha: 0 },
          {
            yPercent: 0,
            y: 0,
            autoAlpha: 1,
            duration: 0.8,
            ease: "expo.out",
            stagger: 0.1,
          }
        );

        gsap.to(scrollHintRef.current, {
          opacity: 0,
          ease: "none",
          scrollTrigger: {
            trigger: heroRef.current,
            start: "top top",
            end: "200px top",
            scrub: true,
          },
        });

        // batch groups whatever crossed the line together, so the offset
        // second card staggers with its row rather than on its own schedule.
        ScrollTrigger.batch(
          gsap.utils.toArray<HTMLElement>("[data-reveal]", root),
          {
            start: "top 85%",
            once: true,
            onEnter: (elements) =>
              gsap.to(elements, {
                opacity: 1,
                y: 0,
                duration: 0.9,
                ease: "power3.out",
                stagger: 0.12,
                overwrite: true,
              }),
          }
        );
      });

      return () => mm.revert();
    },
    { scope: containerRef }
  );

  return (
    <div ref={containerRef} className="w-full bg-brand-white overflow-hidden">
      {/* dvh, not vh: vh resolves against the viewport with mobile browser
          chrome hidden, so on a phone showing its URL bar the section runs past
          the visible area and takes the scroll cue with it. Subtracting the
          fixed header makes the hero exactly fill what's on screen, so the cue
          is always in view. */}
      <section
        ref={heroRef}
        className="min-h-[calc(100dvh-4rem-1px)] flex items-end pb-24 px-6 md:px-12 relative"
      >
        <div className="max-w-[1920px] mx-auto w-full z-10">
          {/* Cap the type by height as well as width. Sized on vw alone, a
              landscape phone (wide but short) renders a ~100px headline whose
              three lines can't fit the screen, pushing the scroll cue off the
              bottom. */}
          <h1 className="font-sans font-extrabold md:font-bold text-[min(15vw,15dvh)] md:text-[min(11vw,20dvh)] leading-[0.85] md:leading-[0.9] tracking-tighter text-brand-black uppercase hyphens-auto break-words">
            <span className="block overflow-hidden pb-[2vw] -mb-[2vw]">
              <span className="hero-line block">{heroLine1 || "Navigating"}</span>
            </span>
            <span className="block overflow-hidden md:ml-[10vw] pb-[2vw] -mb-[2vw]">
              <span className="hero-line block">{heroLine2 || "Brands"}</span>
            </span>
            <span className="block overflow-hidden text-brand-blue pb-[2vw] -mb-[2vw]">
              <span className="hero-line block">{heroLine3 || "Thru Chaos."}</span>
            </span>
          </h1>
        </div>

        <div
          ref={scrollHintRef}
          className="absolute bottom-8 right-6 md:right-12 text-sm font-bold uppercase tracking-widest text-brand-graphite animate-bounce"
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
            className="group block reveal-init"
            data-reveal
          >
            <div className="relative overflow-hidden w-full aspect-[4/3] md:aspect-auto md:min-h-[94vh] bg-brand-offwhite">
                <img
                  src={projects[0].thumbnail}
                  alt={projects[0].title}
                  data-speed="0.97"
                  className="absolute left-0 w-full h-[120%] -top-[10%] object-cover transform transition-all duration-500 ease-out group-hover:scale-[1.02] group-hover:brightness-95 group-hover:contrast-[1.05]"
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
                className={`group block reveal-init ${index % 2 !== 0 ? "md:mt-24" : ""}`}
                data-reveal
              >
                <div className="relative overflow-hidden mb-3 aspect-[4/3] bg-brand-offwhite">
                  <img
                    src={project.thumbnail}
                    alt={project.title}
                    data-speed="0.97"
                    className="absolute left-0 w-full h-[120%] -top-[10%] object-cover"
                  />
                  {/* Hover tint as its own layer rather than a filter on the
                      image. ScrollSmoother rewrites the image's transform every
                      frame for the parallax, so anything transitioned on the
                      image itself ends up easing each of those frames and feels
                      sluggish; animating opacity here keeps the two apart. */}
                  <div className="absolute inset-0 bg-brand-black opacity-0 transition-opacity duration-500 ease-out group-hover:opacity-20 pointer-events-none" />
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
            <div className="flex justify-center mt-12 mb-12 reveal-init" data-reveal>
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
        <Marquee brands={brands} />
      </section>

      <section className="py-32 px-6 md:px-12 bg-brand-white">
        <div className="max-w-4xl mx-auto text-center reveal-init" data-reveal>
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
              <div
                key={i}
                className="flex flex-col justify-between reveal-init"
                data-reveal
              >
                <blockquote className="font-serif text-2xl text-brand-black leading-relaxed mb-8">
                  &ldquo;{t.quote}&rdquo;
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
