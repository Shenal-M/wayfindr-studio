/**
 * Delivery-time image transformation for Sanity assets.
 *
 * Sanity keeps the uploaded original untouched — a 12MB 6000px JPEG stays a
 * 12MB 6000px JPEG in the asset store forever — and does its resizing and
 * re-encoding on request, from query parameters on the cdn.sanity.io URL.
 * Nothing in this file compresses anything; it writes the parameters that ask
 * the CDN to. Which also means the right place to fix an oversized image is
 * here and not before upload: shrinking the master loses the ability to
 * re-crop later and depends on whoever manages content remembering to do it.
 *
 * Deliberately not @sanity/image-url's `urlFor()`, which is what the docs
 * point at. That builder takes an image *object* (or at least an asset
 * `_ref`), and every GROQ projection in this repo flattens images to a URL
 * string via `asset->url` — see queries.ts, all eleven of them, and the
 * matching `string` fields in types.ts. Rewriting those to carry objects would
 * buy hotspot and crop support, which no call site currently asks for; the
 * transform parameters themselves are identical either way, so they get
 * appended to the finished URL instead. If art-directed cropping is ever
 * wanted, that's the point to revisit this.
 *
 * Non-Sanity sources pass through untouched. The fallback fixtures in
 * constants.ts are Unsplash and picsum URLs that carry their own sizing, and
 * guessing at another host's parameter names would break them.
 */

/** Widest render we'll ever ask for. Past this the extra bytes buy nothing. */
const MAX_WIDTH = 2560;

/**
 * Sanity re-encodes at this quality. Visually indistinguishable from 100 on
 * photography while roughly halving the bytes; artefacts start showing in flat
 * gradients somewhere below 75.
 */
const DEFAULT_QUALITY = 80;

/**
 * The `max-w-[1920px]` content column, less the `md:px-12` gutters — the
 * widest an in-column image is ever painted.
 */
const COLUMN_MAX = 1824;

/**
 * Candidate widths offered to the browser. Deliberately coarse: each extra
 * entry is another distinct URL for the CDN and the browser cache to hold, and
 * the browser rounds up to the next candidate anyway, so a fine-grained ladder
 * costs cache hits without saving meaningful bytes.
 */
const WIDTH_LADDER = [480, 640, 768, 960, 1280, 1600, 1920, 2560];

/**
 * Sanity's transform API only applies to raster assets. SVGs are served
 * verbatim whatever you ask for, so parameterising them just produces a second
 * URL for the same bytes and halves the cache hit rate.
 */
const isTransformable = (src: string) =>
  src.includes("cdn.sanity.io") && !src.endsWith(".svg");

/**
 * `fit=max` rather than the default `clip`: both preserve aspect ratio, but
 * `max` also refuses to upscale, so asking a 600px upload for 1920 returns the
 * 600 it has instead of an interpolated blur at four times the weight.
 *
 * `auto=format` is the single highest-leverage parameter here — it serves
 * WebP/AVIF to browsers whose Accept header allows it, typically 30–50%
 * smaller than JPEG at matched quality, and falls back on its own for the rest.
 */
const transform = (width: number, quality: number) =>
  `auto=format&fit=max&w=${Math.round(Math.min(width, MAX_WIDTH))}&q=${quality}`;

export type ImageSizing = {
  /**
   * Candidate widths in CSS pixels, ascending. The largest doubles as the
   * plain `src` for browsers that ignore `srcSet`.
   */
  widths: number[];
  /**
   * CSS `sizes`: how wide this image is painted at a given viewport. Without
   * it the browser assumes 100vw and picks the largest candidate every time,
   * which is most of the waste this file exists to remove.
   */
  sizes: string;
  quality?: number;
};

/** A single transformed URL, for cases with no responsive component. */
export const imageUrl = (
  src: string,
  width: number,
  quality: number = DEFAULT_QUALITY
): string =>
  isTransformable(src) ? `${src.split("?")[0]}?${transform(width, quality)}` : src;

/**
 * Props to spread onto an `<img>`. Returns `srcSet`/`sizes` as `undefined` for
 * untransformable sources so React drops the attributes rather than emitting a
 * srcSet of identical URLs.
 */
export const responsiveImage = (
  src: string,
  { widths, sizes, quality = DEFAULT_QUALITY }: ImageSizing
) => {
  const largest = widths[widths.length - 1];
  return {
    src: imageUrl(src, largest, quality),
    srcSet: isTransformable(src)
      ? widths.map((w) => `${imageUrl(src, w, quality)} ${w}w`).join(", ")
      : undefined,
    sizes: isTransformable(src) ? sizes : undefined,
  };
};

/**
 * Sizing for an image occupying `fraction` of the content column on desktop
 * and the full viewport below `md`, which describes every grid in the case
 * study and every project card. Candidates stop at twice the painted width —
 * enough for a 2× display, and nothing gains from 3×.
 */
export const columnFraction = (fraction: number): ImageSizing => {
  const painted = Math.round(COLUMN_MAX * fraction);
  const widths = WIDTH_LADDER.filter((w) => w <= painted * 2);
  // A third would otherwise reach the stylesheet as 0.3333333333333333.
  const ratio = Number(fraction.toFixed(4));
  return {
    // Below the smallest ladder entry the filter comes back empty; one
    // candidate is still a real saving over the untouched original.
    widths: widths.length ? widths : [WIDTH_LADDER[0]],
    // Gutters are in the calc but grid gaps aren't — overstating slightly makes
    // the browser round up to the next candidate, the safe direction to err.
    sizes: [
      `(min-width: 1920px) ${painted}px`,
      ratio === 1
        ? `(min-width: 768px) calc(100vw - 6rem)`
        : `(min-width: 768px) calc((100vw - 6rem) * ${ratio})`,
      `calc(100vw - 3rem)`,
    ].join(", "),
  };
};

/** Edge-to-edge, no column: the homepage lead project and the case-study hero. */
export const FULL_BLEED: ImageSizing = {
  widths: [768, 1080, 1440, 1920, 2560],
  sizes: "100vw",
};

/**
 * Two-up on desktop, one-up on mobile, spanning the full 1920px column rather
 * than sitting inside its padding: the work grid, the homepage pair, and the
 * related-work grid are all this shape.
 */
export const HALF_COLUMN: ImageSizing = {
  widths: [640, 960, 1280, 1920],
  sizes: "(min-width: 1920px) 944px, (min-width: 768px) 50vw, 100vw",
};

/**
 * The service hero: a square that tops out at `lg:max-w-xl` (576px), so 1152
 * covers a 2× display and anything beyond is dead weight.
 */
export const SERVICE_HERO: ImageSizing = {
  widths: [480, 768, 1152],
  sizes: "(min-width: 1024px) 576px, (min-width: 768px) 512px, min(28rem, 100vw)",
};

/**
 * Marquee logos are sized by height (`--logo-h`, 2–3rem) and the widest
 * wordmark runs about 4:1, so ~400px covers a 2× display. No srcSet: the strip
 * measures `naturalWidth` to build its seamless loop, and a single candidate
 * keeps that measurement from changing under a viewport resize.
 */
export const LOGO_WIDTH = 400;
