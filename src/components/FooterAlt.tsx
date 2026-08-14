"use client";

import Link from "next/link";
import Button from "./Button";
import CopyBubble from "./CopyBubble";
import CopyLabel from "./CopyLabel";
import { useCopyToClipboard } from "./useCopyToClipboard";
import type { SocialLink } from "../types";

const LinkWithSeparator = ({ 
  href, 
  label, 
  external = false,
  showSeparator = true 
}: { 
  href: string; 
  label: string; 
  external?: boolean;
  showSeparator?: boolean;
}) => (
  <>
    {external ? (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className="text-base text-gray-400 hover:text-white transition-colors"
      >
        {label}
      </a>
    ) : (
      <Link href={href} className="text-base text-gray-400 hover:text-white transition-colors">
        {label}
      </Link>
    )}
    {showSeparator && <span className="text-gray-700 hidden md:inline" aria-hidden="true">|</span>}
  </>
);

type Props = {
  socialLinks: SocialLink[];
  email: string;
  aboutText?: string;
  /**
   * Sanitised <svg> markup for the wordmark, inlined rather than loaded as an
   * image — see loadFooterLogo in (site)/layout.tsx for why. Null falls back to
   * the text wordmark below.
   */
  logoMarkup?: string | null;
};

const FooterAlt = ({ socialLinks, email, aboutText, logoMarkup }: Props) => {
  const { copied, bubbleVisible, copy, hoverHandlers } = useCopyToClipboard(email);

  return (
    // No seam guard needed here any more. This used to carry a 4px shadow of its
    // own background colour, because ScrollSmoother translated #smooth-content by
    // a fractional amount while the browser's scrollHeight is a whole number — so
    // at maximum scroll the content could stop a fraction of a pixel short and
    // expose a hairline of the white body behind it. Lenis animates real scroll
    // and applies no transform, so there is no longer a discrepancy to cover.
    <footer className="bg-brand-black text-brand-white w-full py-20 mt-auto">
      <div className="max-w-[1920px] mx-auto px-6 md:px-12">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-12 mb-12 pb-12 border-b border-gray-800">
          <h4 className="md:col-span-2 text-xs font-bold uppercase tracking-[0.3em] text-gray-500">
            About
          </h4>
          <p className="md:col-span-10 text-lg md:text-xl leading-relaxed text-gray-300 max-w-4xl">
            {aboutText || (
              <>
                Wayfindr Studio is a strategic design agency. We combine{" "}
                <span className="font-serif italic text-white">Swiss precision</span> with 
                unexpected wit to build high-end digital experiences for reliable brands. 
                Guided by curiosity and intellect, we create work that redefines ideas, 
                shifts perceptions, and leaves an imprint across disciplines and industries.
              </>
            )}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-12 mb-16">
          <div className="md:col-span-2" />
          <div className="md:col-span-10">
            <span className="text-xs font-bold uppercase tracking-widest text-gray-500 mb-3 block">
              Get in Touch
            </span>
            {/* Two separate controls rather than one button with two internal
                layouts. The mobile treatment IS a button — a solid pill — so it
                has to be the <Button> element itself; nesting that inside an
                outer <button>, as this did before, is invalid HTML. Splitting on
                the breakpoint at the top level keeps each one a single element. */}
            {/* No aria-label here on purpose. One would override the visible
                text as the accessible name, so a screen reader would keep
                announcing "copy email address …" and never hear the label change
                to the confirmation. Letting the text speak for itself means the
                state change is announced.

                Same CopyLabel as the bubble uses, so the mobile pill confirms
                with the same wording and the same crossfade as its desktop
                counterpart instead of hard-swapping its text. */}
            <Button variant="solidPill" className="md:hidden" onClick={copy}>
              <CopyLabel idle={email} done="Copied!" showDone={copied} />
            </Button>

            {/* Desktop: the email reads as text and the bubble does the talking,
                so the button itself stays unstyled. */}
            <button
              onClick={copy}
              {...hoverHandlers}
              className="group text-left hidden md:flex items-center gap-3"
            >
              <span className="text-2xl font-bold text-white transition-colors duration-300 group-hover:text-gray-300">
                {email}
              </span>
              <CopyBubble tone="onDark" visible={bubbleVisible} copied={copied} />
            </button>
          </div>
        </div>
      </div>

      {/* This wordmark carries no compositing hints — no will-change, no
          translateZ(0), no backface-visibility — and it doesn't need any. It is
          not animated; the page simply scrolls past it. Promoting a static
          element to its own layer costs memory and buys nothing.

          Historical note, because these hints were added twice and reverted
          twice: under ScrollSmoother the whole page sat inside an animated
          transform, so a separately-promoted child snapped to whole device pixels
          while the layer around it glided by fractional amounts, and the wordmark
          visibly wobbled against its surroundings. Lenis scrolls natively and
          applies no transform, so neither the original shimmer nor the wobble the
          hints caused is reachable now. Don't reintroduce them speculatively.

          Nothing else here needs styling either: Tailwind's preflight already
          gives img `display:block`, `max-width:100%` and `height:auto`, so the
          inline copies of those were duplication. */}
      <div className="mb-16 w-full px-6 md:px-12">
        {logoMarkup ? (
          /* Inline SVG rather than an <img>. The original reason was a rendering
             one — an image's painted rect gets snapped to whole device pixels
             while adjacent text is positioned sub-pixel, which made the two step
             against each other inside ScrollSmoother's transformed content — and
             that specific problem is gone with ScrollSmoother. The other two
             reasons stand on their own and are why this stays inline: zero layout
             shift, because the geometry is already in the HTML rather than
             arriving over the network, and one fewer request on every page, since
             the footer is in the shared layout.

             The arbitrary child selectors size the SVG rather than an <img>: the
             asset carries a viewBox and no width/height, so width:100% plus
             height:auto derives the height from the viewBox's ratio. No space
             needs reserving because the geometry is already in the HTML.

             role/aria-label go on the wrapper rather than the SVG so the wordmark
             reads as one image to assistive tech regardless of what the asset's
             own markup does or doesn't declare. */
          <div
            role="img"
            aria-label="Wayfindr"
            className="w-full [&>svg]:block [&>svg]:w-full [&>svg]:h-auto"
            dangerouslySetInnerHTML={{ __html: logoMarkup }}
          />
        ) : (
          <h2 className="font-sans font-extrabold text-[19vw] md:text-[21vw] leading-none text-white whitespace-nowrap overflow-hidden">
            Wayfindr
          </h2>
        )}
      </div>

      <div className="max-w-[1920px] mx-auto px-6 md:px-12">
        <div className="flex flex-col md:flex-row md:items-baseline md:justify-between gap-6">
          <nav className="flex flex-wrap items-baseline gap-x-4 md:gap-x-8 gap-y-3" aria-label="Social media">
            {socialLinks.map((link, idx) => (
              <LinkWithSeparator
                key={link.platform}
                href={link.url}
                label={link.platform}
                external
                showSeparator={idx < socialLinks.length - 1}
              />
            ))}
          </nav>
          <div className="flex flex-col md:flex-row md:items-baseline gap-2 md:gap-6">
            <Link href="#" className="text-sm md:text-base text-gray-400 hover:text-white transition-colors">
              Privacy Policy
            </Link>
            <p className="text-sm text-gray-500">© 2020 – 2025 Wayfindr Studio</p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default FooterAlt;
