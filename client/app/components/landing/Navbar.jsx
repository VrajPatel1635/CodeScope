"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import Button from "@/app/components/landing/ui/Button";

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [activeLink, setActiveLink] = useState(null);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navLinks = [
    { label: "Features", href: "#features" },
    { label: "Docs", href: "#docs" },
    { label: "Roadmap", href: "#roadmap" },
    { label: "FAQ", href: "#faq" },
  ];

  return (
    <>
      <header className="fixed top-0 inset-x-0 z-50 pointer-events-none flex justify-center pt-4 md:pt-6 px-4 md:px-8">
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          className={`
            pointer-events-auto relative flex items-center justify-between
            w-full transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)]
            ${isScrolled
              ? "max-w-[1200px] px-4 py-3 rounded-[24px] bg-[#090A0B]/80 backdrop-blur-2xl border border-white/10 shadow-[0_20px_40px_-10px_rgba(0,0,0,0.8),0_0_0_1px_rgba(255,255,255,0.05)_inset]"
              : "max-w-7xl px-4 md:px-5 py-4 rounded-3xl bg-transparent border border-transparent shadow-none"
            }
          `}
        >
          <div className={`absolute inset-x-6 top-0 h-px transition-all duration-700 ease-out ${isScrolled ? 'bg-linear-to-r from-transparent via-white/30 to-transparent opacity-100 scale-100' : 'opacity-0 scale-75'}`} />
          <div className={`absolute inset-x-12 bottom-0 h-px transition-all duration-700 ease-out ${isScrolled ? 'bg-linear-to-r from-transparent via-white/10 to-transparent opacity-100 scale-100' : 'opacity-0 scale-75'}`} />

          <div className={`absolute inset-0 overflow-hidden rounded-[24px] transition-opacity duration-700 pointer-events-none ${isScrolled ? 'opacity-100' : 'opacity-0'}`}>
            <div className="absolute top-[-50%] left-[-10%] w-[40%] h-[200%] bg-(--accent-primary) blur-[100px] opacity-10 mix-blend-screen" />
            <div className="absolute top-[-50%] right-[-10%] w-[40%] h-[200%] bg-white blur-[100px] opacity-[0.02] mix-blend-screen" />
          </div>

          <div className="flex items-center gap-8 md:gap-14 relative z-50 shrink-0 pl-1 md:pl-2">
            <Link href="/" className="flex items-center gap-2.5 group cursor-pointer">
              <div className="relative flex items-center justify-center">
                <div className={`absolute inset-0 bg-(--accent-primary) blur-lg transition-opacity duration-700 rounded-full ${isScrolled ? 'opacity-20' : 'opacity-0'} group-hover:opacity-40`} />
                <img
                  src="/codescopelogo.png"
                  alt="CodeScope"
                  className={`object-contain relative z-10 transition-all duration-500 group-hover:scale-110 ${isScrolled ? 'w-6 h-6 md:w-7 md:h-7' : 'w-7 h-7 md:w-8 md:h-8'}`}
                />
              </div>
              <span className={`font-display font-medium tracking-tight text-white/90 group-hover:text-white transition-all duration-500 ${isScrolled ? 'text-[15px] md:text-base' : 'text-base md:text-[17px]'}`}>
                CodeScope
              </span>
            </Link>

            <nav className="hidden md:flex items-center gap-1.5 transition-all duration-700" onMouseLeave={() => setActiveLink(null)}>
              {navLinks.map((item) => (
                <a
                  key={item.label}
                  href={item.href}
                  onMouseEnter={() => setActiveLink(item.label)}
                  className={`cursor-pointer relative px-3 py-1.5 text-[12px] uppercase tracking-wider font-medium transition-colors duration-300 rounded-[12px] z-10
                    ${activeLink === item.label ? 'text-white' : 'text-white/40 hover:text-white/80'}`}
                >
                  {activeLink === item.label && (
                    <motion.span
                      layoutId="nav-hover-desktop"
                      className="absolute inset-0 bg-white/5 rounded-[12px] border border-white/5"
                      transition={{ type: "spring", bounce: 0.2, duration: 0.5 }}
                    >
                      <span className="absolute inset-x-3 -bottom-px h-px bg-linear-to-r from-transparent via-white/30 to-transparent" />
                    </motion.span>
                  )}
                  <span className="relative z-10">{item.label}</span>
                </a>
              ))}
            </nav>
          </div>

          <div className="hidden md:flex items-center relative z-50 shrink-0 pr-1">
            <div className={`transition-transform duration-700 ease-out ${isScrolled ? 'scale-95' : 'scale-100'}`}>
              <Button href="/visualizer" variant="primary" accent="primary" className="cursor-pointer">
                Launch Visualizer
              </Button>
            </div>
          </div>

          <button
            className={`cursor-pointer md:hidden relative z-50 w-10 h-10 flex items-center justify-center rounded-[14px] border transition-all duration-500 active:scale-95
              ${isScrolled
                ? 'bg-white/5 border-white/10 text-white/80 hover:text-white hover:bg-white/10'
                : 'bg-white/3 border-white/5 text-white/60 hover:text-white hover:bg-white/5'
              }
            `}
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label="Toggle Navigation"
          >
            <div className="w-4 h-3.5 flex flex-col justify-between">
              <span className={`block h-[1.5px] w-full bg-current rounded-full transform transition-all duration-300 origin-center ${isMobileMenuOpen ? "rotate-45 translate-y-[5px]" : ""}`} />
              <span className={`block h-[1.5px] w-full bg-current rounded-full transition-all duration-300 ${isMobileMenuOpen ? "opacity-0 scale-x-0" : ""}`} />
              <span className={`block h-[1.5px] w-full bg-current rounded-full transform transition-all duration-300 origin-center ${isMobileMenuOpen ? "-rotate-45 translate-y-[-5px]" : ""}`} />
            </div>
          </button>
        </motion.div>
      </header>

      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
              className="fixed inset-0 bg-[#090A0B]/80 backdrop-blur-md z-40 md:hidden"
              onClick={() => setIsMobileMenuOpen(false)}
            />

            <motion.div
              initial={{ y: "100%", opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: "100%", opacity: 0 }}
              transition={{ type: "spring", bounce: 0, duration: 0.6 }}
              className="fixed bottom-0 left-0 right-0 z-40 md:hidden"
            >
              <div className="relative bg-[#090A0B]/95 backdrop-blur-3xl border-t border-white/10 rounded-t-[32px] shadow-[0_-20px_60px_rgba(0,0,0,0.8)] overflow-hidden">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[200px] bg-(--accent-primary) blur-[120px] opacity-10 pointer-events-none" />

                <div className="flex justify-center pt-4 pb-2">
                  <div className="w-12 h-1.5 rounded-full bg-white/10" />
                </div>

                <div className="px-6 pt-4 pb-6 flex flex-col gap-2 relative z-10">
                  {navLinks.map((item, i) => (
                    <motion.a
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.1 + i * 0.05, duration: 0.4, ease: "easeOut" }}
                      key={item.label}
                      href={item.href}
                      className="cursor-pointer flex items-center justify-between px-5 py-4 rounded-[20px] text-[13px] uppercase tracking-widest font-medium text-white/50 hover:text-white hover:bg-white/5 border border-transparent hover:border-white/5 transition-all duration-300 group"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      <span>{item.label}</span>
                      <svg className="w-4 h-4 text-white/20 group-hover:text-white/50 group-hover:translate-x-1 transition-all duration-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                      </svg>
                    </motion.a>
                  ))}
                </div>

                <div className="mx-8 h-px bg-linear-to-r from-transparent via-white/10 to-transparent" />

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3, duration: 0.4, ease: "easeOut" }}
                  className="p-6 relative z-10"
                >
                  <Button href="/visualizer" onClick={() => setIsMobileMenuOpen(false)} variant="primary" accent="primary" className="cursor-pointer w-full justify-center py-4">
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
