"use client";

import React from "react";
import { motion } from "framer-motion";

export default function PhilosophyQuoteSection() {
  return (
    <section className="relative w-full py-40 md:py-64 bg-background flex flex-col items-center justify-center overflow-hidden border-t border-white/2">
      
      {/* Extremely subtle atmospheric background */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full max-w-[800px] bg-white/2 blur-[120px] rounded-full pointer-events-none z-0" />

      <div className="relative z-10 w-full max-w-5xl mx-auto px-6 text-center flex flex-col items-center">
        
        {/* Pre-title */}
        <motion.div 
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 1.5 }}
          className="flex items-center gap-6 mb-16 opacity-60"
        >
          <div className="h-px w-12 bg-white/20" />
          <span className="text-[9px] text-white/50 uppercase tracking-[0.5em] font-sans font-medium">
            Philosophy
          </span>
          <div className="h-px w-12 bg-white/20" />
        </motion.div>

        {/* The Quote */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 1.2, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
          className="flex flex-col gap-6 md:gap-8"
        >
          <h2 className="text-4xl sm:text-6xl md:text-7xl lg:text-[6rem] font-serif italic font-light text-white leading-[1.1] tracking-tight">
            Execution is the truth of code.
          </h2>
          <p className="text-2xl sm:text-4xl md:text-5xl lg:text-6xl font-serif italic font-light text-white/30 leading-[1.1] tracking-tight">
            Everything else is an approximation.
          </p>
        </motion.div>

      </div>
    </section>
  );
}