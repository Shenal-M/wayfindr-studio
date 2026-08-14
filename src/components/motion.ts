/**
 * Shared motion values for the copy affordance.
 *
 * Keeping the numbers in one place is what stops them drifting — the bubble and
 * the hook that dismisses it previously disagreed by 200ms, so the label flipped
 * back while the bubble was still fading out.
 *
 * The copy bubble and its label are driven by Motion, not GSAP: they animate in
 * response to React state (hovered, copied) and the label's container has to
 * resize to fit whichever text is showing, which is a layout animation. See
 * .claude/skills/animation-stack for why that assignment is what it is.
 *
 * Button hovers are deliberately not here. A symmetric two-state hover is what
 * CSS transitions are for, and routing one through a JS library made the exit
 * worse, not better (see Button).
 */

/**
 * Fast off the mark, soft landing. Reads as snappy without being abrupt.
 *
 * Two spellings of the same curve, because the two libraries take different
 * types and this repo uses both. The bezier is the standard cubic ease-out, which
 * is what GSAP's `power3.out` computes — so anything animating alongside a GSAP
 * tween stays in step with it.
 */
export const EASE_GSAP = "power3.out";
export const EASE: [number, number, number, number] = [0.33, 1, 0.68, 1];

/** The copy bubble arriving and leaving. */
export const DUR_BUBBLE = 0.35;

/** One label crossfading into another in place. Quicker than the container. */
export const DUR_SWAP = 0.3;

/**
 * How long a caller must wait before it's safe to change a label that's on its
 * way out. Derived from DUR_BUBBLE rather than typed in again.
 */
export const BUBBLE_EXIT_MS = DUR_BUBBLE * 1000;
