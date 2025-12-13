import React from "react";
import Image from "next/image";
import { notFound } from "next/navigation";
import { groq } from "next-sanity";

import { client } from "../../../../sanity/lib/client";
import { SERVICE_BY_SLUG_QUERY } from "../../../../sanity/lib/queries";
import type { Service } from "../../../../types";
import { AGENCY_PAGE_FALLBACK } from "../../../../constants";

export const revalidate = 60;

export async function generateStaticParams() {
  try {
    const services = await client.fetch<{ slug: string }[]>(groq`*[_type == "service" && defined(slug.current)]{ "slug": slug.current }`);
    if (services && services.length > 0) {
      return services.map(({ slug }) => ({ slug }));
    }
  } catch (error) {
    console.warn("Failed to fetch services from Sanity, using fallback:", error);
  }

  // Fallback to constants if Sanity is unavailable
  return (AGENCY_PAGE_FALLBACK.services || []).map((service) => ({
    slug: service.slug,
  }));
}

const ServicePage = async ({ params }: { params: Promise<{ slug: string }> }) => {
  const resolvedParams = await params;
  let service = await client.fetch<Service | null>(SERVICE_BY_SLUG_QUERY, { slug: resolvedParams.slug });

  // Fallback to constants if not found in Sanity
  if (!service) {
    service =
      AGENCY_PAGE_FALLBACK.services?.find((s) => s.slug === resolvedParams.slug) || null;
  }

  if (!service) {
    return notFound();
  }

  const { title, description, heroImage, subServices } = service;

  return (
    <div className="w-full bg-brand-white">
      <section className="px-6 md:px-12 max-w-[1400px] mx-auto py-16 md:py-24">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10 md:gap-12 items-end">
          <div className="md:col-span-6">
            <span className="text-xs font-bold uppercase tracking-[0.3em] text-brand-graphite block mb-4">
              Service
            </span>
            <h1 className="font-sans font-bold text-5xl md:text-6xl lg:text-7xl leading-[0.95] text-brand-black">
              {title}
            </h1>
          </div>
          {heroImage ? (
            <div className="md:col-span-6 relative aspect-[4/5] md:aspect-[5/6] bg-brand-offwhite overflow-hidden">
              <Image
                src={heroImage}
                alt={title}
                fill
                className="object-cover"
                priority
              />
            </div>
          ) : null}
        </div>

        <div className="mt-12 md:mt-16 border-t border-brand-border pt-8 md:pt-10">
          <p className="font-sans text-xl md:text-2xl lg:text-[26px] leading-relaxed text-brand-graphite max-w-4xl">
            {description}
          </p>
        </div>
      </section>

      <section className="py-16 md:py-24 px-6 md:px-12 max-w-[1200px] mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10 md:gap-14">
          <div className="md:col-span-4">
            <h2 className="font-sans text-sm font-bold uppercase tracking-widest text-brand-graphite sticky top-32">
              Sub-Services
            </h2>
          </div>
          <div className="md:col-span-8 divide-y divide-brand-border border-t border-b border-brand-border">
            {subServices?.map((item, index) => (
              <div key={index} className="py-8 md:py-10">
                <h3 className="font-sans text-2xl md:text-3xl font-semibold text-brand-black mb-3">
                  {item.title}
                </h3>
                <p className="text-base md:text-lg text-brand-graphite leading-relaxed">
                  {item.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default ServicePage;
