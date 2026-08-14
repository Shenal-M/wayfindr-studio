"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import Button from "./Button";

/**
 * The chevrons nudge toward their direction on hover, which is why they carry
 * `group-hover:` — the `group` lives on Button's glassCircle variant.
 */
const CHEVRON_CLASS = "w-5 h-5 md:w-6 md:h-6 transform transition-transform";

const ChevronLeft = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className={`${CHEVRON_CLASS} group-hover:-translate-x-0.5`}
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    strokeWidth={2}
  >
    <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
  </svg>
);

const ChevronRight = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className={`${CHEVRON_CLASS} group-hover:translate-x-0.5`}
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    strokeWidth={2}
  >
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
  </svg>
);

type Industry = {
  name: string;
  iconUrl: string;
  description?: string;
};

type IndustriesCarouselProps = {
  industries: Industry[];
};

/** How long each slide is shown before advancing on its own. */
const DWELL_MS = 12000;

/**
 * Arriving and leaving get different curves, and that asymmetry is most of what
 * makes the swap feel deliberate rather than mechanical.
 *
 * A single ease-in-out on both — which is what this used — starts the incoming
 * slide slowly. Read as motion that's a hesitation: you click, and the thing that
 * answers you creeps. Leaving accelerates away (ease-in, and quicker, because
 * nobody needs to watch it go); arriving decelerates into place (ease-out, and
 * longer, because that's the half you actually read).
 */
const ENTER_TRANSITION = { duration: 0.52, ease: [0.16, 1, 0.3, 1] } as const;
const EXIT_TRANSITION = { duration: 0.22, ease: [0.7, 0, 0.84, 0] } as const;

/** Arriving travels less than leaving, so the slide settles rather than skids. */
const ENTER_X = 44;
const EXIT_X = 64;

/**
 * Direction-aware slide. `custom` is how the direction reaches the exit variant —
 * an exiting element has already been removed from the tree, so it can't read the
 * value from a render; AnimatePresence forwards it.
 */
const SLIDE_VARIANTS = {
  enter: (dir: number) => ({ opacity: 0, x: dir > 0 ? ENTER_X : -ENTER_X }),
  center: { opacity: 1, x: 0, transition: ENTER_TRANSITION },
  exit: (dir: number) => ({
    opacity: 0,
    x: dir > 0 ? -EXIT_X : EXIT_X,
    transition: EXIT_TRANSITION,
  }),
};

/**
 * Reduced motion keeps the crossfade and drops the travel. A fade carries no
 * movement to be sensitive to, and it's what the setting asks for — the
 * alternative, cutting to `duration: 0`, is a flicker rather than an improvement.
 */
const FADE_VARIANTS = {
  enter: { opacity: 0 },
  center: { opacity: 1, transition: { duration: 0.2 } },
  exit: { opacity: 0, transition: { duration: 0.2 } },
};

/**
 * Every slide occupies the same grid cell — the visible one and the hidden copies
 * that hold the stage open.
 */
const CELL_CLASS = "col-start-1 row-start-1 w-full px-8";

const SlideBody = ({ industry }: { industry: Industry }) => (
  <div className="text-center max-w-3xl mx-auto">
    <div
      className="inline-flex items-center gap-2 mb-8 px-4 py-2 rounded-full border border-brand-white/10 bg-brand-white/5 backdrop-blur-sm"
      style={{
        boxShadow: "0 0 30px rgba(2, 17, 240, 0.4), 0 0 60px rgba(2, 17, 240, 0.2)",
      }}
    >
      <span className="font-sans text-xs md:text-sm text-brand-white/70 uppercase tracking-[0.2em] font-medium">
        {industry.name}
      </span>
    </div>

    {industry.description && (
      <p className="font-serif text-2xl md:text-4xl text-brand-white leading-[1.4] tracking-tight opacity-90">
        {industry.description}
      </p>
    )}
  </div>
);

/**
 * The industries carousel.
 *
 * The transition is Motion's because a slide is an element entering and leaving
 * the tree — presence, which is the one job nothing else in this stack can do.
 * See .claude/skills/animation-stack.
 *
 * The version this replaced was hand-rolled, and the shape of it is worth
 * recording because the hacks were all symptoms of one missing capability:
 *
 *  - The slide list was padded with clones of the first and last industry, and the
 *    track was a single flex row translated by `-index * 100%`. That's the classic
 *    way to fake a seamless wrap when you can only animate a continuous track.
 *  - Wrapping therefore needed a teleport: a setTimeout would reach into the DOM,
 *    set `style.transition = "none"`, jump the index back to the real slide, then
 *    a second nested setTimeout restored the transition 50ms later. Two timers
 *    racing the 800ms CSS transition they were trying to hide, with no cleanup —
 *    unmounting mid-wrap left them to fire against a detached node.
 *  - Rendering one slide at a time removes the whole mechanism. There is no track
 *    to keep continuous, so there is nothing to wrap and nothing to teleport; the
 *    index is just `(i + 1) % length`.
 *
 * Also gone: a `progress` state that a 50ms interval recomputed from Date.now(),
 * causing twenty re-renders a second, and which was never rendered anywhere. It
 * was dead the whole time. If a progress indicator is wanted, animate one element
 * with Motion rather than pushing a number through React state at frame rate.
 */
export const IndustriesCarousel = ({ industries }: IndustriesCarouselProps) => {
  const [index, setIndex] = useState(0);
  // Tracked separately from the index so the wrap from last to first still slides
  // forwards, which comparing indices could not tell us.
  const [direction, setDirection] = useState(1);
  const [isPaused, setIsPaused] = useState(false);
  const reduce = useReducedMotion();

  const count = industries.length;

  const go = useCallback(
    (dir: number) => {
      setDirection(dir);
      setIndex((prev) => (prev + dir + count) % count);
    },
    [count]
  );

  // Direction is derived out here rather than inside a setIndex updater. Updaters
  // must stay pure — Strict Mode calls them twice — so they're not a place to set
  // other state from.
  const goTo = useCallback(
    (next: number) => {
      if (next === index) return;
      setDirection(next > index ? 1 : -1);
      setIndex(next);
    },
    [index]
  );

  // Restarts on every index change, so manually advancing also resets the dwell
  // rather than leaving a partially elapsed timer to fire early.
  //
  // Auto-advance stops under reduced motion: unrequested movement on a timer is
  // exactly what the setting is about, and the arrows and dots still work.
  const timer = useRef<ReturnType<typeof setInterval>>(undefined);
  useEffect(() => {
    if (isPaused || reduce || count < 2) return;
    timer.current = setInterval(() => go(1), DWELL_MS);
    return () => clearInterval(timer.current);
  }, [isPaused, reduce, count, index, go]);

  if (!count) return null;

  const industry = industries[index];

  return (
    <div
      className="relative max-w-5xl mx-auto"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* The stage is a single grid cell, and it is a fixed height.

          It used to be a `motion.div layout` that animated its height between
          slides, because the descriptions differ in length. Three things were
          wrong with that, and they're the whole reason the swap felt rough:

           - Motion performs layout animations with transforms, so a container
             animating its own height renders scaled. Children are only corrected
             if they also opt into `layout`, and these didn't — so the incoming
             paragraph was squashed vertically for the length of the transition,
             while it was being read.
           - Adding `layout` to the slide to correct that isn't available here: a
             layout animation owns the element's transform, so it can't coexist
             with the `x` this slide needs.
           - The height could only change once the incoming slide had mounted, and
             with `mode="wait"` that was after the outgoing one had finished
             leaving. The swap read as three separate beats — text out, empty box
             resizes, text in — for a total of nearly a second.

          Holding the stage at the height of the longest description removes all
          three at once, and pays for itself twice more: the arrows and the dots
          stop moving between slides, and the section no longer changes document
          height while the page is scrolling.

          The copies are what hold it open. Every description is rendered into the
          same cell, so the row is as tall as the tallest of them; `visibility:
          hidden` keeps them out of the render and out of the accessibility tree,
          and it works with no JS at all, which a measured height would not. */}
      <div className="relative grid items-center overflow-hidden py-8">
        {industries.map((item) => (
          <div
            key={`stage-${item.name}`}
            aria-hidden
            className={`${CELL_CLASS} invisible pointer-events-none`}
          >
            <SlideBody industry={item} />
          </div>
        ))}

        {/* mode="wait", so the outgoing slide is gone before the incoming one
            mounts and the two are never on screen together.

            Running them concurrently is tempting once the stage is a fixed height,
            because they're free to overlap and the swap collapses into a single
            gesture. It doesn't work: two paragraphs of the same serif at the same
            place, both around half opacity at the crossover, read as one
            double-struck paragraph. Fading text through other text is only ever
            legible when the two differ in size or position enough to be told
            apart, and centred body copy in the same slot is the opposite of that.
            The counters and dots are what should be gaining smoothness from the
            fixed height, not this.

            What `wait` cost before was a third beat — text out, empty box resizes,
            text in — and that beat came from the height animation, not from the
            mode. With the stage fixed it's two beats and no dead time; the
            incoming slide mounts the instant the outgoing one is done.

            The exit is deliberately much shorter than the entrance. It's what your
            click has to wait behind, and nobody needs to watch a paragraph leave. */}
        <AnimatePresence mode="wait" custom={direction} initial={false}>
          <motion.div
            key={index}
            custom={direction}
            variants={reduce ? FADE_VARIANTS : SLIDE_VARIANTS}
            initial="enter"
            animate="center"
            exit="exit"
            className={CELL_CLASS}
          >
            <SlideBody industry={industry} />
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Navigation Arrows - Responsive positioning.
          Desktop floats them outside the card; mobile stacks them under it. The
          two pairs are the same button — only the positioning differs, which is
          why that's all the className carries.

          The positioning lives on wrappers, not on the buttons. glassCircle
          carries `relative` so its hover panel has a containing block, and
          passing `absolute` to the same element would leave two position
          declarations fighting — with `relative` quietly winning, which drops
          these back into normal flow. */}
      <div className="hidden lg:block">
        <span className="absolute left-0 -translate-x-16 xl:-translate-x-20 top-1/2 -translate-y-1/2 z-30">
          <Button
            variant="glassCircle"
            onClick={() => go(-1)}
            aria-label="Previous industry"
          >
            <ChevronLeft />
          </Button>
        </span>

        <span className="absolute right-0 translate-x-16 xl:translate-x-20 top-1/2 -translate-y-1/2 z-30">
          <Button
            variant="glassCircle"
            onClick={() => go(1)}
            aria-label="Next industry"
          >
            <ChevronRight />
          </Button>
        </span>
      </div>

      {/* Mobile/Tablet Navigation - Below content, above dots */}
      <div className="flex lg:hidden items-center justify-center gap-4 mt-8 mb-4">
        <Button
          variant="glassCircle"
          onClick={() => go(-1)}
          aria-label="Previous industry"
        >
          <ChevronLeft />
        </Button>

        <Button
          variant="glassCircle"
          onClick={() => go(1)}
          aria-label="Next industry"
        >
          <ChevronRight />
        </Button>
      </div>

      {/* Dots Indicator */}
      <div className="flex items-center justify-center gap-2 mt-4 lg:mt-12">
        {industries.map((item, i) => (
          <button
            key={item.name}
            onClick={() => goTo(i)}
            className="relative group py-2"
            aria-label={`Go to ${item.name}`}
            aria-current={i === index}
          >
            {/* The dot's width change is a CSS transition, not a Motion layout
                animation: it's a symmetric two-state change on a single element
                with nothing to coordinate, which is the first row of the table in
                the animation-stack skill.

                Named properties rather than `transition-all`, and the same
                ease-out curve as an arriving slide, so the dot lands with the text
                instead of on its own schedule. */}
            <div
              className={`h-1.5 rounded-full transition-[width,background-color] duration-[550ms] ease-[cubic-bezier(0.16,1,0.3,1)] motion-reduce:transition-none ${
                i === index
                  ? "w-8 bg-brand-white"
                  : "w-1.5 bg-brand-white/20 group-hover:bg-brand-white/40 group-hover:w-3"
              }`}
            />
          </button>
        ))}
      </div>
    </div>
  );
};
