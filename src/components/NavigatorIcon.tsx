"use client";

import React, { useEffect, useRef } from "react";
import { motion, useMotionValue, useReducedMotion, useSpring } from "motion/react";

/**
 * The compass needle in the header. It points at the cursor.
 *
 * Motion owns this because it's a pointer-driven component animation — and,
 * specifically, because Motion values live outside React. That's the whole point
 * of this file.
 *
 * What it replaced was the most expensive animation on the site. A
 * requestAnimationFrame loop called setCurrentRotation every frame, so this
 * component re-rendered at 60fps — on every page, forever, because the header is
 * in the shared layout and the loop had no idle condition: with the mouse
 * completely still it kept lerping toward the target and re-rendering anyway. The
 * loop's effect also depended on [targetRotation], which changes on every
 * mousemove, so the rAF loop was being torn down and recreated continuously as
 * well.
 *
 * A `useMotionValue` is not React state. Writing to it updates the DOM node
 * directly, so a mousemove costs one style write and **zero renders** — this
 * component now renders exactly once. `useSpring` does the smoothing that the
 * hand-tuned `prev + diff * 0.15` lerp was approximating, with real physics and
 * without a loop to own.
 */

/** Nudges the needle so the arrow's tip, not its bounding box, faces the cursor. */
const TIP_OFFSET_DEG = 45;

const NavigatorIcon: React.FC = () => {
  const iconRef = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();

  /**
   * Degrees, unwrapped — this deliberately keeps counting past 360 rather than
   * staying in [0, 360).
   *
   * A spring interpolates numerically, so it has no idea that 359° and 1° are
   * neighbours: handed those two values it would travel the long way round, and
   * the needle would visibly unwind a full turn whenever the cursor crossed the
   * wrap point. Accumulating the shortest-path delta instead means consecutive
   * targets are always within ±180° of each other and the spring can only ever
   * take the short route. The original solved the same problem inside its lerp;
   * here it moves to the input side, which is where it belongs.
   */
  const heading = useRef(0);
  const target = useMotionValue(0);
  const rotation = useSpring(target, {
    stiffness: 150,
    damping: 20,
    mass: 0.4,
  });

  useEffect(() => {
    // Reduced motion gets a needle that simply doesn't track the cursor. There's
    // no meaningful "instant" version of a decorative follow — it isn't conveying
    // anything, so it just stops.
    if (reduce) return;

    const onMouseMove = (event: MouseEvent) => {
      const node = iconRef.current;
      if (!node) return;

      const rect = node.getBoundingClientRect();
      // A zero-width rect means the element has no layout box, which is how the
      // header hides this below md (`hidden md:flex` on the parent nav). Checking
      // the box rather than window.innerWidth against a hardcoded 768 keeps this
      // correct if that breakpoint ever moves — and without it the angle would be
      // computed from a 0,0 rect and come out as noise.
      if (!rect.width) return;

      const angle = Math.atan2(
        event.clientY - (rect.top + rect.height / 2),
        event.clientX - (rect.left + rect.width / 2)
      );
      const degrees = (angle * 180) / Math.PI + TIP_OFFSET_DEG;

      // Shortest signed distance from the current heading to the new angle,
      // normalised into [-180, 180).
      const delta = (((degrees - heading.current) % 360) + 540) % 360 - 180;
      heading.current += delta;

      // Not setState: this writes straight through to the spring, and the spring
      // writes straight to the DOM. React is not involved.
      target.set(heading.current);
    };

    window.addEventListener("mousemove", onMouseMove, { passive: true });
    return () => window.removeEventListener("mousemove", onMouseMove);
  }, [reduce, target]);

  return (
    <div ref={iconRef}>
      <motion.svg
        width="48"
        height="48"
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-6 h-6 md:w-7 md:h-7 text-brand-black"
        style={{ rotate: rotation }}
        aria-hidden="true"
      >
        <path
          d="M3 11L22 2L13 21L11 13L3 11Z"
          fill="currentColor"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </motion.svg>
    </div>
  );
};

export default NavigatorIcon;
