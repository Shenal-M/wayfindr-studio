"use client";

import React, { useRef } from "react";
import { gsap, useGSAP } from "../lib/gsap";
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
 * The swap is vertical while the bubble itself arrives horizontally, on purpose:
 * the container moving left-to-right and its contents moving up reads as two
 * distinct events. Both on the same axis would muddle into one smear.
 */

type Props = {
  idle: React.ReactNode;
  done: React.ReactNode;
  /** Which of the two is currently showing. */
  showDone: boolean;
};

const CopyLabel: React.FC<Props> = ({ idle, done, showDone }) => {
  const wrapRef = useRef<HTMLSpanElement>(null);
  const idleRef = useRef<HTMLSpanElement>(null);
  const doneRef = useRef<HTMLSpanElement>(null);

  /**
   * The first pass only parks the outgoing label; it deliberately doesn't touch
   * width. Measuring on mount risks doing it before the webfont has swapped in
   * (next/font uses display:swap), which would pin a fallback-font width onto
   * the box and leave it wrong until the next interaction. Leaving width alone
   * until something actually changes means every measurement happens long after
   * fonts have settled.
   */
  const measured = useRef(false);

  useGSAP(
    () => {
      const wrap = wrapRef.current;
      const idleEl = idleRef.current;
      const doneEl = doneRef.current;
      if (!wrap || !idleEl || !doneEl) return;

      // Reduced motion gets the same end states with no travel — the label still
      // has to change, it just doesn't slide there.
      const mm = gsap.matchMedia();
      mm.add(
        {
          motion: "(prefers-reduced-motion: no-preference)",
          still: "(prefers-reduced-motion: reduce)",
        },
        (ctx) => {
          const duration = ctx.conditions?.motion ? DUR_SWAP : 0;
          // overwrite:"auto" so a fast copy-copy-copy eases from wherever the
          // last swap got to instead of stacking tweens.
          const common = { duration, ease: EASE, overwrite: "auto" as const };

          // offsetWidth is 0 when an ancestor is display:none — which is the case
          // for the footer's mobile pill whenever you're on desktop, and it still
          // runs this effect because `copied` is shared with the desktop control.
          // Animating to 0 there would leave an inline width:0 behind, so the
          // pill would come back empty if the viewport were later narrowed.
          const target = showDone ? doneEl : idleEl;
          if (measured.current && target.offsetWidth > 0) {
            // Tween to the incoming label's own width. GSAP reads the current
            // computed width first, so animating from `auto` works.
            gsap.to(wrap, { width: target.offsetWidth, ...common });
          }
          measured.current = true;

          // y:0 pinned for the same reason as Button's panel — keep the tween
          // independent of any pixel offset GSAP might read back off the matrix.
          gsap.to(idleEl, {
            autoAlpha: showDone ? 0 : 1,
            yPercent: showDone ? -100 : 0,
            y: 0,
            ...common,
          });
          gsap.to(doneEl, {
            autoAlpha: showDone ? 1 : 0,
            yPercent: showDone ? 0 : 100,
            y: 0,
            ...common,
          });
        }
      );
      return () => mm.revert();
    },
    { dependencies: [showDone] }
  );

  return (
    // grid puts both labels in one cell so the box keeps a stable height, and
    // overflow-hidden makes the vertical slide read as a mask — without it the
    // outgoing label visibly rides up out of the pill.
    //
    // justify-self-start on the children is not cosmetic, and leaving it off is
    // why the pill refused to resize. Grid items stretch to fill their cell by
    // default, so both labels were being laid out at the width of the *wider*
    // one — which meant measuring `done` returned "Click to copy"'s width and the
    // tween animated the box to the size it already was. Starting them instead
    // lets each label size to its own text, so the measurement is real.
    <span ref={wrapRef} className="grid overflow-hidden">
      <span
        ref={idleRef}
        className="col-start-1 row-start-1 justify-self-start whitespace-nowrap"
      >
        {idle}
      </span>
      <span
        ref={doneRef}
        className="col-start-1 row-start-1 justify-self-start whitespace-nowrap invisible opacity-0"
      >
        {done}
      </span>
    </span>
  );
};

export default CopyLabel;
