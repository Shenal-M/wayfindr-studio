"use client";

import { useRef } from "react";
import { gsap, useGSAP } from "../lib/gsap";

/**
 * A paragraph that wipes from grey to black as it scrolls past.
 *
 * This is a scroll-*linked* animation — its progress is a function of scroll
 * position, not of a duration — so it belongs to ScrollTrigger. See
 * .claude/skills/animation-stack.
 *
 * ── Why it reveals per word, not per line ─────────────────────────────────
 *
 * It used to chop the text into fixed seven-word chunks and render each as a
 * `display: block` line, wiping one chunk at a time. Seven words is roughly one
 * line at this type size in a 1400px column, so on a wide desktop the chunks
 * happened to line up with the real lines and it looked right.
 *
 * Nothing enforced that. Each chunk is still a block that wraps on its own, so
 * the moment the column got narrower than seven words could span, every chunk
 * wrapped to two visual lines and the paragraph came out double-broken — a long
 * line, a short line, a long line, a short line, at breakpoints nobody was
 * looking at. On a phone it was unreadable. The chunking was a guess about
 * layout baked into the markup, and the browser is the only thing that knows
 * where a line actually breaks.
 *
 * So the text is now one flowing paragraph of inline words. Wrapping is the
 * browser's again — correct at every width, with no measurement to keep in step
 * — and each word carries its own share of the wipe, which reads as the same
 * hard edge travelling across each line because that is exactly what it is.
 *
 * That also lets it run below 768px, where it was previously switched off. The
 * old reason was that a chunked paragraph is most of a phone's screen and the
 * wipe would have fired all at once; a per-word sweep over the paragraph's own
 * scroll range has no such problem.
 *
 * ── The mechanism ─────────────────────────────────────────────────────────
 *
 * One span per word, no duplicate copy. The old version stacked two copies of
 * every line and clipped the top one, which meant the whole paragraph existed
 * twice in the DOM with one half `aria-hidden`. Here each word is a single node
 * whose colour comes from a two-stop gradient clipped to the glyphs, and the
 * wipe is that gradient sliding — so there is one copy of the text, which is
 * also the honest thing to hand a screen reader.
 *
 * The revealed state is the DEFAULT and the animation clips *backwards* from
 * it. That ordering is deliberate: no-JS, reduced motion, and a bundle that
 * never arrives all land on fully-black readable text rather than on the grey
 * base, which is nowhere near enough contrast to be a paragraph's fallback.
 */

interface ScrollRevealTextProps {
  text: string;
  className?: string;
}

export const ScrollRevealText = ({
  text,
  className = "",
}: ScrollRevealTextProps) => {
  const containerRef = useRef<HTMLDivElement>(null);

  const words = text.split(/\s+/).filter(Boolean);

  useGSAP(
    () => {
      const root = containerRef.current;
      if (!root) return;

      const mm = gsap.matchMedia();

      // No width condition any more — see the note at the top. Reduced motion
      // still opts out, and needs no fallback of its own because the CSS default
      // is the revealed state.
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        const wordEls = gsap.utils.toArray<HTMLElement>(
          ".reveal-word",
          root,
        );
        if (!wordEls.length) return;

        // One scrubbed timeline for the whole paragraph rather than one
        // ScrollTrigger per word. The words share a single scroll range and
        // sweep in sequence within it; per-word triggers would each need their
        // own start/end computed from the word's position and would drift apart
        // on refresh — and there are fifty of them.
        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: root,
            // Starts once the paragraph is properly on screen and finishes
            // while it still is, so the last word lands before it leaves rather
            // than after. Works at both ends of the size range: a short block on
            // a desktop and a tall one on a phone both get most of a viewport
            // height of scroll to sweep through.
            start: "top 85%",
            end: "bottom 55%",
            scrub: true,
          },
        });

        // ── One edge, moving at one speed ──────────────────────────────────
        //
        // Two things have to be true for this to read as a single hard edge
        // travelling through the text, and a plain `stagger` gives neither.
        //
        // First, no overlap. A stagger shorter than the tween's duration leaves
        // several words mid-wipe at once — at 0.45 against a duration of 1 it
        // was a little over two — so the "edge" was really a two-word gradient
        // and a word could visibly start before the one before it had finished.
        // Laying the tweens end to end means exactly one word is ever in flight.
        //
        // Second, constant speed. Equal time per word is the obvious way to do
        // that and it is wrong: a ten-letter word and a two-letter word would
        // each get the same slice of scroll, so the edge would crawl across the
        // long ones and snap across the short ones. Giving each word a share of
        // the timeline proportional to its measured width makes the edge cover
        // the same number of pixels per unit of scroll all the way through.
        //
        // offsetWidth rather than character count because it is exact and costs
        // one layout pass here — these are reads with no writes between them, so
        // there is nothing to thrash. Measuring once is safe across breakpoints:
        // a font-size change at md scales every word, and only the *ratios*
        // matter.
        const widths = wordEls.map((el) => el.offsetWidth || 1);
        const total = widths.reduce((sum, w) => sum + w, 0);

        let at = 0;
        wordEls.forEach((el, i) => {
          const share = widths[i] / total;
          tl.fromTo(
            el,
            { "--sweep": "100%" },
            {
              "--sweep": "0%",
              // Required, not stylistic: any other ease breaks the 1:1 mapping
              // between scroll position and wipe position, which is the whole
              // point of an edge that tracks the scroll.
              ease: "none",
              duration: share,
            },
            // Absolute position, so the tweens butt up against each other
            // exactly regardless of their differing durations.
            at,
          );
          at += share;
        });
      });

      return () => mm.revert();
    },
    {
      scope: containerRef,
      // Rebuild when the copy changes length — the stagger is built from the
      // word count, so a different string is a different timeline.
      dependencies: [words.length],
      revertOnUpdate: true,
    },
  );

  return (
    <div ref={containerRef} className={className}>
      {words.map((word, idx) => (
        // The spans are inline-block so each can carry its own background, and
        // the separating spaces are real text nodes between them rather than
        // margins — which is what keeps wrapping, justification and copy-paste
        // behaving like ordinary text.
        <span key={idx}>
          <span className="reveal-word">{word}</span>{" "}
        </span>
      ))}
    </div>
  );
};
