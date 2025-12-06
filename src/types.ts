export type Brand = {
  id: string;
  name: string;
  logoUrl?: string;
};

export type SocialLink = {
  platform: string;
  url: string;
};

export type ContactInfo = {
  email: string;
  address: string;
  availabilityText: string;
  availabilityHighlight: string;
};

export type SiteSettings = {
  socialLinks: SocialLink[];
  contactInfo: ContactInfo;
  footerAboutText?: string;
  footerLogoSvg?: string;
};

export type Testimonial = {
  quote: string;
  author: string;
  role: string;
  company: string;
};

export type FAQItem = {
  question: string;
  answer: string;
};

export type Capability = {
  title: string;
  items: string[];
};

export type Stat = {
  number: string;
  label: string;
};

export type AgencyPage = {
  topLabel: string;
  heroLine1: string;
  heroLine2: string;
  heroDescription: string;
  heroBottomText: string;
  establishedYear: string;
  capabilitiesTitle: string;
  capabilities: Capability[];
  philosophyQuote: string;
  philosophyAttribution: string;
  industriesTitle?: string;
  industries?: string[];
  stats?: Stat[];
};

export type ContentBlock =
  | {
      type: "fullWidthImage";
      url: string;
      caption?: string;
      altText?: string;
    }
  | {
      type: "dualGrid" | "tripleGrid";
      images: { url: string; caption?: string }[];
    }
  | {
      type: "gallery";
      images: { url: string; caption?: string; size?: "small" | "medium" | "large" }[];
      columns?: number;
    }
  | {
      type: "richText";
      text: string;
      heading?: string;
    }
  | {
      type: "statBlock";
      number: string;
      label: string;
    }
  | {
      type: "video";
      videoType: "file" | "youtube" | "vimeo";
      videoUrl?: string;
      videoFileUrl?: string;
      posterUrl?: string;
      caption?: string;
      autoplay?: boolean;
      loop?: boolean;
    }
  | {
      type: "quote";
      quote: string;
      author?: string;
      role?: string;
    }
  | {
      type: "beforeAfter";
      beforeImage: string;
      afterImage: string;
      beforeLabel?: string;
      afterLabel?: string;
    }
  | {
      type: "colorPalette";
      colors: { name: string; hex: string }[];
    }
  | {
      type: "typography";
      fonts: { name: string; usage?: string; sample?: string; imageUrl?: string }[];
    }
  | {
      type: "spacer";
      size: "small" | "medium" | "large" | "xlarge";
    };

export type Project = {
  title: string;
  slug: string;
  client: string;
  year: string;
  services: string[];
  industry: string;
  description: string;
  thumbnail: string;
  heroImage: string;
  heroVideoUrl?: string;
  brief: string;
  solution?: string;
  results?: string;
  projectUrl?: string;
  featured?: boolean;
  content: ContentBlock[];
  relatedProjects?: { title: string; slug: string; thumbnail: string }[];
};


