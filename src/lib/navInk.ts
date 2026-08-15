/**
 * Picking the header's link colour off whatever is playing or sitting behind it.
 *
 * Two pages now put the fixed header over full-bleed media with no bar behind
 * it — the homepage over its video, and a case study over its hero image — and
 * both have the same problem: a transparent header is only legible if its links
 * happen to contrast with the frame underneath, and neither a clip nor an
 * uploaded photograph makes any promise about that.
 *
 * Picking white or black by hand is a bet that the media stays dark, or stays
 * light, for its whole run. Any image with real range breaks that bet somewhere,
 * which is what a scrim is usually papering over — and the whole point of these
 * heroes is that nothing is layered over the media. So the strip of frame
 * *directly behind the bar* is measured instead, and the type adapts. That is
 * the right way round: type is ours to change and the footage is not.
 *
 * Only the header. The homepage headline was wired to this at one point and it
 * is the wrong place for it: a headline is read once, and watching it change
 * colour underneath you while you read is worse than any legibility problem it
 * fixes. The bar is the opposite case — chrome, small, and on screen for the
 * whole of the first section.
 *
 * This lives here rather than in either page because the two differ only in how
 * often they sample: a video needs a timer, a still image needs one reading and
 * a re-read when the layout changes. Everything else — the geometry, the
 * thresholds, the tainted-canvas handling — is identical, and was duplicated
 * once before it was moved.
 */

/**
 * The fixed header's height: `h-16` plus its 1px bottom border.
 *
 * Used by every consumer and it has to be the same number in all of them — it is
 * where the header stops sitting over the media, which is both the point at
 * which the bar resolves to its solid state and the exact strip of frame this
 * needs to measure.
 */
export const NAV_H = 65;

/**
 * The custom property the header reads.
 *
 * Written to <html> rather than to any page's own root, because the header is
 * not a descendant of the page — it is rendered by (site)/layout.tsx, as a
 * sibling — so the document element is the nearest thing that is an ancestor of
 * both. globals.css gives it a default, which is what guarantees the links are
 * never an unset colour before the first measurement, or if the canvas turns out
 * to be tainted.
 */
export const NAV_INK_PROP = "--nav-ink";

/** How often a moving source is measured. Still ones are not on a timer. */
export const NAV_INK_SAMPLE_MS = 350;

/**
 * The canvas the strip is drawn into. Deliberately tiny — drawImage does the
 * downscale on the GPU, so a 1920×1080 source costs about what a thumbnail
 * costs, and 32×12 still leaves nearly four hundred samples across a band that
 * is only sixty-five pixels tall on screen. Reading a full frame back several
 * times a second is the expensive version of this and buys nothing: the answer
 * is one bit.
 */
const SAMPLE_W = 32;
const SAMPLE_H = 12;

/**
 * ── THE TUNING KNOBS ───────────────────────────────────────────────────────
 *
 * Both are brightness on a 0–255 scale, measured across the strip of media
 * behind the header. Adjust these to change when the links flip.
 *
 *   TO_DARK_TYPE   links are white; go black once brightness rises ABOVE this.
 *                  Raise it to keep white links for longer.
 *   TO_LIGHT_TYPE  links are black; go white once brightness falls BELOW this.
 *                  Lower it to keep black links for longer.
 *
 * Two thresholds rather than one, and the gap between them is what stops a
 * moving source strobing: with a single midpoint the links flip every time the
 * measured value wanders across it, and footage wanders constantly. With a gap
 * the colour only changes once the brightness has committed.
 *
 * They are currently equal, which switches that protection off. That is
 * deliberate and it is fine for a still image, which is measured once and never
 * wavers; if the video's bar ever flickers, pulling TO_LIGHT_TYPE down to around
 * 130 is the fix.
 *
 * To find the right numbers for a given clip, set NAV_INK_DEBUG below and watch
 * the live reading in devtools rather than guessing.
 */
const TO_DARK_TYPE = 155;
const TO_LIGHT_TYPE = 155;

/**
 * Writes the live brightness reading to `data-nav-luma` on <html>, so the number
 * the thresholds above are compared against can be watched in devtools while the
 * media plays. Off by default: it is a DOM write on a timer that nothing
 * renders.
 */
const NAV_INK_DEBUG = false;

/**
 * Rec. 709 luma. Not gamma-corrected relative luminance, which is the more
 * correct measure, meaningfully slower per pixel, and indistinguishable from
 * this at the thresholds above.
 */
const luma = (r: number, g: number, b: number) =>
  0.2126 * r + 0.7152 * g + 0.0722 * b;

type SampledMedia = HTMLVideoElement | HTMLImageElement;

/**
 * The source's own pixel dimensions, and whether there is anything to draw yet.
 *
 * A video below HAVE_CURRENT_DATA and an image that has not decoded both draw as
 * nothing rather than failing, which would measure as pure black and flip the
 * links to the wrong colour with total confidence.
 */
const sourceFrame = (media: SampledMedia) =>
  media instanceof HTMLVideoElement
    ? {
        w: media.videoWidth,
        h: media.videoHeight,
        ready: media.readyState >= 2,
      }
    : {
        w: media.naturalWidth,
        h: media.naturalHeight,
        ready: media.complete && media.naturalWidth > 0,
      };

export type NavInkSampler = {
  /**
   * Measure once and update the property if the verdict changed. Returns false
   * when the sampler is finished and should not be called again — a tainted
   * canvas, which cannot recover — so a caller on a timer can clear it.
   */
  read: () => boolean;
  /** Hand the property back to its stylesheet default. */
  reset: () => void;
};

/**
 * Build a sampler for one hero.
 *
 * Both accessors are functions rather than elements because refs are null on the
 * first render and the media element can come and go — a hero whose video is
 * removed when the CMS field is cleared, for instance.
 */
export function createNavInkSampler(
  getMedia: () => SampledMedia | null,
  getHero: () => HTMLElement | null,
): NavInkSampler {
  /**
   * The verdict, and separately what the DOM was actually told.
   *
   * These have to be two variables, and collapsing them into one is a real bug
   * that shipped. The write used to be `if (next !== ink)` — that is, only when
   * the *verdict* changed — which silently assumes the property already holds
   * whatever `ink` was initialised to.
   *
   * That assumption holds on a fresh load, where `ink` starts white and the
   * stylesheet default is white, and breaks on every client-side navigation. Go
   * from a bright case study (which wrote black) to a dark one: the new sampler
   * starts at white, measures a dark frame, concludes white — no change, so no
   * write — and the property is still black from the previous page. Black links
   * on a dark photograph, and the sampler convinced it had done its job.
   *
   * `applied` starts as null so the first successful read always writes,
   * whatever it concludes.
   */
  let ink: "#ffffff" | "#050505" = "#ffffff";
  let applied: string | null = null;
  let dead = false;

  const canvas = document.createElement("canvas");
  canvas.width = SAMPLE_W;
  canvas.height = SAMPLE_H;
  // willReadFrequently moves the canvas to a software backing store, which is
  // the right trade when every frame drawn is immediately read back: without it
  // each getImageData stalls waiting on the GPU.
  const ctx = canvas.getContext("2d", { willReadFrequently: true });

  const read = () => {
    if (dead) return false;

    const media = getMedia();
    const hero = getHero();
    if (!ctx || !media || !hero) return true;

    const { w: sw, h: sh, ready } = sourceFrame(media);
    if (!ready || !sw || !sh) return true;

    // Once the hero's bottom edge has passed under the bar, the header is over
    // the page rather than the media and has switched to its solid state — the
    // same threshold the ScrollTrigger uses. Nothing reads this value from here
    // on, so stop measuring.
    if (hero.getBoundingClientRect().bottom <= NAV_H) return true;

    const bw = hero.clientWidth;
    const bh = hero.clientHeight;
    if (!bw || !bh) return true;

    // Undo `object-cover` to find which part of the source is actually behind
    // the bar. Cover scales by whichever axis needs the most and centre-crops
    // the other, so on a viewport narrower than the source the visible top edge
    // is some way down it — and sampling the source's own top row would then
    // measure a strip that is not on screen at all. It is a handful of lines and
    // it is the difference between measuring the right pixels and nearly the
    // right pixels.
    const scale = Math.max(bw / sw, bh / sh);
    const visibleSrcH = bh / scale;
    const srcTop = (sh - visibleSrcH) / 2;
    const srcNavH = Math.max(1, Math.min(NAV_H / scale, visibleSrcH));

    try {
      // Source rectangle in, whole canvas out: the strip is stretched to fill,
      // so every pixel read back belongs to the band behind the bar and there is
      // no sub-region arithmetic on the canvas side.
      ctx.drawImage(media, 0, srcTop, sw, srcNavH, 0, 0, SAMPLE_W, SAMPLE_H);

      const { data } = ctx.getImageData(0, 0, SAMPLE_W, SAMPLE_H);

      let total = 0;
      for (let i = 0; i < data.length; i += 4) {
        total += luma(data[i], data[i + 1], data[i + 2]);
      }
      const brightness = total / (data.length / 4);

      if (NAV_INK_DEBUG) {
        document.documentElement.dataset.navLuma = brightness.toFixed(1);
      }

      const next =
        ink === "#ffffff"
          ? brightness > TO_DARK_TYPE
            ? "#050505"
            : ink
          : brightness < TO_LIGHT_TYPE
            ? "#ffffff"
            : ink;

      ink = next;
      if (next !== applied) {
        applied = next;
        // Straight to the DOM. No state, so no render — and because the links
        // already carry `transition-colors`, the change eases rather than
        // snapping.
        document.documentElement.style.setProperty(NAV_INK_PROP, next);
      }
      return true;
    } catch {
      // A tainted canvas: the pixels cannot be read back.
      //
      // This is the failure mode to expect, because both sources are served
      // cross-origin from Sanity's CDN. The frame is only readable because the
      // element asks for it with `crossOrigin="anonymous"` and Sanity answers
      // with permissive CORS headers. Drop that attribute, or point a field at a
      // host that does not send them, and every draw taints the canvas and lands
      // here on the first sample.
      //
      // Nothing to do but stop. The property keeps whatever it last held — the
      // white default from globals.css if this failed immediately — which is the
      // right answer for a dark ground and a legible one for most others.
      dead = true;
      return false;
    }
  };

  return {
    read,
    reset: () => {
      applied = null;
      document.documentElement.style.removeProperty(NAV_INK_PROP);
    },
  };
}
