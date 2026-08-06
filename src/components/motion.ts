/**
 * Shared motion values for the copy affordance.
 *
 * Deliberately only covers the copy bubble and its label. Button hovers are plain
 * CSS transitions — a symmetric two-state change is what those are for, and
 * routing one through GSAP made the exit worse, not better (see Button). What's
 * left here is the animation that genuinely needs JS: a label whose width has to
 * be measured before it can be animated, and a dismissal that has to stay in step
 * with a React timer.
 *
 * Keeping the numbers in one place is what stops them drifting — the bubble and
 * the hook that dismisses it previously disagreed by 200ms, so the label flipped
 * back while the bubble was still fading out.
 */

/** Fast off the mark, soft landing. Reads as snappy without being abrupt. */
export const EASE = "power3.out";

/** The copy bubble arriving and leaving. */
export const DUR_BUBBLE = 0.35;

/** One label crossfading into another in place. Quicker than the container. */
export const DUR_SWAP = 0.3;

/**
 * How long a caller must wait before it's safe to change a label that's on its
 * way out. Derived from DUR_BUBBLE rather than typed in again.
 */
export const BUBBLE_EXIT_MS = DUR_BUBBLE * 1000;
