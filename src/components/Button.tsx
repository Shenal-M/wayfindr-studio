import React from "react";
import Link from "next/link";

/**
 * The site's one button.
 *
 * Every variant hovers the same way: a panel wipes across from the left. That
 * direction used to belong only to the View All pill; the square and circle
 * variants swapped their background instantly. Now they all share it, so hovering
 * anything on the site moves in the same direction. Only the panel's colour
 * differs, because that's what makes each variant itself.
 *
 * The wipe is a CSS transition, deliberately, and this was tried the other way
 * round first. A hover is a symmetric two-state change, which is precisely what
 * CSS transitions are for: they interpolate from whatever the current computed
 * value is to the target, using the same curve in both directions, and they
 * interrupt gracefully for nothing. Driving it from a GSAP timeline instead meant
 * play() on enter and reverse() on leave — and reverse() replays the *easing*
 * backwards, so an ease-out exit became an ease-in: the panel hung still for a
 * beat then snapped away. Matching CSS would have taken two tweens with two
 * eases, more code for a worse result.
 *
 * GSAP is used elsewhere on the site where it earns it — sequencing, measurement,
 * anything that has to stay in step with JS state or timers. See CopyLabel, which
 * has to measure a label before it can animate to its width. Not here.
 *
 * Keeping it CSS also means no "use client" on this file, so server components
 * can render a button without opening a client boundary.
 *
 *   variant        shape   surface           wipes         size          extras
 *   ─────────────────────────────────────────────────────────────────────────────
 *   outlinePill    pill    black outline     brand blue    px-5 py-2.5   arrow, press
 *   outlineSquare  square  black outline     black         px-8 py-4     —
 *   glassCircle    circle  white/5 + blur    white/10      w-10 → w-12   icon only
 *   solidPill      pill    solid white       — (no hover)  px-6 py-3     press
 */
export type ButtonVariant =
  | "outlinePill"
  | "outlineSquare"
  | "glassCircle"
  | "solidPill";

const VARIANTS: Record<ButtonVariant, string> = {
  outlinePill:
    "group relative inline-flex items-center gap-2 px-5 py-2.5 font-sans text-sm font-bold uppercase tracking-widest text-brand-black bg-transparent border border-brand-black rounded-full overflow-hidden transition-all duration-300 hover:text-brand-white hover:border-brand-blue focus-visible:text-brand-white focus-visible:border-brand-blue active:scale-95",
  outlineSquare:
    "group relative inline-block px-8 py-4 border border-brand-black text-brand-black font-bold uppercase tracking-widest overflow-hidden transition-all duration-300 hover:text-white focus-visible:text-white",
  glassCircle:
    "group relative w-10 h-10 md:w-12 md:h-12 rounded-full border border-brand-white/10 bg-brand-white/5 backdrop-blur-sm overflow-hidden flex items-center justify-center text-brand-white/50 hover:text-brand-white hover:border-brand-white/30 focus-visible:text-brand-white focus-visible:border-brand-white/30 transition-all duration-300",
  solidPill:
    "inline-block px-6 py-3 bg-white text-brand-black text-base font-bold rounded-full transition-all duration-300 active:scale-95",
};

/**
 * The colour each variant's panel wipes in. `null` means no hover panel — the
 * solid pill is the mobile email control, and mobile has no hover to respond to.
 */
const WIPE_COLOR: Record<ButtonVariant, string | null> = {
  outlinePill: "bg-brand-blue",
  outlineSquare: "bg-brand-black",
  glassCircle: "bg-brand-white/10",
  solidPill: null,
};

/**
 * scaleX from the left edge, NOT a translate, and that distinction is the whole
 * reason this constant has a comment.
 *
 * Sliding the panel in with -translate-x-full means parking it fully outside the
 * box and relying on `overflow-hidden` to clip it exactly. That clip is only ever
 * as exact as the box's dimensions: these buttons size themselves from their text,
 * so the padding box width is fractional, and -100% of a fractional width puts
 * the panel's edge on a fractional boundary. The compositor rounds it, and the
 * rounding went both ways — a sliver of panel peeking out at rest (visible on
 * mobile, where there's no hover to hide it, as a dark bar beside the left
 * border) and a sliver left uncovered at full hover (a white gap down the right).
 *
 * Scaling sidesteps all of it. At 0 the panel has literally no width, so there is
 * nothing that can peek out; at 1 it is exactly inset-0, so there is nothing it
 * can fail to cover. No dependence on the clip at all.
 *
 * It looks the same. For a plain block of colour, growing from the left edge and
 * sliding in from the left both render as "colour advancing rightwards" — in each
 * case the covered region at time t is the leftmost t of the box.
 *
 * -inset-px rather than inset-0, because an absolutely positioned child resolves
 * its offsets against the *padding* box. At inset-0 the fill therefore stops
 * exactly where the 1px border begins, and on a square-cornered button any
 * rounding at that seam shows as a hairline of page background between fill and
 * border — most obvious down the right edge. Overshooting by a pixel runs the
 * fill under the border so there is no seam to round. It costs nothing: the
 * overhang is outside the padding box, which is precisely what overflow-hidden
 * clips. The pill never showed this because its rounded clip hides the corners.
 *
 * origin-left is load-bearing: transform-origin defaults to centre, which would
 * open the panel outwards from the middle.
 *
 * group-focus-visible alongside group-hover so keyboard users get the same
 * affordance, which the original hover-only version never gave them.
 *
 * motion-reduce:transition-none rather than suppressing the panel: the label
 * turns white on hover and needs something behind it to stay readable, so the
 * panel still arrives — it just arrives instantly instead of growing.
 */
const WIPE_MOTION =
  "absolute -inset-px origin-left scale-x-0 transition-transform duration-300 ease-out group-hover:scale-x-100 group-focus-visible:scale-x-100 motion-reduce:transition-none";

/** Variants that ship a trailing arrow unless asked not to. */
const HAS_ARROW: Record<ButtonVariant, boolean> = {
  outlinePill: true,
  outlineSquare: false,
  glassCircle: false,
  solidPill: false,
};

/**
 * Deliberately not the shared ArrowIcon — that one is a thin long-tailed arrow
 * belonging to CapabilitiesList. This is the chevron the CTAs have always used.
 */
const TrailingArrow = () => (
  <svg
    className="relative z-10 w-4 h-4 transform transition-transform duration-300 group-hover:translate-x-1 group-focus-visible:translate-x-1 motion-reduce:transition-none"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M17 8l4 4m0 0l-4 4m4-4H3"
    />
  </svg>
);

type Props = {
  variant?: ButtonVariant;
  /** Renders a Link for internal paths, a new-tab anchor for absolute URLs. */
  href?: string;
  onClick?: () => void;
  type?: "button" | "submit";
  /** Override the variant's default arrow. */
  arrow?: boolean;
  /**
   * Layout only — margins, breakpoint visibility, z-index. Anything that changes
   * how the button *looks* belongs in a variant.
   *
   * Do NOT pass a position utility. Every wiping variant already carries
   * `relative`, because the panel is an `absolute inset-0` child that needs this
   * element as its containing block. Adding `absolute` here puts two position
   * declarations on one element, and the winner is decided by the order Tailwind
   * happened to emit them in — which is `relative`, silently. Wrap the button in
   * a positioned element instead; see IndustriesCarousel.
   */
  className?: string;
  "aria-label"?: string;
  children?: React.ReactNode;
};

const Button: React.FC<Props> = ({
  variant = "outlinePill",
  href,
  onClick,
  type = "button",
  arrow,
  className = "",
  "aria-label": ariaLabel,
  children,
}) => {
  const showArrow = arrow ?? HAS_ARROW[variant];
  const wipeColor = WIPE_COLOR[variant];
  const classes = `${VARIANTS[variant]}${className ? ` ${className}` : ""}`;

  const content = (
    <>
      {wipeColor && (
        <span aria-hidden="true" className={`${WIPE_MOTION} ${wipeColor}`} />
      )}
      {/* z-10 lifts the label over the panel. Nothing to sit above without one,
          and an extra stacking context there would just be noise. */}
      {wipeColor ? <span className="relative z-10">{children}</span> : children}
      {showArrow && <TrailingArrow />}
    </>
  );

  if (href) {
    // Absolute URLs leave the site, so they open in a new tab and get the
    // rel guard. mailto:/tel: are left to the OS handler in the same tab.
    if (/^https?:\/\//.test(href)) {
      return (
        <a
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          className={classes}
          aria-label={ariaLabel}
        >
          {content}
        </a>
      );
    }
    return (
      <Link href={href} className={classes} aria-label={ariaLabel}>
        {content}
      </Link>
    );
  }

  return (
    <button type={type} onClick={onClick} className={classes} aria-label={ariaLabel}>
      {content}
    </button>
  );
};

export default Button;
