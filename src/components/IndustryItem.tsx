"use client";

import { useEffect, useRef, useState } from "react";

type IndustryItemProps = {
  name: string;
  iconUrl: string;
  description?: string;
  index: number;
};

export const IndustryItem = ({ name, iconUrl, description, index }: IndustryItemProps) => {
  const itemRef = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsVisible(true);
          }
        });
      },
      {
        threshold: 0.1,
        rootMargin: "0px 0px -50px 0px",
      }
    );

    if (itemRef.current) {
      observer.observe(itemRef.current);
    }

    return () => {
      if (itemRef.current) {
        observer.unobserve(itemRef.current);
      }
    };
  }, []);

  return (
    <div
      ref={itemRef}
      className={`${
        isVisible
          ? "opacity-100 translate-y-0"
          : "opacity-0 translate-y-8"
      }`}
      style={{
        transitionDelay: isVisible ? "0ms" : `${index * 100}ms`,
        transition: "opacity 0.7s ease-out, transform 0.7s ease-out",
      }}
    >
      <div className="flex flex-col h-full">
        {/* Icon at top left */}
        <div className="mb-8">
          <img
            src={iconUrl}
            alt={name}
            className="w-16 h-16 md:w-24 md:h-24 object-contain"
          />
        </div>
        
        {/* Heading */}
        <h3 className="font-sans font-bold text-sm md:text-base text-brand-white/60 tracking-tight mb-4 uppercase">
          {name}
        </h3>
        
        {/* Description */}
        {description && (
          <p className="font-serif text-2xl md:text-4xl text-brand-white leading-relaxed">
            {description}
          </p>
        )}
      </div>
    </div>
  );
};

