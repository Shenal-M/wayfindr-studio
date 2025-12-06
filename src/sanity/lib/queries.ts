import { groq } from "next-sanity";

export const SITE_SETTINGS_QUERY = groq`*[_type == "siteSettings"][0]{
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

export const AGENCY_PAGE_QUERY = groq`*[_type == "agencyPage"][0]{
  topLabel,
  heroLine1,
  heroLine2,
  heroDescription,
  heroBottomText,
  establishedYear,
  capabilitiesTitle,
  capabilities,
  philosophyQuote,
  philosophyAttribution,
  industriesTitle,
  industries,
  stats
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


