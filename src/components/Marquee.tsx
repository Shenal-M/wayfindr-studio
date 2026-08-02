"use client";

import React, { useRef } from "react";
import { gsap, useGSAP, ScrollTrigger } from "../lib/gsap";
import type { Brand } from "../types";

type Props = {
  brands: Brand[];
  /**
   * Scroll speed in pixels per second. Specified as a rate rather than a
   * duration so the strip moves at the same visual speed on mobile, where the
   * logos are smaller and the track is much shorter.
   */
  speed?: number;
};

/** How hard scrolling pushes the strip. Higher = less sensitive. */
const VELOCITY_DAMPING = 400;
/** Ceiling on the speed multiplier, so a fast flick can't blur the logos. */
const MAX_BOOST = 4;

// Logos are sized by height, which quietly penalises tall or stacked marks: a
// wide wordmark spends the whole height budget on one line of letters, while a
// two-line mark has to fit twice as much into the same band and reads as half
// the size. These map an image's aspect ratio to a height multiplier so both
// end up with comparable visual weight.
/** At or below this width/height ratio a logo gets the full boost. */
const TALL_RATIO = 1.2;
/** At or above this ratio the logo is a wide wordmark and needs no boost. */
const WIDE_RATIO = 4;
/** Most a stacked mark may exceed the base height. */
const MAX_TALL_FACTOR = 1.7;

/** Give a logo a height that suits its shape, once its real size is known. */
const fitToAspect = (img: HTMLImageElement) => {
  const ratio = img.naturalWidth / img.naturalHeight;
  if (!ratio || !Number.isFinite(ratio)) return;

  const factor = gsap.utils.clamp(
    1,
    MAX_TALL_FACTOR,
    gsap.utils.mapRange(TALL_RATIO, WIDE_RATIO, MAX_TALL_FACTOR, 1, ratio)
  );
  // Multiply the CSS variable rather than a hard px value so the responsive
  // base height stays in CSS where the breakpoints live.
  img.style.height = `calc(var(--logo-h) * ${factor.toFixed(3)})`;
};

const Marquee: React.FC<Props> = ({ brands, speed = 70 }) => {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);

  // The track renders this twice; the loop travels the width of exactly one
  // copy, so index `half.length` is where the duplicate begins.
  const half = [...brands, ...brands];

  useGSAP(
    () => {
      const track = trackRef.current;
      const wrapper = wrapperRef.current;
      if (!track || !wrapper) return;

      const mm = gsap.matchMedia();

      // An endless scroll is exactly what reduced-motion asks us not to do, so
      // the loop simply never starts and the logos sit still.
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        let loop: gsap.core.Tween | null = null;
        let hovered = false;
        // Reassigned by build(), because quickTo binds to a specific tween and
        // build() replaces the tween. Declared with let so the handlers below
        // always call through to the current one rather than a dead instance.
        let setSpeed: (value: number) => void = () => {};

        const build = () => {
          // Keep the playhead across rebuilds so a resize doesn't visibly
          // restart the strip.
          const progress = loop?.progress() ?? 0;
          loop?.kill();

          // Measure to the first item of the duplicate half; travelling
          // exactly that far lands on a frame identical to the start.
          //
          // Deliberately not xPercent:-50 — that resolves against offsetWidth,
          // which isn't the content width here (Tailwind's preflight puts
          // max-width:100% on images, which fights width:max-content), so the
          // strip reset short and jumped every cycle. And deliberately
          // getBoundingClientRect rather than offsetLeft, which rounds to
          // whole pixels and left the loop half a pixel out. Differencing two
          // children cancels the track's own translation.
          const first = track.children[0] as HTMLElement | undefined;
          const duplicate = track.children[half.length] as HTMLElement | undefined;
          if (!first || !duplicate) return;

          const distance =
            duplicate.getBoundingClientRect().left -
            first.getBoundingClientRect().left;
          if (distance <= 0) return;

          loop = gsap
            .fromTo(
              track,
              { x: 0 },
              {
                x: -distance,
                duration: distance / speed,
                ease: "none",
                repeat: -1,
              }
            )
            .progress(progress);

          // Rebind to the tween that now exists, and carry over the state the
          // old one was holding (a rebuild shouldn't resume a hovered strip).
          loop.timeScale(hovered ? 0 : 1);
          setSpeed = gsap.quickTo(loop, "timeScale", {
            duration: 0.5,
            ease: "power3.out",
          });
        };

        build();

        // Fires both when the viewport resizes and when logo images finish
        // loading and change the track's width — either invalidates the
        // distance and duration we derived from it.
        const rebuild = gsap.delayedCall(0.2, build).pause();
        const ro = new ResizeObserver(() => rebuild.restart(true));
        ro.observe(track);

        // Couple the strip to scroll: it accelerates with scroll velocity,
        // then coasts back to its idle pace. Speed responds to how fast you
        // scroll but never to which way — letting direction follow the scroll
        // reads as the strip glitching backwards, especially with
        // ScrollSmoother, whose inertia keeps feeding velocity after the
        // gesture ends.
        // Note there's no skew here on purpose — it's the fashionable version
        // of this effect, but these are client logos and distorting them is a
        // brand problem, not a style choice.
        const coast = gsap
          .delayedCall(0.35, () => setSpeed(hovered ? 0 : 1))
          .pause();

        const st = ScrollTrigger.create({
          trigger: wrapper,
          start: "top bottom",
          end: "bottom top",
          onUpdate: (self) => {
            if (hovered) return;
            // Magnitude only, and floored at 1, so the strip can speed up but
            // never stall or run in reverse.
            const boost = Math.abs(self.getVelocity()) / VELOCITY_DAMPING;
            setSpeed(gsap.utils.clamp(1, MAX_BOOST, 1 + boost));
            coast.restart(true);
          },
        });

        const slow = () => {
          hovered = true;
          setSpeed(0);
        };
        const restore = () => {
          hovered = false;
          setSpeed(1);
        };

        wrapper.addEventListener("mouseenter", slow);
        wrapper.addEventListener("mouseleave", restore);

        return () => {
          st.kill();
          coast.kill();
          ro.disconnect();
          rebuild.kill();
          wrapper.removeEventListener("mouseenter", slow);
          wrapper.removeEventListener("mouseleave", restore);
        };
      });

      return () => mm.revert();
    },
    { dependencies: [speed, half.length], revertOnUpdate: true }
  );

  const renderLogo = (brand: Brand, key: string, ariaHidden?: boolean) => (
    <span
      key={key}
      className="mx-8 md:mx-16 select-none flex items-center justify-center flex-shrink-0"
      aria-hidden={ariaHidden}
    >
      {brand.logoUrl ? (
        <img
          src={brand.logoUrl}
          alt={brand.name}
          // onLoad alone misses images already in cache, whose load event has
          // fired before React attaches the handler — the ref catches those.
          ref={(el) => {
            if (el?.complete && el.naturalWidth) fitToAspect(el);
          }}
          onLoad={(e) => fitToAspect(e.currentTarget)}
          className="h-(--logo-h) w-auto object-contain opacity-40 transition-opacity duration-300 hover:opacity-100"
        />
      ) : (
        <span className="font-sans font-bold text-4xl md:text-6xl text-brand-graphite opacity-30 uppercase whitespace-nowrap transition-opacity duration-300 hover:opacity-100">
          {brand.name}
        </span>
      )}
    </span>
  );

  return (
    // Hover is bound to this stationary wrapper, not the track: the track is
    // wider than the viewport and slides, so pointer events on it are
    // unreliable.
    <div className="overflow-hidden" ref={wrapperRef}>
      {/* w-max is load-bearing: without it this flex container is block-level
          and takes the wrapper's width, so the children would be measured
          against the viewport instead of the strip. */}
      <div
        className="flex w-max items-center [--logo-h:2rem] md:[--logo-h:3rem]"
        ref={trackRef}
      >
        {half.map((brand, i) => renderLogo(brand, `${brand.id}-${i}`))}
        {/* Duplicate half — the seamless loop depends on this matching exactly. */}
        {half.map((brand, i) => renderLogo(brand, `${brand.id}-${i}-dup`, true))}
      </div>
    </div>
  );
};

export default Marquee;
