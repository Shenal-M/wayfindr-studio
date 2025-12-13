import React from "react";
import { client } from "../../../sanity/lib/client";
import { AGENCY_PAGE_QUERY } from "../../../sanity/lib/queries";
import type { AgencyPage } from "../../../types";
import { AGENCY_PAGE_FALLBACK } from "../../../constants";
import CapabilitiesList from "../../../components/CapabilitiesList";

const AgencyPageComponent = async () => {
  const agencyData = await client.fetch<AgencyPage | null>(AGENCY_PAGE_QUERY);
  const data = agencyData || AGENCY_PAGE_FALLBACK;
  const capabilitiesData = data.services && data.services.length > 0
    ? data.services.map((service) => ({
        title: service.title,
        slug: service.slug,
        items: service.subServices?.map((item) => item.title) || [],
      }))
    : data.capabilities;

  return (
    <div className="w-full bg-brand-white">
      {/* Hero Section */}
      <section className="min-h-[70vh] relative overflow-hidden flex flex-col justify-between">
        {/* Top label */}
        <div className="pt-32 px-6 md:px-12 max-w-[1920px] mx-auto w-full">
          <span className="text-xs font-bold uppercase tracking-[0.3em] text-brand-graphite">
            {data.topLabel}
          </span>
        </div>

        {/* Main content */}
        <div className="px-6 md:px-12 max-w-[1920px] mx-auto w-full relative z-10">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-end">
            <div className="md:col-span-7">
              <h1 className="font-sans font-bold text-[13vw] md:text-[8vw] leading-[0.9] tracking-tighter uppercase">
                <span className="block overflow-hidden pb-[2vw] -mb-[2vw]">
                  <span className="block animate-[slideUp_0.8s_cubic-bezier(0.16,1,0.3,1)_both]">
                    {data.heroLine1}
                  </span>
                </span>
                <span className="block overflow-hidden text-brand-blue pb-[2vw] -mb-[2vw]">
                  <span className="block animate-[slideUp_0.8s_cubic-bezier(0.16,1,0.3,1)_0.1s_both]">
                    {data.heroLine2}
                  </span>
                </span>
              </h1>
            </div>
            <div className="md:col-span-5 pb-4">
              <p className="text-lg md:text-xl leading-relaxed font-sans text-brand-graphite max-w-md">
                {data.heroDescription}
              </p>
            </div>
          </div>
        </div>

        {/* Bottom descriptor */}
        <div className="pb-12 px-6 md:px-12 max-w-[1920px] mx-auto w-full flex justify-between items-end">
          <p className="font-serif italic text-brand-graphite text-base md:text-lg max-w-sm">
            {data.heroBottomText}
          </p>
          <span className="text-xs font-bold uppercase tracking-widest text-brand-graphite hidden md:block">
            {data.establishedYear}
          </span>
        </div>
      </section>

      {/* Divider */}
      <div className="border-t border-brand-border" />

      {/* Capabilities Section */}
      <section className="py-24 md:py-32 px-6 md:px-12 max-w-[1920px] mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-12 md:gap-16">
          <div className="md:col-span-4">
            <h2 className="font-sans text-sm font-bold uppercase tracking-widest text-brand-graphite sticky top-32">
              What We Do
            </h2>
          </div>
          <div className="md:col-span-8">
            <CapabilitiesList capabilities={capabilitiesData} />
          </div>
        </div>
      </section>

      {/* Industries Section */}
      {data.industries && data.industries.length > 0 && (
        <section className="py-24 md:py-32 px-6 md:px-12 max-w-[1920px] mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-12 md:gap-16">
            <div className="md:col-span-4">
              <h2 className="font-serif italic text-3xl md:text-4xl text-brand-blue">
                Industries We Work With
              </h2>
            </div>
            <div className="md:col-span-8">
              <div className="flex flex-wrap gap-3">
                {data.industries.map((industry, index) => (
                  <span
                    key={index}
                    className="px-6 py-3 border border-brand-border text-brand-black font-sans font-medium text-sm uppercase tracking-wider transition-all duration-300 hover:border-brand-black hover:bg-brand-black hover:text-white"
                  >
                    {industry}
                  </span>
                ))}
              </div>
            </div>
          </div>
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



