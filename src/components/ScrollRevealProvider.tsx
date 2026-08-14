"use client";

import React from "react";
import { usePathname } from "next/navigation";
import { gsap, useGSAP, ScrollTrigger } from "../lib/gsap";

/**
 * Reveals every `[data-reveal]` element on the page as it scrolls into view.
 *
 * Scroll-linked, so GSAP owns it — see .claude/skills/animation-stack.
 *
 * This lives in the shared site layout rather than being repeated per page, and
 * it is keyed on `pathname` rather than mounting per route. The App Router swaps
 * the page's contents without remounting the layout, so a plain mount-time effect
 * would bind the first route's elements and then silently do nothing on every
 * navigation after it — while the previous route's triggers lived on, pointing at
 * detached nodes whose rects all read zero and which still took part in every
 * refresh. `revertOnUpdate` is what drops those.
 *
 * The cost of the shared approach is that a page only has to add two things to
 * opt in — `data-reveal` for the trigger and `reveal-init` for the start state —
 * with no client boundary of its own. Every page here is a server component, so
 * that matters: `data-reveal` is an attribute, not a component.
 *
 * The start state is CSS (see `.anim .reveal-init` in globals.css), not a
 * `gsap.from()`. GSAP runs in a layout effect, which fires after the browser has
 * painted the server-rendered HTML, so `from()` would show every element in its
 * final position for one frame and then snatch it away. Holding the start state
 * in CSS means it is never painted anywhere else. That state is gated behind
 * `html.anim` with a failsafe in the root layout, so a bundle that never loads
 * can't leave the whole site invisible.
 */

/** Long enough to read as a glide rather than a snap. */
const DURATION = 0.9;

/** Fast off the mark, long soft landing — the site's reveal curve. */
const EASE = "power3.out";

/** Gap between elements revealed in the same batch. */
const STAGGER = 0.1;

/**
 * Most elements animated in one batch.
 *
 * This is a smoothness control, not a correctness one, and it matters most on
 * mobile: a 3-column grid that becomes a single column has every card crossing
 * the trigger line at nearly the same moment, so without a cap the whole section
 * animates at once. That's both a longer frame budget than a phone wants and a
 * worse effect — the stagger disappears into a single wash. Capping the batch
 * splits it into successive waves that each keep their stagger.
 */
const BATCH_MAX = 6;

/**
 * Where an element becomes visible, as a viewport percentage from the top.
 *
 * 88% rather than the 85% this started at, because the reveal is 0.9s long: at
 * 85% the element is still a fair way up the screen when it finishes, so on a
 * quick scroll you arrive after the animation is over and see nothing happen.
 * Starting slightly earlier means the motion overlaps the moment it comes into
 * view, which is the point of it.
 */
const START = "top 88%";

type Props = {
  children: React.ReactNode;
};

const ScrollRevealProvider: React.FC<Props> = ({ children }) => {
  const pathname = usePathname();

  useGSAP(
    () => {
      const mm = gsap.matchMedia();

      // Under reduced motion nothing is created, and the CSS start states are
      // neutralised in their own media query so the content is simply there.
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        const all = gsap.utils.toArray<HTMLElement>("[data-reveal]");
        if (!all.length) return;

        /**
         * Elements already scrolled past are shown outright instead of being
         * given a trigger.
         *
         * A ScrollTrigger whose start is already behind the current scroll
         * position never fires `onEnter`, so anything above the viewport would
         * stay at `opacity: 0` permanently. That's reachable in normal use: a
         * back/forward navigation restores the previous scroll position, and a
         * link to a #hash lands mid-page. Both would otherwise leave a screenful
         * of blank content above the user with no way to recover it.
         */
        const pending = all.filter((el) => {
          if (el.getBoundingClientRect().bottom >= 0) return true;
          gsap.set(el, { opacity: 1, y: 0 });
          return false;
        });
        if (!pending.length) return;

        // batch groups whatever crossed the line together, so an offset card
        // staggers with its row rather than on its own schedule.
        ScrollTrigger.batch(pending, {
          start: START,
          once: true,
          batchMax: BATCH_MAX,
          onEnter: (elements) =>
            gsap.to(elements, {
              opacity: 1,
              y: 0,
              duration: DURATION,
              ease: EASE,
              stagger: STAGGER,
              // The reveal is the last word on these properties. Without this a
              // refresh mid-animation can leave a half-faded element behind.
              overwrite: true,
            }),
        });
      });

      return () => mm.revert();
    },
    { dependencies: [pathname], revertOnUpdate: true }
  );

  return <>{children}</>;
};

export default ScrollRevealProvider;
