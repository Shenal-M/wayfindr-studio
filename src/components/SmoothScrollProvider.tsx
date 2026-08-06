"use client";

import React, { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { gsap, useGSAP, ScrollTrigger, ScrollSmoother } from "../lib/gsap";

type Props = {
  children: React.ReactNode;
};

/**
 * Parallax runs off the smoother's own rAF loop, which only exists on devices
 * that get smoothing. `smoothTouch: 0` means touch devices scroll natively, so
 * the same data-speed effects would be driven by raw scroll events — and those
 * aren't frame-synced during momentum scrolling, so the images judder against
 * the page. Native scroll with no parallax beats parallax that stutters.
 *
 * isTouch === 1 is GSAP's "touch-only device"; hybrids (2) keep the effects.
 */
const parallaxWanted = () => ScrollTrigger.isTouch !== 1;

/**
 * (Re)bind data-speed / data-lag to whatever is currently in the DOM.
 *
 * `effects: true` on ScrollSmoother.create() resolves its selector exactly once,
 * at create time. The App Router swaps the contents of #smooth-content without
 * remounting this component, so relying on that would mean parallax works on a
 * hard load and silently does nothing after any client-side navigation — while
 * the previous route's effects live on, pointed at detached nodes whose rects
 * all read zero, still taking part in every refresh.
 */
const bindEffects = () => {
  const smoother = ScrollSmoother.get();
  if (!smoother) return;

  // effects() with no argument returns the live list; killing an effect also
  // reverts the y it had written, so orphans don't leave a transform behind.
  smoother.effects().forEach((effect) => {
    if (!effect.trigger?.isConnected) effect.kill();
  });

  // Either branch ends in exactly one refresh, which is what the page-level
  // ScrollTriggers need too: they're created by child components, whose effects
  // run before this parent's, so on first mount they measured against the
  // pre-smoother layout.
  if (parallaxWanted()) {
    // effects() fires its own ScrollTrigger.refresh() — newly created effects
    // need one anyway to compute their start/end.
    smoother.effects("[data-speed], [data-lag]");
  } else {
    ScrollTrigger.refresh();
  }
};

/**
 * Wraps the site in the DOM structure ScrollSmoother requires and drives it.
 * `position: fixed` elements (the nav header and its menu overlay) must be
 * rendered OUTSIDE this component, or the smooth wrapper's transform will
 * contain them and they'll scroll away with the content.
 */
const SmoothScrollProvider: React.FC<Props> = ({ children }) => {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();

  useGSAP(
    () => {
      const mm = gsap.matchMedia();

      mm.add("(prefers-reduced-motion: no-preference)", () => {
        ScrollSmoother.create({
          wrapper: "#smooth-wrapper",
          content: "#smooth-content",
          smooth: 1.2,
          // Rounds the content transform to whole pixels, and this is what stops
          // the giant footer wordmark shimmering as you scroll past it.
          //
          // ScrollSmoother moves the whole page by writing a transform on
          // #smooth-content, and the eased value is fractional. A composited
          // layer sitting at a fractional offset gets resampled by the
          // compositor, so anything with fine detail — a hugely upscaled SVG of
          // thin letterforms, say — is re-filtered at a new sub-pixel phase every
          // frame and its strokes visibly breathe.
          //
          // The previous attempts at this both treated the symptom. Giving the
          // wordmark `will-change: transform` put it on its own layer, which the
          // compositor then snapped to whole pixels independently of the layer
          // around it, so it jittered by 1px against its own surroundings.
          // Removing that put it back in the page layer, correctly, but the page
          // layer is the thing at a fractional offset. This fixes the offset
          // itself, for everything on the page at once.
          //
          // The cost is that scrolling advances in whole-pixel steps. Smoothing
          // is about easing and inertia, not sub-pixel placement, so at any real
          // scroll speed this is invisible — and it only applies on pointer
          // devices anyway, since smoothTouch:0 means no transform at all on
          // touch. Which matches where the shimmer was reported: desktop only.
          wholePixels: true,
          // Deliberately not `effects: true` — see bindEffects() for why the
          // one-shot selector that flag implies isn't enough here.
          smoothTouch: 0, // native scroll on touch devices
          // Suppresses the refresh that would otherwise fire every time a
          // mobile URL bar collapses. This only works if nothing else forces a
          // refresh behind its back: ScrollTrigger.refresh() goes straight to
          // the internal _refreshAll and never consults this flag, so a
          // hand-rolled height watcher calling it would quietly defeat this.
          ignoreMobileResize: true,
        });

        bindEffects();
      });

      // Webfonts swap in after first paint and change text height, which moves
      // every trigger below it. Flagged so a late-resolving promise can't
      // refresh a teardown that has already happened.
      let live = true;
      document.fonts?.ready.then(() => {
        if (live) ScrollTrigger.refresh();
      });

      // Note there is deliberately no ResizeObserver on #smooth-content here.
      // ScrollSmoother already runs one (its `autoResize` option, on by
      // default): it clamps the scroll position if the page shrank underneath
      // you, debounces by 0.2s, and — critically — no-ops while
      // ScrollTrigger.isRefreshing, so a refresh can't feed itself. A second
      // observer calling the heavier ScrollTrigger.refresh() with no such guard
      // just races the built-in one, and bypasses ignoreMobileResize above.

      return () => {
        live = false;
        mm.revert();
      };
    },
    { scope: wrapperRef }
  );

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

  // The App Router swaps the contents of #smooth-content without remounting
  // this layout, so triggers would otherwise keep the previous page's
  // measurements.
  useGSAP(() => {
    if (isFirstRender.current) {
      // Leave the initial load alone: the browser may be restoring a scroll
      // position or honouring a #hash.
      isFirstRender.current = false;
      return;
    }

    if (!isHistoryNav.current) {
      // Next resets native scroll to 0 the moment the route changes, but the
      // smoother is still holding the previous page's offset and will glide
      // down to meet it — so the new page arrives mid-scroll and animates
      // itself upward. Snapping (smooth = false) lands it at the top on the
      // first painted frame instead.
      ScrollSmoother.get()?.scrollTo(0, false);
    }
    isHistoryNav.current = false;

    // Rebinds parallax to the incoming route's elements, drops the outgoing
    // route's orphans, and refreshes once at the end.
    bindEffects();
  }, [pathname]);

  return (
    <div id="smooth-wrapper" ref={wrapperRef}>
      <div id="smooth-content">
        {children}
      </div>
    </div>
  );
};

export default SmoothScrollProvider;
