"use client";

import React, { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";

export default function PhilosophyQuoteSection() {
  const containerRef = useRef(null);
  
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"]
  });

  const x1 = useTransform(scrollYProgress, [0, 1], ["0%", "-5%"]);
  const x2 = useTransform(scrollYProgress, [0, 1], ["-5%", "0%"]);
  const x3 = useTransform(scrollYProgress, [0, 1], ["0%", "-8%"]);

  const transforms = [x1, x2, x3];

  const rows = [
    ["ARRAYS", "TREES", "GRAPHS", "POINTERS", "ARRAYS", "TREES", "GRAPHS", "POINTERS"],
    ["EXECUTION", "RECURSION", "HASHMAPS", "TIMELINES", "EXECUTION", "RECURSION", "HASHMAPS"],
    ["DIAGNOSTICS", "HOTSPOTS", "STATE", "VARIABLES", "DIAGNOSTICS", "HOTSPOTS", "STATE"],
  ];

  return (
    <section 
      ref={containerRef}
      className="relative w-full py-24 md:py-32 bg-background overflow-hidden flex items-center justify-center"
    >
      <div 
        className="absolute inset-0 flex flex-col justify-center gap-6 md:gap-10 opacity-[0.04] pointer-events-none select-none z-0"
        style={{ 
          WebkitMaskImage: "radial-gradient(ellipse at center, black 30%, transparent 70%)",
          maskImage: "radial-gradient(ellipse at center, black 30%, transparent 70%)"
        }}
      >
        {rows.map((row, i) => (
          <motion.div 
            key={i}
            style={{ x: transforms[i] }}
            className="flex items-center gap-8 md:gap-16 whitespace-nowrap"
          >
            {row.map((word, j) => (
              <span 
                key={j} 
                className="text-4xl md:text-6xl font-display font-bold uppercase tracking-widest text-white"
              >
                {word}
              </span>
            ))}
          </motion.div>
        ))}
      </div>

      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80vw] max-w-[600px] h-[300px] bg-white/5 blur-[100px] rounded-full pointer-events-none z-0 opacity-40" />

      <div className="relative z-10 w-full max-w-3xl mx-auto px-6">
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
          className="relative rounded-2xl md:rounded-4xl border border-white/5 bg-[#090A0F]/80 backdrop-blur-3xl px-8 py-12 md:px-16 md:py-16 shadow-[0_40px_100px_-20px_rgba(255,255,255,0.05)] overflow-hidden group text-center"
        >
          {/* Subtle top edge glow */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-2/3 h-px bg-linear-to-r from-transparent via-white/20 to-transparent opacity-50 group-hover:opacity-100 transition-opacity duration-700" />
          <div className="absolute inset-0 bg-linear-to-b from-white/2 to-transparent pointer-events-none" />

          <h2 className="relative z-10 text-3xl sm:text-4xl md:text-5xl leading-[1.4] md:leading-[1.4] font-display font-light tracking-tight text-center">
            <span className="text-white/50">Execution is the</span>{" "}
            <span className="font-medium text-white">truth of code.</span>
            <br className="hidden md:block" />
            <span className="text-white/50 md:ml-3">Everything else is</span>{" "}
            <span className="font-serif italic font-light text-white tracking-normal">
              an approximation.
            </span>
          </h2>

          <div className="relative z-10 flex items-center justify-center gap-4 mt-12 opacity-80">
            <div className="h-px w-8 md:w-12 bg-white/10" />
            <span className="text-[9px] text-white/40 uppercase tracking-[0.3em] font-medium font-sans">
              Codescope Design Principle
            </span>
            <div className="h-px w-8 md:w-12 bg-white/10" />
          </div>
        </motion.div>
      </div>
    </section>
  );
}