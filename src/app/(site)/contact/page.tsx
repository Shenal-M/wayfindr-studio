import React from "react";
import { client } from "../../../sanity/lib/client";
import { FAQS_QUERY, SITE_SETTINGS_QUERY } from "../../../sanity/lib/queries";
import type { ContactInfo, FAQItem, SiteSettings } from "../../../types";
import { FAQS as FALLBACK_FAQS } from "../../../constants";
import ContactContent from "./ContactContent";

const FALLBACK_CONTACT: ContactInfo = {
  email: "hello@wayfindr.com",
  address: "1200 Broadway, New York, NY 10001",
  availabilityText: "We are currently accepting new projects for",
  availabilityHighlight: "Q1 2026",
};

const ContactPage = async () => {
  const [faqs, siteSettings] = await Promise.all([
    client.fetch<FAQItem[]>(FAQS_QUERY),
    client.fetch<SiteSettings>(SITE_SETTINGS_QUERY),
  ]);
  const safeFaqs = faqs.length ? faqs : FALLBACK_FAQS;
  const safeContactInfo = siteSettings?.contactInfo || FALLBACK_CONTACT;
  return <ContactContent faqs={safeFaqs} contactInfo={safeContactInfo} />;
};

export default ContactPage;


