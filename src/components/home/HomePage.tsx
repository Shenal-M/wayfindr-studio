"use client";

import React, { useEffect, useMemo, useRef } from "react";
import Link from "next/link";
import { useReducedMotion } from "motion/react";
import { gsap, useGSAP, ScrollTrigger } from "../../lib/gsap";
import Marquee from "../Marquee";
import { ScrollRevealText } from "../ScrollRevealText";
import { imageUrl } from "../../sanity/lib/imageUrl";
import type {
  Brand,
  HomeContent,
  Project,
  Testimonial,
} from "../../types";

/**
 * The homepage.
 *
 * The argument: say the thing, and say only the thing. A studio homepage is a
 * position, and the work exists to back it up rather than the other way round.
 * So the first screen carries a claim that restates itself over moving footage
 * and nothing else at all — no eyebrow, no standfirst, no metadata, not even a
 * button — and the work arrives as a pinned rail you scroll sideways through,
 * which buys each project a full card instead of a row and costs the page four
 * screens less than a stacked grid.
 *
 * Every word and the video come from Sanity, defaulted field by field against
 * HOMEPAGE_FALLBACK before they get here — see resolveHome in (site)/page.tsx.
 * Nothing in this file reads `?? "some copy"`, because a hundred scattered
 * fallbacks is a hundred chances to miss one and ship an empty heading.
 *
 * Two decisions are worth recording, because both were arrived at by
 * elimination and either could plausibly be tried again.
 *
 * The ground is the site's own — #ffffff and #f5f5f7, #e5e5e5 hairlines. A warm
 * paper was tried and it does make #0211f0 snap to a truer blue; it is still the
 * wrong trade, because it is a second thing to adopt before any of this can
 * ship.
 *
 * And there is one accent. This started as a full bleed of saturated blue with a
 * second accent colour beside it; a chartreuse was tried, then a warm red, and
 * both pulled the page away from the studio's actual language. The blue stops
 * reading as *the* colour the moment anything competes with it.
 *
 * On the header: this page is the reason NavChrome exists. The bar is
 * transparent over the film and resolves to the site's white one as the hero
 * leaves, and its link colour is sampled from the footage itself. The header
 * belongs to (site)/layout.tsx and the video belongs here, so the two facts
 * travel through that context.
 */

type Props = {
  content: HomeContent;
  brands: Brand[];
  projects: Project[];
  testimonials: Testimonial[];
};

/* ── The hero treatment ─────────────────────────────────────────────────────
   Nothing is layered over the footage. Not a scrim element, not an empty one,
   not a gradient — the type's own colour is the only thing between the video and
   the reader.

   That is the opposite of where this started, and the history is the reason for
   the rule. The first pass laid a 62% white veil over the video and a later one
   multiplied the brand blue across the frame. Both are reliable ways to make any
   footage legible, and both make it look like a screenshot of itself — washing a
   video out until it is safe defeats the reason for having one. So the footage
   is left completely alone and the *type* adapts, which is the right way round:
   type is ours to change and the footage is not.

   Fixed link colours were tried too, and they are a bet that the clip stays
   dark, or stays light, for its whole run. Any footage with real range breaks
   that bet somewhere, which is what a scrim is usually papering over. Measuring
   the frame instead — see the sampler below — is what makes both unnecessary.

   Both halves of the headline sit at full white and neither carries an accent.
   Dimming the fixed line was tried and it is wrong over video: on a still ground
   a line can sit back at 70% and read as the quiet half of a sentence, but the
   thing behind it changes every frame, so the same 70% reads as grey text some
   of the time and as deliberate the rest. The line that keeps changing is
   already the emphasis. No blue in the type either — it belongs to the footage
   and to the page below, and #0211f0 on a dark ground is too low-contrast to
   carry a headline anyway. */

/** Shows for the moment before the first frame decodes, so it tracks the
    footage rather than the page: a white ground under a dark clip is a flash on
    every load. */
const HERO_GROUND = "bg-ink";
const HERO_LEAD = "text-white";
const HERO_ENDING = "text-white";
const HERO_CUE = "text-white/55";


/**
 * The ending swap: the current one travels up out of the mask while the next
 * rises into it from below.
 *
 * Two earlier versions of this were worse, and both failures were instructive.
 *
 * It was once split per character and staggered. That is what produced a stray
 * fragment under the "B": with the letters on eighteen different schedules, the
 * ones still mid-flight sat half-clipped on the mask's top edge while the rest
 * had gone, so what you saw was pieces of a word rather than a word leaving.
 * Moving the whole ending as one block fixes it outright — at any instant the
 * mask cuts one clean horizontal line across it, which is the effect, not an
 * artefact of it.
 *
 * It was then a cross-dissolve with a little travel and a 0.99 scale, and that
 * jittered. Scaling type this large forces the browser to re-rasterise every
 * glyph at a new size on every frame; a hundredth of scale is invisible as
 * scaling and extremely visible as shimmer. A plain yPercent translate has no
 * such problem — GSAP writes it as translate3d, the element gets its own
 * compositor layer for the duration, and the glyphs are rasterised once and
 * then simply moved.
 *
 * The two halves do not overlap. The outgoing ending is fully clear of the mask
 * before the incoming one starts to rise, so the swap is two distinct beats —
 * a word leaves, a word arrives — rather than a shuffle you have to unpick.
 * With both endpoints fully hidden, the empty moment between them is a single
 * frame; you read it as a pause, not as a gap.
 *
 * The travel is exactly ±100%, not 105 or 110. The ending's box and the mask's
 * clip region are the same height by construction (see the markup), so 100%
 * lands it precisely flush with the edge — far enough to be fully hidden, and
 * not one pixel further. Overshooting is the usual instinct and it is what
 * makes the exit and the entrance cover different distances in the same time.
 */
const ENDING_OUT = {
  yPercent: -100,
  // y: 0 pinned alongside every yPercent here. GSAP reads an existing transform
  // back off the computed matrix as pixels, so without it a re-run parses the
  // last pass's translate as y:115px and stacks the percentage on top.
  y: 0,
  duration: 0.34,
  // power3, not power2: a steeper acceleration means the ending sits still
  // fractionally longer and then leaves decisively, which is what reads as
  // snap. A gentler curve over the same duration just reads as slow.
  ease: "power3.in",
};

const ENDING_FROM = { yPercent: 100, y: 0 };

const ENDING_IN = {
  yPercent: 0,
  y: 0,
  duration: 0.58,
  // expo.out spends most of its distance in the first third of its duration, so
  // the ending is essentially in place well before the tween ends and the rest
  // is the settle. Longer on the way in than on the way out, deliberately: the
  // arrival is the half anybody is actually reading.
  ease: "expo.out",
};

/** How long an ending holds before the next replaces it. */
const ENDING_HOLD = 2.6;

/**
 * How much scroll the pinned rail costs, as a multiple of how far it travels.
 * 1 is a 1:1 mapping — the rail moves sideways exactly as fast as the gesture
 * moves down; above 1 it moves more slowly, and the section stays stuck longer.
 *
 * This was 1.5, and it had to come down because widening the cards moved the
 * ground under it. The travel is `trackWidth - viewportWidth`, so it grows by
 * the *whole* of any width added to the cards while the viewport subtracted
 * stays fixed: four cards going 26vw → 36vw added 40vw of track and turned a
 * ~290px travel into a ~1030px one on a 1854px window. At 1.5 that is nearly
 * 1900px of scrolling spent pinned, where it used to be about 435 — the rail
 * did not get slower, it got much longer, and the multiplier quietly scaled up
 * with it.
 *
 * The original reason for 1.5 has mostly expired along with it. It was there
 * because one wheel notch used to throw a short rail a third of its length in a
 * single jump; against 1030px of travel that same notch is a tenth, so the
 * mapping no longer needs padding out to stay steerable.
 */
const RAIL_PACE = 1;

/**
 * Seconds the rail takes to catch up with the scroll position.
 *
 * Halved from 1.2, and worth knowing why that reads as *smoother* rather than
 * more abrupt: it is not the only smoothing in the chain. Lenis is already
 * easing `window.scrollY` itself (lerp 0.1, see SmoothScrollProvider), so
 * ScrollTrigger is scrubbing an input that has had the steps taken out of it
 * before it ever arrives. A second long ease on top of a smooth signal does not
 * add smoothness, it adds lag — and the visible cost of that lag lands exactly
 * at the moment of sticking, where vertical motion stops dead and the rail then
 * takes over a second to get going. That gap is the roughness.
 *
 * 0.6 still rounds off the start and stop of every gesture without leaving a
 * dead beat at the handoff. Note it is also what keeps the tail below honest:
 * the hold has to outlast this lag, so raising one means raising the other.
 */
const RAIL_SCRUB = 0.6;

/**
 * The share of the pinned scroll range spent actually travelling. The remainder
 * is a hold at the far end, with the rail already arrived.
 *
 * Without it the rail unpins before the last card lands, which is not a pacing
 * problem but an arithmetic one. `scrub` is a lag measured in *seconds*: the
 * track eases toward wherever the scroll says it should be, always a beat
 * behind. The pin, meanwhile, releases on scroll *position*, exactly. So if the
 * travel occupies the whole range, the frame the pin lets go is the frame the
 * track is still RAIL_SCRUB seconds short of the end — and the faster you
 * scroll, the further short it is. The section slides away with the last card
 * still off the right edge, which is precisely the reported symptom.
 *
 * Reserving the last fifth of the range fixes it at the cause: the tween reaches
 * its end with a screen's worth of scrolling still to go, so the lag has room to
 * resolve and the rail is provably settled before the pin releases. It also buys
 * a beat on the closing card, which is the one asking for the click.
 */
const RAIL_TRAVEL_SHARE = 0.8;

/**
 * One card in the rail: wider than it was, exactly as tall as it was.
 *
 * These are two constants rather than an `aspect-[4/5]` on the plate, and that
 * is the whole mechanism. An aspect ratio makes width the only input — widen the
 * card and it grows taller in lockstep, which is fine until it isn't: the
 * section is `md:h-svh` with `overflow-hidden`, so a card that outgrows the
 * viewport has its caption quietly cut off rather than pushing the layout. A
 * fixed height and a free width takes the vertical dimension out of the argument
 * entirely — the rail's height is now a decision, not a consequence.
 *
 * The heights are the ones the 4:5 plates already resolved to (each old width
 * × 1.25), so nothing about the section's vertical proportions moved. The extra
 * width is spent on the crop instead: these are `object-cover`, so a wider plate
 * shows more of each photograph rather than stretching it.
 *
 * The ratio therefore now varies by breakpoint — portrait on a phone, near
 * square at md, slightly landscape at lg — which is deliberate. A single ratio
 * across all widths is a rule about the picture; this is a rule about the rail,
 * where what matters is how many cards are on screen at once and how much
 * vertical room the section is allowed to take.
 *
 * One string each, used by both the project cards and the closing card: the
 * rail's rhythm depends on every card matching, and two values drifting apart by
 * a breakpoint is the kind of thing nobody notices in the editor and everybody
 * notices on the page.
 */
const CARD_W = "w-[82vw] sm:w-[58vw] md:w-[44vw] lg:w-[36vw]";
/**
 * The `max-h` is for phones held sideways, and only for them — hence
 * `md:max-h-none`, which takes it back off before it can touch the desktop
 * heights the design was signed off at.
 *
 * Everything here is sized in `vw`, which is the right unit for a rail whose
 * job is to show a card and a bit of the next one. It is the wrong unit for
 * *height* on a viewport that is wider than it is tall: a 844x390 phone turns
 * `97.5vw` into an 823px plate on a 390px screen, so the card is twice the
 * height of the window and you scroll past one photograph at a time with no
 * idea it is part of a row. Capping against `svh` bounds it by the thing that
 * actually ran out.
 */
const CARD_H =
  "h-[97.5vw] sm:h-[65vw] md:h-[42.5vw] lg:h-[32.5vw] max-h-[70svh] md:max-h-none";

/**
 * Gap between collection cells arriving, in seconds. Long enough to read as
 * four separate things landing in order; short enough that the last one is not
 * still waiting once you have finished the first.
 */
const CELL_CASCADE = 0.13;

const HomePage: React.FC<Props> = ({
  content,
  brands,
  projects,
  testimonials,
}) => {
  const rootRef = useRef<HTMLDivElement>(null);
  const railRef = useRef<HTMLElement>(null);
  const scrollerRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const heroRef = useRef<HTMLElement>(null);

  const reduce = useReducedMotion();

  /**
   * The longest ending, which sizes the slot they all share.
   *
   * Computed rather than named, because the endings now come from Sanity and an
   * editor reordering them or adding a longer one must not be able to leave the
   * slot too short — a shorter sizer than the widest ending means that ending
   * wraps to two lines inside a one-line mask, and half of it is clipped away
   * for as long as it is on screen.
   */
  const longestEnding = useMemo(
    () =>
      content.heroEndings.reduce(
        (longest, ending) => (ending.length > longest.length ? ending : longest),
        "",
      ),
    [content.heroEndings],
  );

  /**
   * Whether there is a clip at all. A homepage document with no video is a
   * perfectly good state — the hero falls back to its flat near-black ground —
   * so this gates both the element and the sampler that reads it.
   */
  const hasVideo = Boolean(content.heroVideoUrl);

  /**
   * Reduced motion gets the first frame instead of the film.
   *
   * The element still carries `autoPlay`, deliberately: `useReducedMotion`
   * returns null on the server and resolves after hydration, so a conditional
   * attribute would either flash the wrong state or — worse — fail to autoplay
   * for everyone, since a browser only honours autoplay on the initial render.
   * Starting it and stopping it a frame later is the version that is correct in
   * both cases.
   *
   * Rewound to 0 rather than left paused mid-shot, so what you get is a
   * composed frame rather than wherever the playhead happened to land.
   */
  useEffect(() => {
    const video = videoRef.current;
    if (!video || !reduce) return;
    video.pause();
    video.currentTime = 0;
  }, [reduce]);

  useGSAP(
    () => {
      const root = rootRef.current;
      if (!root) return;

      // Nothing about the header is done here any more. The trigger that
      // resolves it once this hero is past, and the sampler that reads the link
      // colour off the footage, both live in NavChrome now — keyed off the
      // `data-nav-hero` attribute on the section below. This page and the case
      // study had started to grow one copy each of the same two mechanisms.

      const mm = gsap.matchMedia();

      mm.add("(prefers-reduced-motion: no-preference)", () => {
        const lines = gsap.utils.toArray<HTMLElement>(".home-line", root);
        const words = gsap.utils.toArray<HTMLElement>(".home-word", root);

        // Park every ending below the mask, and make all four opaque.
        //
        // The opacity is a one-time correction, not part of the animation:
        // endings two to four are `opacity-0` in the markup so they cannot
        // stack into an illegible pile if the bundle never loads, and once GSAP
        // is running that job belongs to the mask instead. Nothing animates
        // opacity from here on — the whole swap is one translate.
        gsap.set(words, { ...ENDING_FROM, autoAlpha: 1 });

        // ── Hero entrance ─────────────────────────────────────────────────
        // Three steps, overlapped, on one timeline.
        //
        // The entrance overlaps where the swap deliberately does not, and the
        // difference is what is being distinguished. On load there is only one
        // ending, so nothing can be confused with anything — the lines and the
        // ending arriving together read as one gesture. Mid-cycle there are two
        // endings, and telling them apart is the entire job, so those two get
        // separated in time instead.
        gsap
          .timeline()
          .fromTo(
            lines,
            { yPercent: 105, y: 0, autoAlpha: 0 },
            {
              yPercent: 0,
              y: 0,
              autoAlpha: 1,
              duration: 0.72,
              ease: "expo.out",
              stagger: 0.07,
            },
          )
          // The same tween the cycle uses, so the ending's arrival on load and
          // its arrival on every swap after are provably identical motion.
          .to(words[0], ENDING_IN, "-=0.42")
          .to(
            ".home-intro",
            {
              opacity: 1,
              y: 0,
              duration: 0.6,
              ease: "power2.out",
              stagger: 0.07,
            },
            "-=0.45",
          );

        // ── The cycling ending ────────────────────────────────────────────
        if (words.length > 1) {
          const cycle = gsap.timeline({
            repeat: -1,
            // Long enough for the entrance to finish and for the first ending
            // to actually be read. Swapping it out while somebody is still
            // parsing it reads as a glitch rather than as a device.
            delay: 3.6,
          });

          words.forEach((word, i) => {
            const next = words[(i + 1) % words.length];
            cycle
              .to(word, ENDING_OUT)
              // No position parameter, so this starts where the exit finished.
              // The outgoing ending is entirely clear of the mask before the
              // next begins to rise — never two words in the slot at once.
              .fromTo(next, ENDING_FROM, ENDING_IN)
              // The hold is a tween on an empty object rather than a delay on
              // the next step, so the whole cycle stays one timeline whose
              // duration is inspectable and whose progress survives a rebuild.
              .to({}, { duration: ENDING_HOLD });
          });
        }

        // ── Hairlines ─────────────────────────────────────────────────────
        // A hairline that draws itself in from the left rather than fading up:
        // on a page this still, a rule arriving is enough of an event.
        //
        // Batched rather than one trigger per rule — six rules a few hundred
        // pixels apart cross the line in clusters, and batching is what makes
        // each cluster a wave instead of six unrelated events. Anything already
        // above the viewport is drawn outright first, because a ScrollTrigger
        // whose start is behind the current scroll position never fires
        // onEnter, and a restored scroll position would otherwise leave every
        // rule above it stuck at scaleX(0).
        const rules = gsap.utils
          .toArray<HTMLElement>(".home-rule", root)
          .filter((el) => {
            if (el.getBoundingClientRect().bottom >= 0) return true;
            gsap.set(el, { scaleX: 1 });
            return false;
          });

        ScrollTrigger.batch(rules, {
          start: "top 92%",
          once: true,
          batchMax: 4,
          onEnter: (els) =>
            gsap.to(els, {
              scaleX: 1,
              duration: 1.1,
              ease: "expo.out",
              stagger: 0.08,
              overwrite: true,
            }),
        });

        // ── The collections grid ──────────────────────────────────────────
        // One timeline for the whole grid, driven by one trigger on the grid
        // itself — deliberately not the site-wide [data-reveal] batch, which is
        // what this used to be and what made it look wrong.
        //
        // The batch groups whatever crosses the trigger line together. That is
        // right for a column of rows arriving one at a time, and wrong for a
        // 2×2 block: all four cells cross within a few pixels of each other, so
        // the stagger collapses and the section arrives as a single wash. It
        // also cannot know reading order — a batch staggers in DOM order only
        // when the elements happen to reach the line in DOM order, which on a
        // two-column grid they do not.
        //
        // Triggering off the container instead means the cascade is authored
        // rather than emergent: cells cascade top-left to bottom-right at a
        // fixed interval, and inside each cell the title leads and the body
        // follows it into the space that has just opened.
        const grid = root.querySelector<HTMLElement>("[data-collections]");
        if (grid) {
          const cells = gsap.utils.toArray<HTMLElement>(
            "[data-collection-cell]",
            grid,
          );

          // Already scrolled past — a back/forward restore, or a #hash landing
          // mid-page. A non-scrubbed trigger whose start is behind the current
          // position never plays, which would leave four masked titles
          // permanently invisible. Show them and build nothing.
          if (grid.getBoundingClientRect().bottom < 0) {
            gsap.set(
              cells.map((c) => c.querySelector(".home-cell-title")),
              {
                autoAlpha: 1,
                yPercent: 0,
                y: 0,
              },
            );
            gsap.set(
              cells.map((c) => c.querySelector(".home-cell-body")),
              {
                opacity: 1,
                y: 0,
              },
            );
          } else {
            const tl = gsap.timeline({
              scrollTrigger: { trigger: grid, start: "top 78%", once: true },
            });

            cells.forEach((cell, i) => {
              // Absolute positions on one timeline rather than a `stagger`,
              // because each cell is two tweens with their own offset from each
              // other — a stagger can only space single tweens apart.
              const at = i * CELL_CASCADE;
              const title = cell.querySelector<HTMLElement>(".home-cell-title");
              const body = cell.querySelector<HTMLElement>(".home-cell-body");

              if (title) {
                tl.fromTo(
                  title,
                  // y: 0 pinned on both ends, as everywhere else here: GSAP
                  // reads an existing transform back off the computed matrix as
                  // pixels and would stack yPercent on top of it.
                  { yPercent: 110, y: 0, autoAlpha: 0 },
                  {
                    yPercent: 0,
                    y: 0,
                    autoAlpha: 1,
                    duration: 0.9,
                    ease: "expo.out",
                  },
                  at,
                );
              }
              if (body) {
                // The body is a plain fade-and-rise in pixels, which is exactly
                // what its `reveal-init` start state already holds — no mask,
                // because two masked elements in one small cell reads as
                // machinery rather than as a reveal.
                tl.to(
                  body,
                  { opacity: 1, y: 0, duration: 0.8, ease: "power2.out" },
                  at + 0.16,
                );
              }
            });
          }
        }
      });

      // ── The horizontal rail ─────────────────────────────────────────────
      // Desktop only. Pinning converts a vertical gesture into horizontal
      // travel, which is a trade a touch device does not need: a phone can
      // already swipe the rail natively, and hijacking its scroll to do the
      // same thing worse is the classic version of this mistake.
      mm.add(
        "(min-width: 768px) and (prefers-reduced-motion: no-preference)",
        () => {
          const rail = railRef.current;
          const scroller = scrollerRef.current;
          const track = trackRef.current;
          if (!rail || !scroller || !track) return;

          // The scroller is natively scrollable so that touch and reduced
          // motion have a way through the rail. While the pin owns the
          // gesture, native scrolling there would fight the transform — so it
          // is switched off for exactly as long as this context is active, and
          // a gsap.set inside a matchMedia is reverted when it stops matching.
          gsap.set(scroller, { overflowX: "hidden" });

          // A function, not a number: `invalidateOnRefresh` re-runs it on every
          // refresh, so a font swapping in or the viewport resizing recomputes
          // the travel instead of scrubbing against a stale measurement.
          const distance = () =>
            Math.max(0, track.scrollWidth - scroller.clientWidth);

          // A timeline rather than a bare tween, so the travel can end before
          // the scroll range does — see RAIL_TRAVEL_SHARE. The scrollTrigger
          // goes on the timeline, never on a child tween.
          const tl = gsap.timeline({
            scrollTrigger: {
              trigger: rail,
              start: "top top",
              // Longer than the travel, on two counts. RAIL_PACE is the pacing
              // one: a 1:1 mapping is the obvious choice and it is what made
              // this feel abrupt, because the rail is several viewports wide, so
              // one wheel notch threw it a long way and every notch landed as a
              // jump. Stretching the range means each unit of gesture buys less
              // travel and the run reads as a glide you are steering.
              //
              // Dividing by RAIL_TRAVEL_SHARE is the correctness one: it grows
              // the range by exactly the tail the timeline holds at the end, so
              // the travel still happens at the RAIL_PACE rate rather than being
              // compressed to make room for the hold.
              end: () =>
                `+=${(distance() * RAIL_PACE) / RAIL_TRAVEL_SHARE}`,
              pin: true,
              // How long the rail takes to catch up with the scroll, in
              // seconds. `true` is instant and reads as mechanical; this is
              // enough lag to round off the start and stop of every gesture
              // without the rail feeling like it is on elastic.
              scrub: RAIL_SCRUB,
              // Sets the pin up a frame early, so the moment the section
              // reaches the top is not also the frame that changes its
              // position — that coincidence is what produces the small lurch
              // as a pinned section engages.
              anticipatePin: 1,
              invalidateOnRefresh: true,
            },
          });

          // The two durations are shares of the scroll range, not seconds — a
          // scrubbed timeline is mapped onto its range by proportion, so what
          // matters is only that they sum to 1.
          tl.to(track, {
            x: () => -distance(),
            ease: "none",
            duration: RAIL_TRAVEL_SHARE,
          })
            // The hold. A tween on a throwaway object, which is the standard way
            // to occupy time on a timeline without touching anything — the rail
            // has arrived and simply stays put while the last of the range is
            // scrolled through.
            .to({}, { duration: 1 - RAIL_TRAVEL_SHARE });
        },
      );

      return () => mm.revert();
    },
    { scope: rootRef },
  );

  return (
    // No `pt-*` anywhere above the hero, which is the whole reason SiteMain
    // drops its padding on this route. That padding is what normally stops the
    // first section sliding under the fixed header, and it is exactly wrong
    // here: the header is transparent over the hero, so anything reserved above
    // the hero shows through it as a strip of page background — which is what
    // put a white bar across the top of the video. The hero carries the
    // clearance internally instead (its own `pt-16`), so the film starts at y=0
    // and runs behind the bar while the headline still sits below it. Every
    // section after it is in normal flow and unaffected.
    <div ref={rootRef} className="bg-brand-white text-brand-black">
        {/* ── Hero ─────────────────────────────────────────────────────────
            One sentence over moving footage, and nothing else.

            The button is gone on purpose. A hero this quiet has exactly one
            job — say the thing — and a call to action next to it is a second
            thing to look at that nobody needs on the first screen: the nav is
            two centimetres away and the whole page below is the call to
            action. Removing it is also what lets the sentence sit dead centre
            rather than centred-ish above a button.

            The type is small, and that is the argument. A headline at 8vw is a
            poster: it fills the screen whether or not the sentence is any
            good. At 3.8vw the sentence has to hold the space on its own, which
            is a more confident thing for a studio to do and a more demanding
            one, because there is no scale left to hide behind.

            min-h is still a *minimum* and the layout is still a flex column
            with a growing middle, so if the type ever outgrows the viewport the
            section gets taller and the cue stays attached beneath it, rather
            than being stranded at an edge the content has already passed. */}
        <section
          ref={heroRef}
          // What NavChrome watches to decide when the header stops being over
          // the media and resolves to its solid state. The page's entire
          // involvement in that — everything else about it lives in NavChrome.
          data-nav-hero
          // A full `min-h-svh` rather than `svh - 4rem`: the section now starts
          // at the top of the document rather than below the header's worth of
          // padding, so it has that 4rem back and the film fills the screen
          // edge to edge. The `pt-16` is what keeps the headline clear of the
          // bar, and it is inside the section so the video is not.
          className={`relative isolate overflow-hidden px-6 md:px-12 min-h-svh flex flex-col pt-16 pb-10 ${HERO_GROUND}`}
        >
          {/* The footage, untinted. There is deliberately no scrim element at
              all — not an empty one, not a gradient — so nothing is between the
              video and the type but the type's own colour.

              muted is not a style choice — it is the condition every browser
              puts on autoplay, and without it the video silently refuses to
              start. playsInline stops iOS taking it fullscreen. preload is
              "metadata" so the first frame is available as a still without
              pulling the whole file before the page is interactive.

              aria-hidden and tabIndex -1: it is wallpaper. It carries no
              information, and with no controls there is nothing to operate.

              Which is also why the two `disable*` attributes and the
              pointer-events class below are here. Firefox
              floats its own picture-in-picture toggle over any video the pointer
              is above, drawn by the browser into the element's UA shadow DOM —
              so it appears on top of a hero that has deliberately nothing
              layered over it, and offers to pop a piece of wallpaper out into a
              mini player. Two independent blocks, because they fail
              differently: disablePictureInPicture is the standard way to say the
              clip is not a thing to watch, and pointer-events-none means the
              hover never reaches the element in the first place, whatever a
              given browser does with the attribute. The video is decorative and
              sits at -z-10 behind everything, so there is no interaction to
              lose. */}
          {hasVideo && (
            <video
              ref={videoRef}
              src={content.heroVideoUrl}
              poster={
                content.heroPosterUrl
                  ? imageUrl(content.heroPosterUrl, 1920)
                  : undefined
              }
              autoPlay
              muted
              loop
              playsInline
              preload="metadata"
              // Load-bearing, not boilerplate. Sanity serves assets from its own
              // CDN, so this clip is cross-origin — and without the attribute
              // every drawImage silently taints the canvas, getImageData throws,
              // and the header's adaptive colour dies on the first sample with
              // no error anyone would see. Sanity answers with permissive CORS
              // headers, so the request succeeds; it just has to be asked.
              crossOrigin="anonymous"
              aria-hidden="true"
              tabIndex={-1}
              disablePictureInPicture
              disableRemotePlayback
              className="absolute inset-0 -z-10 w-full h-full object-cover pointer-events-none"
            />
          )}

          <div className="flex-1 flex flex-col items-center justify-center text-center">
            {/* leading is 1.15, not the 0.95 this carried at display scale.
                Tight leading is a display-type device — it makes large lines
                lock into a block — and at reading size it just makes two lines
                collide. Tracking eases off for the same reason: -0.035em is
                right for 8vw and cramped at 3.8vw.

                The mask padding stays in em, so it tracks the type at every
                breakpoint with no second number to keep in step. */}
            <h1 className="w-full font-sans font-semibold text-[6.5vw] md:text-[3.2vw] leading-[1.15] tracking-[-0.02em]">
              {/* Both halves share one size and one weight, and both sit at
                  full strength. The headline is one sentence, so it is set as
                  one sentence — the only thing distinguishing the two lines is
                  that the second one keeps changing, which is emphasis enough
                  and does not cost the first line any contrast. */}
              <span className="block overflow-hidden pb-[0.18em] -mb-[0.18em]">
                <span
                  className={`home-line block pb-[0.18em] -mb-[0.18em] ${HERO_LEAD}`}
                >
                  {content.heroLeadLine}
                </span>
              </span>

              {/* The slot.

                  `overflow-hidden` with `pb`/`-mb`, and the three heights have
                  to agree exactly or the swap goes wrong at one edge:

                    mask padding box  = one line + 0.18em
                    sizer margin box  = one line   (its own pb, cancelled by -mb)
                    ending border box = one line + 0.18em

                  An ending's box therefore matches the clip region precisely,
                  which is what lets the tween travel exactly ±100% and land
                  flush with the edge — fully hidden, not one pixel past it.

                  The height comes from a hidden copy of the longest ending
                  rather than a computed line-height, so the slot is exactly one
                  line tall even before the webfont swaps in and changes the
                  metrics. `invisible`, not `hidden`: it still has to take up
                  space.

                  Centring earns something the left-aligned version could not:
                  each ending is a different length, and centred they all sit
                  under the middle of the line above. Left-aligned, the ragged
                  right edge jumped by several characters on every swap, which
                  drew the eye to the wrong end of the sentence. */}
              <span className="relative block overflow-hidden pb-[0.18em] -mb-[0.18em]">
                <span
                  className="invisible block whitespace-nowrap pb-[0.18em] -mb-[0.18em]"
                  aria-hidden="true"
                >
                  {longestEnding}
                </span>

                {content.heroEndings.map((ending, i) => (
                  <span
                    key={ending}
                    // The first ending is the one the server renders, so it
                    // needs a start state or it is painted in place and then
                    // snatched away by a tween running in a layout effect.
                    // `home-word-init` is that state, held as `visibility` behind
                    // the `.anim` gate — not as a transform, which GSAP would
                    // read back as pixels and stack its yPercent on top of.
                    //
                    // The rest get plain `opacity-0`, which is deliberately NOT
                    // gated: they have nothing to reveal, and if the bundle
                    // never arrives they must stay hidden or every ending stacks
                    // into one illegible pile. GSAP clears it with autoAlpha on
                    // setup and the mask hides them from then on.
                    className={`home-word absolute inset-x-0 top-0 block whitespace-nowrap pb-[0.18em] ${HERO_ENDING} ${
                      i === 0 ? "home-word-init" : "opacity-0"
                    }`}
                    // Only the server-rendered ending is exposed: the rest are
                    // the same sentence again, and a screen reader announcing
                    // every one of them would read as a stutter.
                    aria-hidden={i !== 0}
                  >
                    {ending}
                  </span>
                ))}
              </span>
            </h1>
          </div>

          {/* `reveal-init` without `data-reveal`. The class is the site's
              existing GSAP start state — opacity 0 plus a small translate — and
              leaving off the attribute means ScrollRevealProvider ignores it
              and the hero timeline above owns it instead. Every safety net that
              class already carries (reduced motion, <noscript>, the
              bundle-died failsafe in the root layout) comes with it. */}
          <div className="flex justify-center">
            <span
              className={`home-intro reveal-init text-[10px] font-sans font-bold uppercase tracking-[0.2em] ${HERO_CUE}`}
            >
              {content.heroScrollCue}
            </span>
          </div>
        </section>

        {/* ── The position ─────────────────────────────────────────────────
            What the hero deliberately left out. The standfirst that would
            normally sit on the first screen lives here instead, at a size that
            earns it, and wipes in line by line as it passes. */}
        <section className="px-6 md:px-12 py-24 md:py-40 border-b border-brand-border">
          <div className="max-w-[1400px] mx-auto">
            <div
              className="text-[10px] md:text-xs font-sans font-bold uppercase tracking-[0.2em] text-brand-graphite mb-10 reveal-init"
              data-reveal
            >
              {content.positionLabel}
            </div>
            {/* Not inside a [data-reveal] wrapper: ScrollRevealText measures its
                own container to map the wipe onto a scroll range, and a reveal
                transform on an ancestor would move the thing it is measuring.
                The eyebrow above is revealed instead. */}
            <ScrollRevealText
              text={content.positionStatement}
              className="font-sans text-2xl md:text-5xl leading-[1.25] font-medium tracking-tight"
            />
            <p
              className="mt-12 md:mt-16 font-serif italic text-xl md:text-3xl text-brand-blue reveal-init"
              data-reveal
            >
              {content.positionNote}
            </p>
          </div>
        </section>

        {/* ── The rail ─────────────────────────────────────────────────────
            The structural argument this variation is making. The section pins
            and the scroll runs sideways, so each project gets a full card
            rather than a row — and the page spends one screen on the work
            instead of four. */}
        <section
          ref={railRef}
          // `md:pt-20` is clearance for the fixed header, and it only matters
          // once this section is pinned. `start: "top top"` puts its top edge at
          // the very top of the viewport — which is *behind* the bar, not below
          // it — so with no padding the eyebrow sits in the header's 64px and
          // shows through its blur. Every other section on the page is in normal
          // flow and scrolls past the bar, so this is the only one that needs it.
          //
          // 80px rather than the bar's own 65: the extra is the gap that stops
          // the eyebrow reading as part of the nav. It comes out of the section's
          // height, which `justify-center` then distributes around what is left,
          // so on a roomy window nothing appears to move at all.
          className="bg-brand-offwhite md:h-svh flex flex-col justify-center py-16 md:pt-20 md:pb-0 overflow-hidden border-y border-brand-border"
        >
          {/* Half the gap it used to carry at md, which buys the cards height
              they were short of — this section is a fixed `h-svh` while the
              cards are sized in `vw`, so every pixel above the rail is a pixel
              the captions do not get, and on a wide window they were finishing
              hard against the bottom border.

              It also reads better tighter. This is a label for the rail directly
              beneath it, not a section heading with its own standing, and 48px
              of air was spacing it away from the only thing it refers to. */}
          <div className="px-6 md:px-12 mb-8 md:mb-6">
            <div className="max-w-[1920px] mx-auto flex items-baseline justify-between text-[10px] md:text-xs font-sans font-bold uppercase tracking-[0.2em] text-brand-graphite">
              <span>{content.railLabel}</span>
              {/* The hint is editable; its mobile counterpart is not. Below md
                  the rail is not pinned and is swiped by hand, so "keep
                  scrolling" would be describing an interaction that is not the
                  one available — which is a fact about the layout rather than
                  something an editor should have to keep in step. */}
              <span className="hidden md:block">{content.railHint} →</span>
              <span className="md:hidden">Swipe →</span>
            </div>
          </div>

          {/* `scroll-px-*` matches the track's own `px-*`, and without it the
              rail is subtly broken on touch.

              The cards are `snap-start`, which aligns a card's left edge with
              the *snapport's* start edge — and the snapport is this element's
              padding box, which has no padding; the gutter is on the track
              inside. So card one, sitting 24px into the scroll content, has its
              snap position at scrollLeft 24, which the rail jumps to on load.
              The left gutter is scrolled away before you touch it and can never
              be seen again. Insetting the snapport by the same amount puts card
              one's snap position back at 0.

              Deliberately NOT `data-lenis-prevent`, which is the usual advice
              for a nested scroller. That attribute stops Lenis handling wheel
              events over the element, and from md up this section is pinned:
              vertical scrolling *over the rail* is exactly what drives it
              sideways. Preventing it here would strand the reader inside a
              pinned section they cannot leave. Touch is already native — Lenis
              runs with syncTouch off — so the swipe was never being hijacked. */}
          <div
            ref={scrollerRef}
            className="overflow-x-auto no-scrollbar snap-x snap-mandatory md:snap-none scroll-px-6 md:scroll-px-12"
          >
            <div
              ref={trackRef}
              // will-change only where something actually transforms it. Below
              // md the rail is a plain native scroller and the hint would hold a
              // compositor layer for a track several viewports wide, on the
              // devices least able to spare the memory.
              className="flex w-max gap-6 md:gap-10 px-6 md:px-12 md:will-change-transform"
            >
              {projects.map((project, i) => (
                <Link
                  key={project.slug}
                  href={`/work/${project.slug}`}
                  className={`group snap-start shrink-0 ${CARD_W}`}
                >
                  {/* The photographs sit at full strength at rest. Knocking
                      them back and restoring them on hover was tried and it is
                      the wrong trade for a rail: unlike a vertical grid, every
                      card here is on screen at once and none of them is being
                      pointed at most of the time, so the resting state is what
                      you actually look at — and the resting state was a wall of
                      slightly grey pictures. */}
                  <div
                    className={`relative overflow-hidden ${CARD_H} bg-brand-border`}
                  >
                    <img
                      src={imageUrl(project.thumbnail, 1200)}
                      alt={project.title}
                      loading="lazy"
                      className="w-full h-full object-cover transition-[scale] duration-700 ease-out group-hover:scale-[1.03] motion-reduce:transition-none"
                    />
                  </div>

                  {/* The hover happens in the caption instead, where the page
                      has room for it: the hairline under the plate turns blue
                      and draws across from the left, and the title follows it.
                      That is the same left-edge advance the buttons and the
                      footer CTA use, so the whole page keeps one hover
                      grammar — and it leaves the photograph alone, which is the
                      point of the change. */}
                  <div className="relative mt-5 pt-4">
                    <span
                      aria-hidden="true"
                      className="absolute top-0 inset-x-0 h-px bg-brand-border"
                    />
                    <span
                      aria-hidden="true"
                      className="absolute top-0 inset-x-0 h-px bg-brand-blue origin-left scale-x-0 transition-transform duration-500 ease-out group-hover:scale-x-100 group-focus-visible:scale-x-100 motion-reduce:transition-none"
                    />
                    <div className="flex items-baseline justify-between gap-4">
                      <h3 className="font-sans text-2xl md:text-3xl font-medium tracking-tight transition-colors duration-300 group-hover:text-brand-blue motion-reduce:transition-none">
                        {project.title}
                      </h3>
                      <span className="font-sans text-xs tabular-nums text-brand-graphite transition-colors duration-300 group-hover:text-brand-blue motion-reduce:transition-none">
                        {String(i + 1).padStart(2, "0")}
                      </span>
                    </div>
                    <p className="mt-2 font-sans text-sm text-brand-graphite">
                      {project.services.join(" · ")} — {project.year}
                    </p>
                  </div>
                </Link>
              ))}

              {/* The rail ends on an ask rather than trailing off. Sized to
                  match a card so the run stays rhythmic to the last frame, and
                  it is the page's one block of colour — which is exactly the
                  budget this language allows. */}
              <Link
                href="/work"
                className={`group snap-start shrink-0 ${CARD_W} ${CARD_H} flex flex-col justify-end bg-brand-blue text-white p-8`}
              >
                {/* whitespace-pre-line so the line break an editor types in
                    Sanity is the line break that renders. This is two or three
                    words set very large, so where it wraps is a typographic
                    decision rather than an accident of the box's width. */}
                <span className="font-sans text-4xl md:text-5xl font-medium tracking-tight leading-[0.98] whitespace-pre-line">
                  {content.railEndTitle}
                </span>
                <span className="mt-6 inline-flex items-center gap-3 font-sans text-sm font-bold uppercase tracking-widest">
                  {content.railEndCta}
                  <span className="inline-block w-8 h-px bg-white origin-left transition-transform duration-500 ease-out group-hover:scale-x-[2] motion-reduce:transition-none" />
                </span>
              </Link>
            </div>
          </div>
        </section>

        {/* ── Capabilities ─────────────────────────────────────────────────
            The disciplines, each behind a hairline that draws in as it
            arrives. Numbered from the array index rather than from a stored
            number, so reordering them in Sanity renumbers them — an editor
            dragging row four above row two should not have to renumber six
            rows by hand, and a list that reads 01 03 02 is worse than no
            numbers at all. */}
        <section className="px-6 md:px-12 py-24 md:py-32">
          <div className="max-w-[1920px] mx-auto">
            <div
              className="text-[10px] md:text-xs font-sans font-bold uppercase tracking-[0.2em] text-brand-graphite reveal-init"
              data-reveal
            >
              {content.capabilitiesLabel}
            </div>

            <div className="mt-10">
              {content.capabilities.map((c, i) => (
                <div key={c.title}>
                  {/* origin-left, or the rule opens outward from its middle. */}
                  <div className="home-rule h-px bg-brand-border origin-left" />
                  <div
                    className="grid grid-cols-1 md:grid-cols-12 gap-3 md:gap-8 py-8 md:py-10 reveal-init"
                    data-reveal
                  >
                    <div className="md:col-span-1 font-sans text-xs tabular-nums text-brand-graphite pt-1">
                      {String(i + 1).padStart(2, "0")}
                    </div>
                    <h3 className="md:col-span-4 font-sans text-2xl md:text-3xl font-medium tracking-tight">
                      {c.title}
                    </h3>
                    <p className="md:col-span-6 md:col-start-7 font-sans text-base md:text-lg leading-relaxed text-brand-graphite">
                      {c.body}
                    </p>
                  </div>
                </div>
              ))}
              <div className="home-rule h-px bg-brand-border origin-left" />
            </div>
          </div>
        </section>

        {/* ── Collections ──────────────────────────────────────────────────
            The work grouped by outcome rather than by discipline — what a brand
            is meant to feel like, not what was delivered. Reads best at four:
            they sit in a 2×2 and the arrival cascade below is authored for a
            block rather than a column. */}
        <section className="px-6 md:px-12 pb-20 md:pb-32">
          <div className="max-w-[1920px] mx-auto">
            <h2
              className="font-sans text-[9vw] md:text-[5vw] leading-[0.98] font-semibold tracking-[-0.035em] max-w-[16ch] reveal-init"
              data-reveal
            >
              {content.collectionsLead}{" "}
              <span className="font-serif italic font-normal text-brand-blue">
                {content.collectionsAccent}
              </span>
            </h2>

            {/* No `reveal-init`/`data-reveal` on the cells. The grid is its own
                trigger and its own timeline — see the collections block in the
                useGSAP above for why the shared batch was the wrong tool for a
                2×2 block. */}
            <div
              data-collections
              className="mt-12 md:mt-20 grid grid-cols-1 md:grid-cols-2 gap-px bg-brand-border border border-brand-border"
            >
              {content.collections.map((c) => (
                <div
                  key={c.title}
                  data-collection-cell
                  className="group relative bg-brand-white p-8 md:p-14 overflow-hidden"
                >
                  {/* Colour floods up from the bottom edge on hover. Bottom,
                      not left: the buttons already own the left-to-right wipe,
                      and giving a large surface its own direction keeps the two
                      gestures from reading as the same component. */}
                  <span
                    aria-hidden="true"
                    className="absolute inset-0 bg-brand-blue origin-bottom scale-y-0 transition-transform duration-500 ease-out group-hover:scale-y-100 motion-reduce:transition-none"
                  />
                  <div className="relative z-10 transition-colors duration-500 group-hover:text-white motion-reduce:transition-none">
                    {/* The title rises out of a mask, the way the hero lines
                        do. The pb/-mb pair appears on both the mask and the
                        line and has to: on the mask it extends the clip region
                        so descenders survive, and on the line it grows the box
                        that yPercent measures against, so 110% clears the edge
                        completely. The negative margins leave the collapsed
                        layout identical to a plain heading. */}
                    <h3 className="font-sans text-3xl md:text-4xl font-medium tracking-tight overflow-hidden pb-[0.16em] -mb-[0.16em]">
                      <span className="home-cell-title block pb-[0.16em] -mb-[0.16em]">
                        {c.title}
                      </span>
                    </h3>
                    {/* `reveal-init` without `data-reveal`: the class is the
                        site's existing start state — opacity plus a translate
                        in pixels, which is exactly what this tween animates —
                        and leaving the attribute off keeps the shared provider
                        from claiming it. Every safety net that class carries
                        comes with it. */}
                    <p className="home-cell-body reveal-init mt-4 max-w-[40ch] font-sans text-base md:text-lg text-brand-graphite transition-colors duration-500 group-hover:text-white/75 motion-reduce:transition-none">
                      {c.body}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Clients ──────────────────────────────────────────────────── */}
        <section className="py-12 border-y border-brand-border bg-brand-offwhite overflow-hidden">
          <Marquee brands={brands} />
        </section>

        {/* ── Words ──────────────────────────────────────────────────────── */}
        <section className="px-6 md:px-12 py-24 md:py-32">
          <div className="max-w-[1920px] mx-auto">
            <div
              className="text-[10px] md:text-xs font-sans font-bold uppercase tracking-[0.2em] text-brand-graphite reveal-init"
              data-reveal
            >
              {content.testimonialsLabel}
            </div>
            <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-12 md:gap-16">
              {testimonials.map((t, i) => (
                <figure
                  key={i}
                  className="flex flex-col justify-between reveal-init"
                  data-reveal
                >
                  <blockquote className="font-serif text-xl md:text-2xl leading-snug text-brand-black">
                    &ldquo;{t.quote}&rdquo;
                  </blockquote>
                  <figcaption className="mt-8 pt-4 border-t border-brand-border">
                    <span className="block font-sans font-bold text-sm">
                      {t.author}
                    </span>
                    <span className="block font-sans text-xs uppercase tracking-widest text-brand-graphite mt-1">
                      {t.role}, {t.company}
                    </span>
                  </figcaption>
                </figure>
              ))}
            </div>
          </div>
        </section>

        {/* Nothing closes the page here. The exploration this grew out of ended
            on its own CTA block and a legal strip; the site already has both in
            FooterAlt, rendered by (site)/layout.tsx below every route, so
            bringing a second one would have given the homepage two endings. */}
    </div>
  );
};

export default HomePage;
