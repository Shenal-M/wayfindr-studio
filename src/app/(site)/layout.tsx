import React from "react";
import Navigation from "../../components/Navigation";
import FooterAlt from "../../components/FooterAlt";
import SmoothScrollProvider from "../../components/SmoothScrollProvider";
import ScrollRevealProvider from "../../components/ScrollRevealProvider";
import { client } from "../../sanity/lib/client";
import { SITE_SETTINGS_QUERY } from "../../sanity/lib/queries";
import type { SiteSettings } from "../../types";
import { SOCIAL_LINKS, FOOTER_ABOUT_TEXT } from "../../constants";

/**
 * Strip anything executable from third-party SVG markup before it goes anywhere
 * near dangerouslySetInnerHTML. The asset is first-party — it comes from the
 * studio's own Sanity dataset — but "our CMS" is not a security boundary, and an
 * SVG is a document format that can carry script.
 *
 * Note that <style> is deliberately kept: SVGs exported from design tools carry
 * their fills in a style block, so removing it would render the logo invisible.
 * The caveat is that a <style> inside inline SVG applies to the whole document,
 * so its selectors are global. The current asset uses Illustrator's generated
 * `.cls-N` names, which collide with nothing here — worth re-checking if a logo
 * with hand-written class names ever replaces it.
 */
function sanitizeSvg(svg: string) {
  return (
    svg
      // Neither is legal inside HTML, and the prolog stops the parser dead.
      .replace(/<\?xml[\s\S]*?\?>/gi, "")
      .replace(/<!DOCTYPE[\s\S]*?>/gi, "")
      .replace(/<script[\s\S]*?<\/script\s*>/gi, "")
      // foreignObject re-enters HTML parsing, so it's a way back to script.
      .replace(/<foreignObject[\s\S]*?<\/foreignObject\s*>/gi, "")
      .replace(/\son[a-z]+\s*=\s*("[^"]*"|'[^']*'|[^\s>]+)/gi, "")
      .replace(
        /\s(?:xlink:)?href\s*=\s*("|')\s*javascript:[^"']*\1/gi,
        ""
      )
      .trim()
  );
}

/**
 * Fetch the footer wordmark and return its markup for inlining.
 *
 * This used to parse out only the viewBox numbers and hand them to an <img> as
 * width/height, to reserve the right height before the file downloaded. Inlining
 * is better on two counts:
 *
 *  1. No layout shift at all, rather than a reserved box that gets filled later.
 *     The geometry is in the HTML, so there is nothing to arrive.
 *  2. One fewer network request, on every page — the footer is in the shared
 *     layout. The asset is ~2KB, comfortably less than the request it replaces.
 *
 * There was a third reason that no longer applies: as an <img> the wordmark's
 * painted rect was snapped to whole device pixels while the text beside it was
 * positioned sub-pixel, so inside ScrollSmoother's transformed content the two
 * visibly stepped against each other. Lenis scrolls natively and transforms
 * nothing, so that class of problem is gone either way.
 */
async function loadFooterLogo(url?: string) {
  if (!url?.startsWith("http")) return null;
  try {
    const res = await fetch(url, { next: { revalidate: 3600 } });
    if (!res.ok) return null;
    const markup = sanitizeSvg(await res.text());
    // Anything that isn't a bare <svg> root after sanitising is not something we
    // should be injecting; fall through to the text wordmark instead.
    if (!markup.startsWith("<svg")) return null;
    return markup;
  } catch {
    // Fall through — FooterAlt renders its text wordmark.
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
  const logoMarkup = await loadFooterLogo(siteSettings?.footerLogoSvg);

  return (
    <>
      {/* Fixed-position — must stay outside the smooth wrapper's transform. */}
      <Navigation />
      <SmoothScrollProvider>
        {/* Inside the smooth scroll provider, because the reveals' ScrollTriggers
            read the scroll position Lenis drives and both are refreshed together
            on navigation. Wrapping the whole page rather than sitting per-page so
            every route opts in with a `data-reveal` attribute and no client
            boundary of its own. */}
        <ScrollRevealProvider>
          {/* svh rather than screen (vh), to match the hero. vh is the largest
              viewport height, so on mobile it reserves more than is on screen and
              adds scroll that isn't wanted; svh is the stable smallest one. */}
          <div className="flex flex-col min-h-svh">
            {/* Must match the fixed header in Navigation.tsx: its h-16 plus the
                1px border-b, so 65px total. Padding of a plain 4rem left content
                sitting 1px under the border. */}
            <main className="flex-grow pt-[calc(4rem+1px)]">{children}</main>
            <FooterAlt
              socialLinks={socialLinks}
              email={email}
              aboutText={aboutText}
              logoMarkup={logoMarkup}
            />
          </div>
        </ScrollRevealProvider>
      </SmoothScrollProvider>
    </>
  );
}



