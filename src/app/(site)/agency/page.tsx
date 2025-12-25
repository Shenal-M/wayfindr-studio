import React from "react";
import { client } from "../../../sanity/lib/client";
import { AGENCY_PAGE_QUERY } from "../../../sanity/lib/queries";
import type { AgencyPage } from "../../../types";
import { AGENCY_PAGE_FALLBACK } from "../../../constants";
import CapabilitiesList from "../../../components/CapabilitiesList";
import { IndustriesCarousel } from "../../../components/IndustriesCarousel";

const AgencyPageComponent = async () => {
  const agencyData = await client.fetch<AgencyPage | null>(AGENCY_PAGE_QUERY);
  const data = agencyData || AGENCY_PAGE_FALLBACK;
  
  // Use services data and map to capabilities format for the component
  const servicesData = data.services && data.services.length > 0
    ? data.services.map((service) => ({
        title: service.title,
        slug: service.slug,
        items: service.subServices?.map((item) => item.title) || [],
      }))
    : [];

  return (
    <div className="w-full bg-brand-white">
      {/* Hero Section */}
      <section className="min-h-[70vh] relative overflow-hidden flex flex-col justify-between">
        <div className="w-full py-20">
          {/* Small eyebrow */}
          <div className="mb-8 px-6 md:px-12 opacity-0 animate-[fadeInUp_0.4s_cubic-bezier(0.33,0,0.2,1)_0s_both]">
            <span className="text-sm md:text-xs font-medium uppercase tracking-[0.25em] text-brand-graphite">
              {data.topLabel}
            </span>
          </div>

          {/* Main content wrapper */}
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-8 px-6 md:px-12">
            <div className="flex-1">
              {/* Main Headline - Two Lines */}
              <h1 className="font-sans font-semibold text-[clamp(3.5rem,12vw,11rem)] leading-[0.9] tracking-tighter mb-16 text-brand-black">
                <span className="block opacity-0 animate-[fadeInUp_0.6s_cubic-bezier(0.33,0,0.2,1)_0.1s_both]">
                  {data.heroLine1}
                </span>
                <span className="block opacity-0 animate-[fadeInUp_0.6s_cubic-bezier(0.33,0,0.2,1)_0.2s_both]">
                  {data.heroLine2}
                </span>
              </h1>

              {/* Description */}
              <p className="text-lg md:text-lg font-sans text-brand-graphite max-w-4xl leading-relaxed opacity-0 animate-[fadeInUp_0.4s_cubic-bezier(0.33,0,0.2,1)_0.35s_both]">
                {data.heroDescription}
              </p>
            </div>

            {/* Year indicator - Desktop only */}
            <div className="hidden md:block text-base font-medium text-brand-graphite pb-2 opacity-0 animate-[fadeInUp_0.4s_cubic-bezier(0.33,0,0.2,1)_0.45s_both]">
              {data.establishedYear}
            </div>
          </div>
        </div>

        {/* Bottom section - Mobile */}
        <div className="md:hidden pb-12 px-6 opacity-0 animate-[fadeInUp_0.4s_cubic-bezier(0.33,0,0.2,1)_0.45s_both]">
          <div className="text-lg font-medium text-brand-graphite">
            {data.establishedYear}
          </div>
        </div>
      </section>

      {/* Divider */}
      <div className="border-t border-brand-border" />

      {/* Services Section */}
      {servicesData && servicesData.length > 0 && (
        <section className="py-24 md:py-32 px-6 md:px-12 max-w-[1920px] mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-12 md:gap-16">
            <div className="md:col-span-4">
              <h2 className="font-sans text-sm font-bold uppercase tracking-widest text-brand-graphite sticky top-32">
                Services
              </h2>
            </div>
            <div className="md:col-span-8">
              <CapabilitiesList capabilities={servicesData} />
            </div>
          </div>
        </section>
      )}

      {/* Industries Section */}
      {data.industries && data.industries.length > 0 && (
        <section className="py-24 md:py-32 px-6 md:px-12 max-w-[1920px] mx-auto bg-brand-black">
          <div className="mb-12 md:mb-16">
            <h2 className="font-sans text-sm font-bold uppercase tracking-widest text-brand-white">
              {data.industriesTitle || "Industries We Work With"}
            </h2>
          </div>
          <IndustriesCarousel industries={data.industries} />
        </section>
      )}

      {/* Stats Section */}
      {data.stats && data.stats.length > 0 && (
        <section className="py-24 md:py-32 px-6 md:px-12 max-w-[1920px] mx-auto border-t border-brand-border">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 md:gap-16">
            {data.stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="font-sans font-bold text-6xl md:text-8xl text-brand-blue tracking-tighter mb-4">
                  {stat.number}
                </div>
                <div className="font-serif italic text-xl text-brand-graphite">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Philosophy Section */}
      <section className="py-32 md:py-40 px-6 md:px-12 bg-brand-offwhite">
        <div className="max-w-5xl mx-auto text-center">
          <blockquote className="font-serif text-4xl md:text-6xl leading-tight text-brand-black">
            "{data.philosophyQuote}"
          </blockquote>
          <div className="mt-8 font-sans font-bold uppercase tracking-widest text-sm text-brand-blue">
            {data.philosophyAttribution}
          </div>
        </div>
      </section>
    </div>
  );
};

export default AgencyPageComponent;



