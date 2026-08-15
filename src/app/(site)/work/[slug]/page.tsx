import React from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { client } from "../../../../sanity/lib/client";
import {
  COVER_HERO,
  columnFraction,
  imageUrl,
  responsiveImage,
} from "../../../../sanity/lib/imageUrl";
import {
  PROJECTS_QUERY,
  PROJECT_BY_SLUG_QUERY,
} from "../../../../sanity/lib/queries";
import type { ContentBlock, Project } from "../../../../types";
import { PROJECTS as FALLBACK_PROJECTS } from "../../../../constants";
import { ScrollRevealText } from "../../../../components/ScrollRevealText";

// ═══════════════════════════════════════════════════════════════
// CONTENT BLOCK COMPONENTS
// ═══════════════════════════════════════════════════════════════

/**
 * ── How the reveals on this page work ──────────────────────────────────────
 *
 * Every block below opts in with the site's two-attribute contract:
 * `reveal-init` holds the start state in CSS behind the `.anim` gate, and
 * `data-reveal` is what ScrollRevealProvider (in the site layout) picks up and
 * gives a batched ScrollTrigger. No client boundary is opened by any of it —
 * this whole file stays a server component, which is the reason the contract is
 * an attribute rather than a wrapper component.
 *
 * Two rules that are easy to get wrong here:
 *
 *  1. Grids opt in **per cell**, not per block. The provider batches whatever
 *     crosses the trigger line together and staggers it, so per-cell gives a row
 *     that arrives in reading order; per-block gives one wash and throws away
 *     the stagger the provider exists to produce.
 *
 *  2. Nothing that contains a <ScrollRevealText> may carry `data-reveal`. That
 *     component measures its own container to map its wipe onto a scroll range,
 *     and a reveal transform on an ancestor moves the thing being measured — so
 *     the wipe ends up mapped to the wrong range and fires at the wrong time.
 *     Where both are wanted, the heading and the attribution reveal and the
 *     prose does its own thing.
 */

// Every block below sizes its images with columnFraction(), whose argument is
// the share of the content column the image is painted into on desktop — 1 for
// a full-width block, 1/3 for a column of a triple grid. Getting that fraction
// right is what stops a phone downloading a desktop-width image; `sizes` is
// doing more work here than `quality` ever could.
const FullWidthImage = ({ url, caption, altText }: { url: string; caption?: string; altText?: string }) => (
  <div className="w-full my-16 md:my-20 reveal-init" data-reveal>
    <img
      {...responsiveImage(url, columnFraction(1))}
      alt={altText || caption || "Project visual"}
      loading="lazy"
      className="w-full h-auto"
    />
    {caption && (
      <p className="mt-4 text-sm text-brand-graphite font-sans">{caption}</p>
    )}
  </div>
);

const DualGrid = ({ images }: { images: { url: string; caption?: string }[] }) => (
  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-8 my-16 md:my-20">
    {images.map((img, idx) => (
      <div key={idx} className="reveal-init" data-reveal>
        <img
          {...responsiveImage(img.url, columnFraction(1 / 2))}
          alt={img.caption || `Detail ${idx + 1}`}
          loading="lazy"
          className="w-full h-auto aspect-square object-cover"
        />
        {img.caption && (
          <p className="mt-4 text-sm text-brand-graphite font-sans">{img.caption}</p>
        )}
      </div>
    ))}
  </div>
);

const TripleGrid = ({ images }: { images: { url: string; caption?: string }[] }) => (
  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 my-16 md:my-20">
    {images.map((img, idx) => (
      <div key={idx} className="reveal-init" data-reveal>
        <img
          {...responsiveImage(img.url, columnFraction(1 / 3))}
          alt={img.caption || `Detail ${idx + 1}`}
          loading="lazy"
          className="w-full h-auto aspect-[9/16] object-cover"
        />
      </div>
    ))}
  </div>
);

const Gallery = ({ images, columns = 3 }: { images: { url: string; caption?: string; size?: string }[]; columns?: number }) => {
  const colsClass = columns === 2 ? "md:grid-cols-2" : columns === 4 ? "md:grid-cols-4" : "md:grid-cols-3";
  return (
    <div className={`grid grid-cols-1 ${colsClass} gap-4 my-16 md:my-20`}>
      {images.map((img, idx) => (
        <div
          key={idx}
          className={`reveal-init ${img.size === "large" ? "md:col-span-2" : ""}`}
          data-reveal
        >
          {/* The fraction has to track the same two things the layout does —
              the column count and whether this item spans two of them — or a
              "large" item in a four-up grid is served at quarter width and
              upscales. */}
          <img
            {...responsiveImage(
              img.url,
              columnFraction((img.size === "large" ? 2 : 1) / columns)
            )}
            alt={img.caption || `Gallery image ${idx + 1}`}
            loading="lazy"
            className="w-full h-auto object-cover"
          />
          {img.caption && (
            <p className="mt-2 text-sm text-brand-graphite font-sans">{img.caption}</p>
          )}
        </div>
      ))}
    </div>
  );
};

const RichText = ({ text, heading }: { text: string; heading?: string }) => (
  <div className="my-16 md:my-20 grid grid-cols-1 md:grid-cols-2 gap-8">
    <div />
    {/* The column is NOT the reveal target — see rule 2 at the top of the file.
        The heading reveals on its own and the prose runs its own wipe. */}
    <div>
      {heading && (
        <h3
          className="font-sans font-bold text-2xl md:text-4xl mb-8 reveal-init"
          data-reveal
        >
          {heading}
        </h3>
      )}
      {/* This is the page's body prose, so it gets the same treatment as the
          brief and the results rather than sitting still while everything
          around it moves — which is what it did before, and what made the wipe
          look like a one-off on two paragraphs instead of the page's voice.

          No `text-brand-black`: .reveal-word paints its own glyphs through a
          clipped gradient, so a colour here would be overridden on supporting
          browsers and disagree with it on the fallback path. */}
      <ScrollRevealText
        text={text}
        className="font-serif text-xl md:text-2xl leading-relaxed"
      />
    </div>
  </div>
);

const StatBlock = ({ number, label }: { number: string; label: string }) => (
  <div
    className="my-16 md:my-20 py-12 border-t border-b border-brand-border text-center reveal-init"
    data-reveal
  >
    <div className="font-sans font-bold text-6xl md:text-9xl text-brand-blue tracking-tighter mb-2">
      {number}
    </div>
    <div className="font-serif italic text-xl text-brand-graphite">{label}</div>
  </div>
);

const VideoBlock = ({ 
  videoType, 
  videoUrl, 
  videoFileUrl, 
  posterUrl, 
  caption, 
  autoplay, 
  loop 
}: { 
  videoType: string; 
  videoUrl?: string; 
  videoFileUrl?: string; 
  posterUrl?: string; 
  caption?: string; 
  autoplay?: boolean; 
  loop?: boolean;
}) => {
  const getEmbedUrl = () => {
    if (videoType === "youtube" && videoUrl) {
      const videoId = videoUrl.match(/(?:youtu\.be\/|youtube\.com(?:\/embed\/|\/v\/|\/watch\?v=|\/user\/\S+|\/ytscreeningroom\?v=|\/sandalsRes498702702702\?v=))([\w-]{10,12})/)?.[1];
      return videoId ? `https://www.youtube.com/embed/${videoId}?autoplay=${autoplay ? 1 : 0}&loop=${loop ? 1 : 0}` : null;
    }
    if (videoType === "vimeo" && videoUrl) {
      const videoId = videoUrl.match(/vimeo\.com\/(\d+)/)?.[1];
      return videoId ? `https://player.vimeo.com/video/${videoId}?autoplay=${autoplay ? 1 : 0}&loop=${loop ? 1 : 0}` : null;
    }
    return null;
  };

  return (
    <div className="w-full my-16 md:my-20 reveal-init" data-reveal>
      {videoType === "file" && videoFileUrl ? (
        <video
          src={videoFileUrl}
          // `poster` takes a single URL with no srcSet equivalent, so it's
          // capped at the widest the content column ever gets rather than
          // sized per viewport. Still the difference between a 1824px frame
          // and whatever the original happened to be.
          poster={posterUrl ? imageUrl(posterUrl, 1824) : undefined}
          controls
          autoPlay={autoplay}
          muted={autoplay}
          loop={loop}
          playsInline
          className="w-full h-auto"
        />
      ) : (
        <div className="relative w-full aspect-video">
          <iframe
            src={getEmbedUrl() || ""}
            className="absolute inset-0 w-full h-full"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </div>
      )}
      {caption && (
        <p className="mt-4 text-sm text-brand-graphite font-sans">{caption}</p>
      )}
    </div>
  );
};

const QuoteBlock = ({ quote, author, role }: { quote: string; author?: string; role?: string }) => (
  <div className="my-16 md:my-20 px-6 md:px-12">
    <div className="max-w-4xl mx-auto text-center">
      {/* The quotation marks go into the string rather than sitting beside the
          component, for two reasons. ScrollRevealText renders a block, so marks
          left outside it would land on their own lines above and below the
          quote. And inside, they travel with the first and last words, so the
          wipe covers the whole quotation rather than revealing a punctuation
          mark that was already black. */}
      <blockquote className="font-serif text-3xl md:text-5xl leading-tight italic">
        <ScrollRevealText text={`“${quote}”`} />
      </blockquote>
      {(author || role) && (
        <div className="mt-8 reveal-init" data-reveal>
          {author && <cite className="not-italic font-bold font-sans text-brand-black block">{author}</cite>}
          {role && <span className="text-sm font-sans text-brand-graphite">{role}</span>}
        </div>
      )}
    </div>
  </div>
);

const BeforeAfterBlock = ({ 
  beforeImage, 
  afterImage, 
  beforeLabel = "Before", 
  afterLabel = "After" 
}: { 
  beforeImage: string; 
  afterImage: string; 
  beforeLabel?: string; 
  afterLabel?: string;
}) => (
  <div className="my-16 md:my-20">
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-8">
      <div className="reveal-init" data-reveal>
        <span className="block text-xs uppercase tracking-widest text-brand-graphite mb-2 font-sans">{beforeLabel}</span>
        <img
          {...responsiveImage(beforeImage, columnFraction(1 / 2))}
          alt={beforeLabel}
          loading="lazy"
          className="w-full h-auto"
        />
      </div>
      <div className="reveal-init" data-reveal>
        <span className="block text-xs uppercase tracking-widest text-brand-graphite mb-2 font-sans">{afterLabel}</span>
        <img
          {...responsiveImage(afterImage, columnFraction(1 / 2))}
          alt={afterLabel}
          loading="lazy"
          className="w-full h-auto"
        />
      </div>
    </div>
  </div>
);

const ColorPaletteBlock = ({ colors }: { colors: { name: string; hex: string }[] }) => (
  <div className="my-16 md:my-20">
    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
      {colors.map((color, idx) => (
        <div key={idx} className="text-center reveal-init" data-reveal>
          <div
            className="w-full aspect-square rounded-lg mb-3 border border-brand-border"
            style={{ backgroundColor: color.hex }}
          />
          <p className="font-sans font-medium text-sm">{color.name}</p>
          <p className="font-mono text-xs text-brand-graphite uppercase">{color.hex}</p>
        </div>
      ))}
    </div>
  </div>
);

const TypographyBlock = ({ fonts }: { fonts: { name: string; usage?: string; sample?: string; imageUrl?: string }[] }) => (
  <div className="my-16 md:my-20">
    <div className="space-y-12">
      {fonts.map((font, idx) => (
        <div
          key={idx}
          className="border-t border-brand-border pt-8 reveal-init"
          data-reveal
        >
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
            <div className="md:col-span-4">
              <h4 className="font-sans font-bold text-xl">{font.name}</h4>
              {font.usage && <p className="text-sm text-brand-graphite mt-1">{font.usage}</p>}
            </div>
            <div className="md:col-span-8">
              {font.imageUrl ? (
                // md:col-span-8 of a 12-column grid.
                <img
                  {...responsiveImage(font.imageUrl, columnFraction(2 / 3))}
                  alt={font.name}
                  loading="lazy"
                  className="w-full h-auto"
                />
              ) : font.sample ? (
                <p className="text-4xl md:text-6xl">{font.sample}</p>
              ) : (
                <p className="text-4xl md:text-6xl">Aa Bb Cc Dd Ee Ff Gg</p>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  </div>
);

const SpacerBlock = ({ size }: { size: string }) => {
  const heights: Record<string, string> = {
    small: "h-8",
    medium: "h-16",
    large: "h-32",
    xlarge: "h-48 md:h-64",
  };
  return <div className={heights[size] || heights.medium} />;
};

const renderBlock = (block: ContentBlock, index: number) => {
  switch (block.type) {
    case "fullWidthImage":
      return <FullWidthImage key={index} url={block.url} caption={block.caption} altText={block.altText} />;
    case "dualGrid":
      return <DualGrid key={index} images={block.images} />;
    case "tripleGrid":
      return <TripleGrid key={index} images={block.images} />;
    case "gallery":
      return <Gallery key={index} images={block.images} columns={block.columns} />;
    case "richText":
      return <RichText key={index} text={block.text} heading={block.heading} />;
    case "statBlock":
      return <StatBlock key={index} number={block.number} label={block.label} />;
    case "video":
      return (
        <VideoBlock 
          key={index} 
          videoType={block.videoType} 
          videoUrl={block.videoUrl} 
          videoFileUrl={block.videoFileUrl}
          posterUrl={block.posterUrl}
          caption={block.caption}
          autoplay={block.autoplay}
          loop={block.loop}
        />
      );
    case "quote":
      return <QuoteBlock key={index} quote={block.quote} author={block.author} role={block.role} />;
    case "beforeAfter":
      return (
        <BeforeAfterBlock 
          key={index} 
          beforeImage={block.beforeImage} 
          afterImage={block.afterImage}
          beforeLabel={block.beforeLabel}
          afterLabel={block.afterLabel}
        />
      );
    case "colorPalette":
      return <ColorPaletteBlock key={index} colors={block.colors} />;
    case "typography":
      return <TypographyBlock key={index} fonts={block.fonts} />;
    case "spacer":
      return <SpacerBlock key={index} size={block.size} />;
    default:
      return null;
  }
};

type PageProps = {
  params: Promise<{ slug: string }>;
};

const ProjectDetailPage = async ({ params }: PageProps) => {
  const { slug } = await params;
  const [projectFromSanity, allProjectsFromSanity] = await Promise.all([
    client.fetch<Project | null>(PROJECT_BY_SLUG_QUERY, { slug }),
    client.fetch<Project[]>(PROJECTS_QUERY),
  ]);

  const allProjects = allProjectsFromSanity.length
    ? allProjectsFromSanity
    : FALLBACK_PROJECTS;

  const project =
    projectFromSanity ??
    allProjects.find((p) => p.slug === slug) ??
    null;

  if (!project) {
    notFound();
  }

  const projectIndex = allProjects.findIndex((p) => p.slug === project.slug);
  const nextProject =
    allProjects[(projectIndex + 1) % allProjects.length] ?? project;

  return (
    <div className="w-full bg-brand-white">
      {/* The image comes first and the title follows it, rather than the other
          way round: the first thing you see is the work, not a page about the
          work.

          It runs to the very top of the document, under the header, which has
          no bar of its own here — the wordmark and the links sit on their own
          dark pills instead. `<main>` drops its top padding on this route
          (NavChrome's `islands` treatment), so nothing above this element can
          show through as a strip of white.

          `data-nav-hero` is what NavChrome watches to know when the header
          stops being over the picture and resolves to the ordinary white bar.
          That attribute is this page's entire involvement in the header, which
          is what keeps it a server component with no client boundary.

          70svh on a phone rather than a full screen, because that is a portrait
          viewport cropping landscape photography: a full-height box there throws
          away most of the frame's width. */}
      <div
        data-nav-hero
        className="w-full h-[70svh] md:h-svh overflow-hidden bg-brand-offwhite"
      >
        {/* The one image on the page that isn't lazy, and now unambiguously the
            LCP element — it is the entire first screen. Eager and high priority
            for that reason.

            Deliberately the one thing on the page with no reveal, for the same
            reason: `reveal-init` starts at `opacity: 0`, and an element at zero
            opacity is not eligible to be the Largest Contentful Paint. Fading it
            in would hand back exactly what those two attributes buy. */}
        <img
          {...responsiveImage(project.heroImage, COVER_HERO)}
          alt={project.title}
          loading="eager"
          fetchPriority="high"
          // Lets NavChrome read this image back off a canvas to pick the
          // header's link colour. Without it every draw silently taints the
          // canvas and the links stay at their white default, which is wrong on
          // a bright hero.
          //
          // Only asked for on Sanity URLs, which are known to answer with
          // permissive CORS headers. Requesting it from a host that does not
          // send them makes the image fail to load *entirely* — a far worse
          // outcome than a header that cannot adapt — and the fallback fixtures
          // in constants.ts point at other hosts, so that is not hypothetical.
          crossOrigin={
            project.heroImage.includes("cdn.sanity.io")
              ? "anonymous"
              : undefined
          }
          className="w-full h-full object-cover"
        />
      </div>

      <header className="pt-16 md:pt-24 px-6 md:px-12 max-w-[1920px] mx-auto mb-12">
        {/* Above the fold, and still a `data-reveal` rather than a mount
            animation. The provider's batch fires on its initial refresh for
            anything already inside the trigger range, so these animate on load;
            it is only elements entirely *above* the viewport — a restored
            scroll position, a #hash landing — that skip it, and those are shown
            outright rather than left hidden. */}
        <h1
          className="font-sans font-bold text-4xl md:text-[8vw] leading-tight md:leading-none tracking-tight mb-8 md:mb-12 uppercase text-brand-black reveal-init"
          data-reveal
        >
          {project.title}
        </h1>

        {/* Per cell, so the four facts land in reading order rather than as one
            block — the same reason the grids above opt in per item. */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8 border-t border-brand-black pt-6 pb-12 font-sans text-sm md:text-base">
          <div className="reveal-init" data-reveal>
            <span className="block text-brand-graphite mb-1 text-xs uppercase tracking-widest">
              Client
            </span>
            <span className="font-medium">{project.client}</span>
          </div>
          <div className="reveal-init" data-reveal>
            <span className="block text-brand-graphite mb-1 text-xs uppercase tracking-widest">
              Services
            </span>
            <span className="font-medium">{project.services.join(", ")}</span>
          </div>
          <div className="reveal-init" data-reveal>
            <span className="block text-brand-graphite mb-1 text-xs uppercase tracking-widest">
              Industry
            </span>
            <span className="font-medium">{project.industry}</span>
          </div>
          <div className="reveal-init" data-reveal>
            <span className="block text-brand-graphite mb-1 text-xs uppercase tracking-widest">
              Year
            </span>
            <span className="font-medium">{project.year}</span>
          </div>
        </div>
      </header>

      <section className="px-6 md:px-12 max-w-[1920px] mx-auto my-16 md:my-20 py-12 md:py-20">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 md:gap-12 items-center">
          <div className="md:col-span-4" />
          <div className="md:col-span-8">
            {/* The eyebrow reveals; the paragraph below it does not. ScrollRevealText
                runs its own scrubbed wipe off its container's measured position, so
                an ancestor carrying a reveal transform would have it measuring a
                moving element and the wipe would map to the wrong scroll range. */}
            <h2
              className="font-sans text-sm md:text-base text-brand-blue mb-6 md:mb-8 reveal-init"
              data-reveal
            >
              The Challenge
            </h2>
            <ScrollRevealText text={project.brief} className="font-serif text-2xl md:text-4xl font-medium leading-snug" />
          </div>
        </div>
      </section>

      <section className="px-6 md:px-12 max-w-[1920px] mx-auto">
        {project.content.map((block, index) => renderBlock(block, index))}
      </section>

      {project.results && (
        <section className="px-6 md:px-12 max-w-[1920px] mx-auto my-16 md:my-20 py-12 md:py-20">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 md:gap-12 items-center">
            <div className="md:col-span-4" />
            <div className="md:col-span-8">
              {/* Same split as The Challenge above — eyebrow only. */}
              <h2
                className="font-sans text-sm md:text-base text-brand-blue mb-6 md:mb-8 reveal-init"
                data-reveal
              >
                Results & Impact
              </h2>
              <ScrollRevealText text={project.results} className="font-serif text-2xl md:text-4xl font-medium leading-snug" />
            </div>
          </div>
        </section>
      )}

      <section className="w-full bg-brand-black text-brand-white py-16 md:py-32 px-6 md:px-12 hover:bg-brand-blue transition-colors duration-500 cursor-pointer overflow-hidden">
        <Link
          href={`/work/${nextProject.slug}`}
          className="block max-w-[1920px] mx-auto text-center reveal-init"
          data-reveal
        >
          <span className="font-serif italic text-lg md:text-xl opacity-70 mb-4 block">
            Next Case Study
          </span>
          <h2 className="font-sans font-bold text-3xl md:text-8xl tracking-tight break-words">
            {nextProject.title}
          </h2>
        </Link>
      </section>
    </div>
  );
};

export default ProjectDetailPage;


