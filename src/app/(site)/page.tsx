import type { Metadata } from "next";
import HomePage from "../../components/home/HomePage";
import { client } from "../../sanity/lib/client";
import {
  BRANDS_QUERY,
  HOMEPAGE_QUERY,
  PROJECTS_QUERY,
  TESTIMONIALS_QUERY,
} from "../../sanity/lib/queries";
import type {
  Brand,
  HomeContent,
  HomeDocument,
  Project,
  Testimonial,
} from "../../types";
import {
  BRANDS as FALLBACK_BRANDS,
  HOMEPAGE_FALLBACK,
  PROJECTS as FALLBACK_PROJECTS,
  TESTIMONIALS as FALLBACK_TESTIMONIALS,
} from "../../constants";

/**
 * Fill every gap in the Sanity document from HOMEPAGE_FALLBACK, field by field.
 *
 * Doing it here, once, is what lets HomePage.tsx render `content.railLabel`
 * instead of `content.railLabel ?? "In the field"`. Spread across a thousand
 * lines of JSX, that second form is a hundred separate chances to forget one and
 * ship an empty heading — and the failure is silent, because an empty string
 * lays out as nothing rather than throwing.
 *
 * Field by field rather than document-level, deliberately. An editor who has
 * written the hero but not yet the capabilities should get their hero and this
 * file's capabilities; falling back on the whole document would throw away real
 * copy the moment one field was missing, and falling back on none of it would
 * leave the page half empty while somebody worked through the form.
 *
 * Blank strings count as missing. Sanity writes "" for a field that has been
 * typed into and cleared, and an editor clearing a field means "I do not want
 * my text here", not "I want this section to have no label".
 */
function resolveHome(doc: HomeDocument | null): HomeContent {
  const f = HOMEPAGE_FALLBACK;

  const text = (value: string | undefined | null, fallback: string) =>
    value && value.trim() ? value : fallback;

  // An empty array is treated as absent for the same reason as a blank string —
  // and note this is what protects the layout downstream: the collections grid
  // is drawn as a 2x2 and the headline slot is sized to the longest ending, so
  // rendering zero of either is a broken section rather than a sparse one.
  const list = <T,>(value: T[] | undefined | null, fallback: T[]) =>
    value && value.length ? value : fallback;

  return {
    title: text(doc?.title, f.title),
    metaDescription: text(doc?.metaDescription, f.metaDescription),

    // No fallback: there is no sensible stand-in for a video, and the hero has
    // a composed state without one.
    heroVideoUrl: doc?.heroVideoUrl || undefined,
    heroPosterUrl: doc?.heroPosterUrl || undefined,
    heroLeadLine: text(doc?.heroLeadLine, f.heroLeadLine),
    // Entries are trimmed and blanks dropped before the length check, so a row
    // an editor added and left empty cannot become a beat where the headline
    // cycles to nothing.
    heroEndings: list(
      doc?.heroEndings?.map((e) => e?.trim()).filter(Boolean) as
        | string[]
        | undefined,
      f.heroEndings,
    ),
    heroScrollCue: text(doc?.heroScrollCue, f.heroScrollCue),

    positionLabel: text(doc?.positionLabel, f.positionLabel),
    positionStatement: text(doc?.positionStatement, f.positionStatement),
    positionNote: text(doc?.positionNote, f.positionNote),

    railLabel: text(doc?.railLabel, f.railLabel),
    railHint: text(doc?.railHint, f.railHint),
    railEndTitle: text(doc?.railEndTitle, f.railEndTitle),
    railEndCta: text(doc?.railEndCta, f.railEndCta),

    capabilitiesLabel: text(doc?.capabilitiesLabel, f.capabilitiesLabel),
    // `body` is optional in the schema but not in the type, so it is defaulted
    // rather than left undefined — a row with a title and no description is a
    // reasonable thing to save mid-edit and should not render "undefined".
    capabilities: list(
      doc?.capabilities
        ?.filter((c) => c?.title)
        .map((c) => ({ title: c.title, body: c.body ?? "" })),
      f.capabilities,
    ),

    collectionsLead: text(doc?.collectionsLead, f.collectionsLead),
    collectionsAccent: text(doc?.collectionsAccent, f.collectionsAccent),
    collections: list(
      doc?.collections
        ?.filter((c) => c?.title)
        .map((c) => ({ title: c.title, body: c.body ?? "" })),
      f.collections,
    ),

    testimonialsLabel: text(doc?.testimonialsLabel, f.testimonialsLabel),
  };
}

export async function generateMetadata(): Promise<Metadata> {
  const doc = await client.fetch<HomeDocument | null>(HOMEPAGE_QUERY);
  const content = resolveHome(doc);

  return {
    title: content.title,
    description: content.metaDescription,
  };
}

export default async function Home() {
  const [doc, brands, projects, testimonials] = await Promise.all([
    client.fetch<HomeDocument | null>(HOMEPAGE_QUERY),
    client.fetch<Brand[]>(BRANDS_QUERY),
    client.fetch<Project[]>(PROJECTS_QUERY),
    client.fetch<Testimonial[]>(TESTIMONIALS_QUERY),
  ]);

  return (
    <HomePage
      content={resolveHome(doc)}
      brands={brands.length ? brands : FALLBACK_BRANDS}
      projects={projects.length ? projects : FALLBACK_PROJECTS}
      testimonials={
        testimonials.length ? testimonials : FALLBACK_TESTIMONIALS
      }
    />
  );
}
