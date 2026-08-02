import React from "react";
import Navigation from "../../components/Navigation";
import FooterAlt from "../../components/FooterAlt";
import SmoothScrollProvider from "../../components/SmoothScrollProvider";
import { client } from "../../sanity/lib/client";
import { SITE_SETTINGS_QUERY } from "../../sanity/lib/queries";
import type { SiteSettings } from "../../types";
import { SOCIAL_LINKS, FOOTER_ABOUT_TEXT, FOOTER_LOGO_SVG } from "../../constants";

/**
 * Read an SVG's intrinsic size so the footer logo can reserve its space before
 * it downloads. It's stored as a Sanity *file* asset, so unlike an image asset
 * the URL carries no dimensions — without this the <img> lays out at zero
 * height and then snaps to its real height on load, growing the page by ~300px
 * underneath the reader. Only two numbers are parsed out; the markup is never
 * inlined.
 */
async function readSvgSize(url?: string) {
  if (!url?.startsWith("http")) return null;
  try {
    const res = await fetch(url, { next: { revalidate: 3600 } });
    if (!res.ok) return null;
    const svg = await res.text();

    const viewBox = svg.match(
      /viewBox\s*=\s*["']\s*[\d.+-]+[\s,]+[\d.+-]+[\s,]+([\d.]+)[\s,]+([\d.]+)/i
    );
    if (viewBox) return { width: +viewBox[1], height: +viewBox[2] };

    const width = svg.match(/\bwidth\s*=\s*["']([\d.]+)/i);
    const height = svg.match(/\bheight\s*=\s*["']([\d.]+)/i);
    if (width && height) return { width: +width[1], height: +height[1] };
  } catch {
    // Fall through — the footer just behaves as it did before.
  }
  return null;
}

export default async function SiteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const siteSettings = await client.fetch<SiteSettings>(SITE_SETTINGS_QUERY);
  const socialLinks = siteSettings?.socialLinks?.length 
    ? siteSettings.socialLinks 
    : SOCIAL_LINKS;
  const email = siteSettings?.contactInfo?.email || "hello@wayfindr.com";
  const aboutText = siteSettings?.footerAboutText || FOOTER_ABOUT_TEXT;
  const logoSvg = siteSettings?.footerLogoSvg || FOOTER_LOGO_SVG;
  const logoSize = await readSvgSize(siteSettings?.footerLogoSvg);

  return (
    <>
      {/* Fixed-position — must stay outside the smooth wrapper's transform. */}
      <Navigation />
      <SmoothScrollProvider>
        <div className="flex flex-col min-h-screen">
          {/* Must match the fixed header in Navigation.tsx: its h-16 plus the
              1px border-b, so 65px total. Padding of a plain 4rem left content
              sitting 1px under the border. */}
          <main className="flex-grow pt-[calc(4rem+1px)]">{children}</main>
          <FooterAlt
            socialLinks={socialLinks}
            email={email}
            aboutText={aboutText}
            logoSvg={logoSvg}
            logoWidth={logoSize?.width}
            logoHeight={logoSize?.height}
          />
        </div>
      </SmoothScrollProvider>
    </>
  );
}



