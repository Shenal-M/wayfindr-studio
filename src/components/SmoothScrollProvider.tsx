"use client";

import React, { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { gsap, useGSAP, ScrollTrigger, ScrollSmoother } from "../lib/gsap";

type Props = {
  children: React.ReactNode;
};

/**
 * Wraps the site in the DOM structure ScrollSmoother requires and drives it.
 * `position: fixed` elements (the nav header and its menu overlay) must be
 * rendered OUTSIDE this component, or the smooth wrapper's transform will
 * contain them and they'll scroll away with the content.
 */
const SmoothScrollProvider: React.FC<Props> = ({ children }) => {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();

  useGSAP(
    () => {
      const mm = gsap.matchMedia();

      mm.add("(prefers-reduced-motion: no-preference)", () => {
        ScrollSmoother.create({
          wrapper: "#smooth-wrapper",
          content: "#smooth-content",
          smooth: 1.2,
          effects: true, // enables data-speed / data-lag attributes
          smoothTouch: 0, // native scroll on touch devices
          ignoreMobileResize: true, // don't re-measure when the mobile URL bar hides
        });

        // Child effects run before parent effects in React, so page-level
        // ScrollTriggers already exist by now — re-measure them against the
        // smoother rather than the pre-smoother layout.
        ScrollTrigger.refresh();
      });

      // Webfonts swap in after first paint and change text height, which moves
      // every trigger below it.
      document.fonts?.ready.then(() => ScrollTrigger.refresh());

      // The page keeps growing after first paint — images arriving, the logo
      // strip resizing itself once it knows each mark's aspect ratio. Every
      // one of those changes the maximum scroll, and a smoother measured
      // against the old height fights its own clamp at the bottom of the page,
      // which reads as a wobble. Resizing the window used to be the only thing
      // that corrected it, because resizing is what triggers a refresh.
      let lastHeight = 0;
      const remeasure = gsap.delayedCall(0.2, () => ScrollTrigger.refresh()).pause();
      const sizeWatcher = new ResizeObserver(([entry]) => {
        const height = entry.contentRect.height;
        // Threshold guards against refresh feeding itself sub-pixel noise.
        if (Math.abs(height - lastHeight) < 1) return;
        lastHeight = height;
        remeasure.restart(true);
      });
      if (contentRef.current) sizeWatcher.observe(contentRef.current);

      return () => {
        sizeWatcher.disconnect();
        remeasure.kill();
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

    ScrollTrigger.refresh();
  }, [pathname]);

  return (
    <div id="smooth-wrapper" ref={wrapperRef}>
      <div id="smooth-content" ref={contentRef}>
        {children}
      </div>
    </div>
  );
};

export default SmoothScrollProvider;
