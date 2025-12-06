"use client";

import React from "react";
import Link from "next/link";
import { SOCIAL_LINKS } from "../constants";

const Footer: React.FC = () => {
  return (
    <footer className="bg-brand-black text-brand-white w-full pt-32 pb-12 px-6 md:px-12 mt-auto border-t border-gray-900">
      <div className="max-w-[1920px] mx-auto grid grid-cols-1 md:grid-cols-12 gap-12 md:gap-8 mb-24">
        <div className="md:col-span-4 flex flex-col justify-between">
          <div>
            <Link href="/" className="inline-block mb-8 group">
              <span className="font-sans font-bold text-2xl md:text-3xl tracking-tighter text-white group-hover:text-brand-blue transition-colors">
                Wayfindr Studio
              </span>
            </Link>
            <div className="max-w-xs">
              <p className="font-serif text-2xl text-gray-400 leading-snug">
                Strategic design for ambitious brands.
              </p>
            </div>
          </div>
        </div>

        <div className="md:col-span-2 flex flex-col gap-6">
          <h4 className="font-sans text-xs font-bold uppercase tracking-widest text-gray-500">
            Connect
          </h4>
          <div className="flex flex-col gap-3">
            {SOCIAL_LINKS.map((link) => (
              <a
                key={link.platform}
                href={link.url}
                className="text-lg font-sans font-medium text-gray-300 hover:text-white hover:translate-x-2 transition-all duration-300 w-max"
              >
                {link.platform}
              </a>
            ))}
          </div>
        </div>

        <div className="md:col-span-2 flex flex-col gap-6">
          <h4 className="font-sans text-xs font-bold uppercase tracking-widest text-gray-500">
            Menu
          </h4>
          <div className="flex flex-col gap-3">
            <Link
              href="/work"
              className="text-lg font-sans font-medium text-gray-300 hover:text-white hover:translate-x-2 transition-all duration-300 w-max"
            >
              Work
            </Link>
            <Link
              href="/agency"
              className="text-lg font-sans font-medium text-gray-300 hover:text-white hover:translate-x-2 transition-all duration-300 w-max"
            >
              Agency
            </Link>
            <Link
              href="/contact"
              className="text-lg font-sans font-medium text-gray-300 hover:text-white hover:translate-x-2 transition-all duration-300 w-max"
            >
              Contact
            </Link>
          </div>
        </div>

        <div className="md:col-span-4 flex flex-col justify-start md:items-end">
          <div>
            <h4 className="font-sans text-xs font-bold uppercase tracking-widest text-gray-500 mb-6 md:text-right">
              New Business
            </h4>
            <a
              href="mailto:hello@wayfindr.com"
              className="block text-4xl md:text-6xl font-sans font-bold tracking-tight text-white hover:text-brand-blue transition-colors leading-[0.9] md:text-right"
            >
              Start a
              <br />
              Project
            </a>
          </div>
        </div>
      </div>

      <div className="max-w-[1920px] mx-auto pt-8 border-t border-gray-800 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 text-sm text-gray-500 font-medium">
        <div className="flex flex-col md:flex-row md:gap-8">
          <span>© 2025 Wayfindr Studio</span>
          <span>All rights reserved.</span>
        </div>

        <div className="flex gap-8">
          <a href="#" className="hover:text-white transition-colors">
            Privacy
          </a>
          <a href="#" className="hover:text-white transition-colors">
            Terms
          </a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;



