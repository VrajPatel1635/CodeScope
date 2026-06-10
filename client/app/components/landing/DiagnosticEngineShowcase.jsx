"use client";

import React from "react";
import { motion } from "framer-motion";

export default function DiagnosticEngineShowcase() {
  const highlights = [
    {
      title: "Compilation Diagnostics",
      desc: "Missing imports, syntax errors, and type mismatches."
    },
    {
      title: "Input Diagnostics",
      desc: "Malformed arrays, matrices, trees, and invalid formats."
    },
    {
      title: "Runtime Diagnostics",
      desc: "Null pointers, index errors, stack overflows, recursion issues."
    },
    {
      title: "Execution Diagnostics",
      desc: "Timeouts, infinite loops, trace limits, platform safeguards."
    }
  ];

  return (
    <section className="relative py-20 md:py-24 bg-background overflow-hidden border-t border-white/2">
      {/* Premium Background Glows (Reduced) */}
      <div className="absolute top-1/2 left-[-10%] w-[600px] h-[600px] bg-linear-to-br from-[#FF5D5D]/10 to-transparent blur-[120px] rounded-full pointer-events-none mix-blend-screen opacity-20" />
      <div className="absolute bottom-0 right-[10%] w-[800px] h-[800px] bg-linear-to-tl from-(--accent-primary)/10 to-transparent blur-[120px] rounded-full pointer-events-none mix-blend-screen opacity-20" />

      <div className="max-w-[1400px] mx-auto px-6 md:px-12 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 lg:gap-20 items-center">
          
          {/* Content (Left) */}
          <div className="lg:col-span-5 flex flex-col order-1">
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="flex items-center gap-4 mb-6"
            >
              <div className="h-px w-8 bg-linear-to-r from-(--accent-primary) to-transparent" />
              <span className="text-(--accent-primary) uppercase tracking-[0.25em] text-xs font-semibold">Smart Diagnostics</span>
            </motion.div>
            
            <motion.h2 
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="text-3xl md:text-4xl lg:text-5xl font-display font-medium leading-[1.05] tracking-tight mb-8 text-white"
            >
              Understand <span className="underline decoration-[#FF5D5D] decoration-2 underline-offset-8">errors</span>.<br />
              <span className="text-white/40">Not just exceptions.</span>
            </motion.h2>

            <motion.p 
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="text-white/40 text-lg md:text-xl leading-relaxed max-w-lg mb-12 font-light"
            >
              Most debugging tools stop at showing errors. The platform translates failures into actionable guidance identifying <span className="text-white/70">what happened</span>, <span className="text-white/70">why it happened</span>, and <span className="text-white/70">how to fix it</span>.
            </motion.p>

            <div className="flex flex-col gap-6">
              {highlights.map((feat, i) => (
                <motion.div 
                  key={i} 
                  initial={{ opacity: 0, x: -10 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.3 + (i * 0.1), duration: 0.5 }}
                  className="flex flex-col gap-1.5 border-l-2 border-white/10 pl-5 hover:border-white/30 transition-colors duration-300 group"
                >
                  <h5 className="text-white/80 group-hover:text-white/95 text-base font-medium tracking-wide transition-colors">{feat.title}</h5>
                  <p className="text-white/40 text-sm md:text-base font-light leading-relaxed">{feat.desc}</p>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Diagnostic Experience (Right) */}
          <div className="lg:col-span-7 order-2 relative lg:ml-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.98, x: 30 }}
              whileInView={{ opacity: 1, scale: 1, x: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
              className="relative w-full flex flex-col md:flex-row items-stretch gap-4 md:gap-6"
            >
              
              {/* Raw Exception Panel (Left / Background element) */}
              <div className="w-full md:w-[40%] rounded-2xl bg-[#030305] border border-white/5 p-5 shadow-inner flex flex-col mt-0 md:mt-8 mb-0 md:mb-8 relative overflow-hidden group hover:border-[#FF5D5D]/20 transition-colors duration-500">
                {/* Subtle top red glow */}
                <div className="absolute top-0 left-0 w-full h-px bg-linear-to-r from-red-500/0 via-red-500/20 to-red-500/0" />
                
                <div className="text-[9px] text-white/30 uppercase tracking-widest font-sans mb-4 flex items-center gap-2 border-b border-white/5 pb-3">
                  <div className="w-1.5 h-1.5 rounded-full bg-[#FF5D5D]/50" /> Raw JVM Error
                </div>
                
                <div className="font-mono text-[10px] sm:text-[11px] leading-[1.8] text-white/40 group-hover:text-white/50 transition-colors duration-500">
                  <span className="text-[#FF5D5D]/80 font-medium">Exception in thread "main"</span><br/>
                  <span className="text-[#FF5D5D]/80 font-medium">java.lang.ArrayIndexOutOfBoundsException: Index 5 out of bounds for length 5</span><br/>
                  <span className="pl-3 mt-1 block">at Solution.merge(Solution.java:42)</span>
                  <span className="pl-3 block">at Solution.mergeSort(Solution.java:24)</span>
                  <span className="pl-3 block">at Solution.solve(Solution.java:12)</span>
                  <span className="pl-3 opacity-50 block">at Main.main(Main.java:8)</span>
                </div>
              </div>

              {/* Premium Diagnostic Panel (Right / Foreground) */}
              <div className="w-full md:w-[60%] rounded-3xl p-px bg-linear-to-b from-white/20 via-white/5 to-transparent shadow-[0_40px_100px_-20px_rgba(255,93,93,0.15)] relative z-10 group transition-transform duration-500 hover:-translate-y-1">
                <div className="w-full h-full rounded-3xl bg-[#090A0F] flex flex-col relative overflow-hidden backdrop-blur-3xl">
                  
                  {/* Decorative Top Glow */}
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-px bg-linear-to-r from-transparent via-[#FF5D5D]/50 to-transparent" />

                  <div className="p-6 md:p-8 flex flex-col h-full">
                    
                    {/* Header */}
                    <div className="flex justify-between items-start mb-6">
                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-[#FF5D5D]/10 text-[#FF5D5D] border border-[#FF5D5D]/20 text-[10px] uppercase tracking-widest font-bold shadow-[0_0_15px_rgba(255,93,93,0.15)]">
                          <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/></svg>
                          Error
                        </div>
                        <span className="text-white/40 text-[10px] font-mono border border-white/5 px-2 py-1 rounded bg-white/5">Line 42</span>
                      </div>
                    </div>

                    {/* Title */}
                    <div className="mb-6">
                      <h3 className="text-xl md:text-2xl font-display font-medium text-white/90 mb-2 leading-tight">Array Index Out Of Bounds</h3>
                      <p className="text-[#FF5D5D]/70 font-mono text-[11px] md:text-[12px] break-all bg-[#FF5D5D]/5 inline-block px-2 py-0.5 rounded border border-[#FF5D5D]/10">java.lang.ArrayIndexOutOfBoundsException</p>
                    </div>

                    <div className="h-px w-full bg-white/5 mb-6" />

                    {/* Diagnostic Fields */}
                    <div className="flex flex-col gap-6 flex-1">
                      
                      {/* What Happened */}
                      <div className="flex flex-col gap-2">
                        <span className="text-[10px] text-(--accent-primary) uppercase tracking-[0.15em] font-medium flex items-center gap-2">
                          What Happened
                        </span>
                        <p className="text-white/70 text-[13px] leading-relaxed font-light">Your merge operation attempted to access an index that does not exist in the destination array.</p>
                      </div>
                      
                      {/* Why */}
                      <div className="flex flex-col gap-2">
                        <span className="text-[10px] text-[#FF5D5D] uppercase tracking-[0.15em] font-medium flex items-center gap-2">
                          Why
                        </span>
                        <p className="text-white/70 text-[13px] leading-relaxed font-light">
                          The merge pointer <code className="bg-white/5 text-white/90 px-1.5 py-0.5 rounded text-[11px] font-mono border border-white/10 mx-1">k = 5</code> exceeded the valid range while copying elements.
                        </p>
                      </div>

                      {/* Suggested Fix */}
                      <div className="flex flex-col gap-2 mt-auto pt-4">
                        <div className="bg-(--accent-primary)/5 border border-(--accent-primary)/10 rounded-xl p-4 shadow-inner relative overflow-hidden group-hover:bg-(--accent-primary)/10 transition-colors duration-500">
                          {/* Inner glow */}
                          <div className="absolute top-0 left-0 w-1 h-full bg-(--accent-primary)/50" />
                          <span className="text-[10px] text-(--accent-primary) uppercase tracking-[0.15em] font-medium flex items-center gap-2 mb-2">
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                            Suggested Fix
                          </span>
                          <p className="text-white/80 text-[13px] leading-relaxed font-light">Verify merge loop bounds and destination array indexing.</p>
                        </div>
                      </div>

                    </div>
                  </div>
                </div>
              </div>

            </motion.div>
          </div>

        </div>
      </div>
    </section>
  );
}
