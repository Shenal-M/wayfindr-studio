"use client";

import React, { useEffect, useRef, useState } from "react";
import ArrowIcon from "./ArrowIcon";

type Capability = {
  title: string;
  items: string[];
  slug?: string;
};

type Props = {
  capabilities: Capability[];
};

const CapabilitiesList: React.FC<Props> = ({ capabilities }) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const activeIndexRef = useRef(0);
  const itemRefs = useRef<(HTMLAnchorElement | null)[]>([]);

  useEffect(() => {
    const updateActiveFromScroll = () => {
      const viewportCenter = window.innerHeight * 0.45;
      let bestIndex = activeIndexRef.current;
      let bestDistance = Number.POSITIVE_INFINITY;

      itemRefs.current.forEach((node, idx) => {
        if (!node) return;
        const rect = node.getBoundingClientRect();
        if (rect.bottom < 0 || rect.top > window.innerHeight) return; // skip off-screen items

        const itemFocusPoint = rect.top + rect.height * 0.35; // bias near top of card
        const distance = Math.abs(itemFocusPoint - viewportCenter);

        if (distance < bestDistance) {
          bestDistance = distance;
          bestIndex = idx;
        }
      });

      if (bestIndex !== activeIndexRef.current) {
        activeIndexRef.current = bestIndex;
        setActiveIndex(bestIndex);
      }
    };

    let frame = 0;
    const handleScroll = () => {
      if (frame) return;
      frame = window.requestAnimationFrame(() => {
        frame = 0;
        updateActiveFromScroll();
      });
    };

    updateActiveFromScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("resize", handleScroll);

    return () => {
      if (frame) cancelAnimationFrame(frame);
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", handleScroll);
    };
  }, [capabilities.length]);

  return (
    <div className="border-t border-b border-brand-border divide-y divide-brand-border">
      {capabilities.map((capability, index) => {
        const isActive = index === activeIndex;
        const href = capability.slug
          ? `/services/${capability.slug}`
          : `/services/${capability.title.toLowerCase().replace(/\s+/g, '-')}`;

        return (
          <a
            key={index}
            href={href}
            ref={(el) => (itemRefs.current[index] = el)}
            className="group block py-8 md:py-10"
          >
            {/* Title and Arrow Row */}
            <div className="flex items-start justify-between gap-4">
              <h3 className="font-sans text-3xl md:text-5xl font-semibold text-brand-black leading-tight tracking-tight">
                {capability.title}
              </h3>
              <div
                className={`flex-shrink-0 w-12 h-12 md:w-16 md:h-16 flex items-center justify-center transition-all duration-200 ease-out
                ${isActive ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-4"}
                md:opacity-0 md:-translate-x-4 md:group-hover:opacity-100 md:group-hover:translate-x-0`}
              >
                <ArrowIcon className="w-full h-full text-brand-blue" color="currentColor" />
              </div>
            </div>

            {/* Service Items - reveal on active/hover */}
            <div
              className={`grid transition-[grid-template-rows] duration-250 ease-out
              ${isActive ? "grid-rows-[1fr]" : "grid-rows-[0fr]"}
              md:grid-rows-[0fr] md:group-hover:grid-rows-[1fr]`}
            >
              <div className="overflow-hidden">
                <div
                  className={`flex flex-wrap gap-2 md:gap-3 mt-4 ml-1 transition-all duration-250 ease-out
                  ${isActive ? "opacity-100" : "opacity-0"}
                  md:opacity-0 md:group-hover:opacity-100`}
                >
                  {capability.items.map((item, idx) => (
                    <span
                      key={idx}
                      className="pr-6 py-1.5 text-brand-graphite text-xs md:text-sm font-medium uppercase tracking-wider"
                    >
                      {item}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </a>
        );
      })}
    </div>
  );
};

export default CapabilitiesList;
