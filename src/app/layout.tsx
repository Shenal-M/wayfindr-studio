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
      // `anim` arms the CSS start states for GSAP's entrance animations — see
      // the .anim rules in globals.css.
      //
      // It ships in the server-rendered HTML rather than being added by the
      // script below, for two reasons. It applies before the first paint, so
      // content is never seen in its final position and then hidden. And it
      // matches what React hydrates against: a script that adds a class to
      // <html> mutates the element before hydration, and React compares the
      // server's className to the live one and reports a mismatch it refuses to
      // patch up. Rendering the class server-side means there is nothing to
      // reconcile, which is a real fix rather than a suppressHydrationWarning
      // papering over one.
      className={`${plusJakartaSans.variable} ${playfairDisplay.variable} anim`}
    >
      <head>
        {/* Failsafe for the gate above, and nothing else — it deliberately
            mutates no DOM at parse time.

            src/lib/gsap.ts sets __gsapReady the moment it evaluates, so a bundle
            that loads normally clears this long before the timer fires. If it
            fires with the flag still unset, the client JS never ran and the
            hidden content would be stranded, so the gate comes off. Keyed on the
            flag rather than a bare timeout because reveals below the fold are
            legitimately still waiting at this point, and un-hiding those would
            break them.

            The removal happens seconds after hydration, so it can't cause a
            mismatch. */}
        <script
          dangerouslySetInnerHTML={{
            __html: `setTimeout(function(){window.__gsapReady||document.documentElement.classList.remove('anim')},4000)`,
          }}
        />
        {/* With scripting off the failsafe above never runs, so the start states
            are neutralised here instead. */}
        <noscript>
          <style>{`.anim .reveal-init{opacity:1!important;transform:none!important}.anim .home-line,.anim .home-word-init,.anim .home-cell-title{visibility:visible!important}.anim .home-rule,.anim .cap-rule,.anim .cap-title,.anim .cap-tag{transform:none!important}.anim .cap-row,.anim .cap-tag{opacity:1!important}`}</style>
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


