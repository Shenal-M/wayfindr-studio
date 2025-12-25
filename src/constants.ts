import type { AgencyPage, Brand, FAQItem, Project, SocialLink, Testimonial, WorkPage } from "./types";

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
  services: [
    {
      title: "Brand Strategy",
      slug: "brand-strategy",
      description: "Positioning, architecture, and messaging that give the brand a sharp point of view.",
      heroImage: "https://images.unsplash.com/photo-1552664730-d307ca884978?w=1200&h=1500&fit=crop",
      subServices: [
        { title: "Brand positioning", description: "Define the promise and territory the brand owns. We develop a clear, differentiated position that resonates with your target audience and creates a distinct space in the competitive landscape." },
        { title: "Market research", description: "Insights and competitive mapping to validate direction. We conduct comprehensive market analysis, customer interviews, and competitive intelligence to uncover opportunities and validate strategic decisions." },
        { title: "Competitive analysis", description: "Differentiate with data-backed opportunities. We analyze your competitive landscape to identify gaps, strengths, and opportunities for differentiation that inform positioning and messaging strategies." },
        { title: "Brand architecture", description: "Clarify how products and lines ladder up. We design brand hierarchies that create clarity and coherence across your portfolio, supporting business objectives while maintaining brand equity." },
        { title: "Messaging frameworks", description: "Codify voice pillars and proof points. We create comprehensive messaging systems that ensure consistent communication across all touchpoints, aligning teams and partners while maintaining brand integrity." },
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
    {
      name: "Retail & Fashion",
      iconUrl: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%23ffffff'%3E%3Cpath d='M7 4V2C7 1.45 7.45 1 8 1H16C16.55 1 17 1.45 17 2V4H20C20.55 4 21 4.45 21 5S20.55 6 20 6H19V19C19 20.1 18.1 21 17 21H7C5.9 21 5 20.1 5 19V6H4C3.45 6 3 5.55 3 5S3.45 4 4 4H7ZM9 3V4H15V3H9ZM7 6V19H17V6H7Z'/%3E%3Cpath d='M9 8V17H11V8H9ZM13 8V17H15V8H13Z'/%3E%3C/svg%3E",
      description: "Elevating retail brands through strategic design and compelling visual narratives.",
    },
    {
      name: "Cosmetics & Beauty",
      iconUrl: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%23ffffff'%3E%3Cpath d='M12 2C8.13 2 5 5.13 5 9C5 14.25 12 22 12 22S19 14.25 19 9C19 5.13 15.87 2 12 2ZM12 11.5C10.62 11.5 9.5 10.38 9.5 9C9.5 7.62 10.62 6.5 12 6.5S14.5 7.62 14.5 9C14.5 10.38 13.38 11.5 12 11.5Z'/%3E%3C/svg%3E",
      description: "Beauty brands that stand out with innovative packaging and brand identity.",
    },
    {
      name: "Technology & SaaS",
      iconUrl: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%23ffffff'%3E%3Cpath d='M12 2L2 7L12 12L22 7L12 2Z'/%3E%3Cpath d='M2 17L12 22L22 17V12L12 17L2 12V17Z'/%3E%3C/svg%3E",
      description: "Tech companies with compelling narratives and user-centric design systems.",
    },
    {
      name: "Finance & Fintech",
      iconUrl: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%23ffffff'%3E%3Cpath d='M11.8 10.9C9.53 10.31 8.8 9.7 8.8 8.75C8.8 7.66 9.81 6.9 11.5 6.9C13.28 6.9 13.94 7.75 14 9H16.21C16.14 7.28 15.09 5.7 13 5.19V3H10V5.16C8.06 5.58 6.5 6.84 6.5 8.77C6.5 10.73 8.26 12 10.8 12.7C13.3 13.4 13.8 14.2 13.8 15.1C13.8 16 13.05 16.9 11.2 16.9C9.16 16.9 8.36 15.9 8.28 14.5H6.07C6.15 16.4 7.5 17.97 10 18.42V21H13V18.47C14.93 18.08 16.5 16.9 16.5 15.1C16.5 12.7 14.2 11.5 11.8 10.9Z'/%3E%3C/svg%3E",
      description: "Financial services reimagined with trust-building design and clarity.",
    },
    {
      name: "Healthcare & Wellness",
      iconUrl: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%23ffffff'%3E%3Cpath d='M12 21.35L10.55 20.03C5.4 15.36 2 12.27 2 8.5C2 5.41 4.42 3 7.5 3C9.24 3 10.91 3.81 12 5.08C13.09 3.81 14.76 3 16.5 3C19.58 3 22 5.41 22 8.5C22 12.27 18.6 15.36 13.45 20.03L12 21.35Z'/%3E%3C/svg%3E",
      description: "Health brands that inspire trust and communicate care through thoughtful design.",
    },
    {
      name: "B2B Services",
      iconUrl: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%23ffffff'%3E%3Cpath d='M20 6H16L14 4H10L8 6H4C2.9 6 2 6.9 2 8V19C2 20.1 2.9 21 4 21H20C21.1 21 22 20.1 22 19V8C22 6.9 21.1 6 20 6ZM12 17C9.24 17 7 14.76 7 12C7 9.24 9.24 7 12 7S17 9.24 17 12C17 14.76 14.76 17 12 17ZM12 15C13.66 15 15 13.66 15 12C15 10.34 13.66 9 12 9S9 10.34 9 12C9 13.66 10.34 15 12 15Z'/%3E%3C/svg%3E",
      description: "B2B brands that connect and communicate value through strategic design.",
    },
  ],
};

export const WORK_PAGE_FALLBACK: WorkPage = {
  topLabel: "Work",
  heroTitle: "Selected Projects",
  heroDescription: "A collection of strategic interventions, digital products, and brand identities. Each project is a unique collaboration between strategy and craft.",
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


