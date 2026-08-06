"use client";

import { gsap } from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ScrollSmoother } from "gsap/ScrollSmoother";

// Registration must happen exactly once, before any plugin is used, and never
// inside a component body that re-renders. Import gsap from here — not from
// "gsap" directly — so every client component shares this single registration.
gsap.registerPlugin(useGSAP, ScrollTrigger, ScrollSmoother);

// Tells the failsafe in the root layout's inline <head> script that the client
// bundle got this far, so it should leave the CSS start states armed. If this
// module never evaluates the gate comes off and the content that GSAP would have
// revealed shows itself instead of staying hidden forever.
declare global {
  interface Window {
    __gsapReady?: boolean;
  }

  /**
   * ScrollSmoother supports `wholePixels` at runtime — it rounds the content
   * transform to integers — but it's missing from the shipped type definitions,
   * so declaring it here is what makes it usable without a cast at the call site.
   * See ScrollSmoother.js, `wholePixels && (y = Math.round(y))`.
   */
  /* eslint-disable-next-line @typescript-eslint/no-namespace --
     The rule is about not using namespaces in place of ES modules. This is
     declaration merging into a namespace GSAP itself declares globally, which is
     the only way to add a property to its Vars interface. */
  namespace ScrollSmoother {
    interface Vars {
      wholePixels?: boolean;
    }
  }
}
if (typeof window !== "undefined") window.__gsapReady = true;

export { gsap, useGSAP, ScrollTrigger, ScrollSmoother };
