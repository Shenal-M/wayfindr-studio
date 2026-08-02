import type { Metadata } from "next";
import { Plus_Jakarta_Sans, Playfair_Display } from "next/font/google";
import "./globals.css";

// These were previously pulled in with an @import url(...) at the top of
// globals.css, but Tailwind v4's bundler resolves and inlines @import rules and
// silently drops ones it can't fetch — so the remote stylesheet never reached
// the browser and every page fell back to system-ui. next/font self-hosts the
// files instead: no external request, no stripped import, and no swap flash.
// Both are variable fonts, so omitting `weight` gives the whole range,
// including the 800 the hero and footer wordmarks ask for.
const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-plus-jakarta-sans",
  display: "swap",
});

const playfairDisplay = Playfair_Display({
  subsets: ["latin"],
  style: ["normal", "italic"],
  variable: "--font-playfair-display",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Wayfindr Studio",
  description: "Strategic design for ambitious brands.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${plusJakartaSans.variable} ${playfairDisplay.variable}`}
    >
      <head>
        {/* GSAP's entrance animations keep their start state in CSS to avoid a
            flash of the final state, which would leave content permanently
            hidden if the animations never run. This only renders when
            scripting is off, so there is nothing for React to hydrate. */}
        <noscript>
          <style>{`.reveal-init{opacity:1!important;transform:none!important}.hero-line{visibility:visible!important}`}</style>
        </noscript>
      </head>
      {/* suppressHydrationWarning covers attributes that browser extensions
          inject into <body> before React hydrates — Grammarly adds
          data-gr-ext-installed and data-new-gr-c-s-check-loaded, which the
          server render can't possibly contain. It only silences attribute
          mismatches on this one element, not on any of its children. */}
      <body
        suppressHydrationWarning
        className="bg-brand-white text-brand-black font-sans selection:bg-brand-blue selection:text-white"
      >
        {children}
      </body>
    </html>
  );
}


