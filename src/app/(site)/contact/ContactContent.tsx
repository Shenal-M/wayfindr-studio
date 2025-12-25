"use client";

import React, { useState } from "react";
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
  const [copied, setCopied] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [showBubble, setShowBubble] = useState(false);

  const handleEmailClick = async () => {
    try {
      await navigator.clipboard.writeText(contactInfo.email);
      setCopied(true);
      setShowBubble(true);
      setIsHovered(false); // Reset hover state
      
      // On mobile/touch devices, show for 1200ms, on desktop keep it for 2s
      const isMobile = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
      const timeout = isMobile ? 1200 : 2000;
      
      setTimeout(() => {
        // Start fading out the bubble
        setShowBubble(false);
        
        // Wait for fade animation to complete (300ms) before changing text
        setTimeout(() => {
          setCopied(false);
        }, 300);
      }, timeout);
    } catch (err) {
      console.error("Failed to copy email:", err);
    }
  };

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
                  onClick={handleEmailClick}
                  onMouseEnter={() => !copied && setIsHovered(true)}
                  onMouseLeave={() => !copied && setIsHovered(false)}
                  className="group text-left flex items-center gap-3 cursor-pointer"
                >
                  {/* Email text with underline animation */}
                  <div className="relative">
                    <span className="text-xl md:text-xl font-semibold text-brand-black transition-all duration-300 group-hover:text-brand-blue">
                      {contactInfo.email}
                    </span>
                    {/* Always visible dashed underline that becomes solid on hover */}
                    <span className="absolute bottom-0 left-0 right-0 h-[1px] border-b-2 border-dashed border-brand-graphite/30 transition-all duration-300 group-hover:border-brand-blue group-hover:border-solid group-hover:h-[2px]" />
                  </div>
                  
                  {/* Container for absolute positioning to prevent layout shift */}
                  <div className="relative w-0">
                    {/* Copy bubble on the right */}
                    <div 
                      className={`absolute left-0 top-1/2 -translate-y-1/2 px-4 py-2 text-sm font-medium whitespace-nowrap rounded-full bg-brand-black text-brand-white transform transition-all duration-500 ease-[cubic-bezier(0.19,1,0.22,1)] ${
                        (showBubble || isHovered) 
                          ? 'opacity-100 translate-x-0' 
                          : 'opacity-0 -translate-x-2 pointer-events-none'
                      }`}
                    >
                      <div className="relative inline-block -translate-y-0.5">
                        <span 
                          className={`block ${
                            copied 
                              ? 'opacity-0 -translate-y-full absolute inset-0 hidden' 
                              : 'opacity-100 translate-y-0 relative'
                          }`}
                        >
                          Click to copy
                        </span>
                        <span 
                          className={`block transition-all duration-400 ease-[cubic-bezier(0.16,1,0.3,1)] ${
                            copied 
                              ? 'opacity-100 translate-y-0 relative' 
                              : 'opacity-0 translate-y-full absolute inset-0'
                          }`}
                        >
                          Done
                        </span>
                      </div>
                    </div>
                  </div>
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



