import type { AgencyPage, Brand, FAQItem, Project, SocialLink, Testimonial } from "./types";

export const SOCIAL_LINKS: SocialLink[] = [
  { platform: "Instagram", url: "#" },
  { platform: "LinkedIn", url: "#" },
  { platform: "Behance", url: "#" },
];

export const FOOTER_ABOUT_TEXT = "Wayfindr Studio is a strategic design agency. We combine Swiss precision with unexpected wit to build high-end digital experiences for reliable brands. Guided by curiosity and intellect, we create work that redefines ideas, shifts perceptions, and leaves an imprint across disciplines and industries.";

export const FOOTER_LOGO_SVG = `<svg viewBox="0 0 800 100" xmlns="http://www.w3.org/2000/svg">
  <text x="0" y="80" font-family="Arial, sans-serif" font-size="90" font-weight="bold" fill="currentColor">Wayfindr</text>
</svg>`;

export const BRANDS: Brand[] = [
  { id: "1", name: "Google" },
  { id: "2", name: "Nike" },
  { id: "3", name: "Aesop" },
  { id: "4", name: "Spotify" },
  { id: "5", name: "Tesla" },
  { id: "6", name: "Arket" },
  { id: "7", name: "Vitra" },
  { id: "8", name: "Polestar" },
];

export const TESTIMONIALS: Testimonial[] = [
  {
    quote:
      "Wayfindr didn't just redesign our site, they completely restructured how we communicate our value. Brutal efficiency.",
    author: "Elena Fisher",
    role: "CMO",
    company: "Apex Group",
  },
  {
    quote:
      "The balance between strict grid systems and absolute chaos is what makes their work stand out. Highly recommended.",
    author: "Marcus Chen",
    role: "Director",
    company: "Mono Press",
  },
  {
    quote:
      "Reliable, fast, and unexpectedly funny. They turned a boring fintech product into something that feels like high fashion.",
    author: "Sarah Jenkins",
    role: "Founder",
    company: "Vortex",
  },
];

export const AGENCY_PAGE_FALLBACK: AgencyPage = {
  topLabel: "The Agency",
  heroLine1: "Structured",
  heroLine2: "Wit.",
  heroDescription:
    "We believe that great design exists at the intersection of logic and emotion. We use rigid grids, precise typography, and data-driven strategies—then we break them.",
  heroBottomText:
    "It's this moment of disruption, the \"Wit\", that makes a brand memorable.",
  establishedYear: "Since 2020",
  capabilitiesTitle: "Capabilities",
  capabilities: [
    {
      title: "Brand Strategy",
      items: ["Brand positioning", "market research", "competitive analysis", "brand architecture", "messaging frameworks"],
    },
    {
      title: "Visual Identity",
      items: ["Logo design", "visual systems", "typography", "color palettes", "brand guidelines"],
    },
    {
      title: "Digital Experience",
      items: ["UI/UX design", "web development", "mobile apps", "motion design", "interactive prototypes"],
    },
    {
      title: "Brand Activation",
      items: ["Launch campaigns", "content strategy", "social media", "brand governance", "employee engagement"],
    },
    {
      title: "Verbal Identity",
      items: ["Brand naming", "tone of voice", "messaging", "copywriting", "editorial guidelines"],
    },
    {
      title: "Creative Direction",
      items: ["Art direction", "photography", "3D visualization", "video production", "packaging design"],
    },
  ],
  services: [
    {
      title: "Brand Strategy",
      slug: "brand-strategy",
      description: "Positioning, architecture, and messaging that give the brand a sharp point of view.",
      heroImage: "https://images.unsplash.com/photo-1552664730-d307ca884978?w=1200&h=1500&fit=crop",
      subServices: [
        { title: "Brand positioning", description: "Define the promise and territory the brand owns." },
        { title: "Market research", description: "Insights and competitive mapping to validate direction." },
        { title: "Competitive analysis", description: "Differentiate with data-backed opportunities." },
        { title: "Brand architecture", description: "Clarify how products and lines ladder up." },
        { title: "Messaging frameworks", description: "Codify voice pillars and proof points." },
      ],
    },
    {
      title: "Visual Identity",
      slug: "visual-identity",
      description: "Systems, typography, and color that make the brand instantly recognizable.",
      heroImage: "https://images.unsplash.com/photo-1561070791-2526d30994b5?w=1200&h=1500&fit=crop",
      subServices: [
        { title: "Logo design", description: "Distinct marks tailored to the brand strategy." },
        { title: "Visual systems", description: "Grid, rhythm, and motion rules for consistency." },
        { title: "Typography", description: "Type stacks tuned for legibility and personality." },
        { title: "Color palettes", description: "Scalable palettes with accessibility in mind." },
        { title: "Brand guidelines", description: "Living standards for teams and partners." },
      ],
    },
    {
      title: "Digital Experience",
      slug: "digital-experience",
      description: "Product and marketing experiences built for speed, clarity, and conversion.",
      heroImage: "https://images.unsplash.com/photo-1561070791-2526d30994b5?w=1200&h=1500&fit=crop",
      subServices: [
        { title: "UI/UX design", description: "Flows and interfaces shaped by user needs." },
        { title: "Web development", description: "Performance-first builds on modern stacks." },
        { title: "Mobile apps", description: "Native-feeling experiences across devices." },
        { title: "Motion design", description: "Purposeful motion to guide and delight." },
        { title: "Interactive prototypes", description: "Test ideas fast before investing in build." },
      ],
    },
    {
      title: "Brand Activation",
      slug: "brand-activation",
      description: "Launches and campaigns that turn a brand system into measurable traction.",
      heroImage: "https://images.unsplash.com/photo-1552664730-d307ca884978?w=1200&h=1500&fit=crop",
      subServices: [
        { title: "Launch campaigns", description: "End-to-end creative to introduce products." },
        { title: "Content strategy", description: "Editorial plans aligned to the funnel." },
        { title: "Social media", description: "Platform-native assets and playbooks." },
        { title: "Brand governance", description: "Guardrails to keep teams on-brand." },
        { title: "Employee engagement", description: "Toolkits that align internal teams." },
      ],
    },
    {
      title: "Verbal Identity",
      slug: "verbal-identity",
      description: "Voice, tone, and naming that sound as intentional as the visuals look.",
      heroImage: "https://images.unsplash.com/photo-1561070791-2526d30994b5?w=1200&h=1500&fit=crop",
      subServices: [
        { title: "Brand naming", description: "Shortlists grounded in strategy and trademark sense." },
        { title: "Tone of voice", description: "Codify how the brand speaks in every channel." },
        { title: "Messaging", description: "Concise narratives for products and campaigns." },
        { title: "Copywriting", description: "On-brand language from headlines to UX microcopy." },
        { title: "Editorial guidelines", description: "Rules for punctuation, grammar, and cadence." },
      ],
    },
    {
      title: "Creative Direction",
      slug: "creative-direction",
      description: "Art direction that keeps imagery, motion, and production cohesive.",
      heroImage: "https://images.unsplash.com/photo-1552664730-d307ca884978?w=1200&h=1500&fit=crop",
      subServices: [
        { title: "Art direction", description: "Concepts, references, and shot lists for shoots." },
        { title: "Photography", description: "On-set guidance and post direction." },
        { title: "3D visualization", description: "CGI to prototype products and environments." },
        { title: "Video production", description: "Narrative and product films with tight pacing." },
        { title: "Packaging design", description: "Structural and graphic systems for shelf impact." },
      ],
    },
  ],
  philosophyQuote:
    "We don't just decorate. We solve business problems with aggressive aesthetics.",
  philosophyAttribution: "The Philosophy",
  industriesTitle: "Industries We Work With",
  industries: [
    "Retail & Fashion",
    "Cosmetics & Beauty",
    "Technology & SaaS",
    "Finance & Fintech",
    "Healthcare & Wellness",
    "B2B Services",
  ],
};

export const FAQS: FAQItem[] = [
  {
    question: "What is your typical budget range?",
    answer:
      "Our engagements typically start at $15k for brand identity projects and $25k for digital experiences. We believe in delivering high-value, comprehensive solutions rather than quick fixes.",
  },
  {
    question: "How long does a project take?",
    answer:
      "A standard identity and web project spans 8-12 weeks. We move fast, but we allocate significant time to strategy and discovery before a single pixel is placed.",
  },
  {
    question: "Do you work with startups?",
    answer:
      "Yes, but only those who are ready to challenge their industry standards. We look for partners who appreciate bold decisions and structured wit.",
  },
  {
    question: "What platforms do you build on?",
    answer:
      "We are a headless-first agency. We primarily utilize Next.js for the frontend and Sanity.io for content management to ensure performance and scalability.",
  },
];

export const PROJECTS: Project[] = [
  {
    title: "Apex Architecture",
    slug: "apex-architecture",
    client: "Apex Group",
    year: "2024",
    services: ["Identity", "Strategy", "Web"],
    industry: "Real Estate",
    description: "Redefining the skyline through a brutalist digital experience.",
    thumbnail: "https://picsum.photos/800/600?random=1",
    heroImage: "https://picsum.photos/1920/1080?random=1",
    brief:
      "Apex needed to shed its corporate skin and embrace the raw materiality of their buildings. The challenge was to create a digital presence that felt as heavy and permanent as concrete, yet moved with the speed of modern web.",
    content: [
      {
        type: "fullWidthImage",
        url: "https://picsum.photos/1920/1200?random=11",
        caption: "Homepage interaction study",
      },
      {
        type: "richText",
        heading: "Materiality in Digital",
        text: "We translated the tactile nature of concrete into a strict grid system. Zero border radius, heavy typography, and monochromatic imagery allow the architectural photography to take center stage.",
      },
      {
        type: "dualGrid",
        images: [
          { url: "https://picsum.photos/800/800?random=12" },
          { url: "https://picsum.photos/800/800?random=13" },
        ],
      },
      {
        type: "statBlock",
        number: "40%",
        label: "Increase in Lead Generation",
      },
    ],
  },
  {
    title: "Lumina Labs",
    slug: "lumina-labs",
    client: "Lumina",
    year: "2023",
    services: ["Packaging", "Art Direction"],
    industry: "Beauty",
    description: "Illuminating the science of skincare with clinical precision.",
    thumbnail: "https://picsum.photos/800/600?random=2",
    heroImage: "https://picsum.photos/1920/1080?random=2",
    brief:
      "Lumina stands at the intersection of nature and laboratory science. They needed a packaging system that felt pharmaceutical but luxurious enough for high-end retail shelves.",
    content: [
      {
        type: "tripleGrid",
        images: [
          { url: "https://picsum.photos/500/800?random=21" },
          { url: "https://picsum.photos/500/800?random=22" },
          { url: "https://picsum.photos/500/800?random=23" },
        ],
      },
      {
        type: "richText",
        text: "The typography (General Sans) was paired with technical diagrams to suggest efficacy. The color palette was restricted to pure white and a holographic foil.",
      },
      {
        type: "fullWidthImage",
        url: "https://picsum.photos/1920/1000?random=24",
      },
    ],
  },
  {
    title: "Mono Magazine",
    slug: "mono-magazine",
    client: "Mono Press",
    year: "2025",
    services: ["Editorial", "Digital"],
    industry: "Publishing",
    description: "A typographically driven platform for minimalists.",
    thumbnail: "https://picsum.photos/800/600?random=3",
    heroImage: "https://picsum.photos/1920/1080?random=3",
    brief:
      "Mono Magazine required a complete overhaul of their reading experience. The goal was to remove all distractions, leaving only the text and the reader.",
    content: [
      {
        type: "fullWidthImage",
        url: "https://picsum.photos/1920/1080?random=31",
      },
      {
        type: "dualGrid",
        images: [
          { url: "https://picsum.photos/800/1000?random=32" },
          { url: "https://picsum.photos/800/1000?random=33" },
        ],
      },
      {
        type: "richText",
        heading: "Typography First",
        text: "We utilized a high-contrast serif for display usage to bring a sense of history and authority, contrasted with a utilitarian sans-serif for UI elements.",
      },
    ],
  },
  {
    title: "Vortex Financial",
    slug: "vortex-financial",
    client: "Vortex",
    year: "2024",
    services: ["App Design", "Identity"],
    industry: "Fintech",
    description: "Simplifying complex data streams for the modern trader.",
    thumbnail: "https://picsum.photos/800/600?random=4",
    heroImage: "https://picsum.photos/1920/1080?random=4",
    brief:
      "Traders need clarity, not noise. Vortex approached us to redesign their terminal interface to reduce cognitive load while maintaining data density.",
    content: [
      {
        type: "fullWidthImage",
        url: "https://picsum.photos/1920/1200?random=41",
      },
      {
        type: "statBlock",
        number: "200ms",
        label: "Latency Reduction",
      },
    ],
  },
];


