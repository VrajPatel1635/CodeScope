"use client";

import React from "react";
import { motion } from "framer-motion";
import Button from "@/app/components/landing/ui/Button";

export default function CTASection() {
  return (
    <section className="relative py-32 md:py-40 bg-background overflow-hidden flex flex-col items-center justify-center text-center border-t border-white/2">
      
      {/* Background Ambience (Reduced) */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-(--exec-active) blur-[150px] opacity-[0.02] rounded-full pointer-events-none" />
      
      {/* Faint moving typography texture in background */}
      <div className="absolute inset-0 flex items-center justify-center opacity-[0.015] pointer-events-none overflow-hidden select-none">
         <motion.div 
           animate={{ x: ["0%", "-50%"] }} 
           transition={{ duration: 100, repeat: Infinity, ease: "linear" }}
           className="whitespace-nowrap font-display font-bold text-[20rem] leading-none"
         >
            EXECUTION TRUTH EXECUTION TRUTH
         </motion.div>
      </div>

      <div className="max-w-4xl mx-auto px-6 relative z-10 flex flex-col items-center w-full">
        
        <motion.h2 
           initial={{ opacity: 0, y: 30 }}
           whileInView={{ opacity: 1, y: 0 }}
           viewport={{ once: true }}
           transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
           className="text-5xl sm:text-6xl md:text-7xl lg:text-[6.5rem] leading-[1.05] tracking-tight font-display font-medium text-white mb-10"
        >
           <span className="text-white">Understanding begins</span><br />
           <span className="text-white/40">when execution becomes</span><br />
           <span className="font-serif italic font-light text-(--accent-primary) tracking-normal pr-4">visible.</span>
        </motion.h2>

        <motion.div
           initial={{ opacity: 0, y: 20 }}
           whileInView={{ opacity: 1, y: 0 }}
           viewport={{ once: true }}
           transition={{ duration: 0.9, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
           className="flex flex-col items-center gap-2 mb-16"
        >
           <p className="text-lg md:text-xl text-white/50 font-light">Run real Java code.</p>
           <p className="text-lg md:text-xl text-white/50 font-light">Visualize every step.</p>
           <p className="text-lg md:text-xl text-white/50 font-light">Understand every decision.</p>
        </motion.div>

        <motion.div
           initial={{ opacity: 0, y: 20 }}
           whileInView={{ opacity: 1, y: 0 }}
           viewport={{ once: true }}
           transition={{ duration: 0.9, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
           className="flex flex-col sm:flex-row items-center justify-center gap-6 w-full sm:w-auto"
        >
           <Button href="/visualizer" variant="primary" accent="primary" className="w-full sm:w-auto" icon={<svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>}>
              Launch Visualizer
           </Button>
           <Button variant="secondary" accent="primary" className="w-full sm:w-auto">
              View Documentation
           </Button>
        </motion.div>

      </div>
    </section>
  );
}
