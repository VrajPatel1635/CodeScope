"use client";

import React from "react";
import { motion } from "framer-motion";

export default function ExecutionIntelligenceShowcase() {
  const highlights = [
    {
      title: "Hotspot Detection",
      desc: "Identify which lines consume the most execution time.",
      icon: (
        <svg className="w-3.5 h-3.5 text-(--accent-highlight)" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
          <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M9.879 16.121A3 3 0 1012.015 11L11 14H9c0 .768.293 1.536.879 2.121z" />
        </svg>
      )
    },
    {
      title: "Observed Behavior",
      desc: "Detect recursion, nested iterations, heavy allocations, and traversal patterns.",
      icon: (
        <svg className="w-3.5 h-3.5 text-(--accent-highlight)" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
        </svg>
      )
    },
    {
      title: "Execution Timeline",
      desc: "Understand where execution spends its time and transitions between phases.",
      icon: (
        <svg className="w-3.5 h-3.5 text-(--accent-highlight)" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      )
    },
    {
      title: "Memory Characteristics",
      desc: "See stack growth, peak depth, and dynamic allocation behavior.",
      icon: (
        <svg className="w-3.5 h-3.5 text-(--accent-highlight)" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
          <path strokeLinecap="round" strokeLinejoin="round" d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4" />
        </svg>
      )
    }
  ];

  return (
    <section className="relative py-20 md:py-24 bg-background overflow-hidden border-t border-white/2">
      {/* Premium Background Glows (Reduced) */}
      <div className="absolute top-1/3 left-0 w-[800px] h-[800px] bg-linear-to-br from-(--accent-highlight)/5 via-(--accent-highlight)/5 to-transparent blur-[120px] rounded-full pointer-events-none mix-blend-screen opacity-20" />
      <div className="absolute bottom-[0%] right-[-10%] w-[600px] h-[600px] bg-linear-to-tl from-(--accent-highlight)/10 to-transparent blur-[100px] rounded-full pointer-events-none mix-blend-screen opacity-20" />

      <div className="max-w-[1400px] mx-auto px-6 md:px-12 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 lg:gap-20 items-center">
          
          {/* Dashboard Preview (Left on Desktop, Bottom on Mobile) */}
          <div className="lg:col-span-7 order-2 lg:order-1 relative">
            <motion.div
              initial={{ opacity: 0, scale: 0.98, x: -30 }}
              whileInView={{ opacity: 1, scale: 1, x: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
              whileHover={{ y: -6, transition: { duration: 0.5, ease: "easeOut" } }}
              className="relative w-full rounded-3xl p-px bg-linear-to-b from-white/20 via-white/5 to-transparent shadow-[0_40px_100px_-20px_rgba(255,93,93,0.08)] group"
            >
              <div className="w-full rounded-3xl bg-[#090A0F] overflow-hidden flex flex-col font-sans relative z-10 backdrop-blur-3xl">
                
                {/* Header Chrome */}
                <div className="flex items-center justify-between px-5 py-3 border-b border-white/5 bg-white/2">
                  <div className="flex gap-2">
                    <div className="w-3 h-3 rounded-full bg-white/20 group-hover:bg-(--accent-highlight) transition-colors duration-300" />
                    <div className="w-3 h-3 rounded-full bg-white/20 group-hover:bg-(--accent-highlight) transition-colors duration-300" />
                    <div className="w-3 h-3 rounded-full bg-white/20 group-hover:bg-[#00D084] transition-colors duration-300" />
                  </div>
                  <div className="flex items-center gap-2 text-white/50 text-[11px] font-medium px-4 py-1.5 rounded-md bg-white/5 border border-white/5 shadow-inner uppercase tracking-widest">
                    <svg className="w-3.5 h-3.5 text-(--accent-highlight)" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                    <span>Intelligence</span>
                  </div>
                  <div className="w-12" /> {/* Spacer for centering */}
                </div>

                {/* Dashboard Content */}
                <div className="p-6 sm:p-8 flex flex-col gap-6 sm:gap-8 min-h-[460px] bg-linear-to-b from-transparent to-white/1">
                  
                  {/* Observed Behavior */}
                  <div className="flex flex-col gap-4">
                    <h4 className="text-[10px] text-white/30 uppercase tracking-[0.2em] font-medium">Observed Behavior</h4>
                    <div className="flex flex-wrap gap-3">
                      <div className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-(--accent-highlight)/30 bg-(--accent-highlight)/5 text-(--accent-highlight) text-[11px] font-medium tracking-wide shadow-[0_0_15px_rgba(79,140,255,0.1)]">
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="3"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                        Recursion Detected
                      </div>
                      <div className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-(--accent-highlight)/30 bg-(--accent-highlight)/5 text-(--accent-highlight) text-[11px] font-medium tracking-wide shadow-[0_0_15px_rgba(255,176,32,0.1)]">
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="3"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                        In-Place Processing
                      </div>
                      <div className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-(--accent-highlight)/30 bg-(--accent-highlight)/5 text-(--accent-highlight) text-[11px] font-medium tracking-wide shadow-[0_0_15px_rgba(255,93,93,0.1)]">
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="3"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                        Array Mutation Heavy
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 sm:gap-8">
                    {/* Hotspots */}
                    <div className="flex flex-col gap-4">
                      <h4 className="text-[10px] text-white/30 uppercase tracking-[0.2em] font-medium">Execution Hotspots</h4>
                      <div className="flex flex-col gap-3">
                        <div className="flex items-center justify-between group">
                          <div className="flex items-center gap-3">
                            <span className="w-6 text-center text-[10px] font-mono text-white/40 bg-white/5 rounded py-0.5">L14</span>
                            <span className="text-[13px] text-white/80 font-mono">partition()</span>
                          </div>
                          <div className="flex items-center gap-3">
                            <div className="w-16 h-1.5 bg-white/5 rounded-full overflow-hidden">
                              <div className="h-full bg-(--accent-highlight) w-[45%] shadow-[0_0_8px_var(--accent-highlight)]" />
                            </div>
                            <span className="text-[12px] text-(--accent-highlight) font-mono font-medium w-8 text-right">45%</span>
                          </div>
                        </div>
                        <div className="flex items-center justify-between group">
                          <div className="flex items-center gap-3">
                            <span className="w-6 text-center text-[10px] font-mono text-white/40 bg-white/5 rounded py-0.5">L21</span>
                            <span className="text-[13px] text-white/80 font-mono">swap()</span>
                          </div>
                          <div className="flex items-center gap-3">
                            <div className="w-16 h-1.5 bg-white/5 rounded-full overflow-hidden">
                              <div className="h-full bg-(--accent-highlight) w-[30%] shadow-[0_0_8px_var(--accent-highlight)]" />
                            </div>
                            <span className="text-[12px] text-(--accent-highlight) font-mono font-medium w-8 text-right">30%</span>
                          </div>
                        </div>
                        <div className="flex items-center justify-between group">
                          <div className="flex items-center gap-3">
                            <span className="w-6 text-center text-[10px] font-mono text-white/40 bg-white/5 rounded py-0.5">L9</span>
                            <span className="text-[13px] text-white/80 font-mono">quickSort()</span>
                          </div>
                          <div className="flex items-center gap-3">
                            <div className="w-16 h-1.5 bg-white/5 rounded-full overflow-hidden">
                              <div className="h-full bg-(--accent-highlight) w-[12%] shadow-[0_0_8px_var(--accent-highlight)]" />
                            </div>
                            <span className="text-[12px] text-(--accent-highlight) font-mono font-medium w-8 text-right">12%</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Memory Profile */}
                    <div className="flex flex-col gap-4">
                      <h4 className="text-[10px] text-white/30 uppercase tracking-[0.2em] font-medium">Memory Profile</h4>
                      <div className="flex flex-col gap-3">
                        <div className="bg-white/2 border border-white/5 rounded-xl p-3 flex justify-between items-center shadow-inner">
                          <span className="text-[12px] text-white/50">Peak Stack Depth</span>
                          <span className="text-[14px] text-white/90 font-mono font-medium">12 Frames</span>
                        </div>
                        <div className="bg-white/2 border border-white/5 rounded-xl p-3 flex justify-between items-center shadow-inner">
                          <span className="text-[12px] text-white/50">Allocation Pattern</span>
                          <span className="text-[13px] text-[#00D084] font-medium">O(1) Auxiliary</span>
                        </div>
                        <div className="bg-white/2 border border-white/5 rounded-xl p-3 flex justify-between items-center shadow-inner">
                          <span className="text-[12px] text-white/50">Characteristic</span>
                          <span className="text-[13px] text-white/80 font-medium">Divide & Conquer</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Cost Distribution */}
                  <div className="flex flex-col gap-4 mt-2">
                    <div className="flex justify-between items-end mb-1">
                      <h4 className="text-[10px] text-white/30 uppercase tracking-[0.2em] font-medium">Cost Distribution</h4>
                      <span className="text-[10px] text-white/40 font-mono">4,210 Total Ops</span>
                    </div>
                    {/* Stacked Bar */}
                    <div className="h-2 w-full rounded-full flex overflow-hidden gap-0.5 shadow-inner">
                      <div className="bg-(--accent-highlight) w-[40%] hover:brightness-125 transition-all cursor-pointer" />
                      <div className="bg-(--accent-highlight) w-[35%] hover:brightness-125 transition-all cursor-pointer" />
                      <div className="bg-(--accent-highlight) w-[15%] hover:brightness-125 transition-all cursor-pointer" />
                      <div className="bg-white/20 w-[10%] hover:brightness-125 transition-all cursor-pointer" />
                    </div>
                    {/* Legend */}
                    <div className="flex justify-between text-[11px] text-white/50 mt-1">
                      <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-sm bg-(--accent-highlight)" />Comparisons</div>
                      <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-sm bg-(--accent-highlight)" />Mutations</div>
                      <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-sm bg-(--accent-highlight)" />Pointers</div>
                      <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-sm bg-white/20" />Overhead</div>
                    </div>
                  </div>

                </div>
              </div>
            </motion.div>
          </div>

          {/* Content (Right on Desktop, Top on Mobile) */}
          <div className="lg:col-span-5 flex flex-col order-1 lg:order-2">
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="flex items-center gap-4 mb-6"
            >
              <div className="h-px w-8 bg-linear-to-r from-(--accent-highlight) to-transparent" />
              <span className="text-(--accent-highlight) uppercase tracking-[0.25em] text-xs font-semibold">Execution Intelligence</span>
            </motion.div>
            
            <motion.h2 
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="text-4xl md:text-5xl lg:text-6xl font-display font-medium leading-[1.05] tracking-tight mb-8 text-white"
            >
              Beyond execution.<br />
              <span className="font-serif italic font-light text-(--accent-highlight) tracking-normal">Into understanding.</span>
            </motion.h2>

            <motion.p 
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="text-white/40 text-lg md:text-xl leading-relaxed max-w-lg mb-12 font-light"
            >
              Most tools only show what happened. The platform analyzes execution traces to extract <span className="font-serif italic text-(--accent-highlight)">observed behavior</span> and <span className="font-serif italic text-(--accent-highlight)">actual performance characteristics</span>.
            </motion.p>

            <div className="flex flex-col gap-8">
              {highlights.map((feat, i) => (
                <motion.div 
                  key={i} 
                  initial={{ opacity: 0, x: 10 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.3 + (i * 0.1), duration: 0.5 }}
                  className="flex gap-4"
                >
                  <div className="shrink-0 w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center border border-white/10 shadow-inner mt-1">
                    {feat.icon}
                  </div>
                  <div className="flex flex-col">
                    <h5 className="text-white/90 text-lg font-medium mb-1 tracking-wide">{feat.title}</h5>
                    <p className="text-white/40 text-sm md:text-base leading-relaxed font-light">{feat.desc}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
