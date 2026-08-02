"use client";

import { useState } from "react";
import Link from "next/link";
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
  logoSvg?: string;
  /** Intrinsic size of the logo, used only to reserve layout space. */
  logoWidth?: number;
  logoHeight?: number;
};

const FooterAlt = ({
  socialLinks,
  email,
  aboutText,
  logoSvg,
  logoWidth,
  logoHeight,
}: Props) => {
  const [copied, setCopied] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const handleEmailClick = async () => {
    try {
      await navigator.clipboard.writeText(email);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy email:", err);
    }
  };

  return (
    // The shadow is a seam guard, not decoration. ScrollSmoother transforms
    // #smooth-content, but the browser's scrollHeight is a whole number while
    // the content's height is fractional — so at maximum scroll the content
    // can stop a fraction of a pixel short of the viewport bottom, exposing a
    // hairline of the white body background. Painting the footer's own colour
    // a few pixels past its box covers that without touching layout or
    // scroll height.
    <footer className="bg-brand-black text-brand-white w-full py-20 mt-auto shadow-[0_4px_0_0_var(--color-brand-black)]">
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
            <button
              onClick={handleEmailClick}
              onMouseEnter={() => setIsHovered(true)}
              onMouseLeave={() => setIsHovered(false)}
              className="group text-left"
            >
              {/* Mobile: Show as bubble */}
              <div className="md:hidden inline-block px-6 py-3 bg-white text-brand-black text-base font-bold rounded-full transition-all duration-300 active:scale-95">
                {copied ? "Copied! ✓" : email}
              </div>
              
              {/* Desktop: Show with hover bubble */}
              <div className="hidden md:flex items-center gap-3">
                <div className="text-2xl font-bold text-white transition-colors duration-300 group-hover:text-gray-300">
                  {email}
                </div>
                <div 
                  className="relative px-4 py-2 bg-white text-brand-black text-sm font-medium whitespace-nowrap transition-all duration-300 rounded-full"
                  style={{ 
                    opacity: (isHovered || copied) ? 1 : 0,
                    transform: copied ? 'scale(1.1)' : (isHovered ? 'scale(1)' : 'scale(0.9)')
                  }}
                >
                  {copied ? "Copied! ✓" : "Click to copy"}
                </div>
              </div>
            </button>
          </div>
        </div>
      </div>

      <div className="mt-0 mb-16 w-full px-6 md:px-12">
        {logoSvg ? (
          <div className="w-full overflow-hidden">
            {/* width/height are the intrinsic SVG size, not a display size —
                the CSS below still scales it to the container. They give the
                browser an aspect ratio so the correct height is reserved
                before the file downloads; without them this collapses to zero
                height and then grows the page ~300px on load, which reads as
                the footer stuttering as you reach it. */}
            <img
              src={logoSvg}
              alt="Wayfindr"
              width={logoWidth}
              height={logoHeight}
              className="w-full h-auto"
              style={{
                maxWidth: '100%',
                display: 'block',
                // Give the wordmark its own compositing layer. It's an SVG
                // blown up ~4.5x, and ScrollSmoother translates the page by
                // fractional pixels every frame — without a layer the browser
                // re-rasterises those thin letterforms at a new sub-pixel
                // phase each frame and they visibly shimmer while scrolling.
                // Promoted, it is rasterised once and only translated.
                willChange: 'transform',
                transform: 'translateZ(0)',
                backfaceVisibility: 'hidden',
              }}
            />
          </div>
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
