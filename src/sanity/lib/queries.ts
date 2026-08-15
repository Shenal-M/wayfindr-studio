import { groq } from "next-sanity";

export const SITE_SETTINGS_QUERY = groq`*[_type == "siteSettings" && _id == "siteSettings"][0]{
  "socialLinks": socialLinks[]{ platform, url },
  "contactInfo": {
    "email": contactEmail,
    "address": contactAddress,
    "availabilityText": availabilityText,
    "availabilityHighlight": availabilityHighlight
  },
  footerAboutText,
  "footerLogoSvg": footerLogoSvg.asset->url
}`;

/**
 * Everything the homepage renders except the projects, brands and testimonials,
 * which are their own document types and have their own queries.
 *
 * Every field is optional on the way out. The page pairs this with
 * HOMEPAGE_FALLBACK from constants.ts field by field, so a document that has
 * only been half filled in still renders a complete page — see resolveHome in
 * (site)/page.tsx.
 *
 * ── Why `_id == "homepage"` and not just `[0]` ─────────────────────────────
 *
 * This is a singleton, and src/sanity/structure.ts pins it to that exact id, so
 * everything edited through the Studio's "Homepage" item writes there. But the
 * document type is an ordinary one, and nothing at the dataset level stops a
 * second document of the same type existing — this dataset had one, created
 * before the structure pinned the id.
 *
 * A bare `[0]` on an unordered filter then picks whichever the API returns
 * first, which in practice is the lowest `_id`. A random uuid beats "homepage"
 * on that comparison almost always, so the site silently read the empty stray
 * document and rendered fallback copy — including ignoring a hero video that
 * was sitting correctly on the real one.
 *
 * Naming the id makes it deterministic and makes strays inert. If the singleton
 * genuinely does not exist the page falls back, which is a defined and visible
 * state rather than a coin toss between two documents.
 *
 * Every other singleton below is pinned for the same reason.
 */
export const HOMEPAGE_QUERY = groq`*[_type == "homepage" && _id == "homepage"][0]{
  title,
  metaDescription,
  "heroVideoUrl": heroVideo.asset->url,
  "heroPosterUrl": heroPoster.asset->url,
  heroLeadLine,
  heroEndings,
  heroScrollCue,
  positionLabel,
  positionStatement,
  positionNote,
  railLabel,
  railHint,
  railEndTitle,
  railEndCta,
  capabilitiesLabel,
  capabilities[]{ title, body },
  collectionsLead,
  collectionsAccent,
  collections[]{ title, body },
  testimonialsLabel
}`;

export const BRANDS_QUERY = groq`*[_type == "brand"] | order(_createdAt asc){
  "id": _id,
  name,
  "logoUrl": logo.asset->url
}`;

export const TESTIMONIALS_QUERY = groq`*[_type == "testimonial"] | order(_createdAt asc){
  quote,
  author,
  role,
  company
}`;

export const FAQS_QUERY = groq`*[_type == "faq"] | order(order asc){
  question,
  answer
}`;

export const AGENCY_PAGE_QUERY = groq`*[_type == "agencyPage" && _id == "agencyPage"][0]{
  topLabel,
  heroLine1,
  heroLine2,
  heroDescription,
  heroBottomText,
  establishedYear,
  "services": *[_type == "service"] | order(order asc, _createdAt asc){
    title,
    "slug": slug.current,
    description,
    "heroImage": heroImage.asset->url,
    subServices[]{
      title,
      description
    }
  },
  philosophyQuote,
  philosophyAttribution,
  industriesTitle,
  "industries": industries[]{
    name,
    "iconUrl": icon.asset->url,
    description
  },
  stats
}`;

export const WORK_PAGE_QUERY = groq`*[_type == "workPage" && _id == "workPage"][0]{
  topLabel,
  heroTitle,
  heroDescription
}`;

// Shared content blocks projection
const contentBlocksProjection = `content[]{
  _type == "fullWidthImageBlock" => {
    "type": "fullWidthImage",
    "url": image.asset->url,
    caption,
    altText
  },
  _type == "dualGridBlock" => {
    "type": "dualGrid",
    "images": images[]{
      "url": image.asset->url,
      caption
    }
  },
  _type == "tripleGridBlock" => {
    "type": "tripleGrid",
    "images": images[]{
      "url": image.asset->url,
      caption
    }
  },
  _type == "galleryBlock" => {
    "type": "gallery",
    columns,
    "images": images[]{
      "url": image.asset->url,
      caption,
      size
    }
  },
  _type == "richTextBlock" => {
    "type": "richText",
    heading,
    text
  },
  _type == "statBlock" => {
    "type": "statBlock",
    number,
    label
  },
  _type == "videoBlock" => {
    "type": "video",
    videoType,
    videoUrl,
    "videoFileUrl": videoFile.asset->url,
    "posterUrl": poster.asset->url,
    caption,
    autoplay,
    loop
  },
  _type == "quoteBlock" => {
    "type": "quote",
    quote,
    author,
    role
  },
  _type == "beforeAfterBlock" => {
    "type": "beforeAfter",
    "beforeImage": beforeImage.asset->url,
    "afterImage": afterImage.asset->url,
    beforeLabel,
    afterLabel
  },
  _type == "colorPaletteBlock" => {
    "type": "colorPalette",
    colors
  },
  _type == "typographyBlock" => {
    "type": "typography",
    "fonts": fonts[]{
      name,
      usage,
      sample,
      "imageUrl": image.asset->url
    }
  },
  _type == "spacerBlock" => {
    "type": "spacer",
    size
  }
}`;

export const PROJECTS_QUERY = groq`*[_type == "project"] | order(order desc, _createdAt desc){
  title,
  "slug": slug.current,
  client,
  year,
  services,
  industry,
  description,
  "thumbnail": thumbnail.asset->url,
  "heroImage": heroImage.asset->url,
  "heroVideoUrl": heroVideo.asset->url,
  brief,
  solution,
  results,
  projectUrl,
  featured,
  order,
  ${contentBlocksProjection}
}`;

export const FEATURED_PROJECTS_QUERY = groq`*[_type == "project" && featured == true] | order(order desc, _createdAt desc){
  title,
  "slug": slug.current,
  client,
  year,
  services,
  industry,
  description,
  "thumbnail": thumbnail.asset->url,
  "heroImage": heroImage.asset->url,
  brief,
  order
}`;

export const PROJECT_BY_SLUG_QUERY = groq`*[_type == "project" && slug.current == $slug][0]{
  title,
  "slug": slug.current,
  client,
  year,
  services,
  industry,
  description,
  "thumbnail": thumbnail.asset->url,
  "heroImage": heroImage.asset->url,
  "heroVideoUrl": heroVideo.asset->url,
  brief,
  solution,
  results,
  projectUrl,
  featured,
  ${contentBlocksProjection},
  "relatedProjects": relatedProjects[]->{
    title,
    "slug": slug.current,
    "thumbnail": thumbnail.asset->url
  }
}`;

export const SERVICES_QUERY = groq`*[_type == "service"] | order(order asc, _createdAt asc){
  title,
  "slug": slug.current,
  description,
  "heroImage": heroImage.asset->url,
  subServices[]{
    title,
    description
  }
}`;

export const SERVICE_BY_SLUG_QUERY = groq`*[_type == "service" && slug.current == $slug][0]{
  title,
  "slug": slug.current,
  description,
  "heroImage": heroImage.asset->url,
  useCustomServiceImage,
  subServices[]{
    title,
    description
  }
}`;

export const PROJECTS_BY_SERVICE_TAG_QUERY = groq`*[_type == "project"] | order(order desc, _createdAt desc){
  title,
  "slug": slug.current,
  client,
  year,
  services,
  industry,
  description,
  "thumbnail": thumbnail.asset->url,
  "heroImage": heroImage.asset->url,
  brief,
  order
}`;


