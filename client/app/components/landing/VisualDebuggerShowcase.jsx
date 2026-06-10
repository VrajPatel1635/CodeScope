"use client";

import React from "react";
import { motion } from "framer-motion";

export default function VisualDebuggerShowcase() {
  const features = [
    "Step-by-step playback",
    "Variable tracking",
    "Call stack visualization",
    "Live structure mutations",
    "Source-level execution"
  ];

  return (
    <section className="relative py-24 md:py-32 bg-background overflow-hidden border-t border-white/2">
      {/* Premium Background Glows (Reduced) */}
      <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-linear-to-bl from-(--accent-secondary)/20 via-(--accent-secondary)/5 to-transparent blur-[120px] rounded-full pointer-events-none mix-blend-screen opacity-20" />
      <div className="absolute bottom-[-20%] left-[-10%] w-[600px] h-[600px] bg-linear-to-tr from-(--exec-return)/10 to-transparent blur-[100px] rounded-full pointer-events-none mix-blend-screen opacity-20" />

      <div className="max-w-[1400px] mx-auto px-6 md:px-12 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 lg:gap-16 items-center">
          
          {/* Content (Left) */}
          <div className="lg:col-span-5 flex flex-col order-1">
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="flex items-center gap-4 mb-6"
            >
              <div className="h-px w-8 bg-linear-to-r from-(--accent-secondary) to-transparent" />
              <span className="text-(--accent-secondary) uppercase tracking-[0.25em] text-xs font-semibold">Visual Debugger</span>
            </motion.div>
            
            <motion.h2 
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="text-5xl md:text-6xl lg:text-[4.5rem] font-display font-medium leading-[1.05] tracking-tight mb-8 text-white"
            >
              See every step.<br />
              <span className="text-(--accent-secondary)">Understand every change.</span>
            </motion.h2>

            <motion.p 
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="text-white/40 text-lg md:text-xl leading-relaxed max-w-lg mb-12 font-light"
            >
              Track variables, pointers, mutations, recursive calls, and memory state through a <span className="text-white font-medium">deterministic execution timeline</span>.
            </motion.p>

            <ul className="flex flex-col gap-5">
              {features.map((feat, i) => (
                <motion.li 
                  key={i} 
                  initial={{ opacity: 0, x: -10 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.3 + (i * 0.1), duration: 0.5 }}
                  className="flex items-center gap-4 text-white/80 text-base md:text-lg font-light"
                >
                  <div className="shrink-0 w-5 h-5 rounded bg-white/5 flex items-center justify-center border border-white/10 shadow-inner">
                    <svg className="w-3 h-3 text-(--accent-secondary)" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="3">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  {feat}
                </motion.li>
              ))}
            </ul>
          </div>

          {/* Product Preview (Right) */}
          <div className="lg:col-span-7 order-2 relative lg:ml-8 mt-12 lg:mt-0">
            <motion.div
              initial={{ opacity: 0, scale: 0.98, y: 30 }}
              whileInView={{ opacity: 1, scale: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
              whileHover={{ y: -6, transition: { duration: 0.5, ease: "easeOut" } }}
              className="relative w-full rounded-3xl p-px bg-linear-to-b from-white/20 via-white/5 to-transparent shadow-[0_40px_100px_-20px_rgba(79,140,255,0.15)] group"
            >
              <div className="w-full rounded-3xl bg-[#090A0F] overflow-hidden flex flex-col font-mono relative z-10 backdrop-blur-3xl">
                
                {/* Header Chrome */}
                <div className="flex items-center justify-between px-5 py-3 border-b border-white/5 bg-white/2">
                  <div className="flex gap-2">
                    <div className="w-3 h-3 rounded-full bg-white/20 group-hover:bg-[#FF5D5D] transition-colors duration-300" />
                    <div className="w-3 h-3 rounded-full bg-white/20 group-hover:bg-[#FFB020] transition-colors duration-300" />
                    <div className="w-3 h-3 rounded-full bg-white/20 group-hover:bg-[#00D084] transition-colors duration-300" />
                  </div>
                  <div className="flex items-center gap-2 text-white/50 text-[11px] font-medium px-4 py-1.5 rounded-md bg-white/5 border border-white/5 shadow-inner uppercase tracking-wider">
                    <svg className="w-3.5 h-3.5 text-(--accent-secondary)" fill="currentColor" viewBox="0 0 24 24"><path d="M4 22H2V2h2v20zM22 2v20h-2V2h2zm-4 16H6V6h12v12z"/></svg>
                    <span>QuickSort.java</span>
                  </div>
                  <div className="w-12" /> {/* Spacer for centering */}
                </div>

                {/* Main content grid */}
                <div className="flex flex-col md:flex-row min-h-[460px]">
                  
                  {/* Code Editor */}
                  <div className="w-full md:w-[45%] border-b md:border-b-0 md:border-r border-white/5 bg-[#050508]/50 relative flex flex-col py-6">
                    <div className="text-[10px] text-white/30 uppercase tracking-[0.2em] font-sans mb-6 px-6 font-medium">Source Code</div>
                    <pre className="text-white/60 leading-loose text-[12px] md:text-[13px] overflow-x-auto flex-1 font-mono custom-scrollbar">
                      <code className="block px-6">
                        <span className="text-(--exec-return)">public void</span> <span className="text-[#F0F1F3]">quickSort</span>(int[] arr, int left, int right) {"{\n"}
                      </code>
                      <code className="block px-6">
                        {"    "}<span className="text-(--exec-return)">if</span> (left {"<"} right) {"{\n"}
                      </code>
                      <code className="block relative bg-linear-to-r from-(--accent-secondary)/15 to-transparent text-white border-l-[3px] border-(--accent-secondary) px-6 py-1 ml-px md:ml-[-3px] shadow-[inset_20px_0_40px_-20px_rgba(79,140,255,0.1)]">
                        {"        "}int pivot = <span className="text-[#F0F1F3]">partition</span>(arr, left, right);{"\n"}
                      </code>
                      <code className="block px-6 opacity-40">
                        {"        "}quickSort(arr, left, pivot - 1);{"\n"}
                      </code>
                      <code className="block px-6 opacity-40">
                        {"        "}quickSort(arr, pivot + 1, right);{"\n"}
                      </code>
                      <code className="block px-6 opacity-40">
                        {"    }\n"}
                      </code>
                      <code className="block px-6 opacity-40">
                        {"}"}
                      </code>
                    </pre>
                  </div>

                  {/* Visualization & State */}
                  <div className="w-full md:w-[55%] flex flex-col bg-white/1">
                    
                    {/* Visualizer Workspace */}
                    <div className="flex-1 p-6 flex flex-col items-center justify-center border-b border-white/5 relative min-h-[240px]">
                      <div className="absolute top-6 left-6 text-[10px] text-white/30 uppercase tracking-[0.2em] font-sans font-medium">Workspace</div>
                      
                      {/* Array Representation */}
                      <div className="flex gap-3 sm:gap-4 relative mt-4">
                        {[4, 2, 7, 1, 9].map((val, idx) => (
                          <div key={idx} className={`w-12 h-12 sm:w-14 sm:h-14 flex items-center justify-center rounded-xl border ${idx === 2 ? 'bg-linear-to-b from-(--exec-mutation)/20 to-(--exec-mutation)/5 border-(--exec-mutation)/50 text-(--exec-mutation) shadow-[0_0_25px_rgba(255,176,32,0.15)]' : 'bg-linear-to-b from-white/10 to-white/2 border-white/10 text-white/90 shadow-inner'} relative transition-all`}>
                            <span className={idx === 2 ? "font-bold text-xl" : "font-medium text-lg"}>{val}</span>
                            
                            {/* Pointers */}
                            {idx === 0 && (
                              <div className="absolute -bottom-8 text-[11px] text-(--exec-node-active) flex flex-col items-center font-bold tracking-widest">
                                <svg className="w-3.5 h-3.5 mb-1 opacity-80" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 10l7-7m0 0l7 7m-7-7v18"/></svg>
                                L
                              </div>
                            )}
                            {idx === 4 && (
                              <div className="absolute -bottom-8 text-[11px] text-(--accent-secondary) flex flex-col items-center font-bold tracking-widest">
                                <svg className="w-3.5 h-3.5 mb-1 opacity-80" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 10l7-7m0 0l7 7m-7-7v18"/></svg>
                                R
                              </div>
                            )}
                            {idx === 2 && (
                              <div className="absolute -top-8 text-[10px] text-(--exec-mutation) flex flex-col items-center px-2 py-0.5 rounded border border-(--exec-mutation)/30 bg-(--exec-mutation)/10 whitespace-nowrap font-medium tracking-wide">
                                Evaluating
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* State Panels */}
                    <div className="flex border-b border-white/5 h-[140px]">
                      {/* Variables */}
                      <div className="w-1/2 p-6 border-r border-white/5">
                        <div className="text-[10px] text-white/30 uppercase tracking-[0.2em] font-sans mb-4 font-medium">Variables</div>
                        <div className="flex flex-col gap-3 text-[13px]">
                          <div className="flex justify-between items-center">
                            <span className="text-(--exec-node-active) font-medium">left</span>
                            <span className="text-white/90 font-mono bg-white/5 px-2 py-0.5 rounded border border-white/5 text-xs">0</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-(--accent-secondary) font-medium">right</span>
                            <span className="text-white/90 font-mono bg-white/5 px-2 py-0.5 rounded border border-white/5 text-xs">4</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-(--exec-mutation) font-medium">pivot</span>
                            <span className="text-white/30 italic font-mono text-xs px-2 py-0.5">pending</span>
                          </div>
                        </div>
                      </div>

                      {/* Call Stack */}
                      <div className="w-1/2 p-6">
                        <div className="text-[10px] text-white/30 uppercase tracking-[0.2em] font-sans mb-4 flex justify-between font-medium">
                          Call Stack
                          <span className="text-white/40 bg-white/5 px-1.5 rounded border border-white/5">3</span>
                        </div>
                        <div className="flex flex-col gap-2.5 text-[13px] text-white/50">
                          <div className="truncate text-white/90 flex items-center gap-2.5 bg-white/5 px-2 py-1.5 rounded border border-white/5 shadow-inner">
                            <span className="w-1.5 h-1.5 rounded-full bg-(--accent-secondary) shadow-[0_0_8px_var(--accent-secondary)]" /> partition(...)
                          </div>
                          <div className="truncate pl-4 font-light">quickSort(arr, 0, 4)</div>
                          <div className="truncate pl-4 opacity-40 font-light">main(args)</div>
                        </div>
                      </div>
                    </div>

                    {/* Timeline Bar */}
                    <div className="px-6 py-5 bg-[#050508]/40 flex items-center gap-5">
                      {/* Play button */}
                      <div className="w-10 h-10 rounded-full bg-linear-to-b from-(--accent-secondary) to-[#3A6BCC] flex items-center justify-center text-white pl-0.5 shrink-0 shadow-[0_8px_20px_rgba(79,140,255,0.3)] border border-white/20 cursor-pointer hover:scale-105 transition-transform duration-300">
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>
                      </div>
                      {/* Track */}
                      <div className="flex-1 flex flex-col gap-2 min-w-0">
                        <div className="flex justify-between text-[10px] text-white/40 uppercase tracking-widest font-sans font-medium">
                          <span className="truncate">Phase: Partitioning</span>
                          <span className="shrink-0 ml-2">Step 14/32</span>
                        </div>
                        <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden relative shadow-inner">
                          <div className="absolute top-0 left-0 h-full w-[45%] bg-linear-to-r from-(--accent-secondary)/30 via-(--accent-secondary) to-[#82B1FF] rounded-full shadow-[0_0_10px_var(--accent-secondary)]" />
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
