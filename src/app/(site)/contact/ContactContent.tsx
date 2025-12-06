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

  const handleEmailClick = async () => {
    try {
      await navigator.clipboard.writeText(contactInfo.email);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy email:", err);
    }
  };

  return (
    <div className="w-full bg-brand-white min-h-screen">
      {/* Hero Section */}
      <section className="min-h-[70vh] relative overflow-hidden flex flex-col justify-between">
        {/* Top label */}
        <div className="pt-32 px-6 md:px-12 max-w-[1920px] mx-auto w-full">
          <span className="text-xs font-bold uppercase tracking-[0.3em] text-brand-graphite">
            Contact
          </span>
        </div>

        {/* Main content */}
        <div className="px-6 md:px-12 max-w-[1920px] mx-auto w-full relative z-10">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-end">
            <div className="md:col-span-7">
              <h1 className="font-sans font-bold text-[13vw] md:text-[8vw] leading-[0.9] tracking-tighter ">
                <span className="block overflow-hidden pb-[2vw] -mb-[2vw]">
                  <span className="block animate-[slideUp_0.8s_cubic-bezier(0.16,1,0.3,1)_both]">
                    Come
                  </span>
                </span>
                <span className="block overflow-hidden text-brand-blue pb-[2vw] -mb-[2vw]">
                  <span className="block animate-[slideUp_0.8s_cubic-bezier(0.16,1,0.3,1)_0.1s_both]">
                    Say Hi.
                  </span>
                </span>
              </h1>
            </div>
            <div className="md:col-span-5 pb-4 flex flex-col gap-6">
              <div>
                <span className="text-xs font-bold uppercase tracking-widest text-brand-graphite mb-2 block">
                  New Business
                </span>
                <button
                  onClick={handleEmailClick}
                  onMouseEnter={() => setIsHovered(true)}
                  onMouseLeave={() => setIsHovered(false)}
                  className="group text-left flex items-center gap-3"
                >
                  <div className="text-xl md:text-2xl font-bold text-brand-black transition-colors duration-300 group-hover:text-brand-blue">
                    {contactInfo.email}
                  </div>
                  <div 
                    className="relative px-4 py-2 bg-brand-black text-brand-white text-sm font-medium whitespace-nowrap transition-all duration-300 rounded-full"
                    style={{ 
                      opacity: (isHovered || copied) ? 1 : 0,
                      transform: copied ? 'scale(1.1)' : (isHovered ? 'scale(1)' : 'scale(0.9)')
                    }}
                  >
                    {copied ? "Copied! ✓" : "Click to copy"}
                  </div>
                </button>
              </div>
              <div>
                <span className="text-xs font-bold uppercase tracking-widest text-brand-graphite mb-2 block">
                  Office
                </span>
                <address className="text-lg md:text-xl not-italic font-medium text-brand-graphite max-w-xs ">
                  {contactInfo.address}
                </address>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom descriptor */}
        <div className="pb-12 px-6 md:px-12 max-w-[1920px] mx-auto w-full flex justify-between items-end">
          <p className="font-serif italic text-brand-graphite text-base md:text-lg max-w-sm">
            {contactInfo.availabilityText} <span className="text-brand-blue">{contactInfo.availabilityHighlight}</span>.
          </p>
          <span className="text-xs font-bold uppercase tracking-widest text-brand-graphite hidden md:block">
            Get in Touch
          </span>
        </div>
      </section>

      {/* Divider */}
      <div className="border-t border-brand-border" />

      <section className="py-24 px-6 md:px-12 max-w-[1920px] mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-12">
          <div className="md:col-span-4">
            <h2 className="font-sans text-sm font-bold uppercase tracking-widest sticky top-32">
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



