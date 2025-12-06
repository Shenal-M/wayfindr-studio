import { type SchemaTypeDefinition } from "sanity";

export const schema: { types: SchemaTypeDefinition[] } = {
  types: [
    // Site Settings (singleton)
    {
      name: "siteSettings",
      title: "Site Settings",
      type: "document",
      description: "Global site settings including social links and contact information",
      fields: [
        {
          name: "socialLinks",
          title: "Social Media Links",
          type: "array",
          description: "Add your social media profiles",
          of: [
            {
              type: "object",
              name: "socialLink",
              fields: [
                {
                  name: "platform",
                  title: "Platform",
                  type: "string",
                  description: "Name of the platform (e.g. Instagram, LinkedIn)",
                  validation: (Rule) => Rule.required(),
                },
                {
                  name: "url",
                  title: "URL",
                  type: "url",
                  description: "Link to your profile",
                  validation: (Rule) => Rule.required().uri({ scheme: ["http", "https"] }),
                },
              ],
              preview: {
                select: { title: "platform", subtitle: "url" },
              },
            },
          ],
        },
        {
          name: "contactEmail",
          title: "Contact Email",
          type: "string",
          description: "Main business email address",
          validation: (Rule) => Rule.required().email(),
        },
        {
          name: "contactAddress",
          title: "Office Address",
          type: "string",
          description: "Physical office address",
        },
        {
          name: "availabilityText",
          title: "Availability Text (Regular)",
          type: "string",
          description: "Text before the highlighted part (e.g. 'We are currently accepting new projects for')",
        },
        {
          name: "availabilityHighlight",
          title: "Availability Text (Highlighted)",
          type: "string",
          description: "The highlighted/blue part of the text (e.g. 'Q1 2026')",
        },
        {
          name: "footerAboutText",
          title: "Footer About Text",
          type: "text",
          rows: 4,
          description: "About text that appears in the footer",
        },
        {
          name: "footerLogoSvg",
          title: "Footer Logo SVG",
          type: "file",
          description: "Upload an SVG file for the footer logo",
          options: {
            accept: ".svg",
          },
        },
      ],
      preview: {
        prepare() {
          return { title: "Site Settings" };
        },
      },
    },

    // Agency Page (singleton)
    {
      name: "agencyPage",
      title: "Agency Page",
      type: "document",
      description: "Content for the agency/about page",
      fields: [
        // Hero Section
        {
          name: "topLabel",
          title: "Top Label",
          type: "string",
          description: "Small label above the headline (e.g., 'The Agency')",
          initialValue: "The Agency",
        },
        {
          name: "heroLine1",
          title: "Hero Headline Line 1",
          type: "string",
          description: "First line of the main headline (e.g., 'Structured')",
        },
        {
          name: "heroLine2",
          title: "Hero Headline Line 2",
          type: "string",
          description: "Second line of the main headline (e.g., 'Wit.') - appears in blue",
        },
        {
          name: "heroDescription",
          title: "Hero Description",
          type: "text",
          rows: 3,
          description: "Supporting paragraph explaining the agency's approach",
        },
        {
          name: "heroBottomText",
          title: "Hero Bottom Text",
          type: "text",
          rows: 2,
          description: "Italicized text at the bottom of the hero section",
        },
        {
          name: "establishedYear",
          title: "Established Year",
          type: "string",
          description: "Year the agency was founded (e.g., 'Since 2020')",
          initialValue: "Since 2020",
        },

        // Capabilities Section
        {
          name: "capabilitiesTitle",
          title: "Capabilities Section Title",
          type: "string",
          description: "Title for the capabilities section",
          initialValue: "Capabilities",
        },
        {
          name: "capabilities",
          title: "Capabilities",
          type: "array",
          description: "List of service categories and their offerings",
          of: [
            {
              type: "object",
              fields: [
                {
                  name: "title",
                  title: "Category Title",
                  type: "string",
                  description: "e.g., Brand Strategy, Visual Identity, Digital Experience",
                  validation: (Rule) => Rule.required(),
                },
                {
                  name: "items",
                  title: "Services",
                  type: "array",
                  description: "List of services under this category (will be displayed as comma-separated text)",
                  of: [{ type: "string" }],
                  validation: (Rule) => Rule.required().min(1),
                },
              ],
              preview: {
                select: {
                  title: "title",
                  items: "items",
                },
                prepare({ title, items }) {
                  return {
                    title: title,
                    subtitle: items ? `${items.length} services` : "No services",
                  };
                },
              },
            },
          ],
        },

        // Philosophy Section
        {
          name: "philosophyQuote",
          title: "Philosophy Quote",
          type: "text",
          rows: 3,
          description: "The main philosophy or mission statement (displayed large and centered)",
        },
        {
          name: "philosophyAttribution",
          title: "Philosophy Attribution",
          type: "string",
          description: "Attribution text below the quote (e.g., 'The Philosophy')",
          initialValue: "The Philosophy",
        },

        // Industries Section
        {
          name: "industriesTitle",
          title: "Industries Section Title",
          type: "string",
          description: "Title for the industries section (optional)",
        },
        {
          name: "industries",
          title: "Industries",
          type: "array",
          description: "Industries you work with (displayed as tags)",
          of: [{ type: "string" }],
        },

        // Stats Section (optional)
        {
          name: "stats",
          title: "Statistics",
          type: "array",
          description: "Key statistics or achievements (optional)",
          of: [
            {
              type: "object",
              fields: [
                {
                  name: "number",
                  title: "Number/Statistic",
                  type: "string",
                  description: "e.g., '150+', '10 Years', '98%'",
                },
                {
                  name: "label",
                  title: "Label",
                  type: "string",
                  description: "Description of the stat",
                },
              ],
              preview: {
                select: {
                  title: "number",
                  subtitle: "label",
                },
              },
            },
          ],
        },
      ],
      preview: {
        prepare() {
          return { title: "Agency Page" };
        },
      },
    },

    // Homepage (hero copy etc. – optional)
    {
      name: "homepage",
      title: "Homepage",
      type: "document",
      fields: [
        {
          name: "title",
          title: "Browser Title (Metadata)",
          type: "string",
          description: "Title shown in the browser tab",
        },
        {
          name: "heroLine1",
          title: "Hero Line 1",
          type: "string",
          description: "First line of the hero text (e.g. Navigating)",
        },
        {
          name: "heroLine2",
          title: "Hero Line 2",
          type: "string",
          description: "Second line of the hero text (e.g. The Chaos)",
        },
        {
          name: "heroLine3",
          title: "Hero Line 3",
          type: "string",
          description: "Third line of the hero text (e.g. Of Brands.)",
        },
      ],
    },

    // Brands used in the marquee
    {
      name: "brand",
      title: "Brand",
      type: "document",
      description: "Brands displayed in the scrolling marquee on the homepage",
      fields: [
        {
          name: "name",
          title: "Name",
          type: "string",
          description: "The brand or client name",
          validation: (Rule) => Rule.required(),
        },
        {
          name: "logo",
          title: "Logo (SVG)",
          type: "image",
          description: "Upload a black SVG logo. It will be displayed with reduced opacity for the gray effect.",
          options: {
            accept: "image/svg+xml",
          },
        },
      ],
      preview: {
        select: {
          title: "name",
          media: "logo",
        },
      },
    },

    // Testimonials on the homepage
    {
      name: "testimonial",
      title: "Testimonial",
      type: "document",
      description: "Client testimonials displayed on the homepage",
      fields: [
        {
          name: "quote",
          title: "Quote",
          type: "text",
          description: "The testimonial quote (keep it concise and impactful)",
        },
        {
          name: "author",
          title: "Author",
          type: "string",
          description: "Name of the person giving the testimonial",
        },
        {
          name: "role",
          title: "Role",
          type: "string",
          description: "Job title or role (e.g. CEO, Creative Director)",
        },
        {
          name: "company",
          title: "Company",
          type: "string",
          description: "Company or organization name",
        },
      ],
    },

    // FAQ entries for the Contact page
    {
      name: "faq",
      title: "FAQ",
      type: "document",
      description: "Frequently asked questions for the contact page",
      fields: [
        {
          name: "order",
          title: "Order",
          type: "number",
          description: "Display order (lower numbers appear first)",
          validation: (Rule) => Rule.required().integer().positive(),
        },
        {
          name: "question",
          title: "Question",
          type: "string",
          description: "The question being asked",
        },
        {
          name: "answer",
          title: "Answer",
          type: "text",
          description: "The answer to the question",
        },
      ],
      orderings: [
        {
          title: "Display Order",
          name: "orderAsc",
          by: [{ field: "order", direction: "asc" }],
        },
      ],
      preview: {
        select: {
          title: "question",
          order: "order",
        },
        prepare({ title, order }) {
          return {
            title: title,
            subtitle: `Order: ${order || "Not set"}`,
          };
        },
      },
    },

    // ═══════════════════════════════════════════════════════════════
    // CONTENT BLOCKS FOR PROJECTS
    // ═══════════════════════════════════════════════════════════════

    // Full-width Image Block
    {
      name: "fullWidthImageBlock",
      title: "Full-width Image",
      type: "object",
      description: "A single image that spans the full width of the page",
      fields: [
        {
          name: "image",
          title: "Image",
          type: "image",
          options: { hotspot: true },
          description: "Upload a high-resolution image (recommended: 1920px wide minimum)",
        },
        {
          name: "caption",
          title: "Caption",
          type: "string",
          description: "Optional caption displayed below the image",
        },
        {
          name: "altText",
          title: "Alt Text",
          type: "string",
          description: "Accessibility description of the image",
        },
      ],
      preview: {
        select: { title: "caption", media: "image" },
        prepare({ title, media }) {
          return { title: title || "Full-width Image", media };
        },
      },
    },

    // Dual Grid Block (2 columns)
    {
      name: "dualGridBlock",
      title: "Dual Grid (2 Images)",
      type: "object",
      description: "Two images displayed side by side in a grid",
      fields: [
        {
          name: "images",
          title: "Images",
          type: "array",
          description: "Add exactly 2 images for the grid",
          validation: (Rule) => Rule.max(2),
          of: [
            {
              type: "object",
              fields: [
                {
                  name: "image",
                  title: "Image",
                  type: "image",
                  options: { hotspot: true },
                },
                {
                  name: "caption",
                  title: "Caption",
                  type: "string",
                  description: "Optional caption for this image",
                },
              ],
              preview: {
                select: { title: "caption", media: "image" },
              },
            },
          ],
        },
      ],
      preview: {
        prepare() {
          return { title: "Dual Grid (2 Images)" };
        },
      },
    },

    // Triple Grid Block (3 columns)
    {
      name: "tripleGridBlock",
      title: "Triple Grid (3 Images)",
      type: "object",
      description: "Three images displayed in a row (ideal for mobile screenshots or details)",
      fields: [
        {
          name: "images",
          title: "Images",
          type: "array",
          description: "Add exactly 3 images for the grid",
          validation: (Rule) => Rule.max(3),
          of: [
            {
              type: "object",
              fields: [
                {
                  name: "image",
                  title: "Image",
                  type: "image",
                  options: { hotspot: true },
                },
                {
                  name: "caption",
                  title: "Caption",
                  type: "string",
                },
              ],
              preview: {
                select: { title: "caption", media: "image" },
              },
            },
          ],
        },
      ],
      preview: {
        prepare() {
          return { title: "Triple Grid (3 Images)" };
        },
      },
    },

    // Rich Text Block
    {
      name: "richTextBlock",
      title: "Rich Text",
      type: "object",
      description: "A text section with optional heading for storytelling",
      fields: [
        {
          name: "heading",
          title: "Heading",
          type: "string",
          description: "Optional section heading",
        },
        {
          name: "text",
          title: "Text",
          type: "text",
          description: "The body text content",
        },
      ],
      preview: {
        select: { title: "heading", subtitle: "text" },
        prepare({ title, subtitle }) {
          return {
            title: title || "Rich Text Block",
            subtitle: subtitle ? subtitle.substring(0, 80) + "..." : "",
          };
        },
      },
    },

    // Stat Block
    {
      name: "statBlock",
      title: "Stat Block",
      type: "object",
      description: "A large statistic with label (e.g. 150% increase in engagement)",
      fields: [
        {
          name: "number",
          title: "Number/Stat",
          type: "string",
          description: "The statistic value (e.g. 150%, 2M+, 98%)",
        },
        {
          name: "label",
          title: "Label",
          type: "string",
          description: "Description of what the stat represents",
        },
      ],
      preview: {
        select: { title: "number", subtitle: "label" },
        prepare({ title, subtitle }) {
          return { title: title || "Stat", subtitle };
        },
      },
    },

    // Video Block
    {
      name: "videoBlock",
      title: "Video",
      type: "object",
      description: "Embed a video (upload or external URL)",
      fields: [
        {
          name: "videoType",
          title: "Video Type",
          type: "string",
          options: {
            list: [
              { title: "Upload File", value: "file" },
              { title: "YouTube", value: "youtube" },
              { title: "Vimeo", value: "vimeo" },
            ],
            layout: "radio",
          },
          initialValue: "file",
          description: "Choose how to add the video",
        },
        {
          name: "videoFile",
          title: "Video File",
          type: "file",
          options: { accept: "video/*" },
          description: "Upload an MP4, WebM, or MOV file",
          hidden: ({ parent }) => parent?.videoType !== "file",
        },
        {
          name: "videoUrl",
          title: "Video URL",
          type: "url",
          description: "Paste the YouTube or Vimeo video URL",
          hidden: ({ parent }) => parent?.videoType === "file",
        },
        {
          name: "poster",
          title: "Poster Image",
          type: "image",
          options: { hotspot: true },
          description: "Thumbnail shown before the video plays",
        },
        {
          name: "caption",
          title: "Caption",
          type: "string",
          description: "Optional caption below the video",
        },
        {
          name: "autoplay",
          title: "Autoplay (muted)",
          type: "boolean",
          initialValue: false,
          description: "Auto-play the video on scroll (will be muted)",
        },
        {
          name: "loop",
          title: "Loop",
          type: "boolean",
          initialValue: false,
          description: "Loop the video continuously",
        },
      ],
      preview: {
        select: { title: "caption", media: "poster" },
        prepare({ title, media }) {
          return { title: title || "Video Block", media };
        },
      },
    },

    // Quote Block
    {
      name: "quoteBlock",
      title: "Quote",
      type: "object",
      description: "A highlighted quote or testimonial within the case study",
      fields: [
        {
          name: "quote",
          title: "Quote",
          type: "text",
          description: "The quote text",
        },
        {
          name: "author",
          title: "Author",
          type: "string",
          description: "Who said this (optional)",
        },
        {
          name: "role",
          title: "Role/Company",
          type: "string",
          description: "Author's role or company (optional)",
        },
      ],
      preview: {
        select: { title: "quote", subtitle: "author" },
        prepare({ title, subtitle }) {
          return {
            title: title ? `"${title.substring(0, 50)}..."` : "Quote Block",
            subtitle,
          };
        },
      },
    },

    // Before/After Block
    {
      name: "beforeAfterBlock",
      title: "Before & After",
      type: "object",
      description: "Show a before and after comparison",
      fields: [
        {
          name: "beforeImage",
          title: "Before Image",
          type: "image",
          options: { hotspot: true },
          description: "The 'before' state image",
        },
        {
          name: "afterImage",
          title: "After Image",
          type: "image",
          options: { hotspot: true },
          description: "The 'after' state image",
        },
        {
          name: "beforeLabel",
          title: "Before Label",
          type: "string",
          initialValue: "Before",
        },
        {
          name: "afterLabel",
          title: "After Label",
          type: "string",
          initialValue: "After",
        },
      ],
      preview: {
        select: { media: "afterImage" },
        prepare({ media }) {
          return { title: "Before & After", media };
        },
      },
    },

    // Color Palette Block
    {
      name: "colorPaletteBlock",
      title: "Color Palette",
      type: "object",
      description: "Display the project's color palette",
      fields: [
        {
          name: "colors",
          title: "Colors",
          type: "array",
          of: [
            {
              type: "object",
              fields: [
                {
                  name: "name",
                  title: "Color Name",
                  type: "string",
                  description: "e.g. Primary Blue, Accent Orange",
                },
                {
                  name: "hex",
                  title: "Hex Code",
                  type: "string",
                  description: "e.g. #0211F0",
                },
              ],
              preview: {
                select: { title: "name", subtitle: "hex" },
              },
            },
          ],
        },
      ],
      preview: {
        prepare() {
          return { title: "Color Palette" };
        },
      },
    },

    // Typography Block
    {
      name: "typographyBlock",
      title: "Typography Showcase",
      type: "object",
      description: "Display typography choices used in the project",
      fields: [
        {
          name: "fonts",
          title: "Fonts",
          type: "array",
          of: [
            {
              type: "object",
              fields: [
                {
                  name: "name",
                  title: "Font Name",
                  type: "string",
                  description: "e.g. Plus Jakarta Sans",
                },
                {
                  name: "usage",
                  title: "Usage",
                  type: "string",
                  description: "e.g. Headlines, Body Text",
                },
                {
                  name: "sample",
                  title: "Sample Text",
                  type: "string",
                  description: "Sample text to display",
                },
                {
                  name: "image",
                  title: "Font Preview Image",
                  type: "image",
                  description: "Optional image showing the font in use",
                },
              ],
            },
          ],
        },
      ],
      preview: {
        prepare() {
          return { title: "Typography Showcase" };
        },
      },
    },

    // Spacer Block
    {
      name: "spacerBlock",
      title: "Spacer",
      type: "object",
      description: "Add vertical spacing between content blocks",
      fields: [
        {
          name: "size",
          title: "Size",
          type: "string",
          options: {
            list: [
              { title: "Small (32px)", value: "small" },
              { title: "Medium (64px)", value: "medium" },
              { title: "Large (128px)", value: "large" },
              { title: "Extra Large (200px)", value: "xlarge" },
            ],
          },
          initialValue: "medium",
        },
      ],
      preview: {
        select: { size: "size" },
        prepare({ size }) {
          return { title: `Spacer (${size || "medium"})` };
        },
      },
    },

    // Gallery Block (masonry-style)
    {
      name: "galleryBlock",
      title: "Image Gallery",
      type: "object",
      description: "A flexible gallery of images (masonry layout)",
      fields: [
        {
          name: "images",
          title: "Images",
          type: "array",
          of: [
            {
              type: "object",
              fields: [
                {
                  name: "image",
                  title: "Image",
                  type: "image",
                  options: { hotspot: true },
                },
                {
                  name: "caption",
                  title: "Caption",
                  type: "string",
                },
                {
                  name: "size",
                  title: "Size",
                  type: "string",
                  options: {
                    list: [
                      { title: "Small", value: "small" },
                      { title: "Medium", value: "medium" },
                      { title: "Large", value: "large" },
                    ],
                  },
                  initialValue: "medium",
                },
              ],
              preview: {
                select: { title: "caption", media: "image" },
              },
            },
          ],
        },
        {
          name: "columns",
          title: "Columns",
          type: "number",
          options: {
            list: [2, 3, 4],
          },
          initialValue: 3,
          description: "Number of columns on desktop",
        },
      ],
      preview: {
        prepare() {
          return { title: "Image Gallery" };
        },
      },
    },

    // ═══════════════════════════════════════════════════════════════
    // PROJECT DOCUMENT
    // ═══════════════════════════════════════════════════════════════
    {
      name: "project",
      title: "Project",
      type: "document",
      description: "Case studies and portfolio projects",
      fields: [
        {
          name: "title",
          title: "Project Title",
          type: "string",
          description: "The name of the project",
          validation: (Rule) => Rule.required(),
        },
        {
          name: "slug",
          title: "Slug",
          type: "slug",
          options: { source: "title", maxLength: 96 },
          description: "URL-friendly identifier (auto-generated from title)",
          validation: (Rule) => Rule.required(),
        },
        {
          name: "client",
          title: "Client",
          type: "string",
          description: "The client or company name",
        },
        {
          name: "year",
          title: "Year",
          type: "string",
          description: "Year the project was completed (e.g. 2024)",
        },
        {
          name: "services",
          title: "Services",
          type: "array",
          of: [{ type: "string" }],
          options: {
            layout: "tags",
          },
          description: "Services provided (e.g. Branding, Web Design, Development)",
        },
        {
          name: "industry",
          title: "Industry",
          type: "string",
          description: "The client's industry (e.g. Technology, Fashion, Finance)",
        },
        {
          name: "description",
          title: "Short Description",
          type: "text",
          rows: 3,
          description: "Brief project summary for listings (2-3 sentences)",
        },
        {
          name: "thumbnail",
          title: "Thumbnail",
          type: "image",
          options: { hotspot: true },
          description: "Image shown in project listings (recommended: 800x600px)",
        },
        {
          name: "heroImage",
          title: "Hero Image",
          type: "image",
          options: { hotspot: true },
          description: "Large image at the top of the project page (recommended: 1920x1080px)",
        },
        {
          name: "heroVideo",
          title: "Hero Video (Optional)",
          type: "file",
          options: { accept: "video/*" },
          description: "Optional video to display instead of hero image",
        },
        {
          name: "brief",
          title: "Project Brief",
          type: "text",
          rows: 4,
          description: "The challenge or problem statement",
        },
        {
          name: "solution",
          title: "Solution Overview",
          type: "text",
          rows: 4,
          description: "High-level description of your approach and solution",
        },
        {
          name: "results",
          title: "Results/Impact",
          type: "text",
          rows: 3,
          description: "Key outcomes, metrics, or achievements",
        },
        {
          name: "projectUrl",
          title: "Live Project URL",
          type: "url",
          description: "Link to the live project (if applicable)",
        },
        {
          name: "featured",
          title: "Featured Project",
          type: "boolean",
          initialValue: false,
          description: "Show this project on the homepage",
        },
        {
          name: "order",
          title: "Display Order",
          type: "number",
          description: "Set a number to control display order (1, 2, 3, etc.). Lower numbers appear at the bottom. Leave empty to sort by date created.",
          validation: (Rule) => Rule.integer().positive(),
        },
        {
          name: "content",
          title: "Content Blocks",
          type: "array",
          description: "Build your case study with these content blocks",
          of: [
            { type: "fullWidthImageBlock" },
            { type: "dualGridBlock" },
            { type: "tripleGridBlock" },
            { type: "galleryBlock" },
            { type: "videoBlock" },
            { type: "richTextBlock" },
            { type: "quoteBlock" },
            { type: "statBlock" },
            { type: "beforeAfterBlock" },
            { type: "colorPaletteBlock" },
            { type: "typographyBlock" },
            { type: "spacerBlock" },
          ],
        },
        {
          name: "relatedProjects",
          title: "Related Projects",
          type: "array",
          of: [{ type: "reference", to: [{ type: "project" }] }],
          description: "Link to related case studies",
        },
      ],
      preview: {
        select: {
          title: "title",
          subtitle: "client",
          media: "thumbnail",
        },
      },
    },
  ],
};

