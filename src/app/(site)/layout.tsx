import React from "react";
import Navigation from "../../components/Navigation";
import FooterAlt from "../../components/FooterAlt";
import { client } from "../../sanity/lib/client";
import { SITE_SETTINGS_QUERY } from "../../sanity/lib/queries";
import type { SiteSettings } from "../../types";
import { SOCIAL_LINKS, FOOTER_ABOUT_TEXT, FOOTER_LOGO_SVG } from "../../constants";

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

  return (
    <div className="flex flex-col min-h-screen">
      <Navigation />
      <main className="flex-grow pt-20">{children}</main>
      <FooterAlt 
        socialLinks={socialLinks} 
        email={email}
        aboutText={aboutText}
        logoSvg={logoSvg}
      />
    </div>
  );
}



