"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import SectionEyebrow from "./ui/SectionEyebrow";

const features = [
  {
    id: "01",
    title: "Hotspot Detection",
    desc: "Pinpoint performance bottlenecks. The engine profiles execution time per-line, instantly highlighting the most expensive operations in your algorithm.",
  },
  {
    id: "02",
    title: "Observed Behavior",
    desc: "Move beyond simple step-throughs. CodeScope automatically identifies recursive patterns, in-place mutations, and deep iterations.",
  },
  {
    id: "03",
    title: "Memory Insights",
    desc: "Track the invisible. Monitor peak stack depth and dynamic heap allocations in real-time as your data structures evolve.",
  }
];

const HotspotPanel = ({ isActive }) => (
  <motion.div 
    animate={{ 
      y: isActive ? 0 : -20, 
      scale: isActive ? 1 : 0.95, 
      opacity: isActive ? 1 : 0.4,
      zIndex: isActive ? 30 : 10
    }}
    transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
    className="absolute top-[10%] right-[5%] w-[80%] bg-(--bg-surface) border border-(--border-color) rounded-xl p-6 md:p-8 shadow-2xl"
  >
     <div className="flex justify-between items-center mb-8">
        <span className="text-[10px] uppercase font-mono text-(--text-muted) tracking-[0.2em]">Execution Hotspots</span>
        <span className="text-[10px] font-mono text-(--accent-primary)">4,210 Ops</span>
     </div>
     <div className="flex flex-col gap-5">
        {[
          { line: "L14", func: "partition()", pct: 45 },
          { line: "L21", func: "swap()", pct: 30 },
          { line: "L09", func: "quickSort()", pct: 12 },
        ].map(item => (
          <div key={item.line} className="flex flex-col gap-2">
             <div className="flex justify-between text-[11px] font-mono">
                <span className="text-(--text-secondary)">{item.line} <span className="text-foreground ml-2">{item.func}</span></span>
                <span className="text-(--accent-primary)">{item.pct}%</span>
             </div>
             <div className="h-1.5 w-full bg-(--bg-elevated) rounded-full overflow-hidden">
                <motion.div 
                   initial={{ width: 0 }} 
                   animate={{ width: isActive ? `${item.pct}%` : 0 }} 
                   transition={{ duration: 1, delay: isActive ? 0.2 : 0, ease: "easeOut" }}
                   className="h-full bg-(--accent-primary)" 
                />
             </div>
          </div>
        ))}
     </div>
  </motion.div>
);

const BehaviorPanel = ({ isActive }) => (
  <motion.div 
    animate={{ 
      y: isActive ? 0 : 20, 
      x: isActive ? 0 : -20,
      scale: isActive ? 1 : 0.95, 
      opacity: isActive ? 1 : 0.4,
      zIndex: isActive ? 30 : 20
    }}
    transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
    className="absolute bottom-[10%] left-0 w-[75%] bg-background border border-(--border-color) rounded-xl p-6 md:p-8 shadow-2xl backdrop-blur-xl flex flex-col"
  >
     <div className="flex justify-between items-center mb-6 pb-4 border-b border-(--border-color)">
        <span className="text-[10px] uppercase font-mono text-(--text-muted) tracking-[0.2em]">Semantic Analysis</span>
        <div className="flex gap-1.5">
           <div className="w-1.5 h-1.5 rounded-full bg-(--text-muted)" />
           <div className="w-1.5 h-1.5 rounded-full bg-(--text-muted)" />
        </div>
     </div>
     <div className="flex flex-col gap-3">
        <div className="flex items-center gap-4 px-4 py-3 rounded-lg bg-(--bg-surface) border border-(--border-color)">
           <div className="w-2 h-2 rounded-full bg-(--accent-secondary)" />
           <span className="text-[12px] font-mono text-foreground">Recursion Pattern Detected</span>
        </div>
        <div className="flex items-center gap-4 px-4 py-3 rounded-lg bg-(--bg-surface) border border-(--border-color)">
           <div className="w-2 h-2 rounded-full bg-(--accent-highlight)" />
           <span className="text-[12px] font-mono text-foreground">In-Place Array Mutation</span>
        </div>
        <div className="flex items-center gap-4 px-4 py-3 rounded-lg bg-transparent border border-(--border-color) opacity-50">
           <div className="w-2 h-2 rounded-full bg-(--text-muted)" />
           <span className="text-[12px] font-mono text-(--text-secondary)">Divide & Conquer Characteristic</span>
        </div>
     </div>
  </motion.div>
);

const MemoryPanel = ({ isActive }) => (
  <motion.div 
    animate={{ 
      y: isActive ? 0 : 30, 
      x: isActive ? 0 : 30,
      scale: isActive ? 1 : 0.9, 
      opacity: isActive ? 1 : 0.3,
      zIndex: isActive ? 30 : 15
    }}
    transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
    className="absolute top-1/2 -translate-y-1/2 right-[-5%] w-[55%] aspect-square bg-(--bg-elevated) border border-(--border-color) rounded-full p-8 shadow-2xl flex flex-col justify-center items-center text-center backdrop-blur-md"
  >
     <motion.div 
        animate={{ rotate: isActive ? 0 : -45 }} 
        transition={{ duration: 1.5, ease: "easeOut" }}
        className="absolute inset-2 border border-dashed border-(--text-muted)/30 rounded-full" 
     />
     <span className="text-[10px] uppercase font-mono text-(--text-muted) tracking-[0.2em] mb-3">Peak Stack</span>
     <span className="text-6xl font-display text-foreground mb-6">12<span className="text-2xl text-(--text-muted) ml-1 italic font-serif">fr</span></span>
     
     <span className="text-[10px] uppercase font-mono text-(--text-muted) tracking-[0.2em] mb-2">Allocation</span>
     <span className="text-[13px] font-mono text-(--accent-highlight)">O(1) Auxiliary</span>
  </motion.div>
);

export default function ExecutionIntelligenceShowcase() {
  const [activeId, setActiveId] = useState("01");

  return (
    <section className="relative py-24 md:py-32 bg-background overflow-hidden border-t border-(--border-color)">
      <div className="absolute top-1/3 left-0 w-[800px] h-[800px] bg-linear-to-br from-(--accent-highlight)/5 via-(--accent-highlight)/5 to-transparent blur-[120px] rounded-full pointer-events-none mix-blend-screen opacity-20" />
      <div className="absolute bottom-[0%] right-[-10%] w-[600px] h-[600px] bg-linear-to-tl from-(--accent-highlight)/10 to-transparent blur-[100px] rounded-full pointer-events-none mix-blend-screen opacity-20" />

      <div className="max-w-[1400px] mx-auto px-6 md:px-12 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 lg:gap-24 items-center">
          
          <div className="col-span-1 lg:col-span-5 flex flex-col">
            <SectionEyebrow title="Execution Intelligence" phase="SYS.ANALYSIS" accentClass="text-[var(--accent-highlight)]" />

            <motion.h2
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="text-4xl md:text-5xl lg:text-[3.5rem] font-display font-medium leading-[1.05] tracking-tight mb-6 text-foreground"
            >
              Beyond execution.<br />
              <span className="font-serif italic font-light text-(--accent-highlight) tracking-normal">Into understanding.</span>
            </motion.h2>

            <motion.p
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="text-(--text-secondary) text-lg leading-relaxed max-w-lg mb-16 font-light"
            >
              Most tools only show what happened. The platform analyzes execution traces to extract <span className="font-serif italic text-foreground">observed behavior</span> and <span className="font-serif italic text-foreground">actual performance characteristics</span>.
            </motion.p>

            <div className="flex flex-col">
              {features.map((feat) => (
                <div 
                  key={feat.id}
                  onMouseEnter={() => setActiveId(feat.id)}
                  className={`group relative flex gap-6 p-6 border-l-2 cursor-pointer transition-all duration-500 ${activeId === feat.id ? 'border-(--accent-primary) bg-(--bg-surface)' : 'border-(--border-color) hover:border-(--text-muted) hover:bg-(--bg-surface)/50'}`}
                >
                  <span className={`text-[11px] font-mono transition-colors duration-500 mt-1 ${activeId === feat.id ? 'text-(--accent-primary)' : 'text-(--text-muted)'}`}>
                    {feat.id}
                  </span>
                  <div className="flex flex-col w-full">
                    <h5 className={`text-[15px] font-medium mb-2 transition-colors duration-500 ${activeId === feat.id ? 'text-foreground' : 'text-(--text-secondary)'}`}>
                      {feat.title}
                    </h5>
                    <div className={`grid transition-[grid-template-rows,opacity] duration-500 ${activeId === feat.id ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`}>
                       <div className="overflow-hidden">
                         <p className="text-(--text-muted) text-[13px] leading-relaxed font-light mt-1">
                           {feat.desc}
                         </p>
                       </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="col-span-1 lg:col-span-7 relative h-[500px] md:h-[600px] flex items-center justify-center">
             <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] md:w-[500px] h-[300px] md:h-[500px] bg-linear-to-br from-(--accent-primary)/10 via-(--accent-secondary)/5 to-transparent blur-[100px] rounded-full pointer-events-none mix-blend-screen opacity-50" />

             <div className="relative w-full max-w-[600px] h-full">
                <HotspotPanel isActive={activeId === "01"} />
                <BehaviorPanel isActive={activeId === "02"} />
                <MemoryPanel isActive={activeId === "03"} />
             </div>
          </div>

        </div>
      </div>
    </section>
  );
}