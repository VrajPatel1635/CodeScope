"use client";

import React from "react";
import { motion } from "framer-motion";

export default function SectionEyebrow({ 
  title, 
  phase, 
  accentClass = "text-(--accent-secondary)",
  align = "left"
}) {
  return (
    <div className={`flex items-start gap-4 mb-8 md:mb-10 group cursor-default ${accentClass} ${align === 'center' ? 'mx-auto w-fit' : ''}`}>
      {/* Calibration Crosshair */}
      <div className="relative shrink-0 flex items-center justify-center w-5 h-5 mt-0.5">
        <motion.div 
          initial={{ rotate: 0 }}
          whileInView={{ rotate: 90 }}
          transition={{ duration: 1.5, ease: [0.16, 1, 0.3, 1] }}
          viewport={{ once: true }}
          className="absolute inset-0 border border-current opacity-30 rounded-[1px] group-hover:scale-110 transition-transform duration-500"
        />
        <div className="absolute w-[140%] h-px bg-current opacity-40 group-hover:w-[180%] transition-all duration-500" />
        <div className="absolute h-[140%] w-px bg-current opacity-40 group-hover:h-[180%] transition-all duration-500" />
        <div className="relative z-10 w-1.5 h-1.5 bg-current shadow-[0_0_8px_currentColor]" />
        
        {/* Animated Corner Brackets */}
        <div className="absolute -top-1 -left-1 w-1.5 h-1.5 border-t border-l border-current opacity-0 group-hover:opacity-100 group-hover:-top-1.5 group-hover:-left-1.5 transition-all duration-500" />
        <div className="absolute -bottom-1 -right-1 w-1.5 h-1.5 border-b border-r border-current opacity-0 group-hover:opacity-100 group-hover:-bottom-1.5 group-hover:-right-1.5 transition-all duration-500" />
      </div>

      {/* Label Content */}
      <div className="flex flex-col">
        <div className="flex items-center gap-3 mb-1 overflow-hidden">
           <motion.span 
             initial={{ y: "100%" }}
             whileInView={{ y: 0 }}
             transition={{ duration: 0.5, ease: "easeOut" }}
             viewport={{ once: true }}
             className="text-[9px] font-mono text-(--text-muted) tracking-[0.3em] uppercase leading-none"
           >
             {phase || "SYS.MODULE"}
           </motion.span>
           <motion.div 
             initial={{ scaleX: 0 }}
             whileInView={{ scaleX: 1 }}
             transition={{ duration: 0.7, delay: 0.2, ease: "easeOut" }}
             viewport={{ once: true }}
             className="h-px w-8 bg-(--border-color) origin-left group-hover:w-12 group-hover:bg-current transition-all duration-500" 
           />
        </div>
        <div className="overflow-hidden pt-0.5">
          <motion.span 
            initial={{ y: "100%" }}
            whileInView={{ y: 0 }}
            transition={{ duration: 0.6, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
            viewport={{ once: true }}
            className="block text-[11px] md:text-xs font-mono uppercase tracking-[0.25em] font-medium leading-none"
          >
            {title}
          </motion.span>
        </div>
      </div>
    </div>
  );
}
