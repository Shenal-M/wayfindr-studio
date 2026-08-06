"use client";

import React, { useRef } from "react";
import { gsap, useGSAP } from "../lib/gsap";
import CopyLabel from "./CopyLabel";
import { EASE, DUR_BUBBLE } from "./motion";

/**
 * The little pill that says "Click to copy" and then confirms.
 *
 * FooterAlt and ContactContent each had their own version and they had drifted —
 * different easing and duration, different entrances (one scaled, one slid), and
 * different ways of confirming. This is one implementation used by both.
 *
 * It enters left-to-right, the same direction Button's hover panel wipes, so the
 * whole site moves one way.
 *
 * `tone` is the one thing that genuinely must differ between the two callers: the
 * bubble inverts against whatever it sits on, so it's white on the black footer
 * and black on the white contact page. A single colour would make one of them
 * invisible, so "the same bubble" means same geometry, same motion, same
 * behaviour — surface flipped.
 */

type Tone = "onDark" | "onLight";

const TONES: Record<Tone, string> = {
  /** For dark surfaces — e.g. the footer. */
  onDark: "bg-white text-brand-black",
  /** For light surfaces — e.g. the contact page. */
  onLight: "bg-brand-black text-brand-white",
};

/** How far it travels in. Small: this is a nudge, not an entrance. */
const SLIDE_PX = 10;

type Props = {
  tone: Tone;
  /** Whether the bubble is on screen. */
  visible: boolean;
  /** Whether it's reporting a successful copy rather than inviting one. */
  copied: boolean;
  idleLabel?: string;
  copiedLabel?: string;
};

const CopyBubble: React.FC<Props> = ({
  tone,
  visible,
  copied,
  idleLabel = "Click to copy",
  copiedLabel = "Copied!",
}) => {
  const bubbleRef = useRef<HTMLSpanElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add(
        {
          motion: "(prefers-reduced-motion: no-preference)",
          still: "(prefers-reduced-motion: reduce)",
        },
        (ctx) => {
          const duration = ctx.conditions?.motion ? DUR_BUBBLE : 0;
          // overwrite:"auto" so hovering on and off faster than the animation
          // eases from wherever it is rather than stacking tweens.
          gsap.to(bubbleRef.current, {
            autoAlpha: visible ? 1 : 0,
            x: visible ? 0 : -SLIDE_PX,
            duration,
            ease: EASE,
            overwrite: "auto",
          });
        }
      );
      return () => mm.revert();
    },
    { dependencies: [visible] }
  );

  return (
    // Absolute inside a zero-width box is load-bearing: it lets the bubble sit
    // beside the email without reserving any space, so nothing shifts when it
    // comes and goes.
    <span className="relative w-0">
      {/* -translate-y-1/2 and GSAP's x live together deliberately. Tailwind v4
          compiles translate utilities to the standalone `translate` property
          while GSAP writes `transform`, and the two compose — so the class holds
          the vertical centring and GSAP owns the horizontal slide, on separate
          axes, without either clobbering the other. */}
      <span
        ref={bubbleRef}
        className={`absolute left-0 top-1/2 -translate-y-1/2 px-4 py-2 text-sm font-medium rounded-full ${TONES[tone]} invisible opacity-0`}
      >
        <CopyLabel idle={idleLabel} done={copiedLabel} showDone={copied} />
      </span>
    </span>
  );
};

export default CopyBubble;
