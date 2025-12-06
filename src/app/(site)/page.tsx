import type { Metadata } from "next";
import HomePage from "../HomePage";
import { client } from "../../sanity/lib/client";
import {
  BRANDS_QUERY,
  PROJECTS_QUERY,
  TESTIMONIALS_QUERY,
} from "../../sanity/lib/queries";
import type { Brand, Project, Testimonial } from "../../types";
import { BRANDS as FALLBACK_BRANDS, PROJECTS as FALLBACK_PROJECTS, TESTIMONIALS as FALLBACK_TESTIMONIALS } from "../../constants";

type HomepageDoc = {
  title?: string;
  heroLine1?: string;
  heroLine2?: string;
  heroLine3?: string;
} | null;

export async function generateMetadata(): Promise<Metadata> {
  const homepage = await client.fetch<HomepageDoc>(
    `*[_type == "homepage"][0]{title}`
  );

  return {
    title: homepage?.title ?? "Wayfindr Studio",
    description: "Strategic design for ambitious brands.",
  };
}

export default async function Home() {
  const [homepage, brands, projects, testimonials] = await Promise.all([
    client.fetch<HomepageDoc>(`*[_type == "homepage"][0]{title, heroLine1, heroLine2, heroLine3}`),
    client.fetch<Brand[]>(BRANDS_QUERY),
    client.fetch<Project[]>(PROJECTS_QUERY),
    client.fetch<Testimonial[]>(TESTIMONIALS_QUERY),
  ]);

  const safeBrands = brands.length ? brands : FALLBACK_BRANDS;
  const safeProjects = projects.length ? projects : FALLBACK_PROJECTS;
  const safeTestimonials = testimonials.length ? testimonials : FALLBACK_TESTIMONIALS;

  return (
    <HomePage
      homepageTitle={homepage?.title}
      heroLine1={homepage?.heroLine1}
      heroLine2={homepage?.heroLine2}
      heroLine3={homepage?.heroLine3}
      brands={safeBrands}
      projects={safeProjects}
      testimonials={safeTestimonials}
    />
  );
}



