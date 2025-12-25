import React from "react";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { groq } from "next-sanity";

import { client } from "../../../../sanity/lib/client";
import { SERVICE_BY_SLUG_QUERY, PROJECTS_BY_SERVICE_TAG_QUERY, SERVICES_QUERY } from "../../../../sanity/lib/queries";
import type { Service, Project } from "../../../../types";
import { AGENCY_PAGE_FALLBACK, PROJECTS as FALLBACK_PROJECTS } from "../../../../constants";
import ViewAllButton from "../../../../components/ViewAllButton";

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

// Map service slugs to search tags for filtering projects
function getServiceTags(slug: string, title: string): string[] {
  const slugLower = slug.toLowerCase();
  const titleLower = title.toLowerCase();
  
  // Extract key words from slug and title
  const tags: string[] = [];
  
  if (slugLower.includes("strategy") || titleLower.includes("strategy")) {
    tags.push("strategy", "brand strategy", "Strategy");
  }
  if (slugLower.includes("visual") || slugLower.includes("identity")) {
    tags.push("identity", "visual identity", "branding", "Identity");
  }
  if (slugLower.includes("digital") || slugLower.includes("experience")) {
    tags.push("digital", "web", "ux", "ui", "Digital", "Web");
  }
  if (slugLower.includes("activation")) {
    tags.push("activation", "campaign", "Activation");
  }
  if (slugLower.includes("verbal")) {
    tags.push("naming", "copywriting", "verbal", "Naming");
  }
  if (slugLower.includes("creative") || slugLower.includes("direction")) {
    tags.push("creative", "art direction", "Creative");
  }
  
  return tags;
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

  const { title, description, heroImage, subServices, useCustomServiceImage } = service;

  // Fetch all services to get previous/next navigation
  let allServices: Service[] = [];
  try {
    allServices = await client.fetch<Service[]>(SERVICES_QUERY);
  } catch (error) {
    console.warn("Failed to fetch all services:", error);
    allServices = AGENCY_PAGE_FALLBACK.services || [];
  }

  // Find current service index and get previous/next
  const currentIndex = allServices.findIndex((s) => s.slug === resolvedParams.slug);
  const previousService = currentIndex > 0 ? allServices[currentIndex - 1] : null;
  const nextService = currentIndex < allServices.length - 1 ? allServices[currentIndex + 1] : null;

  // Fetch related projects based on service tags
  const serviceTags = getServiceTags(resolvedParams.slug, title);
  let relatedProjects: Project[] = [];
  
  try {
    const allProjects = await client.fetch<Project[]>(PROJECTS_BY_SERVICE_TAG_QUERY);
    
    if (allProjects && allProjects.length > 0 && serviceTags.length > 0) {
      // Filter projects that have services matching any of our tags
      relatedProjects = allProjects.filter((project) => {
        if (!project.services || project.services.length === 0) return false;
        return serviceTags.some((tag) =>
          project.services.some((service) =>
            service.toLowerCase().includes(tag.toLowerCase())
          )
        );
      }).slice(0, 4);
    }
  } catch (error) {
    console.warn("Failed to fetch projects:", error);
  }

  // Fallback to constants if no projects found
  if (relatedProjects.length === 0) {
    relatedProjects = FALLBACK_PROJECTS.filter((project) => {
      if (!project.services || project.services.length === 0) return false;
      return serviceTags.some((tag) =>
        project.services.some((service) =>
          service.toLowerCase().includes(tag.toLowerCase())
        )
      );
    }).slice(0, 4);
  }

  return (
    <div className="w-full bg-brand-white">
      {/* Hero Section */}
      <section className="pt-12 md:pt-16 pb-20 md:pb-32">
        <div className="px-6 md:px-12 max-w-[1920px] mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 md:gap-12 items-end">
            <div className="md:col-span-6">
              <h1 className="font-sans font-bold text-5xl md:text-6xl lg:text-7xl leading-[0.95] text-brand-black mb-6">
                {title}
              </h1>
              <p className="font-sans text-lg md:text-lg lg:text-xl leading-normal text-brand-graphite max-w-3xl">
                {description}
              </p>
            </div>
            <div className="md:col-span-6 flex justify-center md:justify-end">
              <div className="w-full max-w-md md:max-w-lg lg:max-w-xl aspect-square">
                {useCustomServiceImage && heroImage ? (
                  // Custom user-uploaded image
                  <Image 
                    src={heroImage} 
                    alt={title}
                    width={400}
                    height={400}
                    className="w-full h-full object-cover"
                  />
                ) : title.toLowerCase().includes("strategy") ? (
                  // Brand Strategy - geometric shapes with intersecting lines
                  <svg viewBox="0 0 400 400" className="w-full h-auto" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <rect width="400" height="400" fill="#f5f5f7" />
                    <path d="M200 50 L350 200 L200 350 L50 200 Z" fill="#0211f0" opacity="0.1" />
                    <circle cx="200" cy="200" r="80" fill="#0211f0" opacity="0.2" />
                    <path d="M120 200 L200 120 L280 200 L200 280 Z" fill="#0211f0" opacity="0.3" />
                    <line x1="200" y1="50" x2="200" y2="350" stroke="#0211f0" strokeWidth="2" opacity="0.4" />
                    <line x1="50" y1="200" x2="350" y2="200" stroke="#0211f0" strokeWidth="2" opacity="0.4" />
                  </svg>
                ) : title.toLowerCase().includes("identity") ? (
                  // Brand Identity Design - overlapping shapes and grids
                  <svg viewBox="0 0 400 400" className="w-full h-auto" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <rect width="400" height="400" fill="#f5f5f7" />
                    <rect x="100" y="100" width="200" height="200" fill="#0211f0" opacity="0.1" />
                    <rect x="120" y="120" width="160" height="160" fill="#0211f0" opacity="0.15" />
                    <rect x="140" y="140" width="120" height="120" fill="#0211f0" opacity="0.2" />
                    <circle cx="200" cy="200" r="60" fill="#0211f0" opacity="0.25" />
                    <line x1="100" y1="200" x2="300" y2="200" stroke="#0211f0" strokeWidth="2" opacity="0.3" />
                    <line x1="200" y1="100" x2="200" y2="300" stroke="#0211f0" strokeWidth="2" opacity="0.3" />
                  </svg>
                ) : title.toLowerCase().includes("story") || title.toLowerCase().includes("tone") ? (
                  // Brand Story & Tone - flowing curves and waves
                  <svg viewBox="0 0 400 400" className="w-full h-auto" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <rect width="400" height="400" fill="#f5f5f7" />
                    <path d="M50 150 Q150 100, 200 150 T350 150" stroke="#0211f0" strokeWidth="3" fill="none" opacity="0.2" />
                    <path d="M50 200 Q150 250, 200 200 T350 200" stroke="#0211f0" strokeWidth="3" fill="none" opacity="0.25" />
                    <path d="M50 250 Q150 300, 200 250 T350 250" stroke="#0211f0" strokeWidth="3" fill="none" opacity="0.3" />
                    <circle cx="200" cy="200" r="100" fill="#0211f0" opacity="0.05" />
                    <path d="M100 200 Q150 150, 200 200 Q250 250, 300 200" stroke="#0211f0" strokeWidth="4" fill="none" opacity="0.2" />
                  </svg>
                ) : title.toLowerCase().includes("digital") || title.toLowerCase().includes("print") ? (
                  // Digital & Print Design - pixelated/modern grid pattern
                  <svg viewBox="0 0 400 400" className="w-full h-auto" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <rect width="400" height="400" fill="#f5f5f7" />
                    <rect x="100" y="100" width="50" height="50" fill="#0211f0" opacity="0.2" />
                    <rect x="200" y="100" width="50" height="50" fill="#0211f0" opacity="0.25" />
                    <rect x="250" y="100" width="50" height="50" fill="#0211f0" opacity="0.2" />
                    <rect x="100" y="150" width="50" height="50" fill="#0211f0" opacity="0.15" />
                    <rect x="200" y="150" width="50" height="50" fill="#0211f0" opacity="0.3" />
                    <rect x="250" y="150" width="50" height="50" fill="#0211f0" opacity="0.15" />
                    <rect x="150" y="200" width="50" height="50" fill="#0211f0" opacity="0.25" />
                    <rect x="200" y="200" width="50" height="50" fill="#0211f0" opacity="0.2" />
                    <rect x="150" y="250" width="50" height="50" fill="#0211f0" opacity="0.3" />
                    <rect x="200" y="250" width="50" height="50" fill="#0211f0" opacity="0.15" />
                    <line x1="100" y1="100" x2="300" y2="300" stroke="#0211f0" strokeWidth="1" opacity="0.2" />
                    <line x1="300" y1="100" x2="100" y2="300" stroke="#0211f0" strokeWidth="1" opacity="0.2" />
                  </svg>
                ) : (
                  // Default fallback - simple geometric design
                  <svg viewBox="0 0 400 400" className="w-full h-auto" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <rect width="400" height="400" fill="#f5f5f7" />
                    <circle cx="200" cy="200" r="100" fill="#0211f0" opacity="0.1" />
                    <circle cx="200" cy="200" r="60" fill="#0211f0" opacity="0.2" />
                  </svg>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Sub-Services Section - Similar to Siegel+Gale */}
      <section className="py-16 md:py-24 px-6 md:px-12 max-w-[1920px] mx-auto bg-brand-black relative overflow-hidden">
        <div className="relative z-10 max-w-[1920px] mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-12">
            {subServices?.map((item, index) => (
              <div key={index} className="flex flex-col py-4">
                <h3 className="font-sans text-2xl md:text-3xl font-semibold text-brand-white mb-4">
                  {item.title}
                </h3>
                <p className="font-serif text-base md:text-lg text-brand-white/80 leading-relaxed">
                  {item.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Service Navigation Section */}
      <section className="px-6 md:px-12 max-w-[1920px] mx-auto bg-brand-white border-t border-brand-border">
        <div className="flex relative -mx-6 md:-mx-12">
          {/* Previous Service */}
          {previousService ? (
            <Link
              href={`/services/${previousService.slug}`}
              className="group w-1/2 px-6 md:px-12 py-16 md:py-24 text-left flex flex-col justify-center hover:bg-brand-offwhite transition-colors duration-300"
            >
              <div className="text-xs font-medium uppercase tracking-widest text-brand-graphite mb-2 group-hover:text-brand-blue transition-colors duration-300">
                Previous
              </div>
              <h3 className="font-sans text-xl md:text-2xl font-semibold text-brand-black group-hover:text-brand-blue transition-colors duration-300 inline-block">
                <span className="relative inline-block">
                  {previousService.title}
                  <span className="absolute bottom-0 left-0 w-0 h-[2px] bg-brand-blue group-hover:w-full transition-all duration-300 ease-out" />
                </span>
              </h3>
            </Link>
          ) : (
            <div className="w-1/2 px-6 md:px-12" />
          )}

          {/* Vertical divider */}
          <div className="absolute left-1/2 top-0 bottom-0 w-px bg-brand-border transform -translate-x-1/2" />

          {/* Next Service */}
          {nextService ? (
            <Link
              href={`/services/${nextService.slug}`}
              className="group w-1/2 px-6 md:px-12 py-16 md:py-24 text-right flex flex-col justify-center hover:bg-brand-offwhite transition-colors duration-300"
            >
              <div className="text-xs font-medium uppercase tracking-widest text-brand-graphite mb-2 group-hover:text-brand-blue transition-colors duration-300">
                Next
              </div>
              <h3 className="font-sans text-xl md:text-2xl font-semibold text-brand-black group-hover:text-brand-blue transition-colors duration-300 inline-block ml-auto">
                <span className="relative inline-block">
                  {nextService.title}
                  <span className="absolute bottom-0 right-0 w-0 h-[2px] bg-brand-blue group-hover:w-full transition-all duration-300 ease-out" />
                </span>
              </h3>
            </Link>
          ) : (
            <div className="w-1/2 px-6 md:px-12" />
          )}
        </div>
      </section>

      {/* Our Work Section */}
      {relatedProjects.length > 0 && (
        <section className="py-20 md:py-32 px-6 md:px-12 max-w-[1920px] mx-auto border-t border-brand-border">
          <div className="mb-16 md:mb-20">
            <h2 className="font-sans text-4xl md:text-5xl lg:text-6xl font-bold text-brand-black">
              Our work
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 lg:gap-10">
            {relatedProjects.slice(0, 4).map((project) => (
              <Link
                href={`/work/${project.slug}`}
                key={project.slug}
                className="group block"
              >
                <div className="relative overflow-hidden aspect-[4/3] md:aspect-[5/4] bg-brand-offwhite">
                  <img
                    src={project.thumbnail}
                    alt={project.title}
                    className="object-cover w-full h-full transform transition-all duration-500 ease-out group-hover:scale-[1.02] group-hover:brightness-95 group-hover:contrast-[1.05]"
                  />
                </div>
              </Link>
            ))}
          </div>
          <ViewAllButton href="/work" text="See more work" align="left" />
        </section>
      )}
    </div>
  );
};

export default ServicePage;
