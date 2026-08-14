"use client";

import React from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { EASE, DUR_SWAP } from "./motion";

/**
 * Two labels occupying the same space, one swapping for the other.
 *
 * Shared by the copy bubble and the footer's mobile email pill so both report a
 * successful copy the same way — they used to differ, one swapping its text
 * outright and the other crossfading.
 *
 * The box narrows to whichever label is showing rather than staying as wide as
 * the wider of the two, so confirming with a short word gives you a short pill.
 * That width is animated, because the alternative is the container snapping to a
 * new size underneath a 300ms crossfade, which looks broken.
 *
 * The labels crossfade in place while the box resizes around them. The GSAP
 * version slid them vertically as well, so that the container's horizontal
 * movement and its contents' vertical movement read as two distinct events. That
 * had to go, and for a concrete reason rather than taste: Motion's `layout`
 * animation works by writing a transform, and animating `x`/`y` on the same
 * element at the same time fights it — the documented conflict. The width change
 * is the more important of the two motions, so it keeps the transform, and the
 * swap is left as opacity. Width horizontal, opacity in place: still two events,
 * still not a smear.
 *
 * ---
 *
 * This was a GSAP component and is now a Motion one, which is what removed the
 * hard part rather than working around it.
 *
 * The width animation used to be done by hand: read the incoming label's
 * offsetWidth, tween the container to that number of pixels. Three problems came
 * with that, all of them now gone rather than guarded.
 *
 *  1. Measuring is only valid once webfonts have swapped in, so the first pass
 *     had to deliberately skip the width to avoid pinning a fallback-font width
 *     onto the box (a `measured` ref existed purely to arrange that).
 *  2. offsetWidth reads 0 when an ancestor is display:none — which is the footer's
 *     mobile pill's normal state on desktop, and it still ran because `copied` is
 *     shared with the desktop control. Animating to 0 there left an inline
 *     width:0 behind, so the pill came back empty if the viewport was narrowed.
 *  3. Animating `width` forces layout on every frame of every swap.
 *
 * Motion's `layout` prop does the whole job: it measures the before and after
 * boxes itself, at the moment they actually change, and interpolates between them
 * with a transform. Nothing to measure, nothing to skip on first render, no
 * display:none special case, and no per-frame layout.
 *
 * What makes it work is AnimatePresence's `popLayout`: only the active label is
 * mounted, so the container's natural width IS the active label's width — which
 * is the thing `layout` then animates. (Rendering both, as the GSAP version did,
 * meant the grid column stayed as wide as the wider label and there was no
 * natural width change to animate, which is exactly why it had to be done by
 * hand.) `popLayout` takes the outgoing label out of layout flow as it leaves, so
 * it doesn't hold the old width open while the new one arrives.
 */

type Props = {
  idle: React.ReactNode;
  done: React.ReactNode;
  /** Which of the two is currently showing. */
  showDone: boolean;
};

const CopyLabel: React.FC<Props> = ({ idle, done, showDone }) => {
  // Reduced motion gets the same end states with no travel — the label still has
  // to change, it just doesn't slide there. Zeroing the duration rather than
  // dropping the animation is what keeps the state change itself intact.
  const reduce = useReducedMotion();
  const transition = { duration: reduce ? 0 : DUR_SWAP, ease: EASE };

  return (
    // relative is required by popLayout, which positions the outgoing label
    // absolutely so it stops holding the old width open while the new one arrives.
    <motion.span layout transition={transition} className="relative grid">
      {/* initial={false} so the label doesn't animate in on mount — it's already
          the correct one, and there's nothing to transition from. */}
      <AnimatePresence mode="popLayout" initial={false}>
        <motion.span
          // The key is what makes this a swap. Changing it is the whole signal
          // AnimatePresence acts on.
          key={showDone ? "done" : "idle"}
          // `layout` here too, and it is not redundant. The parent's layout
          // animation resizes by writing a scale, which would squash the text
          // horizontally for the duration of the swap; a child that also declares
          // `layout` gets the inverse scale applied so its own box stays undistorted.
          layout
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={transition}
          className="col-start-1 row-start-1 justify-self-start whitespace-nowrap"
        >
          {showDone ? done : idle}
        </motion.span>
      </AnimatePresence>
    </motion.span>
  );
};

export default CopyLabel;
