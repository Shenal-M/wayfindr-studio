import React from "react";
import Link from "next/link";

interface ViewAllButtonProps {
  href: string;
  text?: string;
  align?: "left" | "center" | "right";
}

const ViewAllButton: React.FC<ViewAllButtonProps> = ({ 
  href, 
  text = "View All",
  align = "center"
}) => {
  const alignClass = align === "left" ? "justify-start" : align === "right" ? "justify-end" : "justify-center";
  
  return (
    <div className={`flex ${alignClass} mt-12`}>
      <Link
        href={href}
        className="group relative inline-flex items-center gap-2 px-5 py-2.5 font-sans text-sm font-bold uppercase tracking-widest text-brand-black bg-transparent border border-brand-black rounded-full overflow-hidden transition-all duration-300 hover:text-brand-white hover:border-brand-blue active:scale-95"
      >
        <span className="absolute inset-0 bg-brand-blue transform -translate-x-full group-hover:translate-x-0 transition-transform duration-300 ease-out" />
        <span className="relative z-10">{text}</span>
        <svg 
          className="relative z-10 w-4 h-4 transform transition-transform duration-300 group-hover:translate-x-1" 
          fill="none" 
          viewBox="0 0 24 24" 
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
        </svg>
      </Link>
    </div>
  );
};

export default ViewAllButton;

