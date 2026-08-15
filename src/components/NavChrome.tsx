"use client";

import React, { createContext, useContext, useMemo, useState } from "react";
import { usePathname } from "next/navigation";
import { useGSAP, ScrollTrigger } from "../lib/gsap";
import {
  createNavInkSampler,
  NAV_H,
  NAV_INK_PROP,
  NAV_INK_SAMPLE_MS,
} from "../lib/navInk";

/**
 * What the fixed header should look like right now, and the one place that
 * decides it.
 *
 * The problem this solves is an ownership one. The header is rendered by
 * (site)/layout.tsx so it is identical on every page; the media it has to stay
 * legible against is rendered by the page. Neither can reach the other — they
 * are siblings — so something has to sit above both.
 *
 * Two independent facts combine into the answer:
 *
 *   the route's treatment  Does this route open on full-bleed media, and if so
 *                          which header treatment does that media want? Derived
 *                          from the pathname, synchronously, which matters more
 *                          than it looks. The obvious alternative is to have the
 *                          hero register itself on mount, and that is a frame
 *                          late: the header would paint solid and <main> would
 *                          reserve its 65px of padding, then both would change
 *                          once the effect ran. A visible flash and a layout
 *                          shift on every load. The pathname is known during the
 *                          server render, so there is nothing to correct.
 *
 *   atTop                  Is that media still behind the bar? This one cannot
 *                          be derived — it depends on scroll — so it comes from
 *                          a ScrollTrigger, below. It is a threshold that flips
 *                          twice per page, not a per-frame value, so driving
 *                          React state from it is fine: `onToggle` fires only on
 *                          an actual change, never on every tick.
 */

/**
 * How the header renders.
 *
 *   islandsDark   The wordmark and the links each sit on their own box that
 *                 darkens and blurs whatever is behind it, with white type. The
 *                 site's header, everywhere, at every scroll position — with the
 *                 single exception below.
 *
 *   adaptive      No box at all, and the link colour *measured* off the media
 *                 behind it several times a second. The homepage, and only while
 *                 its clip is still behind the bar. It is the expensive way to
 *                 stay legible — a canvas, a timer, two thresholds and a
 *                 cross-origin requirement on the media — and it buys the one
 *                 thing an island cannot: nothing at all between the reader and
 *                 the picture. Worth it there because that first screen is the
 *                 clip, and any box on it, however faint, reads as a patch.
 *
 *   islandsLight  The same two boxes, but a light fill with black type. Nothing
 *                 routes to it; kept as a one-word alternative for a page that
 *                 turns out to want black chrome.
 *
 *   bar           The old full-width white bar. Only the open mobile menu uses
 *                 it now, where the panel behind is a white sheet.
 *
 * One treatment for the whole site is the point rather than a simplification.
 * Per-route chrome meant the header changed identity as you moved around, and
 * the dark island is the one surface that does not care what is underneath it: a
 * brightness filter darkens whatever it is given, so the same box works over a
 * hero photograph, over white body copy, over the offwhite sections and over the
 * black footer. A translucent fill has to be chosen against a known backdrop,
 * which is exactly what a shared header does not have.
 */
export type NavTreatment = "bar" | "adaptive" | "islandsLight" | "islandsDark";

/**
 * What a route wears over its hero, and what it changes to once that hero is
 * past. Equal values mean it never changes and nothing needs to watch scroll.
 *
 * Only the homepage differs between the two, and it has to. Its top state is
 * `adaptive`, whose type colour is measured off the clip — and the sampler stops
 * the moment the clip leaves, because there is nothing left to measure. Holding
 * that state below the hero would leave the last colour it happened to read
 * stranded over white page copy, which is white type on white about half the
 * time. So it hands over to the island every other page is already wearing.
 *
 * Everything else holds `islandsDark` the whole way down, including the case
 * studies over their hero photography. Nothing to watch for, no crossfade, no
 * moment where the header is between two identities.
 */
type RouteChrome = { top: NavTreatment; resolved: NavTreatment };

const chromeForRoute = (pathname: string): RouteChrome => {
  if (pathname === "/") {
    return { top: "adaptive", resolved: "islandsDark" };
  }
  return { top: "islandsDark", resolved: "islandsDark" };
};

/**
 * Whether this route opens on full-bleed media running to the very top of the
 * document — which is the only reason <main> would skip the header's height.
 *
 * Deliberately a separate question from the treatment. Every page has islands
 * now, so "has a box for a header" no longer implies "has something behind it";
 * an ordinary page still needs its content to start *below* the chrome rather
 * than underneath it.
 *
 * `/work` itself is absent because the pattern requires a segment after it. The
 * index is an ordinary page with a heading at the top, not a hero.
 */
const hasTopMedia = (pathname: string) =>
  pathname === "/" || /^\/work\/[^/]+$/.test(pathname);

type NavChromeValue = {
  /** What the header should render this frame. */
  treatment: NavTreatment;
  /** Whether <main> has to reserve the header's height as top padding. */
  reserveTop: boolean;
};

const NavChromeContext = createContext<NavChromeValue>({
  treatment: "bar",
  reserveTop: true,
});

export const useNavChrome = () => useContext(NavChromeContext);

export const NavChromeProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const pathname = usePathname();
  const { top: topTreatment, resolved } = chromeForRoute(pathname);

  /**
   * Nothing to watch for: this route wears one header the whole way down.
   *
   * Worth having as a case rather than always running the trigger, because the
   * change it avoids is the visible one. Going from two filtered boxes to a
   * full-width bar means a 500ms crossfade during which the boxes are still
   * there *on top of* the bar — inherent to interpolating a backdrop-filter, not
   * something that can be tuned out. The islands were kept the whole way down
   * precisely so that moment never arrives.
   */
  const persistent = topTreatment === resolved;

  // Starts true: a route that has a top state is showing it until the trigger
  // below says otherwise, and one that does not ignores this entirely.
  const [atTop, setAtTop] = useState(true);

  /**
   * The resolve point, owned here rather than by each page.
   *
   * The page marks its hero with `data-nav-hero` and that is its entire
   * involvement — which is what keeps the case study a pure server component
   * with no client boundary of its own. It also means one implementation rather
   * than one per overlaid page, and those had already started to differ.
   *
   * Querying the document is safe from here: React runs child effects before
   * parent ones, so by the time this layout effect fires the page below has
   * mounted and its hero is in the DOM.
   *
   * Deliberately not inside a reduced-motion gate. This is not an animation — it
   * decides whether the header is legible against what is behind it — and
   * somebody who has asked for less movement still needs black links once the
   * white page arrives under the bar.
   */
  useGSAP(
    () => {
      // Hand the link colour back to its stylesheet default before anything
      // measures, on every route change.
      //
      // Belt and braces with the `applied` tracking inside the sampler, and
      // worth having both: that fixes the sampler lying to itself about what it
      // wrote, this makes the *baseline* right for the window between navigating
      // and the new hero's first successful measurement. Without it a bright case
      // study leaves black on <html> and the next page's first paint uses it —
      // which on a dark hero is a beat of invisible links before the sampler
      // catches up.
      document.documentElement.style.removeProperty(NAV_INK_PROP);

      // A persistent treatment never resolves, so there is nothing to watch for
      // and nothing to measure — it carries its own contrast the whole way down.
      // Everything below this line exists for the homepage's `adaptive` top
      // state, which is the only one that changes.
      if (persistent) return;

      const hero = document.querySelector<HTMLElement>("[data-nav-hero]");
      if (!hero) {
        // An overlaid route whose page forgot to mark its hero. Falling back to
        // the solid header is the safe direction: the alternative is white links
        // on whatever the page happens to start with.
        setAtTop(false);
        return;
      }

      ScrollTrigger.create({
        trigger: hero,
        // The hero's bottom edge reaching the *underside* of the header, not the
        // top of the viewport — and the same NAV_H the sampler uses to decide
        // which strip of media is behind the bar, so the two can never disagree
        // about where the header stops being over it.
        start: `bottom top+=${NAV_H}`,
        // Two edge callbacks rather than `end: "max"` + `onToggle`, and that
        // difference is a bug fix rather than a preference.
        //
        // A ScrollTrigger is "active" *between* start and end, so `end: "max"`
        // means the range ends at the furthest the document can scroll — and
        // arriving there counts as leaving it. Scroll to the footer and the
        // trigger went inactive, `onToggle` reported `!isActive` as "still at the
        // top", and the header threw its background away at the very bottom of
        // the page. The same edge also made it flicker between the bar and the
        // islands while scrolling near the end.
        //
        // onEnter and onLeaveBack are both keyed to `start` alone, so where the
        // range happens to end stops mattering at all. Nothing handles onLeave or
        // onEnterBack, which is correct: crossing the end in either direction
        // should not change a decision that is only about the hero's bottom edge.
        onEnter: () => setAtTop(false),
        onLeaveBack: () => setAtTop(true),
      });

      // Sync once on creation, measured directly rather than read off the
      // trigger. `self.isActive` is false both before the start and after the
      // end, so a load that restored a scroll position near the footer would
      // report exactly the same thing as a load at the very top — which is the
      // bug above, arriving a different way.
      setAtTop(hero.getBoundingClientRect().bottom > NAV_H);

      // ── Reading the media ─────────────────────────────────────────────────
      // `adaptive` only, by the early return above. `islands` needs none of it:
      // its surface guarantees contrast rather than measuring for it, which is
      // the entire trade between the two treatments.
      const media = hero.querySelector<HTMLVideoElement | HTMLImageElement>(
        "video, img",
      );
      // An overlaid hero with no media in it — the homepage with no clip
      // configured in Sanity, which falls back to a flat near-black ground. The
      // white default is already the right answer against it, and starting a
      // timer that measures nothing several times a second is not.
      if (!media) return;

      const sampler = createNavInkSampler(
        () => media,
        () => hero,
      );

      // The cadence is the only thing the two kinds of media differ on. A clip
      // changes every frame and needs a timer; a photograph is measured once it
      // has decoded, and again whenever the layout moves — a resize re-crops
      // `object-cover` and puts different pixels behind the bar.
      if (media instanceof HTMLVideoElement) {
        const timer = window.setInterval(() => {
          // read() returns false once the canvas has tainted, which cannot
          // recover — so the interval stops rather than failing forever.
          if (!sampler.read()) window.clearInterval(timer);
        }, NAV_INK_SAMPLE_MS);
        sampler.read();
        return () => window.clearInterval(timer);
      }

      const read = () => {
        sampler.read();
      };
      // May already have decoded — this is an eager image and the browser can
      // finish it before hydration, in which case `load` never fires.
      read();
      media.addEventListener("load", read);
      ScrollTrigger.addEventListener("refresh", read);
      return () => {
        media.removeEventListener("load", read);
        ScrollTrigger.removeEventListener("refresh", read);
      };
    },
    { dependencies: [persistent, pathname], revertOnUpdate: true },
  );

  const value = useMemo(
    () => ({
      // A persistent route ignores `atTop` entirely — its two states are the
      // same one, so there is nothing for scroll to choose between.
      treatment: persistent || atTop ? topTreatment : resolved,
      reserveTop: !hasTopMedia(pathname),
    }),
    [topTreatment, resolved, persistent, atTop, pathname],
  );

  return (
    <NavChromeContext.Provider value={value}>
      {children}
    </NavChromeContext.Provider>
  );
};

/**
 * The page's <main>, which needs the header's height as top padding on every
 * route except the overlaid ones.
 *
 * That padding is what stops content sliding under a fixed header, and it is
 * exactly wrong when the header has no bar: anything reserved above the hero
 * shows through as a strip of page background. On the homepage that put a white
 * band across the top of the video. An overlaid hero carries whatever clearance
 * it needs internally instead, so the media starts at y=0 and runs behind the
 * chrome while the content still sits below it.
 *
 * A client component purely to read the context — it renders one element and
 * holds no state of its own.
 */
export const SiteMain: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { reserveTop } = useNavChrome();

  return (
    // 4rem + 1px is the header's h-16 plus its bottom border. A plain 4rem
    // leaves content sitting one pixel under the rule.
    <main className={`grow ${reserveTop ? "pt-[calc(4rem+1px)]" : ""}`}>
      {children}
    </main>
  );
};
