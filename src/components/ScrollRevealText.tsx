"use client";

import { useRef } from "react";
import { gsap, useGSAP } from "../lib/gsap";

/**
 * A paragraph that wipes from grey to black, line by line, as it scrolls past.
 *
 * This is a scroll-*linked* animation — its progress is a function of scroll
 * position, not of a duration — so it belongs to ScrollTrigger. See
 * .claude/skills/animation-stack.
 *
 * It was previously a `window.addEventListener("scroll", …)` handler that computed
 * a progress array and called setState. Three things were wrong with that, and
 * they're the reason this file is worth reading before writing another one like
 * it:
 *
 *  1. It re-rendered this component, and reconciled every line, on every frame of
 *     every scroll. The animation writes one number per line; React was never
 *     needed to carry it. ScrollTrigger writes the number straight to a CSS
 *     custom property and the compositor does the rest — no render, no diff.
 *  2. The scroll maths was hand-rolled (`1 - rect.top / windowHeight`), so it
 *     didn't survive the element being taller than the viewport and had no notion
 *     of a refresh when layout changed underneath it.
 *  3. A raw scroll listener is unsynchronised with the frame loop. Everything
 *     else on this site now runs off GSAP's single ticker, which Lenis drives;
 *     this ran off whatever tick the browser's scroll event landed in, so it
 *     lagged the smooth scroll by a frame or two.
 *
 * The revealed state is the DEFAULT, and the animation clips *backwards* from it.
 * That ordering is deliberate: it means no-JS, reduced-motion and mobile all land
 * on fully-black readable text, rather than on the grey base colour — which is
 * #c0c0c0 and nowhere near enough contrast to be the fallback for a paragraph.
 */

interface ScrollRevealTextProps {
  text: string;
  className?: string;
}

/** Words per rendered line. The wipe advances one of these at a time. */
const WORDS_PER_LINE = 7;

export const ScrollRevealText = ({ text, className = "" }: ScrollRevealTextProps) => {
  const containerRef = useRef<HTMLDivElement>(null);

  const words = text.split(/\s+/);
  const lines: string[] = [];
  for (let i = 0; i < words.length; i += WORDS_PER_LINE) {
    lines.push(words.slice(i, i + WORDS_PER_LINE).join(" "));
  }

  useGSAP(
    () => {
      const root = containerRef.current;
      if (!root) return;

      const mm = gsap.matchMedia();

      // Below md the paragraph is most of the screen, so there's no useful scroll
      // range to map a per-line wipe onto — it would all happen at once. Reduced
      // motion opts out for the obvious reason. Either way the CSS default leaves
      // the text fully revealed, so opting out needs no fallback of its own.
      mm.add(
        "(min-width: 768px) and (prefers-reduced-motion: no-preference)",
        () => {
          const lineEls = gsap.utils.toArray<HTMLElement>(
            ".challenge-line-reveal",
            root
          );
          if (!lineEls.length) return;

          // One scrubbed timeline, staggered, rather than one ScrollTrigger per
          // line. The lines share a single scroll range and reveal in sequence
          // within it, which is what a staggered timeline already expresses;
          // per-line triggers would each need their own start/end computed from
          // the line's position and would drift apart on refresh.
          const tl = gsap.timeline({
            scrollTrigger: {
              trigger: root,
              start: "top 80%",
              end: "bottom 60%",
              scrub: true,
            },
          });

          tl.fromTo(
            lineEls,
            { "--line-progress": "0%" },
            {
              "--line-progress": "100%",
              // Required, not stylistic: any other ease breaks the 1:1 mapping
              // between scroll position and wipe position.
              ease: "none",
              // Each line takes 1/n of the range and they don't overlap, which
              // reproduces the sequential feel of the original.
              stagger: { each: 1, from: "start" },
              duration: 1,
            }
          );
        }
      );

      return () => mm.revert();
    },
    { scope: containerRef, dependencies: [lines.length], revertOnUpdate: true }
  );

  return (
    <div ref={containerRef} className={className}>
      {lines.map((line, idx) => (
        <span key={idx} className="challenge-line">
          {/* The grey base sits underneath and carries nothing for assistive
              tech to read twice — the overlay is the aria-hidden copy. */}
          <span className="challenge-line-base">{line}</span>
          <span className="challenge-line-reveal" aria-hidden="true">
            {line}
          </span>
        </span>
      ))}
    </div>
  );
};
