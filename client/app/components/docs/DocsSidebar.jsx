"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { DOCS_NAVIGATION } from "@/app/lib/docs-data";
import { useState, useEffect, useMemo } from "react";

const EASE = [0.16, 1, 0.3, 1];

const itemVariants = {
  hidden: { opacity: 0, x: -6 },
  visible: (i) => ({
    opacity: 1,
    x: 0,
    transition: { duration: 0.4, ease: EASE, delay: i * 0.03 },
  }),
};

function hexTag(category, slug, index) {
  const seed = `${category}:${slug}`;
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = (hash * 31 + seed.charCodeAt(i)) >>> 0;
  }
  return (hash % 0xfff).toString(16).padStart(3, "0").toUpperCase();
}

export default function DocsSidebar() {
  const pathname = usePathname();
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isDesktopOpen, setIsDesktopOpen] = useState(true);

  const [expandedSections, setExpandedSections] = useState(() => {
    const initialState = {};
    DOCS_NAVIGATION.forEach((section) => {
      initialState[section.category] = true;
    });
    return initialState;
  });

  const toggleSection = (category) => {
    setExpandedSections((prev) => ({
      ...prev,
      [category]: !prev[category],
    }));
  };

  useEffect(() => {
    setIsMobileOpen(false);
  }, [pathname]);

  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === "Escape") setIsMobileOpen(false);
    };
    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, []);

  const flatItems = useMemo(() => {
    let i = 0;
    const map = new Map();
    DOCS_NAVIGATION.forEach((section) => {
      section.items.forEach((item) => {
        map.set(`${section.category}:${item.slug}`, i++);
      });
    });
    return map;
  }, []);

  const activeSlug = pathname?.startsWith("/docs/")
    ? pathname.replace("/docs/", "")
    : pathname === "/docs"
    ? "home"
    : null;

  const SidebarContent = (
    <nav className="flex flex-col pb-24 w-72">
      {/* Index Zero / Home */}
      <motion.div custom={0} variants={itemVariants} initial="hidden" animate="visible" className="mb-12">
        <Link
          href="/docs"
          className="group relative flex items-center justify-between py-4 px-6 border-y border-transparent hover:border-(--border-color) transition-colors duration-500"
        >
          <span className={`text-sm tracking-wide font-ui ${pathname === "/docs" ? "text-foreground" : "text-(--text-secondary) group-hover:text-foreground"} transition-colors duration-300`}>
            System Overview
          </span>
          <span className="font-mono text-[10px] text-(--accent-primary)/50 group-hover:text-(--accent-primary) transition-colors duration-300">
            0x000
          </span>
        </Link>
      </motion.div>

      <div className="flex flex-col gap-10">
        {DOCS_NAVIGATION.map((section, idx) => (
          <motion.div
            key={section.category}
            custom={idx + 1}
            variants={itemVariants}
            initial="hidden"
            animate="visible"
            className="flex flex-col"
          >
            {/* Category Header (Architectural Separator) */}
            <button
              onClick={() => toggleSection(section.category)}
              className="group flex items-center gap-4 px-6 mb-4 w-full text-left outline-none cursor-pointer"
            >
              <span className="font-mono text-[10px] text-(--accent-primary) transition-colors">
                {String(idx + 1).padStart(2, '0')}
              </span>
              <h3 className="font-mono text-[10px] tracking-[0.25em] text-(--text-muted) uppercase transition-colors group-hover:text-foreground">
                {section.category}
              </h3>
              <div className="flex-1 h-px bg-(--border-color) group-hover:bg-(--text-muted) transition-colors duration-500" />
            </button>

            <AnimatePresence initial={false}>
              {expandedSections[section.category] && (
                <motion.div
                  key="content"
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.4, ease: EASE }}
                  className="overflow-hidden flex flex-col"
                >
                  {section.items.map((item) => {
                    const href = `/docs/${item.slug}`;
                    const isActive = pathname === href;
                    const flatIndex = flatItems.get(`${section.category}:${item.slug}`) ?? 0;
                    const tag = hexTag(section.category, item.slug, flatIndex);

                    return (
                      <Link
                        key={item.slug}
                        href={href}
                        className="group relative flex items-center justify-between py-3 px-6 overflow-hidden outline-none"
                      >
                        {/* Hover Architecture */}
                        <div className="absolute inset-0 bg-(--bg-elevated) transform -translate-x-full group-hover:translate-x-0 transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]" />
                        
                        {/* Active Edge Block */}
                        {isActive && (
                          <motion.div 
                            layoutId="activeEdge"
                            className="absolute left-0 top-0 bottom-0 w-1 bg-(--accent-primary)"
                            transition={{ type: "spring", stiffness: 300, damping: 30 }}
                          />
                        )}

                        <div className="relative flex items-center gap-4 z-10">
                          {/* Crosshair bullet for active state */}
                          <div className={`w-3 h-3 flex items-center justify-center transition-opacity duration-300 ${isActive ? 'opacity-100' : 'opacity-0 group-hover:opacity-30'}`}>
                            <div className="w-full h-px bg-(--accent-primary) absolute" />
                            <div className="h-full w-px bg-(--accent-primary) absolute" />
                          </div>
                          
                          <span
                            className={`text-sm font-ui tracking-wide transform group-hover:translate-x-1 transition-all duration-300 ${
                              isActive
                                ? "text-foreground"
                                : "text-(--text-secondary) group-hover:text-foreground"
                            }`}
                          >
                            {item.name}
                          </span>
                        </div>

                        <span
                          className={`relative z-10 font-mono text-[10px] tracking-widest transition-colors duration-300 ${
                            isActive
                              ? "text-(--accent-primary)"
                              : "text-(--text-muted) group-hover:text-(--accent-primary)/70"
                          }`}
                        >
                          0x{tag}
                        </span>
                      </Link>
                    );
                  })}
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        ))}
      </div>
    </nav>
  );

  return (
    <>
      {/* Mobile Toggle */}
      <div className="lg:hidden fixed top-4 right-4 z-50">
        <button
          onClick={() => setIsMobileOpen(!isMobileOpen)}
          className="px-4 py-2 bg-background border border-(--border-color) text-(--text-secondary) hover:text-foreground transition-colors cursor-pointer"
        >
          <span className="font-mono text-[10px] tracking-widest uppercase">
            {isMobileOpen ? "[ Close ]" : "[ Menu ]"}
          </span>
        </button>
      </div>

      <motion.aside
        initial={false}
        animate={{ width: isDesktopOpen ? 288 : 80 }}
        transition={{ duration: 0.5, ease: EASE }}
        className="hidden lg:flex flex-col shrink-0 h-screen sticky top-0 bg-background border-r border-(--border-color) overflow-hidden"
      >
        {/* Architectural Header */}
        <div className="flex items-center justify-between p-6 h-24 shrink-0 bg-background relative z-20">
          <AnimatePresence initial={false} mode="wait">
            {isDesktopOpen ? (
              <motion.div
                key="expanded-header"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="flex items-center justify-between w-full"
              >
                <div className="flex items-center gap-4">
                  <img src="/codescopelogo.png" alt="Logo" className="w-7 h-7 object-contain invert opacity-90 hover:opacity-100 transition-opacity" />
                  <span className="font-mono text-[11px] uppercase tracking-[0.25em] text-foreground">
                    CodeScope
                  </span>
                </div>
                <button
                  onClick={() => setIsDesktopOpen(false)}
                  className="group relative w-8 h-8 flex items-center justify-center border border-transparent hover:border-(--accent-primary)/30 bg-transparent hover:bg-(--bg-elevated) transition-all duration-500 cursor-pointer overflow-hidden"
                >
                  {/* Sliding wash background */}
                  <div className="absolute inset-0 bg-(--accent-primary)/5 origin-right scale-x-0 group-hover:scale-x-100 transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]" />
                  
                  {/* Dynamic Chevron + Tail */}
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="relative z-10 text-(--text-muted) group-hover:text-(--accent-primary) transition-colors duration-300">
                    <path d="M15 18l-6-6 6-6" strokeLinecap="square" className="transform transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:-translate-x-1" />
                    <path d="M22 12H9" strokeLinecap="square" className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 delay-75" />
                  </svg>
                </button>
              </motion.div>
            ) : (
              <motion.button
                key="collapsed-header"
                onClick={() => setIsDesktopOpen(true)}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="relative w-full flex items-center justify-center h-full cursor-pointer group"
              >
                {/* Default State: Perfect Logo */}
                <div className="absolute inset-0 flex items-center justify-center transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] opacity-100 group-hover:opacity-0 group-hover:scale-75">
                  <img src="/codescopelogo.png" alt="Logo" className="w-7 h-7 object-contain invert opacity-90" />
                </div>

                {/* Hover State: Architectural Expand Button Overlay */}
                <div className="absolute inset-0 flex items-center justify-center transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] opacity-0 scale-125 group-hover:opacity-100 group-hover:scale-100">
                  <div className="w-10 h-10 border border-(--accent-primary)/30 bg-(--bg-elevated) flex items-center justify-center overflow-hidden relative shadow-[0_0_20px_rgba(211,123,80,0.15)]">
                    {/* Sliding wash background */}
                    <div className="absolute inset-0 bg-(--accent-primary)/10 origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] delay-75" />
                    
                    {/* Dynamic Chevron + Tail */}
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="relative z-10 text-(--accent-primary)">
                      <path d="M9 18l6-6-6-6" strokeLinecap="square" className="transform transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:translate-x-1 delay-75" />
                      <path d="M2 12h13" strokeLinecap="square" className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 delay-150" />
                    </svg>
                  </div>
                </div>
              </motion.button>
            )}
          </AnimatePresence>
        </div>

        {/* Scrollable Nav Area */}
        <div className="flex-1 overflow-y-auto custom-scrollbar relative z-10 pt-8">
          <AnimatePresence initial={false} mode="wait">
            {isDesktopOpen ? (
              <motion.div
                key="content"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.35, ease: EASE }}
                className="absolute top-0 left-0 w-72 pt-8"
              >
                {SidebarContent}
              </motion.div>
            ) : (
              <motion.div
                key="collapsed"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="flex flex-col items-center py-8 h-full gap-4"
              >
                {/* Micro-architectural indicators */}
                <div className="w-px h-12 bg-linear-to-b from-transparent via-(--border-color) to-transparent mb-4" />
                
                {Array.from(flatItems.entries()).map(([key, idx]) => {
                  const slug = key.split(":")[1];
                  const isActive = activeSlug === slug;
                  return (
                    <div
                      key={key}
                      className={`relative flex items-center justify-center w-8 h-8 transition-all duration-300 ${
                        isActive ? "opacity-100" : "opacity-30"
                      }`}
                    >
                      {isActive && <div className="absolute inset-0 border border-(--accent-primary)/30 rotate-45" />}
                      <span
                        className={`block transition-all duration-300 ${
                          isActive
                            ? "w-2 h-2 bg-(--accent-primary) shadow-[0_0_10px_rgba(232,164,74,0.5)]"
                            : "w-1 h-1 bg-(--text-muted)"
                        }`}
                      />
                    </div>
                  );
                })}
                
                <div className="w-px h-12 bg-linear-to-b from-transparent via-(--border-color) to-transparent mt-4" />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.aside>

      <AnimatePresence>
        {isMobileOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-background/90 backdrop-blur-md z-40 lg:hidden"
            onClick={() => setIsMobileOpen(false)}
          >
            <motion.aside
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="absolute top-0 left-0 bottom-0 w-[85vw] max-w-sm bg-background border-r border-(--border-color) overflow-y-auto shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6 border-b border-(--border-color) mb-8">
                <span className="font-mono text-[11px] uppercase tracking-[0.25em] text-foreground">
                  CodeScope Directory
                </span>
              </div>
              {SidebarContent}
            </motion.aside>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}