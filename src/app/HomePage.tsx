"use client";

import React, { useRef } from "react";
import Link from "next/link";
import { gsap, useGSAP, ScrollTrigger } from "../lib/gsap";
import Button from "../components/Button";
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
        // 101, not 100: the line's border box and the mask's clip region are
        // the same height by construction (see the markup), so 100 lands the
        // two edges exactly flush and a fractional-pixel layout can let a
        // hairline of the glyph tops survive. The extra 1% is ~1px and
        // invisible, but it guarantees the line starts fully clipped.
        gsap.fromTo(
          gsap.utils.toArray<HTMLElement>(".hero-line", root),
          { yPercent: 101, y: 0, autoAlpha: 0 },
          {
            yPercent: 0,
            y: 0,
            autoAlpha: 1,
            duration: 0.8,
            ease: "expo.out",
            stagger: 0.1,
          }
        );

        // Absolute scroll positions rather than a trigger + offsets. Two
        // reasons: the hero's top is 65px down the page (the fixed header's
        // worth of padding on <main>), so "top top" didn't start the fade until
        // 65px of scroll and finished at 265px — never the intent. And keying
        // off measured element geometry means every ScrollTrigger.refresh()
        // recomputes the range; with numbers there is nothing to re-measure, so
        // a refresh can't make the cue fade at a different point or reappear.
        gsap.to(scrollHintRef.current, {
          opacity: 0,
          ease: "none",
          scrollTrigger: {
            start: 0,
            end: 200,
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
      {/* A full-screen hero on every breakpoint, with the headline and the
          scroll cue anchored to the bottom of it — min-h sets the height,
          justify-end pushes the content column down, and the cue is the last
          item in that column.

          Two details make this safe where the original wasn't:

          svh, not dvh. dvh retracks as the mobile URL bar collapses, so it
          changes mid-scroll — which resized the hero AND (below) the headline's
          font size while a gesture was in flight, moving every measurement
          ScrollSmoother and its triggers were part-way through using. svh is the
          smallest viewport height, the URL-bar-shown case, and it never changes
          while scrolling. When the bar retracts you get a little of the next
          section showing under the cue, which is fine.

          And the cue is an ordinary flex item, not `absolute bottom-8`. That
          matters because min-h is a *minimum*: if the type ever outgrows it the
          section simply gets taller, and the cue stays attached below the
          headline instead of being stranded at a bottom edge the content has
          already passed. The height and the cue's placement are no longer the
          same problem, which is what made this fragile before. */}
      <section className="flex flex-col justify-end min-h-[calc(100svh-4rem-1px)] pt-16 pb-8 px-6 md:px-12">
        {/* The gap is clear space, not a guess: leading-[0.85] puts the baseline
            essentially on the h1's box edge, and the type is uppercase so there
            are no descenders reaching into it. Wider on desktop to keep the
            same rhythm the old absolute offsets produced at that type size. */}
        <div className="max-w-[1920px] mx-auto w-full flex flex-col gap-8 md:gap-12">
          {/* Cap the type by height as well as width. Sized on vw alone, a
              landscape phone (wide but short) renders a ~125px headline whose
              three lines are taller than the screen on their own — which would
              outgrow the section's min-h and push the cue below the fold.

              svh and not dvh, for the same reason as the section: dvh would
              resize the type, and so reflow the whole page, every time the URL
              bar moved. */}
          <h1 className="font-sans font-extrabold md:font-bold text-[min(15vw,15svh)] md:text-[min(11vw,20svh)] leading-[0.85] md:leading-[0.9] tracking-tighter text-brand-black uppercase hyphens-auto break-words">
            {/* The pb/-mb pair appears on BOTH the mask and the line, and needs
                to. On the mask it extends the clip region so descenders aren't
                sliced off. On the line it grows the element's own border box by
                the same amount, which is what yPercent measures against — sized
                only to the line box, yPercent:100 leaves the line's top sitting
                2vw above the clip's bottom edge and the tops of the letters
                show through before the reveal. The negative margins keep the
                collapsed layout identical to a plain stack of lines. */}
            <span className="block overflow-hidden pb-[2vw] -mb-[2vw]">
              <span className="hero-line block pb-[2vw] -mb-[2vw]">{heroLine1 || "Navigating"}</span>
            </span>
            <span className="block overflow-hidden md:ml-[10vw] pb-[2vw] -mb-[2vw]">
              <span className="hero-line block pb-[2vw] -mb-[2vw]">{heroLine2 || "Brands"}</span>
            </span>
            <span className="block overflow-hidden text-brand-blue pb-[2vw] -mb-[2vw]">
              <span className="hero-line block pb-[2vw] -mb-[2vw]">{heroLine3 || "Thru Chaos."}</span>
            </span>
          </h1>

          {/* self-end keeps it right-aligned to the same 1920px column as the
              headline, which is what the old `right-6 md:right-12` approximated
              by measuring from the section's padding edge instead. */}
          <div
            ref={scrollHintRef}
            className="self-end text-sm font-bold uppercase tracking-widest text-brand-graphite animate-bounce"
          >
            Scroll
          </div>
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
                {/* transition-[scale,filter], never transition-all. This image
                    carries data-speed, so ScrollSmoother rewrites its transform
                    every frame; `all` would ease each of those writes over
                    500ms and the parallax would visibly chase the scroll
                    instead of tracking it. Naming the properties keeps the
                    hover on scale/filter — which Tailwind v4 emits as the
                    standalone `scale` property, so it composes with GSAP's
                    transform rather than fighting it — and leaves transform
                    alone. Same separation the grid images below make with their
                    tint layer. */}
                <img
                  src={projects[0].thumbnail}
                  alt={projects[0].title}
                  data-speed="0.97"
                  className="absolute left-0 w-full h-[120%] -top-[10%] object-cover transition-[scale,filter] duration-500 ease-out group-hover:scale-[1.02] group-hover:brightness-95 group-hover:contrast-[1.05]"
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
              <Button href="/work">View All</Button>
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
            <Button variant="outlineSquare" href="/agency">
              Our Philosophy
            </Button>
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
