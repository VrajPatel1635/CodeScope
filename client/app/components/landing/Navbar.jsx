"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import Button from "@/app/components/landing/ui/Button";

const NotchLeftCorner = () => (
  <svg className="absolute top-0 left-[-20px] w-[20px] h-[20px] text-(--accent-highlight)" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M20 0H0C11.0457 0 20 8.95431 20 20V0Z" fill="currentColor" />
  </svg>
);

const NotchRightCorner = () => (
  <svg className="absolute top-0 right-[-20px] w-[20px] h-[20px] text-(--accent-highlight)" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M0 0H20C8.95431 0 0 8.95431 0 20V0Z" fill="currentColor" />
  </svg>
);

const NavHoverLink = ({ href, external, children }) => {
  return (
    <Link href={href} target={external ? "_blank" : undefined} rel={external ? "noopener noreferrer" : undefined} className="group relative w-auto inline-flex items-center justify-center cursor-pointer overflow-hidden rounded-[14px] transition-all duration-300 ease-out outline-none active:scale-[0.98] font-ui font-medium tracking-wide px-2 lg:px-4 py-2.5 text-[12px] lg:text-[13px]">
      {/* Default State */}
      <div className="flex items-center gap-2.5 relative z-10 text-(--bg-primary)/70 transition-colors group-hover:text-background">
        <div className="h-1.5 w-1.5 shrink-0 rounded-[4px] bg-(--bg-primary)/50 transition-all duration-500 ease-out group-hover:scale-[150] group-hover:bg-background"></div>
        <span className="inline-block transition-all duration-300 ease-out group-hover:translate-x-12 group-hover:opacity-0">
          {children}
        </span>
      </div>

      {/* Hover State Overlay */}
      <div className="absolute top-0 left-0 z-20 flex h-full w-full translate-x-12 items-center justify-center gap-2 opacity-0 transition-all duration-400 ease-out group-hover:translate-x-0 group-hover:opacity-100 bg-background text-(--accent-highlight)">
        <span className="leading-none font-semibold">{children}</span>
        <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 shrink-0 leading-none" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
          <path strokeLinecap="round" strokeLinejoin="round" d="M3 12h14"></path>
          <path strokeLinecap="round" strokeLinejoin="round" d="M13 6l6 6-6 6"></path>
        </svg>
      </div>
    </Link>
  );
};

export default function Navbar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navLinks = [
    { label: "Features", href: "#features" },
    { label: "Showcase", href: "#data-structures" },
    { label: "Docs", href: "/docs" },
    { label: "GitHub", href: "https://github.com/VrajPatel1635/CodeScope", external: true },
    { label: "Architect", href: "https://vraj-patel.me", external: true },
  ];

  return (
    <>
      <header className="fixed top-0 inset-x-0 z-50 pointer-events-none flex justify-center">
        <div className="relative flex items-center justify-between w-[95%] max-w-[1000px] h-[60px] md:h-[68px] px-2.5 md:px-3 bg-(--accent-highlight) rounded-b-[24px] md:rounded-b-[28px] pointer-events-auto shadow-[0_20px_50px_-10px_rgba(0,0,0,0.8)]">
          <NotchLeftCorner />
          <NotchRightCorner />
          
          {/* Left side: Logo & Title */}
          <div className="flex items-center gap-3 pl-1 md:pl-2">
            <Link href="/" className="flex items-center gap-2 md:gap-3 group">
              <img
                src="/codescopelogo.png"
                alt="CodeScope"
                className="w-6 h-6 md:w-8 md:h-8 object-contain transition-transform duration-500 group-hover:scale-110 opacity-90 group-hover:opacity-100" 
              />
              <span className="font-ui font-semibold text-[15px] md:text-[17px] text-background tracking-tight group-hover:text-(--accent-primary) transition-colors">
                CodeScope
              </span>
            </Link>
          </div>

          {/* Middle: Nav Links with Button Hover Animation */}
          <nav className="hidden md:flex items-center gap-1 lg:gap-3">
            {navLinks.map((item) => (
              <NavHoverLink key={item.label} href={item.href} external={item.external}>
                {item.label}
              </NavHoverLink>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            {/* Right side button - CTA */}
            <div className="hidden md:block scale-[0.85] origin-right">
              <Button 
                href="/visualizer" 
                variant="primary" 
                accent="primary"
                triggerLoader={true}
                className="shadow-[0_5px_15px_rgba(var(--accent-primary-rgb, 211,123,80),0.2)] hover:shadow-[0_10px_30px_rgba(var(--accent-primary-rgb, 211,123,80),0.4)] rounded-[16px]!"
              >
                Launch Visualizer
              </Button>
            </div>

            {/* Mobile menu toggle */}
            <button
              className="md:hidden relative z-50 w-10 h-10 flex items-center justify-center rounded-[12px] bg-background border border-(--border-color) text-(--accent-highlight) transition-transform active:scale-95 hover:border-(--accent-primary)"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              aria-label="Toggle Navigation"
            >
              <div className="w-3.5 h-3 flex flex-col justify-between">
                <span className={`block h-[1.5px] w-full bg-current rounded-full transform transition-all duration-300 origin-center ${isMobileMenuOpen ? "rotate-45 translate-y-[4.5px]" : ""}`} />
                <span className={`block h-[1.5px] w-full bg-current rounded-full transition-all duration-300 ${isMobileMenuOpen ? "opacity-0 scale-x-0" : ""}`} />
                <span className={`block h-[1.5px] w-full bg-current rounded-full transform transition-all duration-300 origin-center ${isMobileMenuOpen ? "-rotate-45 translate-y-[-4.5px]" : ""}`} />
              </div>
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
              className="fixed inset-0 bg-background/90 backdrop-blur-md z-40 md:hidden"
              onClick={() => setIsMobileMenuOpen(false)}
            />

            <motion.div
              initial={{ y: "100%", opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: "100%", opacity: 0 }}
              transition={{ type: "spring", bounce: 0, duration: 0.6 }}
              className="fixed bottom-0 left-0 right-0 z-40 md:hidden"
            >
              <div className="relative bg-(--bg-surface) border-t border-(--border-color) rounded-t-[32px] shadow-[0_-20px_60px_rgba(0,0,0,0.9)] overflow-hidden">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[200px] bg-(--accent-primary) blur-[120px] opacity-[0.12] pointer-events-none" />

                <div className="flex justify-center pt-5 pb-2">
                  <div className="w-12 h-1.5 rounded-full bg-(--border-color)" />
                </div>

                <div className="px-6 pt-4 pb-6 flex flex-col gap-2 relative z-10">
                  {navLinks.map((item, i) => (
                    <motion.a
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.1 + i * 0.05, duration: 0.4, ease: "easeOut" }}
                      key={item.label}
                      href={item.href}
                      target={item.external ? "_blank" : undefined}
                      rel={item.external ? "noopener noreferrer" : undefined}
                      className="cursor-pointer flex items-center justify-between px-5 py-4 rounded-[20px] text-[13px] uppercase tracking-[0.2em] font-medium text-(--text-secondary) hover:text-foreground hover:bg-(--bg-elevated) border border-transparent hover:border-(--border-color) transition-all duration-300 group"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      <span>{item.label}</span>
                      <svg className="w-4 h-4 text-(--text-secondary)/50 group-hover:text-(--accent-primary) group-hover:translate-x-1 transition-all duration-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                      </svg>
                    </motion.a>
                  ))}
                </div>

                <div className="mx-8 h-px bg-linear-to-r from-transparent via-(--border-color) to-transparent" />

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3, duration: 0.4, ease: "easeOut" }}
                  className="p-6 relative z-10"
                >
                  <Button 
                    href="/visualizer" 
                    onClick={() => setIsMobileMenuOpen(false)} 
                    variant="primary" 
                    accent="primary"
                    triggerLoader={true}
                    className="w-full justify-center"
                  >
                    Launch Visualizer
                  </Button>
                </motion.div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
