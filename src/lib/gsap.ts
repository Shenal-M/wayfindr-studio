"use client";

import { gsap } from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";

// Registration must happen exactly once, before any plugin is used, and never
// inside a component body that re-renders. Import gsap from here — not from
// "gsap" directly — so every client component shares this single registration.
//
// ScrollSmoother is deliberately absent. Smooth scrolling is Lenis's job now
// (see SmoothScrollProvider), and the two cannot coexist: they would both claim
// the page scroll. See .claude/skills/animation-stack for the division of
// labour. GSAP's remaining scope here is ScrollTrigger and timelines.
gsap.registerPlugin(useGSAP, ScrollTrigger);

// Tells the failsafe in the root layout's inline <head> script that the client
// bundle got this far, so it should leave the CSS start states armed. If this
// module never evaluates the gate comes off and the content that GSAP would have
// revealed shows itself instead of staying hidden forever.
declare global {
  interface Window {
    __gsapReady?: boolean;
  }
}
if (typeof window !== "undefined") window.__gsapReady = true;

export { gsap, useGSAP, ScrollTrigger };
