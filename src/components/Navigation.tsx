"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import NavigatorIcon from "./NavigatorIcon";

const Navigation: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const pathname = usePathname();

  const closeMenu = () => setIsMenuOpen(false);

  const isActive = (path: string) => pathname === path;

  const navItems = [
    { label: "Work", path: "/work" },
    { label: "Agency", path: "/agency" },
    { label: "Contact", path: "/contact" },
  ];

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-50 transition-all duration-300 bg-brand-white/80 backdrop-blur-md border-b border-brand-border">
        <div className="max-w-[1920px] mx-auto px-6 md:px-12 h-20 flex items-center justify-between">
          <Link
            href="/"
            className="text-xl md:text-2xl font-bold font-sans tracking-tighter text-brand-black z-50 relative"
            onClick={closeMenu}
          >
            Wayfindr Studio
          </Link>

          <nav className="hidden md:flex items-center gap-12">
            {navItems.map((item) => (
              <Link
                key={item.label}
                href={item.path}
                className={`relative text-xs font-medium uppercase tracking-widest transition-colors duration-300 ${
                  isActive(item.path)
                    ? "text-brand-blue"
                    : "text-brand-black hover:text-brand-blue"
                }`}
              >
                {item.label}
                <span 
                  className={`absolute -bottom-1 left-0 h-[1px] bg-brand-blue transition-all duration-300 ease-out origin-left ${
                    isActive(item.path) ? "w-full" : "w-0"
                  }`}
                />
              </Link>
            ))}
            <NavigatorIcon />
          </nav>

          <div className="flex items-center gap-4 md:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-sm font-bold uppercase tracking-widest z-50 text-brand-black"
            >
              {isMenuOpen ? "Close" : "Menu"}
            </button>
          </div>
        </div>
      </header>

      <div 
        className={`fixed inset-0 z-40 bg-brand-white flex flex-col items-center justify-center transition-opacity duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] ${
          isMenuOpen 
            ? 'opacity-100 pointer-events-auto' 
            : 'opacity-0 pointer-events-none'
        }`}
      >
        <nav className="flex flex-col items-center gap-8">
          {navItems.map((item, index) => (
            <Link
              key={item.label}
              href={item.path}
              className={`text-4xl font-sans font-bold tracking-tight text-brand-black hover:text-brand-blue transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] ${
                isMenuOpen 
                  ? 'opacity-100 translate-y-0' 
                  : 'opacity-0 translate-y-2'
              }`}
              style={{
                transitionDelay: isMenuOpen ? `${200 + index * 80}ms` : '0ms'
              }}
              onClick={closeMenu}
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </div>
    </>
  );
};

export default Navigation;



