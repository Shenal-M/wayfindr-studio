"use client";

import React, { useState } from "react";
import CopyBubble from "../../../components/CopyBubble";
import { useCopyToClipboard } from "../../../components/useCopyToClipboard";
import type { ContactInfo, FAQItem } from "../../../types";

const AccordionItem = ({ question, answer }: FAQItem) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="border-b border-brand-border">
      <button
        className="w-full py-8 flex justify-between items-start text-left group outline-none"
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
      >
        <span
          className={`font-sans font-bold text-xl md:text-2xl transition-colors pr-8 duration-300 ${
            isOpen ? "text-brand-blue" : "group-hover:text-brand-blue"
          }`}
        >
          {question}
        </span>
        <span
          className={`font-sans text-3xl leading-none transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] ${
            isOpen ? "rotate-45 text-brand-blue" : "rotate-0"
          }`}
        >
          +
        </span>
      </button>
      <div
        className={`grid transition-[grid-template-rows,opacity,margin] duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] ${
          isOpen ? "grid-rows-[1fr] opacity-100 mb-8" : "grid-rows-[0fr] opacity-0 mb-0"
        }`}
      >
        <div className="overflow-hidden">
          <p className="font-serif text-lg text-brand-graphite leading-relaxed max-w-2xl pt-2">
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
          <div className="md:col-span-4">
            <h2 className="font-sans text-sm font-bold uppercase tracking-widest text-brand-graphite sticky top-32">
              Frequently Asked
              <br />
              Questions
            </h2>
          </div>
          <div className="md:col-span-8">
            {faqs.map((faq, index) => (
              <AccordionItem key={index} question={faq.question} answer={faq.answer} />
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default ContactContent;



