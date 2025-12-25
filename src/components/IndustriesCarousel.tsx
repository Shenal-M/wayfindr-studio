"use client";

import { useEffect, useState, useRef } from "react";

type Industry = {
  name: string;
  iconUrl: string;
  description?: string;
};

type IndustriesCarouselProps = {
  industries: Industry[];
};

export const IndustriesCarousel = ({ industries }: IndustriesCarouselProps) => {
  const [currentIndex, setCurrentIndex] = useState(1);
  const [progress, setProgress] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const progressIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const autoTransitionRef = useRef<NodeJS.Timeout | null>(null);

  const slides = [industries[industries.length - 1], ...industries, industries[0]];
  const TRANSITION_DURATION = 12000; // 12 seconds

  // Progress bar animation
  useEffect(() => {
    setProgress(0);
    
    const startTime = Date.now();
    progressIntervalRef.current = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const newProgress = Math.min((elapsed / TRANSITION_DURATION) * 100, 100);
      setProgress(newProgress);
      
      if (newProgress >= 100) {
        if (progressIntervalRef.current) {
          clearInterval(progressIntervalRef.current);
        }
      }
    }, 50);

    return () => {
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
      }
    };
  }, [currentIndex]);

  // Auto-transition (pause when hovering)
  useEffect(() => {
    if (isPaused) {
      if (autoTransitionRef.current) {
        clearInterval(autoTransitionRef.current);
      }
      return;
    }

    autoTransitionRef.current = setInterval(() => {
      handleNext();
    }, TRANSITION_DURATION);

    return () => {
      if (autoTransitionRef.current) {
        clearInterval(autoTransitionRef.current);
      }
    };
  }, [isPaused]);

  const handleNext = () => {
    setCurrentIndex((prev) => {
      const next = prev + 1;
      if (next >= slides.length - 1) {
        setTimeout(() => {
          if (containerRef.current) {
            containerRef.current.style.transition = 'none';
            setCurrentIndex(1);
            setTimeout(() => {
              if (containerRef.current) {
                containerRef.current.style.transition = '';
              }
            }, 50);
          }
        }, 800);
        return next;
      }
      return next;
    });
  };

  const handlePrevious = () => {
    setCurrentIndex((prev) => {
      const next = prev - 1;
      if (next <= 0) {
        setTimeout(() => {
          if (containerRef.current) {
            containerRef.current.style.transition = 'none';
            setCurrentIndex(industries.length);
            setTimeout(() => {
              if (containerRef.current) {
                containerRef.current.style.transition = '';
              }
            }, 50);
          }
        }, 800);
        return next;
      }
      return next;
    });
  };

  const goToSlide = (index: number) => {
    setCurrentIndex(index + 1);
  };

  const actualIndex = currentIndex === 0 ? industries.length - 1 : currentIndex === slides.length - 1 ? 0 : currentIndex - 1;

  return (
    <div 
      className="relative max-w-5xl mx-auto"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* Carousel Container */}
      <div className="relative overflow-hidden py-8">
        <div
          ref={containerRef}
          className="flex transition-transform duration-[800ms] ease-[cubic-bezier(0.65,0,0.35,1)]"
          style={{
            transform: `translateX(-${currentIndex * 100}%)`,
          }}
        >
          {slides.map((industry, index) => (
            <div
              key={index}
              className="w-full flex-shrink-0 px-8"
            >
              <div className="text-center max-w-3xl mx-auto">
                {/* Industry Badge */}
                <div 
                  className="inline-flex items-center gap-2 mb-8 px-4 py-2 rounded-full border border-brand-white/10 bg-brand-white/5 backdrop-blur-sm"
                  style={{ boxShadow: '0 0 30px rgba(2, 17, 240, 0.4), 0 0 60px rgba(2, 17, 240, 0.2)' }}
                >
                  <span className="font-sans text-xs md:text-sm text-brand-white/70 uppercase tracking-[0.2em] font-medium">
                    {industry.name}
                  </span>
                </div>
                
                {/* Description with reveal animation */}
                {industry.description && (
                  <p className="font-serif text-2xl md:text-4xl text-brand-white leading-[1.4] tracking-tight opacity-90">
                    {industry.description}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Navigation Arrows - Responsive positioning */}
      <div className="hidden lg:block">
        <button
          onClick={handlePrevious}
          className="absolute left-0 -translate-x-16 xl:-translate-x-20 top-1/2 -translate-y-1/2 w-10 h-10 md:w-12 md:h-12 rounded-full border border-brand-white/10 bg-brand-white/5 backdrop-blur-sm flex items-center justify-center text-brand-white/50 hover:text-brand-white hover:border-brand-white/30 hover:bg-brand-white/10 transition-all duration-300 z-30 group"
          aria-label="Previous industry"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="w-5 h-5 md:w-6 md:h-6 transform group-hover:-translate-x-0.5 transition-transform"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M15 19l-7-7 7-7"
            />
          </svg>
        </button>

        <button
          onClick={handleNext}
          className="absolute right-0 translate-x-16 xl:translate-x-20 top-1/2 -translate-y-1/2 w-10 h-10 md:w-12 md:h-12 rounded-full border border-brand-white/10 bg-brand-white/5 backdrop-blur-sm flex items-center justify-center text-brand-white/50 hover:text-brand-white hover:border-brand-white/30 hover:bg-brand-white/10 transition-all duration-300 z-30 group"
          aria-label="Next industry"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="w-5 h-5 md:w-6 md:h-6 transform group-hover:translate-x-0.5 transition-transform"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M9 5l7 7-7 7"
            />
          </svg>
        </button>
      </div>

      {/* Mobile/Tablet Navigation - Below content, above dots */}
      <div className="flex lg:hidden items-center justify-center gap-4 mt-8 mb-4">
        <button
          onClick={handlePrevious}
          className="w-10 h-10 md:w-12 md:h-12 rounded-full border border-brand-white/10 bg-brand-white/5 backdrop-blur-sm flex items-center justify-center text-brand-white/50 hover:text-brand-white hover:border-brand-white/30 hover:bg-brand-white/10 transition-all duration-300 group"
          aria-label="Previous industry"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="w-5 h-5 md:w-6 md:h-6 transform group-hover:-translate-x-0.5 transition-transform"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M15 19l-7-7 7-7"
            />
          </svg>
        </button>

        <button
          onClick={handleNext}
          className="w-10 h-10 md:w-12 md:h-12 rounded-full border border-brand-white/10 bg-brand-white/5 backdrop-blur-sm flex items-center justify-center text-brand-white/50 hover:text-brand-white hover:border-brand-white/30 hover:bg-brand-white/10 transition-all duration-300 group"
          aria-label="Next industry"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="w-5 h-5 md:w-6 md:h-6 transform group-hover:translate-x-0.5 transition-transform"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M9 5l7 7-7 7"
            />
          </svg>
        </button>
      </div>

      {/* Dots Indicator */}
      <div className="flex items-center justify-center gap-2 mt-4 lg:mt-12">
        {industries.map((_, index) => (
          <button
            key={index}
            onClick={() => goToSlide(index)}
            className="relative group"
            aria-label={`Go to slide ${index + 1}`}
          >
            {/* Dot */}
            <div
              className={`h-1.5 rounded-full transition-all duration-500 ${
                index === actualIndex
                  ? "w-8 bg-brand-white"
                  : "w-1.5 bg-brand-white/20 group-hover:bg-brand-white/40 group-hover:w-3"
              }`}
            />
          </button>
        ))}
      </div>
    </div>
  );
};

