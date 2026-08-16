"use client";

import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useNavChrome } from "./NavChrome";
import { useLenisRef } from "./SmoothScrollProvider";
import NavigatorIcon from "./NavigatorIcon";

/**
 * The site header.
 *
 * The bar itself is never visible. What you see is two islands — one behind the
 * wordmark, one behind the links — and the <header> around them paints nothing
 * on any route, at any scroll position. Which one of the island surfaces is worn
 * is decided by NavChrome rather than here; this file only knows how to draw
 * each of them.
 *
 * The single exception is the homepage over its clip, where even the islands go
 * away and the links' colour is read off the frame behind them instead.
 *
 * There used to be a third state: a full-width white bar with black links, worn
 * below the hero. It is gone, not merely unrouted — see the header element's own
 * comment for why leaving the string behind was the actual hazard.
 *
 * `text-[var(--nav-ink)]` is the whole adaptive mechanism: the homepage samples
 * the strip of footage directly behind this bar a few times a second and writes
 * black or white to that property on <html>. Naming a variable rather than a
 * colour means one DOM write recolours the header with no React render involved,
 * and because the links already carry `transition-colors` the change eases
 * rather than snapping. `globals.css` defines the property so it is never unset.
 *
 * Note the hover while overlaid is an opacity rather than a second colour: a
 * value held in a custom property cannot take Tailwind's `/70` modifier, which
 * is resolved at build time against a value that is not known until runtime.
 */

const NAV_ITEMS = [
  { label: "Work", path: "/work" },
  { label: "Agency", path: "/agency" },
  { label: "Contact", path: "/contact" },
];

/** The curve the whole site's larger transitions use. */
const EASE = [0.16, 1, 0.3, 1] as const;

/**
 * The island surface, over a video or a photograph.
 *
 * Mostly a *filter* rather than a fill: it darkens and blurs what is already
 * behind it and pushes the colour back up, so over a red wall the island goes
 * deep red and over ivy it goes deep green. It takes the hue of whatever it sits
 * on rather than laying a neutral sheet across it — the difference between the
 * chrome belonging to the image and being parked on it.
 *
 * Each part has a job:
 *
 *   brightness  the whole reason white type is safe here, and the only part that
 *               works on a *bright* backdrop.
 *   blur-xl     strong on purpose. It flattens detail so a hard light/dark edge
 *               cannot run through the middle of a word — the one thing
 *               darkening alone does not fix.
 *   saturate    aesthetic only; brightness alone leaves the image looking muddy.
 *   bg-ink/16   a floor under the brightness so a blown highlight cannot reach
 *               through, and the only part that still applies at all if
 *               backdrop-filter is unsupported.
 *
 * This is now the whole site's header, not just a case study's, so it has to
 * carry white type over the hero photograph, over white body copy, over the
 * offwhite sections *and* over the black footer. A translucent fill cannot do
 * that; a brightness filter can, because it darkens whatever it is given rather
 * than blending toward a fixed colour.
 *
 * ── ON THE BRIGHTNESS NUMBER ──────────────────────────────────────────────
 * These two values were arrived at by eye, over the case study photography, in
 * three passes — 0.55 then 0.62 then 0.68, each one asked for as "less dark". It
 * is worth writing down what that cost, because the number it trades against is
 * not visible from the page it was tuned on.
 *
 * The composite over a backdrop of value B is `0.84·B·0.68 + 0.16·5`. Over pure
 * white that is #929292, and white type on it measures 3.1:1 — well under the
 * 4.5:1 that the 12px uppercase links need. It clears 4.5:1 over any backdrop
 * darker than about #cecece, so the heroes, the offwhite sections and the footer
 * are all fine and the shortfall is the plain white pages only. For reference:
 * 0.62/0.20 measured 3.8:1 and 0.55/0.20 measured 4.9:1, which was the last
 * value that passed everywhere. Changing those two tokens is the whole revert.
 *
 * Do not try to buy the contrast back by raising `bg-ink`. The fill lightens the
 * result over dark backdrops and darkens it over bright ones, so against white —
 * the only case that fails — a heavier floor makes it worse, not better. Its job
 * here is the opposite one: at 16% it is a floor against a blown highlight, and
 * lowering it from 20% is part of what lifted the box off the photography.
 *
 * Two much lighter versions were tried before and failed differently. A
 * near-invisible `bg-ink/8` with a 3px blur looked right and could not carry
 * type on its own, which is what pushed the colour onto a sampler — and that
 * brought its own class of bug. Guaranteeing contrast in the surface is what
 * lets the type be a constant.
 */
const ISLAND_DARK =
  "bg-ink/16 backdrop-blur-xl backdrop-brightness-[0.68] backdrop-saturate-[1.2]";

/**
 * The light island. Nothing routes to it at present — the dark island above is
 * the whole site's header now — and it is kept because it is one word in
 * NavChrome's route table to put back, on any page that turns out to want black
 * type instead.
 *
 * A plain white fill rather than the filter above, and it can be, because the
 * thing it has to guarantee is the opposite direction. A brightness filter is
 * the only way to force a backdrop *darker* than it might be; forcing one
 * lighter needs nothing cleverer than enough white, since the fill is a floor —
 * whatever is behind it, the result is at least 70% of the way to white.
 *
 * 70% is set by the darkest thing it ever sits on, which is the homepage's clip
 * at roughly #0a0a0c: that composites to #b6b6b6 and carries black type at
 * 10.3:1. On the white pages it is effectively invisible, which is the point —
 * there it exists only to keep the type off whatever scrolls underneath.
 */
const ISLAND_LIGHT = "bg-brand-white/70 backdrop-blur-xl backdrop-saturate-[1.1]";

/**
 * No island at all: the homepage over its video, and the resolved bar.
 *
 * Not a faint island — nothing. No fill, and `backdrop-blur-none` rather than an
 * omitted blur, so there is provably no filter either. Every intermediate
 * version of this was rejected on sight and all for the same reason: any
 * translucent layer is a grey cast, and a grey cast over saturated blue footage
 * reads as the colour being *drained* inside the box. It became visible not as a
 * shape but as a dull patch. Even a bare 3px blur is a soft rectangle you can
 * find, once you know to look for it.
 *
 * So over the clip there is only type, and its colour is measured off the frame
 * behind it — see `adaptive` in NavChrome and the sampler in lib/navInk.ts. That
 * pairing is what makes an empty surface safe here and nowhere else: the box is
 * not holding the type legible, because nothing is asking it to.
 *
 * Do not reach for this on a surface where the type is a fixed colour. That was
 * tried, and it is why the two fills above exist.
 */
const ISLAND_NONE = "bg-transparent backdrop-blur-none";

/**
 * The link hover: a hairline rule that sweeps out from the left.
 *
 * Replaces a `hover:opacity-70`, which was wrong for a reason worth keeping.
 * Dimming works when type sits on a surface it contrasts strongly with — the
 * result reads as the same colour, quieter. On the dark island the type is white
 * and the surface is a mid grey, so 70% white lands *in* the surface's own
 * range: hovering a link turned it grey on grey, which is the exact appearance
 * of a disabled control. The affordance was pointing the wrong way.
 *
 * So nothing about the type changes here. The rule is a separate mark that
 * arrives, which leaves the word at full strength and reads as pointing at it
 * rather than switching it off.
 *
 * `bg-current` rather than a named colour is what lets one string cover every
 * mode: it inherits from the link, so it is white on the island and, over the
 * clip, whatever the sampler last measured — including the transition between
 * them, since it inherits the animated value rather than a fixed one.
 *
 * Animating `scaleX` from a left origin rather than `width`: a transform is
 * composited and a width is a layout property, which on a fixed element sitting
 * over playing video is the difference between a free frame and a reflow. 400ms
 * on the site's own curve — the ease front-loads almost all of the travel, so it
 * arrives quickly and settles, which reads as smoother than a linear sweep of
 * the same length.
 *
 * focus-visible gets it too. It is the only affordance these links have, and a
 * keyboard user needs it more than a pointer user does.
 *
 * `right-[0.1em]` rather than `inset-x-0` because the links are `tracking-widest`
 * — letter-spacing is added *after* every letter including the last, so the
 * element's box overhangs the final glyph by exactly that much. Matching the two
 * numbers makes the rule end where the word looks like it ends.
 */
const LINK_RULE =
  "relative after:absolute after:left-0 after:right-[0.1em] after:bottom-0 after:h-px after:bg-current after:origin-left after:scale-x-0 hover:after:scale-x-100 focus-visible:after:scale-x-100 after:transition-transform after:duration-[400ms] after:ease-[cubic-bezier(0.16,1,0.3,1)] motion-reduce:after:transition-none";

/**
 * The panel and its contents run on different clocks, in both directions.
 *
 * Opening, the panel leads and the links follow it down into space that already
 * exists — arriving together would have them sliding through a surface that is
 * still moving. Closing is asymmetric on purpose: the links go in half the time
 * and the panel takes the full duration, because the open is what was asked for
 * and the close is tidying up. Nothing should still be legible under a rising
 * edge.
 */
const PANEL_IN = { duration: 0.55, ease: EASE };
const PANEL_OUT = { duration: 0.4, ease: EASE };

const LIST_VARIANTS = {
  closed: { transition: { staggerChildren: 0.04, staggerDirection: -1 } },
  open: { transition: { staggerChildren: 0.07, delayChildren: 0.18 } },
};

const ITEM_VARIANTS = {
  closed: { opacity: 0, y: 12, transition: { duration: 0.2, ease: EASE } },
  open: { opacity: 1, y: 0, transition: { duration: 0.5, ease: EASE } },
};

const Navigation: React.FC = () => {
  const pathname = usePathname();
  const { treatment } = useNavChrome();
  const reduce = useReducedMotion();
  const lenisRef = useLenisRef();

  const [isOpen, setIsOpen] = useState(false);
  const toggleRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  /**
   * Close on navigation.
   *
   * The links call `setIsOpen(false)` too, but this is the one that is actually
   * reliable: the browser's back button does not go through a link at all, and
   * a menu still standing open over the page it just navigated to is the classic
   * mobile-menu bug.
   *
   * Adjusted during render rather than in an effect. An effect would run after
   * the browser had already painted the new route with the old menu still over
   * it — a visible frame of the wrong thing — and React flags the cascading
   * render it causes. Setting state during render is the documented way to
   * derive state from a changed input: React discards the in-progress output and
   * re-runs this component immediately, before anything is committed.
   */
  const [menuRoute, setMenuRoute] = useState(pathname);
  if (menuRoute !== pathname) {
    setMenuRoute(pathname);
    if (isOpen) setIsOpen(false);
  }

  /**
   * While the menu is open: no page scrolling behind it, Escape closes it, and
   * focus is somewhere useful.
   *
   * Two mechanisms for the scroll lock because there are two ways this page can
   * scroll. `lenis.stop()` is the real one; the overflow on <html> covers the
   * reduced-motion case, where Lenis is deliberately never constructed and the
   * page is scrolling natively. Locking only one of them leaves the background
   * scrollable on exactly the setup that was not tested.
   *
   * No visible layout shift from the overflow: this panel only exists below md,
   * where scrollbars are overlays that take no width.
   */
  useEffect(() => {
    if (!isOpen) return;

    const lenis = lenisRef?.current;
    lenis?.stop();

    const html = document.documentElement;
    const previousOverflow = html.style.overflow;
    html.style.overflow = "hidden";

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setIsOpen(false);
    };
    window.addEventListener("keydown", onKeyDown);

    // Focus moves into the panel so a keyboard or screen-reader user is not
    // left behind at the toggle with the rest of the page inert-but-focusable.
    panelRef.current?.querySelector<HTMLElement>("a")?.focus();

    return () => {
      window.removeEventListener("keydown", onKeyDown);
      html.style.overflow = previousOverflow;
      lenis?.start();
    };
  }, [isOpen, lenisRef]);

  // While the mobile panel is open the header sits on a white sheet, so it wears
  // the plain bar's clothes whatever the route asks for: black type, and no
  // island, because the panel behind it is already an opaque surface.
  const mode = isOpen ? "bar" : treatment;

  // A constant on both islands, because their surface guarantees the contrast
  // rather than hoping for it — see the two fills above. Only `adaptive`, which
  // has no surface at all, has to measure.
  const text =
    mode === "islandsDark"
      ? "text-white"
      : mode === "adaptive"
        ? "text-[var(--nav-ink)]"
        : "text-brand-black";
  // Blue is the hover wherever the type is black and the surface is light enough
  // to show it. It is not on the dark island or over bare media — #0211f0 on a
  // darkened photograph is barely a change — so those get the rule alone.
  const hover = mode === "islandsDark" || mode === "adaptive" ? "" : "hover:text-brand-blue";

  /**
   * The two islands: a box behind the wordmark and another behind the links.
   * See ISLAND_FILL for what the surface is doing.
   *
   * The geometry is applied in *every* mode and only the fill changes, which is
   * what makes resolving a pure colour transition with nothing moving. That
   * works because `px-* -mx-*` and `py-* -my-*` cancel exactly: the padding
   * pushes the painted box outward and the negative margin takes the same amount
   * back out of the layout, so the wordmark and the links sit at the identical
   * position whether or not there is a box behind them. Toggling the padding
   * instead would slide the wordmark sideways every time the header resolved.
   *
   * The horizontal padding is smaller on a phone for one reason: it is spent
   * outward from the type, and the page gutter is `px-6` there against `md:px-12`
   * on desktop. Matching the desktop padding on a phone would put the left box
   * flush against the viewport edge; each value has to stay under its gutter.
   *
   * Both axes are deliberately tight. The box is sized to the type rather than
   * given a comfortable inset, because it is chrome — the moment it reads as a
   * button or a pill it starts competing with the page for attention, and the
   * only thing it is actually for is keeping the links off the backdrop.
   */
  // Everything that paints lives in the fill, and `backdrop-blur-none` in the
  // resolved state is load-bearing rather than tidiness.
  //
  // The blur used to sit in the base, which meant it applied in every mode — so
  // once the header resolved you got the white bar *and* two blurred rectangles
  // sitting on it, because a backdrop-filter still filters when the element's own
  // background is transparent. Two boxes visible on a bar that is supposed to be
  // one continuous surface.
  const islandBase =
    "rounded-md px-3 -mx-3 md:px-4 md:-mx-4 py-1.5 -my-1.5 transition-[background-color,backdrop-filter] duration-500 motion-reduce:transition-none";
  const islandFill =
    mode === "islandsDark"
      ? ISLAND_DARK
      : mode === "islandsLight"
        ? ISLAND_LIGHT
        : ISLAND_NONE;
  const island = `${islandBase} ${islandFill}`;

  return (
    <>
      <header
        // The bar itself never paints. Everything visible in this header is one
        // of the two islands; the element around them is a positioning context
        // and nothing else, on every route and at every scroll position.
        //
        // It used to switch to `bg-brand-white/85 backdrop-blur-md border-b` once
        // a hero had scrolled past — the site's original header — and that string
        // is deliberately gone rather than left behind an unreachable branch.
        // Since every route holds islands the whole way down, the only thing that
        // could still have selected it was the context default in NavChrome, i.e.
        // a Navigation rendered with no provider above it. Which is to say the
        // one remaining way to see a full-width white bar was a bug, so the fix
        // is to make it unrepresentable rather than merely unreachable.
        //
        // The border stays as `border-transparent` rather than being dropped, so
        // the box keeps identical geometry in every state. Removing it would make
        // any future change to this element a 1px reflow of a fixed bar over
        // playing video, which reads as a twitch at the worst possible moment.
        className="fixed top-0 left-0 right-0 z-50 bg-transparent border-b border-transparent"
      >
        {/* h-16 here plus the 1px border is the 65px that globals.css reserves
            on <main> for every route without a hero, that the homepage's hero
            carries internally, and that NAV_H names for the sampler. Four
            numbers, one source — change this and the rest follow from it. */}
        <div className="max-w-[1920px] mx-auto px-6 md:px-12 h-16 flex items-center justify-between">
          {/* The left island. */}
          <Link
            href="/"
            onClick={() => setIsOpen(false)}
            className={`text-lg md:text-2xl font-sans font-bold tracking-tighter ${island} ${text}`}
          >
            Wayfindr Studio
          </Link>

          {/* The right island. */}
          <nav className={`hidden md:flex items-center gap-8 ${island}`}>
            {NAV_ITEMS.map((item) => (
              <Link
                key={item.label}
                href={item.path}
                // Kept even though nothing renders differently for it. The
                // design marks the current page with no visual affordance,
                // which is a choice available to sighted users reading the
                // headline below; it is not a reason to withhold the
                // information from assistive technology, where it costs one
                // attribute.
                aria-current={pathname === item.path ? "page" : undefined}
                className={`text-xs font-sans font-medium uppercase tracking-widest transition-colors duration-300 motion-reduce:transition-none ${LINK_RULE} ${text} ${hover}`}
              >
                {item.label}
              </Link>
            ))}

            {/* The compass needle. Desktop only — it is decorative, and 28px of
                it is a real proportion of a phone's header.

                The colour class sits here rather than on the SVG so the needle
                turns white over the video and black over the page along with
                everything else in the bar; its paths fill with `currentColor`.
                Note it reads its own bounding rect to find the cursor angle and
                bails on a zero-width one, so `hidden` below md costs it
                nothing. */}
            <div className={text}>
              <NavigatorIcon />
            </div>
          </nav>

          {/* Two bars rather than three, and not a rotated "+" or "×" glyph.
              A typographic cross is centred on the font's math axis rather than
              on its line box, so rotating it pivots around a point that is not
              where the strokes meet and it travels through a small arc instead
              of turning in place. Drawn bars give equal weight, an exact centre,
              and a pivot that *is* the crossing.

              CSS rather than Motion: it is a symmetric two-state change with no
              physics and nothing to orchestrate, so it interrupts correctly in
              both directions for free. */}
          <button
            ref={toggleRef}
            type="button"
            onClick={() => setIsOpen((open) => !open)}
            aria-expanded={isOpen}
            aria-controls="mobile-menu"
            aria-label={isOpen ? "Close menu" : "Open menu"}
            // The right island on a phone. Already 44px square, so it needs no
            // padding to add and no negative margins to cancel, unlike the two
            // above — the box *is* the tap target here rather than something
            // painted behind type.
            //
            // -mr-2 pulls the optical edge back to the page gutter while the tap
            // target keeps its full size.
            className={`md:hidden relative -mr-2 w-11 h-11 flex items-center justify-center rounded-md transition-[background-color,backdrop-filter] duration-300 motion-reduce:transition-none ${islandFill} ${text}`}
          >
            <span
              aria-hidden="true"
              className={`absolute w-6 h-px bg-current transition-transform duration-300 ease-out motion-reduce:transition-none ${
                isOpen ? "rotate-45" : "-translate-y-[3.5px]"
              }`}
            />
            <span
              aria-hidden="true"
              className={`absolute w-6 h-px bg-current transition-transform duration-300 ease-out motion-reduce:transition-none ${
                isOpen ? "-rotate-45" : "translate-y-[3.5px]"
              }`}
            />
          </button>
        </div>
      </header>

      {/* AnimatePresence because the panel leaves the React tree, and deferring
          an unmount until an exit animation has finished is the one thing no
          other layer in this stack can do.

          Unmounting rather than parking it behind `opacity-0
          pointer-events-none` is an accessibility fix, not a stylistic one:
          pointer-events stops the mouse but not the keyboard, so a permanently
          mounted menu leaves three off-screen links in the tab order on every
          page and reads out a menu that is not open. */}
      <AnimatePresence onExitComplete={() => toggleRef.current?.focus()}>
        {isOpen && (
          <motion.div
            id="mobile-menu"
            ref={panelRef}
            key="mobile-menu"
            // Slides down from behind the header rather than fading. A fade
            // between two white surfaces has nothing to read as movement; an
            // edge arriving does.
            initial={{ y: "-100%" }}
            animate={{ y: 0 }}
            exit={{ y: "-100%" }}
            transition={reduce ? { duration: 0 } : PANEL_IN}
            // z-40, under the header's z-50, so the wordmark and the toggle
            // stay on top of it and the toggle remains the way back out.
            className="md:hidden fixed inset-0 z-40 bg-brand-white flex flex-col justify-center px-6"
          >
            <motion.nav
              variants={LIST_VARIANTS}
              initial="closed"
              animate="open"
              exit="closed"
              className="flex flex-col gap-2"
            >
              {NAV_ITEMS.map((item) => (
                <motion.div
                  key={item.label}
                  variants={reduce ? undefined : ITEM_VARIANTS}
                >
                  <Link
                    href={item.path}
                    onClick={() => setIsOpen(false)}
                    aria-current={pathname === item.path ? "page" : undefined}
                    className={`block py-2 font-sans text-5xl font-semibold tracking-tight transition-colors duration-300 motion-reduce:transition-none ${
                      pathname === item.path
                        ? "text-brand-blue"
                        : "text-brand-black hover:text-brand-blue"
                    }`}
                  >
                    {item.label}
                  </Link>
                </motion.div>
              ))}
            </motion.nav>

            {/* The panel has room the header does not, so the current page gets
                a marker here even though the desktop bar shows none. */}
            <motion.div
              variants={reduce ? undefined : ITEM_VARIANTS}
              initial="closed"
              animate="open"
              exit="closed"
              transition={reduce ? { duration: 0 } : PANEL_OUT}
              className="mt-12 pt-6 border-t border-brand-border"
            >
              <a
                href="mailto:hello@wayfindr.com"
                className="font-sans text-sm uppercase tracking-widest text-brand-graphite hover:text-brand-blue transition-colors duration-300 motion-reduce:transition-none"
              >
                hello@wayfindr.com
              </a>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default Navigation;
