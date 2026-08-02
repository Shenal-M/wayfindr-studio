"use client";

import { gsap } from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ScrollSmoother } from "gsap/ScrollSmoother";

// Registration must happen exactly once, before any plugin is used, and never
// inside a component body that re-renders. Import gsap from here — not from
// "gsap" directly — so every client component shares this single registration.
gsap.registerPlugin(useGSAP, ScrollTrigger, ScrollSmoother);

export { gsap, useGSAP, ScrollTrigger, ScrollSmoother };
