"use client";

import React, { useRef, useState } from "react";
import { gsap, useGSAP, ScrollTrigger } from "../lib/gsap";
import ArrowIcon from "./ArrowIcon";

type Capability = {
  title: string;
  items: string[];
  slug?: string;
};

type Props = {
  capabilities: Capability[];
};

/**
 * The viewport line an item has to straddle to become the active one, as a
 * fraction of viewport height from the top.
 *
 * A single line rather than a "nearest to a focus point" search, and that
 * simplification is the reason this reads as it does. The items are a contiguous
 * stack, so at any scroll position exactly one of them contains this line —
 * "exactly one active" falls out of the geometry instead of having to be enforced
 * by comparing distances across every item on screen.
 */
const FOCUS_LINE = 0.55;

/**
 * Where a row's entrance begins, as a viewport percentage from the top.
 *
 * Earlier than the site-wide 88% because these rows are tall — 130px or so at
 * md — so by the time the top of one reaches 88% a good part of it is already in
 * view. Starting at 90% keeps the motion overlapping the moment of arrival.
 */
const ROW_START = "top 90%";

/** Gap between rows that enter together. */
const ROW_STAGGER = 0.12;

/**
 * Most rows animated in one wave.
 *
 * On a tall desktop viewport four or five rows can be on screen at once when the
 * section arrives. Without a cap they'd all be in a single batch and the stagger
 * would stretch to over half a second of the last row sitting blank; capping it
 * breaks that into successive waves that each keep a tight stagger.
 */
const BATCH_MAX = 4;

/** Fast off the mark, long soft landing — the site's reveal curve. */
const EASE = "power3.out";

/**
 * The three moving parts of a row, looked up off the row element rather than by
 * a scoped selector sweep, so a row can only ever animate its own pieces.
 */
const partsOf = (row: HTMLElement) => ({
  rule: row.querySelector<HTMLElement>("[data-cap-rule]"),
  title: row.querySelector<HTMLElement>("[data-cap-title]"),
  tags: Array.from(row.querySelectorAll<HTMLElement>("[data-cap-tag]")),
});

/**
 * One row's entrance: the hairline draws across, the title rises out from behind
 * it, and the sub-services settle in underneath.
 *
 * The overlaps are deliberate and small. Each part starts before the one above it
 * has finished, so the row reads as a single gesture rather than three queued
 * ones — which is what a strict sequence of the same three tweens looks like.
 *
 * Everything animated here is `transform` or `opacity`. The row's height never
 * changes, which is the property that matters most: this list is animated while
 * the user is scrolling, and anything that changes document height mid-scroll
 * shows up as content sliding out from under your finger.
 */
const revealRow = (row: HTMLElement, delay: number) => {
  const { rule, title, tags } = partsOf(row);
  // Set on the constructor rather than with tl.delay() afterwards: a timeline
  // starts the moment it exists, so shifting its start time after its children
  // are in place is a correction rather than a plan.
  const tl = gsap.timeline({ delay });

  tl.to(row, { opacity: 1, duration: 0.5, ease: "power1.out" }, 0);
  if (rule) tl.to(rule, { scaleX: 1, duration: 0.75, ease: EASE }, 0);
  if (title) tl.to(title, { y: 0, duration: 0.85, ease: EASE }, 0.08);
  if (tags.length) {
    tl.to(
      tags,
      { opacity: 1, y: 0, duration: 0.5, ease: "power2.out", stagger: 0.035 },
      0.24
    );
  }

  return tl;
};

/** The same end state, applied outright. */
const showRow = (row: HTMLElement) => {
  const { rule, title, tags } = partsOf(row);
  gsap.set(row, { opacity: 1 });
  if (rule) gsap.set(rule, { scaleX: 1 });
  if (title) gsap.set(title, { y: 0 });
  if (tags.length) gsap.set(tags, { opacity: 1, y: 0 });
};

const CapabilitiesList: React.FC<Props> = ({ capabilities }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const itemRefs = useRef<(HTMLAnchorElement | null)[]>([]);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      const rows = itemRefs.current.filter((el): el is HTMLAnchorElement => !!el);

      /* Entrance. Both breakpoints — the rows are the same rows, and the reason
         the active-index block below is mobile-only doesn't apply here.

         Under reduced motion nothing is created and the start states are
         neutralised in their own media query, so the list is simply there. */
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        if (!rows.length) return;

        /**
         * Rows already scrolled past are shown outright instead of being given a
         * trigger.
         *
         * `once: true` means a ScrollTrigger whose start is already behind the
         * current scroll position never fires, so a row above the viewport would
         * stay at `opacity: 0` for good. That is reachable in normal use — a
         * back/forward navigation restores the previous scroll position — and it
         * would leave a screenful of blank list above the user with no way to
         * bring it back.
         */
        const pending = rows.filter((row) => {
          if (row.getBoundingClientRect().bottom >= 0) return true;
          showRow(row);
          return false;
        });
        if (!pending.length) return;

        /* Tracked so they can be killed on cleanup. Tweens built inside a
           ScrollTrigger callback run long after this function has returned, so
           the surrounding gsap.context never recorded them and mm.revert() won't
           touch them. */
        const timelines: gsap.core.Timeline[] = [];

        ScrollTrigger.batch(pending, {
          start: ROW_START,
          once: true,
          batchMax: BATCH_MAX,
          // batch groups whatever crossed the line in the same frame, so rows
          // that arrive together stagger against each other rather than each
          // running on its own clock.
          onEnter: (elements) => {
            elements.forEach((row, i) => {
              timelines.push(revealRow(row as HTMLElement, i * ROW_STAGGER));
            });
          },
        });

        return () => timelines.forEach((tl) => tl.kill());
      });

      /* Which row is focused, below md only. From md up the same emphasis is
         hover-driven (see the `md:group-hover:` classes), so a scroll-driven
         index would be computed and then thrown away.

         This used to be a raw scroll listener doing a nearest-neighbour search
         over every on-screen item. It was rAF-throttled and only set state on a
         genuine change, so it wasn't a render problem — but it ran off whatever
         tick the browser's scroll event landed in rather than the single GSAP
         ticker Lenis drives, and its hand-rolled geometry had no notion of
         re-measuring when layout changed underneath it.

         State is still React state, deliberately: this changes a handful of times
         per scroll, not per frame, and it drives ordinary conditional classes. */
      mm.add("(max-width: 767px)", () => {
        rows.forEach((node, index) => {
          ScrollTrigger.create({
            trigger: node,
            start: `top ${FOCUS_LINE * 100}%`,
            end: `bottom ${FOCUS_LINE * 100}%`,
            // Fires on the way in and the way out; only claiming the slot on the
            // way in means the last row stays focused once it's scrolled past,
            // rather than everything switching off at the bottom of the list.
            onToggle: (self) => {
              if (self.isActive) setActiveIndex(index);
            },
          });
        });
      });

      return () => mm.revert();
    },
    { scope: containerRef, dependencies: [capabilities.length], revertOnUpdate: true }
  );

  return (
    /* Only the bottom cap is a real border. The lines between rows are per-row
       elements instead of `divide-y`, because each one has to draw itself in and
       then act as that row's focus indicator — neither of which a border on the
       parent can do. */
    <div ref={containerRef} className="border-b border-brand-border">
      {capabilities.map((capability, index) => {
        const isActive = index === activeIndex;
        const href = capability.slug
          ? `/services/${capability.slug}`
          : `/services/${capability.title.toLowerCase().replace(/\s+/g, "-")}`;

        return (
          <a
            key={index}
            href={href}
            ref={(el) => {
              itemRefs.current[index] = el;
            }}
            className="cap-row group relative block py-8 md:py-10"
          >
            {/* The hairline is structural and nothing but. It draws itself in on
                entrance and then stays border-grey in every state.

                It carried the focus indicator for two attempts — first by darkening
                to black, then by having a blue accent wipe across it — and both were
                wrong for the same reason. A line between two rows belongs to
                neither, so highlighting the one above a row reads as underlining the
                row above *it*. Colour narrows the ambiguity but can't remove it;
                only moving the indicator onto the row can. It's on the title now. */}
            <span
              aria-hidden
              data-cap-rule
              className="cap-rule absolute left-0 top-0 h-px w-full origin-left bg-brand-border"
            />

            {/* Title and Arrow Row */}
            <div className="flex items-start justify-between gap-4">
              {/* The h3 is the mask and the span is what moves. `pb`/`-mb` cancel
                  out, so the padding buys the mask enough room below the baseline
                  for descenders without changing the row's height.

                  The title going blue is the focus indicator. It's the site's
                  existing hover language — the work cards and the contact FAQ both
                  do exactly this — and it's unambiguous in the way a line between
                  two rows can never be: the thing that changes is the thing you
                  picked. It lands in the same blue as the arrow arriving at the far
                  end of the row, so the two read as one state.

                  Colour on the mask rather than the moving span: they're a single
                  transition either way, and keeping the span to nothing but the
                  entrance transform means the two can't interfere. */}
              <h3
                className={`font-sans text-3xl md:text-5xl font-semibold leading-tight tracking-tight overflow-hidden pb-[0.2em] -mb-[0.2em] transition-colors duration-300 ease-out motion-reduce:transition-none
                ${isActive ? "text-brand-blue" : "text-brand-black"}
                md:text-brand-black md:group-hover:text-brand-blue`}
              >
                <span className="cap-title block" data-cap-title>
                  {capability.title}
                </span>
              </h3>
              <div
                className={`shrink-0 w-12 h-12 md:w-16 md:h-16 flex items-center justify-center transition-all duration-300 ease-out motion-reduce:transition-none
                ${isActive ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-4"}
                md:opacity-0 md:-translate-x-4 md:group-hover:opacity-100 md:group-hover:translate-x-0`}
              >
                <ArrowIcon className="w-full h-full text-brand-blue" color="currentColor" />
              </div>
            </div>

            {/* Sub-services. Laid out permanently below md, revealed on hover from
                md up.

                They used to expand and collapse below md too, following the
                focused row, and that was the section's worst behaviour: the row
                losing focus is above the fold line, so its collapse pulled the row
                you were reading up by its own height while you were still
                scrolling into it. Every focus change displaced the page. Leaving
                them laid out costs some vertical space and buys a list whose
                geometry never moves. */}
            <div className="grid grid-rows-[1fr] md:grid-rows-[0fr] md:group-hover:grid-rows-[1fr] transition-[grid-template-rows] duration-300 ease-out motion-reduce:transition-none">
              <div className="overflow-hidden">
                <div className="flex flex-wrap gap-2 md:gap-3 mt-4 ml-1 md:opacity-0 md:transition-opacity md:duration-300 md:ease-out md:group-hover:opacity-100 motion-reduce:transition-none">
                  {capability.items.map((item, idx) => (
                    <span
                      key={idx}
                      className="cap-tag pr-6 py-1.5 text-brand-graphite text-xs md:text-sm font-medium uppercase tracking-wider"
                      data-cap-tag
                    >
                      {item}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </a>
        );
      })}
    </div>
  );
};

export default CapabilitiesList;
