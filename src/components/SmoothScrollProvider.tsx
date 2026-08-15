"use client";

import React, {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { usePathname } from "next/navigation";
import Lenis from "lenis";
import { gsap, useGSAP, ScrollTrigger } from "../lib/gsap";
// Sets `scroll-behavior: auto` while smoothing (so native smooth scroll can't
// fight Lenis), `overscroll-behavior: contain` on [data-lenis-prevent] subtrees,
// and `overflow: hidden` while stopped. Imported here rather than in globals.css
// because Tailwind v4's bundler processes that file's @import rules and this is
// plain vendor CSS with nothing to compile.
import "lenis/dist/lenis.css";

type Props = {
  children: React.ReactNode;
};

/**
 * Access to the Lenis instance, for the rare descendant that needs to stop and
 * start page scrolling — the mobile menu is the only one today.
 *
 * A *ref* rather than the instance itself, deliberately. Lenis is constructed in
 * a layout effect, so a value passed straight through context would have to be
 * state, and setting that state would re-render this provider's entire subtree —
 * which is the whole page — once on every mount, to deliver something nobody
 * reads during render. A ref object's identity never changes, so there is no
 * re-render at all, and the consumers that need it read `.current` from an
 * effect or an event handler, by which time it is populated.
 *
 * Null under reduced motion, where Lenis is deliberately never created. Callers
 * must handle that rather than assuming a page always has smooth scroll to stop.
 */
const LenisContext = createContext<React.RefObject<Lenis | null> | null>(null);

export const useLenisRef = () => useContext(LenisContext);

/**
 * Smooth scrolling for the whole site.
 *
 * This replaced GSAP's ScrollSmoother, and the reason is structural rather than
 * preference. ScrollSmoother works by translating a wrapper element, so the real
 * scroll position never moves; Lenis animates the *actual* window scroll. That
 * one difference deletes an entire family of problems this file used to carry:
 *
 *  - No #smooth-wrapper / #smooth-content. `position: fixed` behaves normally, so
 *    the nav header and its overlay no longer have to be hoisted out of the
 *    subtree to avoid being dragged along by its transform.
 *  - No `wholePixels` workaround. The page layer isn't sitting at a fractional
 *    offset any more, so nothing is resampled by the compositor every frame and
 *    the footer wordmark can't shimmer. Same for the hairline of white that used
 *    to show under the footer at maximum scroll — scrollHeight and the transform
 *    can no longer disagree, because there is no transform.
 *  - No ScrollTrigger.scrollerProxy(). ScrollTrigger reads native scroll, which is
 *    what Lenis writes, so the two need no translation layer between them.
 *
 * Lenis owns scrolling and nothing else. Scroll-*linked* animation stays with
 * ScrollTrigger in the components that need it — see
 * .claude/skills/animation-stack for the full division of labour.
 */
const SmoothScrollProvider: React.FC<Props> = ({ children }) => {
  const lenisRef = useRef<Lenis | null>(null);
  const pathname = usePathname();

  /**
   * Reduced motion gets native scroll: Lenis is never created at all. Easing the
   * page under the user is exactly the kind of unrequested movement the setting
   * asks us to stop doing, and there's no "instant" configuration of a smoothing
   * library that beats simply not smoothing.
   *
   * Read synchronously so the first client render is already correct. Safe for
   * hydration because this component renders no DOM of its own either way.
   */
  const [reduced, setReduced] = useState(
    () =>
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );

  useEffect(() => {
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    const onChange = () => setReduced(query.matches);
    query.addEventListener("change", onChange);
    return () => query.removeEventListener("change", onChange);
  }, []);

  /**
   * Lenis is constructed here rather than with the <ReactLenis> wrapper from
   * `lenis/react`, and that is deliberate — the wrapper cannot be driven safely
   * from a parent effect.
   *
   * ReactLenis holds its instance in `useState` and creates it inside a passive
   * useEffect, exposing it through useImperativeHandle. So the ref is empty during
   * every layout effect on mount, and still empty during the parent's passive
   * effect: the ref only reflects the instance after the re-render that
   * `setLenis` schedules. An effect here reading `ref.current.lenis` would find
   * nothing, skip attaching the ticker, and — because `autoRaf` has to be off —
   * leave Lenis with no rAF driver at all. Scrolling would simply stop.
   *
   * Constructing it inside this effect makes creation, sync and teardown one
   * ordered unit with no cross-component timing to get right.
   */
  useGSAP(() => {
    if (reduced) return;

    const lenis = new Lenis({
      // GSAP's ticker is the only rAF loop on the page. Leaving this on (the
      // default) would give Lenis a second one, and the two loops desync: Lenis
      // writes window.scrollY on its tick and ScrollTrigger reads the previous
      // value on its own, a one-to-two frame lag that shows up as scroll-linked
      // animation sliding along a beat behind the scroll itself.
      autoRaf: false,
      // Frame-rate independent easing; roughly the feel of the 1.2s smoothing
      // this replaced, without a fixed duration to fight against user input.
      lerp: 0.1,
      // Touch scrolling stays native. Momentum scrolling on a touchscreen is
      // already smoothed by the OS, and layering a second easing over it is what
      // makes smooth-scroll sites feel detached on phones.
      syncTouch: false,
      // Lenis intercepts in-page anchor links so they ease rather than jumping,
      // and so they land on a position Lenis agrees with.
      anchors: true,
    });
    lenisRef.current = lenis;

    // GSAP's ticker reports elapsed time in seconds; Lenis wants milliseconds.
    const raf = (time: number) => lenis.raf(time * 1000);
    gsap.ticker.add(raf);

    // Same-frame sync. ScrollTrigger does listen for native scroll events, which
    // Lenis genuinely produces, but this makes the update part of the same tick
    // that moved the scroll rather than whatever tick the browser's event lands
    // in.
    lenis.on("scroll", ScrollTrigger.update);

    // GSAP clamps deltas larger than 500ms to 33ms so animations don't jump after
    // the main thread stalls. That protection is wrong here: the clamped step is
    // passed straight to lenis.raf(), so returning to a backgrounded tab feeds
    // Lenis a truncated delta and the page lurches. Note this is a GLOBAL GSAP
    // setting — the marquee will now skip ahead rather than resume in place after
    // a tab has been away, which is the accepted cost.
    gsap.ticker.lagSmoothing(0);

    // Positions were measured against the native scrollbar's absence/presence and
    // whatever the layout was a moment ago; one refresh once Lenis is live.
    ScrollTrigger.refresh();

    return () => {
      gsap.ticker.remove(raf);
      gsap.ticker.lagSmoothing(500, 33); // back to GSAP's documented default
      lenis.destroy(); // also removes its own listeners, including the one above
      lenisRef.current = null;
    };
  }, [reduced]);

  // Webfonts swap in after first paint and change text height, which moves every
  // trigger below it. Flagged so a late-resolving promise can't refresh after
  // teardown.
  useEffect(() => {
    let live = true;
    document.fonts?.ready.then(() => {
      if (live) ScrollTrigger.refresh();
    });
    return () => {
      live = false;
    };
  }, []);

  // Back/forward should keep the browser's restored scroll position; only
  // ordinary link navigations get forced to the top.
  const isHistoryNav = useRef(false);
  useEffect(() => {
    const onPopState = () => {
      isHistoryNav.current = true;
    };
    window.addEventListener("popstate", onPopState);
    return () => window.removeEventListener("popstate", onPopState);
  }, []);

  const isFirstRender = useRef(true);

  // The App Router swaps the page's contents without remounting this layout, so
  // the incoming route's triggers need a refresh against the new layout. Child
  // effects run before this one, so by the time it fires the new page has already
  // created its ScrollTriggers and they're waiting to be measured.
  useEffect(() => {
    if (isFirstRender.current) {
      // Leave the initial load alone: the browser may be restoring a scroll
      // position or honouring a #hash.
      isFirstRender.current = false;
      return;
    }

    if (!isHistoryNav.current) {
      // `immediate` rather than an animated scrollTo. Next resets scroll to 0 the
      // moment the route changes, so an eased trip up from the previous page's
      // offset would mean the new page arrives mid-scroll and animates itself
      // upward past its own reveals.
      //
      // The fallback covers the reduced-motion case, where there is no Lenis.
      if (lenisRef.current) lenisRef.current.scrollTo(0, { immediate: true });
      else window.scrollTo(0, 0);
    }
    isHistoryNav.current = false;

    ScrollTrigger.refresh();
  }, [pathname]);

  return (
    <LenisContext.Provider value={lenisRef}>{children}</LenisContext.Provider>
  );
};

export default SmoothScrollProvider;
