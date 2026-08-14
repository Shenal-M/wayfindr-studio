"use client";

import React, { useRef, useState } from "react";
import { gsap, useGSAP } from "../lib/gsap";
import { LOGO_WIDTH, imageUrl } from "../sanity/lib/imageUrl";
import type { Brand } from "../types";

type Props = {
  brands: Brand[];
  /**
   * Travel rate in pixels per second, constant for the life of the strip.
   * Specified as a rate rather than a duration so the logos move at the same
   * visual speed on mobile, where they're smaller and the track much shorter.
   */
  speed?: number;
};

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

/** Two repeats is the minimum a seamless loop can be built from. */
const MIN_COPIES = 2;
/**
 * Ceiling on total logo elements along the track. Before the images load they
 * measure at zero width, so the strip briefly looks narrow enough to "need" a
 * lot of repeats; this bounds what that mistake can cost until the real widths
 * arrive. Expressed as a total rather than a repeat count so it scales: a
 * one-logo strip is allowed the many repeats it genuinely needs to span a wide
 * viewport, while a thirty-logo strip is held to two.
 */
const MAX_ITEMS = 60;

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

  // How many times the brand list is repeated along the track. The loop travels
  // exactly one repeat, so at the far end of the loop the remaining repeats have
  // to still cover the viewport or a gap opens at the seam. That's a function of
  // the measured strip width, so it's settled in build() rather than guessed
  // here — the previous code hardcoded four copies, which is insurance a wide
  // list doesn't need and a short one may not have enough of.
  const [copies, setCopies] = useState(MIN_COPIES);

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

        const build = () => {
          // Keep the playhead across rebuilds so a resize doesn't visibly
          // restart the strip.
          const progress = loop?.progress() ?? 0;
          loop?.kill();

          // Measure to the first item of the second repeat; travelling exactly
          // that far lands on a frame identical to the start.
          //
          // Deliberately not xPercent:-50 — that resolves against offsetWidth,
          // which isn't the content width here (Tailwind's preflight puts
          // max-width:100% on images, which fights width:max-content), so the
          // strip reset short and jumped every cycle. And deliberately
          // getBoundingClientRect rather than offsetLeft, which rounds to
          // whole pixels and left the loop half a pixel out. Differencing two
          // children cancels the track's own translation.
          const first = track.children[0] as HTMLElement | undefined;
          const duplicate = track.children[brands.length] as HTMLElement | undefined;
          if (!first || !duplicate) {
            loop = null;
            return;
          }

          const distance =
            duplicate.getBoundingClientRect().left -
            first.getBoundingClientRect().left;
          if (distance <= 0) {
            // Leave loop null rather than pointing at the tween just killed, or
            // the next rebuild reads a dead tween's progress as its start point.
            loop = null;
            return;
          }

          // After travelling one repeat the strip has `copies - 1` repeats left
          // to its right; that has to span the viewport or the seam shows
          // through as empty space. Re-rendering with more repeats re-runs this
          // effect, which measures again and converges.
          const needed = gsap.utils.clamp(
            MIN_COPIES,
            Math.max(MIN_COPIES, Math.floor(MAX_ITEMS / brands.length)),
            Math.ceil(wrapper.clientWidth / distance) + 1
          );
          if (needed !== copies) {
            loop = null;
            setCopies(needed);
            return;
          }

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
        };

        build();

        // Fires both when the viewport resizes and when logo images finish
        // loading and change the track's width — either invalidates the
        // distance and duration we derived from it.
        const rebuild = gsap.delayedCall(0.2, build).pause();
        const ro = new ResizeObserver(() => rebuild.restart(true));
        ro.observe(track);

        // The strip runs at one constant rate and nothing modulates it: no
        // scroll-velocity boost, no pause on hover. Both are deliberate
        // removals, not omissions. Either one means the tween's timeScale is
        // being written from outside, which is what made the strip appear to
        // surge or stall for reasons the reader can't connect to anything —
        // smooth scrolling in particular keeps feeding velocity after the gesture
        // has ended, so a velocity-linked strip never settles. A logo strip reads
        // better as steady furniture.
        //
        // One consequence of the Lenis integration to be aware of here: the
        // provider sets gsap.ticker.lagSmoothing(0), which is global. This loop
        // will therefore jump ahead rather than resume in place after the tab has
        // been backgrounded, instead of GSAP clamping the delta. That's accepted —
        // the alternative is feeding Lenis a truncated time step, which makes the
        // whole page lurch on refocus. See SmoothScrollProvider.

        return () => {
          ro.disconnect();
          rebuild.kill();
        };
      });

      return () => mm.revert();
    },
    { dependencies: [speed, brands.length, copies], revertOnUpdate: true }
  );

  const renderLogo = (brand: Brand, key: string, ariaHidden?: boolean) => (
    <span
      key={key}
      className="mx-8 md:mx-16 select-none flex items-center justify-center flex-shrink-0"
      aria-hidden={ariaHidden}
    >
      {brand.logoUrl ? (
        <img
          // A single capped width rather than a srcSet, and no loading="lazy",
          // both because of the measuring above and in build(). A srcSet lets
          // the browser swap candidates on a viewport change, and lazy logos
          // measure at zero width while they're off to the right — either one
          // feeds the loop a track width that's about to change, and it
          // rebuilds until the widths settle. One eager candidate is cheap
          // here anyway: these are ~400px marks, not photographs.
          src={imageUrl(brand.logoUrl, LOGO_WIDTH)}
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
    // The ref is on this stationary wrapper rather than the track because
    // build() needs the visible width to work out how many repeats the strip
    // needs; the track is wider than the viewport and slides.
    <div className="overflow-hidden" ref={wrapperRef}>
      {/* w-max is load-bearing: without it this flex container is block-level
          and takes the wrapper's width, so the children would be measured
          against the viewport instead of the strip. */}
      <div
        className="flex w-max items-center [--logo-h:2rem] md:[--logo-h:3rem]"
        ref={trackRef}
      >
        {/* Every repeat must match exactly — build() measures the loop distance
            as the gap between child 0 and child brands.length, so the repeats
            being identical is what makes the wrap frame-identical to the start.
            Only the first repeat is exposed to assistive tech. */}
        {Array.from({ length: copies }, (_, copy) =>
          brands.map((brand, i) =>
            renderLogo(brand, `${brand.id}-${copy}-${i}`, copy > 0)
          )
        )}
      </div>
    </div>
  );
};

export default Marquee;
