"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import Button from "@/app/components/landing/ui/Button";

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navLinks = ["Features", "Docs", "Roadmap", "FAQ"];

  return (
    <>
      <header
        className={`fixed top-0 inset-x-0 z-50 transition-all duration-300 ${
          isScrolled
            ? "bg-[#0E0F11]/80 backdrop-blur-md border-b border-[#2A2D3E] py-4 shadow-sm"
            : "bg-transparent border-b border-transparent py-6"
        }`}
      >
        <div className="max-w-7xl mx-auto px-6 md:px-12 flex items-center justify-between">
          
          {/* Logo */}
          <div className="flex items-center gap-3 relative z-50">
            <img 
              src="/codescopelogo.png" 
              alt="DSA Visualizer Logo" 
              className="w-7 h-7 object-contain"
            />
            <span className="font-(family-name:--font-ui) text-lg font-medium tracking-tight text-[#F0F1F3]">
              DSA Visualizer
            </span>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-10 absolute left-1/2 -translate-x-1/2">
            {navLinks.map((item) => (
              <a
                key={item}
                href={`#${item.toLowerCase()}`}
                className="group relative text-[0.9rem] font-medium text-[#A8AABB] hover:text-[#F0F1F3] transition-colors"
              >
                {item}
                <span className="absolute -bottom-1.5 left-0 w-0 h-[2px] bg-[#E8A44A] transition-all duration-300 group-hover:w-full rounded-full opacity-0 group-hover:opacity-100"></span>
              </a>
            ))}
          </nav>

          {/* Desktop CTA */}
          <div className="hidden md:flex items-center relative z-50">
            <Button href="/visualizer" variant="primary" accent="primary">
              Launch Visualizer
            </Button>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden relative z-50 p-2 text-[#A8AABB] hover:text-[#F0F1F3] transition-colors"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label="Toggle Navigation"
          >
            <div className="w-5 h-4 flex flex-col justify-between">
              <span className={`block h-[2px] w-full bg-current transform transition-transform duration-300 ${isMobileMenuOpen ? "rotate-45 translate-y-[7px]" : ""}`} />
              <span className={`block h-[2px] w-full bg-current transition-opacity duration-300 ${isMobileMenuOpen ? "opacity-0" : ""}`} />
              <span className={`block h-[2px] w-full bg-current transform transition-transform duration-300 ${isMobileMenuOpen ? "-rotate-45 -translate-y-[7px]" : ""}`} />
            </div>
          </button>
        </div>
      </header>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 bg-[#0E0F11]/60 backdrop-blur-sm z-40 md:hidden"
              onClick={() => setIsMobileMenuOpen(false)}
            />
            
            {/* Drawer */}
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", bounce: 0, duration: 0.4 }}
              className="fixed top-0 right-0 h-full w-[280px] bg-[#161820] border-l border-[#2A2D3E] shadow-2xl z-40 md:hidden flex flex-col pt-24 px-6 pb-6"
            >
              <div className="flex flex-col gap-6 flex-1">
                {navLinks.map((item, i) => (
                  <motion.a
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 + i * 0.05 }}
                    key={item}
                    href={`#${item.toLowerCase()}`}
                    className="text-lg font-medium text-[#A8AABB] hover:text-[#F0F1F3] transition-colors"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    {item}
                  </motion.a>
                ))}
              </div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="pt-6 border-t border-[#2A2D3E]"
              >
                <Button href="/visualizer" onClick={() => setIsMobileMenuOpen(false)} variant="primary" accent="primary" className="w-full">
                  Launch Visualizer
                </Button>
              </motion.div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
