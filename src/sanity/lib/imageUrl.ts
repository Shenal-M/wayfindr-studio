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

/**
 * Edge-to-edge and cover-cropped into a box of fixed height: the case study
 * hero, and the only sizing here whose `sizes` is not roughly the width of the
 * box it sits in.
 *
 * ── WHY IT IS OVER 100vw ───────────────────────────────────────────────────
 * `sizes` describes how wide the image is *painted*, and `object-cover` paints
 * a landscape photograph far wider than its container whenever the container is
 * portrait. Cover scales until both axes are filled, so on a portrait box the
 * height is what binds and the width overflows and is clipped:
 *
 *     painted width = box height × image aspect
 *
 * On a 393×852 phone the hero box is 393 × 70svh = 393×596, and a 16:9 source
 * is therefore painted 596 × 1.78 ≈ 1060 CSS px wide — 2.7× the viewport. A
 * plain `100vw` told the browser 393px, it multiplied by the 3× display and
 * asked for 1179, and picked the 1440 candidate to paint across 1060 CSS px.
 * That is an effective 1.36× on a 3× screen, which is exactly the softness this
 * fixes. On desktop the box is landscape, the width binds instead, painted
 * width really is 100vw, and nothing was ever wrong — which is why this only
 * ever showed up on a phone.
 *
 * `(orientation: portrait)` rather than a width breakpoint, because the
 * magnification is caused by the box being taller than it is wide and by
 * nothing else. A width query gets it wrong in both directions: a portrait
 * tablet is 768px and needs the boost, a phone turned sideways is narrow and
 * does not. Orientation asks the actual question. `sizes` takes a full media
 * condition, not just a width one.
 *
 * 260vw covers the range in one number. Portrait phone works out at ~2.7 (the
 * 70svh box), portrait tablet at ~2.4 (the full-height box), and a 3:2 source
 * rather than 16:9 lowers both. Overstating is the safe direction and costs
 * nothing real here, since anything above about 220vw saturates the top of the
 * ladder on a 2× display anyway.
 */
export const COVER_HERO: ImageSizing = {
  widths: [768, 1080, 1440, 1920, 2560],
  sizes: "(orientation: portrait) 260vw, 100vw",
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
