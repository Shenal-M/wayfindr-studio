"use client";

import { useEffect, useRef, useState } from "react";

interface ScrollRevealTextProps {
  text: string;
  className?: string;
}

export const ScrollRevealText = ({ text, className = "" }: ScrollRevealTextProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [lineProgresses, setLineProgresses] = useState<number[]>([]);
  const [isMobile, setIsMobile] = useState(false);
  
  // Split text into lines with 7-8 words each
  const words = text.split(/\s+/);
  const lines: string[] = [];
  for (let i = 0; i < words.length; i += 7) {
    lines.push(words.slice(i, i + 7).join(" "));
  }

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener("resize", checkMobile);
    
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  useEffect(() => {
    const container = containerRef.current;
    if (!container || isMobile) return;

    const handleScroll = () => {
      const rect = container.getBoundingClientRect();
      const windowHeight = window.innerHeight;
      
      // Calculate overall progress: 0 at bottom of viewport, 1 when top reaches top
      const overallProgress = Math.max(0, Math.min(1, 1 - rect.top / windowHeight));
      
      // Calculate progress for each line sequentially
      const progresses = lines.map((_, idx) => {
        const startProgress = idx / lines.length;
        const endProgress = (idx + 1) / lines.length;
        const lineProgress = (overallProgress - startProgress) / (endProgress - startProgress);
        return Math.max(0, Math.min(1, lineProgress));
      });
      
      setLineProgresses(progresses);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();

    return () => window.removeEventListener("scroll", handleScroll);
  }, [lines.length, isMobile]);

  // Mobile view: render plain text
  if (isMobile) {
    return (
      <div ref={containerRef} className={`${className}`}>
        <p style={{ color: "#050505" }}>{text}</p>
      </div>
    );
  }

  // Desktop view: render with scroll animation
  return (
    <div ref={containerRef} className={`${className}`}>
      {lines.map((line, idx) => (
        <span
          key={idx}
          className="challenge-line"
          style={{
            display: "block",
            position: "relative",
            color: "#c0c0c0",
            marginBottom: "0.05em",
            lineHeight: "1.2",
            paddingBottom: "0.05em",
          }}
        >
          <span style={{ position: "relative", zIndex: 1 }}>{line}</span>
          <span
            style={{
              position: "absolute",
              inset: 0,
              color: "#050505",
              clipPath: `inset(0 ${100 - (lineProgresses[idx] || 0) * 100}% 0 0)`,
              zIndex: 2,
            }}
            aria-hidden="true"
          >
            {line}
          </span>
        </span>
      ))}
    </div>
  );
};
