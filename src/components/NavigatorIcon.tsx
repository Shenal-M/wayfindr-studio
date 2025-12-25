"use client";

import React, { useEffect, useState, useRef } from "react";

const NavigatorIcon: React.FC = () => {
  const [targetRotation, setTargetRotation] = useState(0);
  const [currentRotation, setCurrentRotation] = useState(0);
  const iconRef = useRef<HTMLDivElement>(null);
  const animationRef = useRef<number | undefined>(undefined);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!iconRef.current || window.innerWidth < 768) return;

      const rect = iconRef.current.getBoundingClientRect();
      const iconCenterX = rect.left + rect.width / 2;
      const iconCenterY = rect.top + rect.height / 2;

      const angle = Math.atan2(e.clientY - iconCenterY, e.clientX - iconCenterX);
      const degrees = (angle * 180) / Math.PI + 45;

      setTargetRotation(degrees);
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  // Smooth lerp animation
  useEffect(() => {
    const animate = () => {
      setCurrentRotation((prev) => {
        // Handle angle wrapping for smooth rotation
        let diff = targetRotation - prev;
        if (diff > 180) diff -= 360;
        if (diff < -180) diff += 360;

        const newRotation = prev + diff * 0.15; // 0.15 = smoothing factor
        return newRotation;
      });
      animationRef.current = requestAnimationFrame(animate);
    };

    animationRef.current = requestAnimationFrame(animate);
    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, [targetRotation]);

  return (
    <div ref={iconRef}>
      <svg
        width="48"
        height="48"
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-6 h-6 md:w-7 md:h-7 text-brand-black"
        style={{ transform: `rotate(${currentRotation}deg)` }}
      >
        <path
          d="M3 11L22 2L13 21L11 13L3 11Z"
          fill="currentColor"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </div>
  );
};

export default NavigatorIcon;
