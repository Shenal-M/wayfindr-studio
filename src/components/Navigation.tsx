"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import NavigatorIcon from "./NavigatorIcon";

/**
 * The mobile menu overlay is a Motion component because it enters and leaves the
 * React tree, and deferring an unmount until an exit animation has finished is
 * the one thing no other layer in this stack can do.
 *
 * It used to be permanently mounted behind `opacity-0 pointer-events-none`,
 * because a plain CSS transition can't animate an element that's already gone.
 * That was an accessibility bug rather than a stylistic choice: pointer-events
 * stops the mouse but not the keyboard, so three off-screen links stayed in the
 * tab order on every page, and screen readers read out a menu that wasn't open.
 * Unmounting it is the fix.
 *
 * The stagger is `staggerChildren` rather than a per-item transitionDelay
 * computed from the index. The hand-rolled version only ran forwards — on close,
 * every item left at once, because the delays would have had to be reversed by
 * hand to cascade the other way.
 */
const OVERLAY_VARIANTS = {
  closed: { opacity: 0 },
  open: { opacity: 1 },
};

const LIST_VARIANTS = {
  closed: { transition: { staggerChildren: 0.05, staggerDirection: -1 } },
  open: { transition: { staggerChildren: 0.08, delayChildren: 0.2 } },
};

const ITEM_VARIANTS = {
  closed: { opacity: 0, y: 8 },
  open: { opacity: 1, y: 0 },
};

/** The curve the whole site's larger transitions use. */
const EASE = [0.16, 1, 0.3, 1] as const;

const Navigation: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const pathname = usePathname();
  const reduce = useReducedMotion();

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
        {/* Keep this in step with the matching pt-* on <main> in
            (site)/layout.tsx — the header is fixed, so that padding is the
            only thing stopping page content from sliding underneath it. */}
        <div className="max-w-[1920px] mx-auto px-6 md:px-12 h-16 flex items-center justify-between">
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

      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            variants={OVERLAY_VARIANTS}
            initial="closed"
            animate="open"
            exit="closed"
            transition={{ duration: reduce ? 0 : 0.5, ease: EASE }}
            className="fixed inset-0 z-40 bg-brand-white flex flex-col items-center justify-center"
          >
            {/* The list carries no visual animation of its own — it exists to own
                the stagger and pass `open`/`closed` down to the items, which
                inherit the variant from their parent rather than being told
                individually. */}
            <motion.nav
              variants={LIST_VARIANTS}
              className="flex flex-col items-center gap-8"
            >
              {navItems.map((item) => (
                <motion.div
                  key={item.label}
                  variants={ITEM_VARIANTS}
                  transition={{ duration: reduce ? 0 : 0.5, ease: EASE }}
                >
                  <Link
                    href={item.path}
                    className="text-4xl font-sans font-bold tracking-tight text-brand-black hover:text-brand-blue transition-colors duration-300"
                    onClick={closeMenu}
                  >
                    {item.label}
                  </Link>
                </motion.div>
              ))}
            </motion.nav>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default Navigation;



