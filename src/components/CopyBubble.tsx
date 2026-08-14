"use client";

import React from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
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
 *
 * Driven by Motion rather than GSAP because `visible` is React state and this is
 * a direct mapping from it to a visual state. Declaring the target and letting
 * Motion interpolate replaces a GSAP tween that needed an explicit dependency
 * array to notice the state at all, plus `overwrite: "auto"` so that hovering on
 * and off faster than the animation eased from wherever it was instead of
 * stacking tweens. Motion does both by default.
 *
 * The hidden state is an unmount, via AnimatePresence, rather than the
 * visibility:hidden that GSAP's autoAlpha wrote. Same outcome for assistive tech —
 * a bubble that isn't there can't be announced — but arrived at without needing a
 * property that has to flip at the *end* of a fade and not the start. The exit
 * duration is DUR_BUBBLE, which is what BUBBLE_EXIT_MS is derived from, so the
 * label in useCopyToClipboard resets exactly as the bubble finishes leaving
 * instead of flipping back mid-fade.
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
  const reduce = useReducedMotion();

  return (
    // Absolute inside a zero-width box is load-bearing: it lets the bubble sit
    // beside the email without reserving any space, so nothing shifts when it
    // comes and goes.
    <span className="relative w-0">
      <AnimatePresence>
        {visible && (
          <motion.span
            // y:"-50%" carries the vertical centring, rather than a
            // -translate-y-1/2 class. Motion writes `transform` and owns both
            // axes of it, so the offset has to be declared alongside x or it
            // would be overwritten and the bubble would sit low. (Under GSAP the
            // two could be split, because Tailwind v4 compiles translate
            // utilities to the standalone `translate` property, which composes
            // with `transform`.)
            initial={{ opacity: 0, x: -SLIDE_PX, y: "-50%" }}
            animate={{ opacity: 1, x: 0, y: "-50%" }}
            exit={{ opacity: 0, x: -SLIDE_PX, y: "-50%" }}
            transition={{ duration: reduce ? 0 : DUR_BUBBLE, ease: EASE }}
            className={`absolute left-0 top-1/2 px-4 py-2 text-sm font-medium rounded-full ${TONES[tone]}`}
          >
            <CopyLabel idle={idleLabel} done={copiedLabel} showDone={copied} />
          </motion.span>
        )}
      </AnimatePresence>
    </span>
  );
};

export default CopyBubble;
