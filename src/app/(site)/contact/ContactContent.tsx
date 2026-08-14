"use client";

import React, { useState } from "react";
import CopyBubble from "../../../components/CopyBubble";
import { useCopyToClipboard } from "../../../components/useCopyToClipboard";
import type { ContactInfo, FAQItem } from "../../../types";

/**
 * One curve and one duration for everything the accordion does, so the mark
 * turning and the panel opening are literally the same motion rather than two
 * that nearly agree. Expo-out — off the mark immediately, long soft settle —
 * which is the curve the rest of the site reveals on.
 *
 * Written as complete literal utility strings: Tailwind's scanner reads source
 * text, so it finds these here and generates them. Assembling a class name from
 * fragments at runtime is what it can't see.
 */
const PANEL_EASE = "ease-[cubic-bezier(0.16,1,0.3,1)]";
const PANEL_DURATION = "duration-500";

/**
 * The open/close mark: two geometric bars that turn from a plus into a cross.
 *
 * This was the text character `+` with `rotate-45` on it, and a font glyph is
 * the wrong raw material for the job. A typographic plus is centred on the
 * font's math axis rather than on its line box, so rotating the box pivots
 * around a point that isn't where the strokes cross — the mark swings through
 * an arc instead of turning in place. Its two strokes are also drawn to
 * different lengths and hinted for orthogonal rendering, so at 45° it lands as
 * a slightly lopsided, softly blurred cross. Two bars remove all of that by
 * construction: equal weight, exact centre, and a pivot that *is* the crossing.
 *
 * 135° rather than the 45° that would suffice. A plus has 90° rotational
 * symmetry so both land on the same cross, but 45° is an eighth of a turn and
 * is over before you've registered it — which is most of why the old one read
 * as nothing happening. 135° is the same endpoint with three times the travel,
 * and on an ease-out curve nearly all of it is spent in the first third of the
 * duration, so it costs no extra waiting.
 *
 * Not scaled down to compensate for the cross measuring √2 wider across its
 * bounding box than the plus. That's a real geometric fact, and the obvious fix
 * — scale by 0.707 — thins the 2px bars to 1.4px, so the cross reads lighter
 * than the plus did. At 16px, constant stroke weight is worth more than a
 * constant bounding box.
 *
 * `bg-current` so colour still comes from the parent's `text-*`, exactly as it
 * did while this was a glyph.
 */
const PlusCross = ({ isOpen }: { isOpen: boolean }) => (
  <span
    aria-hidden
    className={`relative block h-4 w-4 transition-transform ${PANEL_DURATION} ${PANEL_EASE} motion-reduce:transition-none ${
      isOpen ? "rotate-[135deg]" : "rotate-0"
    }`}
  >
    <span className="absolute left-0 top-1/2 h-[2px] w-full -translate-y-1/2 rounded-full bg-current" />
    <span className="absolute left-1/2 top-0 h-full w-[2px] -translate-x-1/2 rounded-full bg-current" />
  </span>
);

const AccordionItem = ({ question, answer }: FAQItem) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="border-b border-brand-border">
      {/* `cursor-pointer` is not redundant: Tailwind v4's preflight resets
          buttons to `cursor: default` to match the browser, so every button on
          this site has to ask for it — the email button below does too. */}
      <button
        className="group w-full cursor-pointer py-8 flex justify-between items-start gap-8 text-left outline-none"
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
      >
        {/* `group-focus-visible` alongside every `group-hover`, because the
            button suppresses its own outline. Without it a keyboard user tabs
            through this list with nothing to show which question they're on. */}
        <span
          className={`font-sans font-bold text-xl md:text-2xl transition-colors duration-300 motion-reduce:transition-none ${
            isOpen
              ? "text-brand-blue"
              : "text-brand-black group-hover:text-brand-blue group-focus-visible:text-brand-blue"
          }`}
        >
          {question}
        </span>

        {/* The mark's box is exactly the height of the question's first line
            box — 28px at text-xl, 32px at text-2xl, both from Tailwind's paired
            line-heights — so centring the mark in it puts it on that line's
            optical centre. That's what the parent's `items-start` needs: when a
            question wraps to two lines the mark stays beside the first one
            instead of drifting toward the middle of the block.

            The colour transition lives out here and the rotation lives on the
            child, so neither can interfere with the other. */}
        <span
          className={`shrink-0 grid place-items-center h-7 w-7 md:h-8 md:w-8 transition-colors duration-300 motion-reduce:transition-none ${
            isOpen
              ? "text-brand-blue"
              : "text-brand-black group-hover:text-brand-blue group-focus-visible:text-brand-blue"
          }`}
        >
          <PlusCross isOpen={isOpen} />
        </span>
      </button>

      {/* The box and its contents are deliberately on different clocks. Sharing
          one — which is what `transition-[grid-template-rows,opacity,margin]`
          did — means the paragraph sits at half opacity while the box is at
          half height, and half-faded text in a half-open box is a smear rather
          than a reveal.

          Opening, the box leads and the text follows 100ms behind, arriving
          into a space that already exists. Closing, the text is gone in 150ms
          while the box takes the full 500 to shut, so nothing is still legible
          under the descending edge. The asymmetry is the point: the open is
          what you're there to see, the close is just tidying up.

          The bottom spacing is `pb-8` on the paragraph rather than a margin on
          this grid, so collapsing the row takes it along. As an animated `mb-8`
          it was a third property on a third clock, and the only one of the
          three that touched layout. */}
      <div
        className={`grid transition-[grid-template-rows] ${PANEL_DURATION} ${PANEL_EASE} motion-reduce:transition-none ${
          isOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
        }`}
      >
        <div className="overflow-hidden">
          <p
            className={`font-serif text-lg text-brand-graphite leading-relaxed max-w-2xl pt-2 pb-8 transition-[opacity,transform] ${PANEL_EASE} motion-reduce:transition-none motion-reduce:transform-none ${
              isOpen
                ? "opacity-100 translate-y-0 duration-500 delay-100"
                : "opacity-0 translate-y-3 duration-150 delay-0"
            }`}
          >
            {answer}
          </p>
        </div>
      </div>
    </div>
  );
};

type Props = {
  faqs: FAQItem[];
  contactInfo: ContactInfo;
};

const ContactContent: React.FC<Props> = ({ faqs, contactInfo }) => {
  // This component's own copy-to-clipboard logic was the better of the two on
  // the site, so it became the shared hook rather than being replaced by one.
  const { copied, bubbleVisible, copy, hoverHandlers } = useCopyToClipboard(
    contactInfo.email
  );

  return (
    <div className="w-full bg-brand-white min-h-screen">
      {/* Hero Section */}
      <section className="min-h-[70vh] relative overflow-hidden flex flex-col justify-between">
        <div className="w-full pt-20 pb-8">
          {/* Small eyebrow */}
          <div className="mb-8 px-6 md:px-12 opacity-0 animate-[fadeInUp_0.4s_cubic-bezier(0.33,0,0.2,1)_0s_both]">
            <span className="text-sm md:text-xs font-medium uppercase tracking-[0.25em] text-brand-graphite">
              Contact
            </span>
          </div>

          {/* Main content wrapper */}
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-12 px-6 md:px-12">
            <div className="flex-1">
              {/* Main Headline - Two Lines */}
              <h1 className="font-sans font-semibold text-[clamp(3.5rem,12vw,11rem)] leading-[0.9] tracking-tighter mb-16 text-brand-black">
                <span className="block opacity-0 animate-[fadeInUp_0.6s_cubic-bezier(0.33,0,0.2,1)_0.1s_both]">
                  Come
                </span>
                <span className="block opacity-0 animate-[fadeInUp_0.6s_cubic-bezier(0.33,0,0.2,1)_0.2s_both]">
                  Say Hi.
                </span>
              </h1>
            </div>

            {/* Contact Information */}
            <div className="flex flex-col gap-8 opacity-0 animate-[fadeInUp_0.4s_cubic-bezier(0.33,0,0.2,1)_0.35s_both] md:mr-32 md:mb-16 md:pb-0.5">
              <div>
                <span className="text-sm md:text-xs font-medium uppercase tracking-widest text-brand-graphite mb-3 block">
                  New Business
                </span>
                <button
                  onClick={copy}
                  {...hoverHandlers}
                  className="group text-left flex items-center gap-3 cursor-pointer"
                >
                  {/* Email text with underline animation */}
                  <span className="relative">
                    <span className="text-xl md:text-xl font-semibold text-brand-black transition-all duration-300 group-hover:text-brand-blue">
                      {contactInfo.email}
                    </span>
                    {/* Always visible dashed underline that becomes solid on hover */}
                    <span className="absolute bottom-0 left-0 right-0 h-[1px] border-b-2 border-dashed border-brand-graphite/30 transition-all duration-300 group-hover:border-brand-blue group-hover:border-solid group-hover:h-[2px]" />
                  </span>

                  <CopyBubble tone="onLight" visible={bubbleVisible} copied={copied} />
                </button>
              </div>
              <div>
                <span className="text-sm md:text-xs font-medium uppercase tracking-widest text-brand-graphite mb-3 block">
                  Office
                </span>
                <address className="text-lg md:text-lg not-italic font-medium text-brand-graphite max-w-xs leading-relaxed">
                  {contactInfo.address}
                </address>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom section - Desktop */}
        <div className="hidden md:flex pb-12 px-6 md:px-12 w-full justify-between items-end opacity-0 animate-[fadeInUp_0.4s_cubic-bezier(0.33,0,0.2,1)_0.45s_both]">
          <p className="text-lg font-sans text-brand-graphite">
            {contactInfo.availabilityText} <span className="font-semibold text-brand-black">{contactInfo.availabilityHighlight}</span>
          </p>
          <span className="text-base font-medium text-brand-graphite">
            Get in Touch
          </span>
        </div>

        {/* Bottom availability text - Mobile */}
        <div className="md:hidden pb-12 px-6 opacity-0 animate-[fadeInUp_0.4s_cubic-bezier(0.33,0,0.2,1)_0.45s_both]">
          <p className="text-lg font-sans text-brand-graphite">
            {contactInfo.availabilityText} <span className="font-semibold text-brand-black">{contactInfo.availabilityHighlight}</span>
          </p>
        </div>
      </section>

      {/* Divider */}
      <div className="border-t border-brand-border" />

      <section className="py-24 px-6 md:px-12 max-w-[1920px] mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-12">
          {/* No reveal on this column: the heading is `sticky top-32`, and a
              transform on it or any ancestor would make that element a containing
              block, changing what the sticky offset resolves against. */}
          <div className="md:col-span-4">
            <h2 className="font-sans text-sm font-bold uppercase tracking-widest text-brand-graphite sticky top-32">
              Frequently Asked
              <br />
              Questions
            </h2>
          </div>
          <div className="md:col-span-8">
            {/* Revealed per question so the list builds as you reach it. Safe to
                put the start state on the row itself: the accordion animates its
                own `grid-template-rows`, which is a different property on a
                different element from the reveal's transform. */}
            {faqs.map((faq, index) => (
              <div key={index} className="reveal-init" data-reveal>
                <AccordionItem question={faq.question} answer={faq.answer} />
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default ContactContent;



