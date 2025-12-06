import React from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { client } from "../../../../sanity/lib/client";
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

const FullWidthImage = ({ url, caption, altText }: { url: string; caption?: string; altText?: string }) => (
  <div className="w-full my-16 md:my-20">
    <img src={url} alt={altText || caption || "Project visual"} className="w-full h-auto" />
    {caption && (
      <p className="mt-4 text-sm text-brand-graphite font-sans">{caption}</p>
    )}
  </div>
);

const DualGrid = ({ images }: { images: { url: string; caption?: string }[] }) => (
  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-8 my-16 md:my-20">
    {images.map((img, idx) => (
      <div key={idx}>
        <img
          src={img.url}
          alt={img.caption || `Detail ${idx + 1}`}
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
      <div key={idx}>
        <img
          src={img.url}
          alt={img.caption || `Detail ${idx + 1}`}
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
        <div key={idx} className={img.size === "large" ? "md:col-span-2" : ""}>
          <img
            src={img.url}
            alt={img.caption || `Gallery image ${idx + 1}`}
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
    <div>
      {heading && (
        <h3 className="font-sans font-bold text-2xl md:text-4xl mb-8">{heading}</h3>
      )}
      <div className="font-serif text-xl md:text-2xl text-brand-black leading-relaxed">
        <p>{text}</p>
      </div>
    </div>
  </div>
);

const StatBlock = ({ number, label }: { number: string; label: string }) => (
  <div className="my-16 md:my-20 py-12 border-t border-b border-brand-border text-center">
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
    <div className="w-full my-16 md:my-20">
      {videoType === "file" && videoFileUrl ? (
        <video
          src={videoFileUrl}
          poster={posterUrl}
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
      <blockquote className="font-serif text-3xl md:text-5xl text-brand-black leading-tight italic">
        "{quote}"
      </blockquote>
      {(author || role) && (
        <div className="mt-8">
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
      <div>
        <span className="block text-xs uppercase tracking-widest text-brand-graphite mb-2 font-sans">{beforeLabel}</span>
        <img src={beforeImage} alt={beforeLabel} className="w-full h-auto" />
      </div>
      <div>
        <span className="block text-xs uppercase tracking-widest text-brand-graphite mb-2 font-sans">{afterLabel}</span>
        <img src={afterImage} alt={afterLabel} className="w-full h-auto" />
      </div>
    </div>
  </div>
);

const ColorPaletteBlock = ({ colors }: { colors: { name: string; hex: string }[] }) => (
  <div className="my-16 md:my-20">
    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
      {colors.map((color, idx) => (
        <div key={idx} className="text-center">
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
        <div key={idx} className="border-t border-brand-border pt-8">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
            <div className="md:col-span-4">
              <h4 className="font-sans font-bold text-xl">{font.name}</h4>
              {font.usage && <p className="text-sm text-brand-graphite mt-1">{font.usage}</p>}
            </div>
            <div className="md:col-span-8">
              {font.imageUrl ? (
                <img src={font.imageUrl} alt={font.name} className="w-full h-auto" />
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
      <header className="pt-24 md:pt-32 px-6 md:px-12 max-w-[1920px] mx-auto mb-12">
        <h1 className="font-sans font-bold text-4xl md:text-[8vw] leading-tight md:leading-none tracking-tight mb-8 md:mb-12 uppercase text-brand-black">
          {project.title}
        </h1>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8 border-t border-brand-black pt-6 pb-12 font-sans text-sm md:text-base">
          <div>
            <span className="block text-brand-graphite mb-1 text-xs uppercase tracking-widest">
              Client
            </span>
            <span className="font-medium">{project.client}</span>
          </div>
          <div>
            <span className="block text-brand-graphite mb-1 text-xs uppercase tracking-widest">
              Services
            </span>
            <span className="font-medium">{project.services.join(", ")}</span>
          </div>
          <div>
            <span className="block text-brand-graphite mb-1 text-xs uppercase tracking-widest">
              Industry
            </span>
            <span className="font-medium">{project.industry}</span>
          </div>
          <div>
            <span className="block text-brand-graphite mb-1 text-xs uppercase tracking-widest">
              Year
            </span>
            <span className="font-medium">{project.year}</span>
          </div>
        </div>
      </header>

      <div className="w-full md:h-[90vh]">
        <img
          src={project.heroImage}
          alt={project.title}
          className="w-full h-auto md:h-full object-contain md:object-cover"
        />
      </div>

      <section className="px-6 md:px-12 max-w-[1920px] mx-auto my-16 md:my-20 py-12 md:py-20">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 md:gap-12 items-center">
          <div className="md:col-span-4" />
          <div className="md:col-span-8">
            <h2 className="font-sans text-sm md:text-base text-brand-blue mb-6 md:mb-8">The Challenge</h2>
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
              <h2 className="font-sans text-sm md:text-base text-brand-blue mb-6 md:mb-8">Results & Impact</h2>
              <ScrollRevealText text={project.results} className="font-serif text-2xl md:text-4xl font-medium leading-snug" />
            </div>
          </div>
        </section>
      )}

      <section className="w-full bg-brand-black text-brand-white py-16 md:py-32 px-6 md:px-12 hover:bg-brand-blue transition-colors duration-500 cursor-pointer overflow-hidden">
        <Link
          href={`/work/${nextProject.slug}`}
          className="block max-w-[1920px] mx-auto text-center"
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


