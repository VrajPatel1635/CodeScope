"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import SectionEyebrow from "./ui/SectionEyebrow";

export default function VisualDebuggerShowcase() {
  const [activeFeature, setActiveFeature] = useState(null);

  const capabilities = [
    {
      label: "Step-by-step playback",
      detail: "Deterministic forward and backward traversal",
      icon: "M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z M21 12a9 9 0 11-18 0 9 9 0 0118 0z",
      targetPanel: 0
    },
    {
      label: "Variable tracking",
      detail: "Watch every mutation in real-time",
      icon: "M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4",
      targetPanel: 1
    },
    {
      label: "Call stack visualization",
      detail: "Full recursive depth awareness",
      icon: "M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10",
      targetPanel: 2
    },
    {
      label: "Live structure mutations",
      detail: "See arrays, trees, and graphs transform",
      icon: "M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z",
      targetPanel: 3
    },
    {
      label: "Source-level execution",
      detail: "Exact line-by-line correspondence",
      icon: "M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4",
      targetPanel: 4
    }
  ];

  const Panel = ({ index, children, className }) => {
    const isHoveringAny = activeFeature !== null;
    const isActive = activeFeature === index;
    const isDimmed = isHoveringAny && !isActive;

    return (
      <motion.div
        animate={{
          scale: isActive ? 1.02 : isDimmed ? 0.97 : 1,
          opacity: isDimmed ? 0.35 : 1,
          filter: isDimmed ? "blur(3px)" : "blur(0px)",
          borderColor: isActive ? "rgba(255,255,255,0.15)" : "rgba(255,255,255,0.03)",
        }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className={`rounded-2xl border bg-white/1 overflow-hidden relative ${className}`}
      >
        {isActive && (
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            transition={{ duration: 0.5 }}
            className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,var(--tw-gradient-stops))] from-white/8 via-transparent to-transparent pointer-events-none"
          />
        )}
        {children}
      </motion.div>
    );
  };

  return (
    <section id="features" className="relative py-16 sm:py-24 lg:py-48 bg-background">
      {/* Background ambience */}
      <div className="absolute top-10 right-[5%] w-[800px] h-[800px] bg-(--accent-secondary) blur-[200px] opacity-[0.02] rounded-full pointer-events-none" />
      <div className="absolute bottom-[10%] left-[-10%] w-[600px] h-[600px] bg-(--exec-return) blur-[180px] opacity-[0.02] rounded-full pointer-events-none" />

      <div className="max-w-[1400px] mx-auto px-6 md:px-12 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 lg:gap-12 items-start relative">

          {/* Content (Left) */}
          <div className="col-span-1 lg:col-span-5 flex flex-col relative z-20">
            <SectionEyebrow title="Visual Debugger" phase="SYS.DEBUG" accentClass="text-(--accent-secondary)" />

            {/* Headline */}
            <h2 className="mb-8 flex flex-col gap-1">
              <span className="text-[clamp(2.5rem,6vw,5.5rem)] font-display font-medium leading-[0.95] tracking-tighter text-white">
                See every step.
              </span>
              <span className="text-[clamp(2.5rem,6vw,5.5rem)] font-serif italic font-light leading-none tracking-tight text-(--accent-secondary)">
                Understand every change.
              </span>
            </h2>

            {/* Description */}
            <p className="text-white/40 text-lg md:text-xl leading-[1.7] max-w-md mb-14 font-light tracking-wide">
              Track variables, pointers, mutations, recursive calls, and memory state through a{" "}
              <span className="text-white/80 font-normal">deterministic execution timeline</span>.
            </p>

            {/* Capability List */}
            <div className="flex flex-col gap-3 relative" onMouseLeave={() => setActiveFeature(null)}>
              {/* Connecting line */}
              <div className="absolute left-[27px] top-6 bottom-6 w-px bg-[linear-gradient(to_bottom,transparent,rgba(255,255,255,0.1),transparent)] hidden md:block" />
              
              {capabilities.map((cap, i) => {
                const isActive = activeFeature === cap.targetPanel;
                return (
                  <div 
                    key={i} 
                    onMouseEnter={() => setActiveFeature(cap.targetPanel)}
                    className={`group flex items-start gap-5 cursor-pointer p-3 rounded-2xl transition-all duration-500 relative z-10 ${isActive ? 'bg-white/3' : 'hover:bg-white/1'}`}
                  >
                    <div className={`shrink-0 w-10 h-10 sm:w-14 sm:h-14 rounded-lg sm:rounded-xl flex items-center justify-center transition-all duration-500 relative ${isActive ? 'bg-(--accent-secondary)/10 border border-(--accent-secondary)/30 text-(--accent-secondary) shadow-[0_0_20px_var(--accent-secondary)]' : 'bg-(--bg-surface) border border-white/5 text-white/30'}`}>
                       <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d={cap.icon} /></svg>
                    </div>
                    <div className="flex flex-col pt-1.5">
                      <span className={`text-[15px] sm:text-[17px] font-medium tracking-wide transition-colors duration-500 ${isActive ? 'text-white' : 'text-white/60 group-hover:text-white/90'}`}>{cap.label}</span>
                      <span className={`text-[12px] sm:text-[14px] mt-1 leading-relaxed transition-colors duration-500 font-light ${isActive ? 'text-white/60' : 'text-white/30'}`}>{cap.detail}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Product Preview Bento Box (Right) */}
          <div className="col-span-1 lg:col-span-7 relative h-full w-full">
            <div className="lg:sticky lg:top-24 w-full lg:w-[105%] lg:ml-[-2.5%] transition-all duration-700 z-10 hidden sm:block">
              <div className="relative w-full rounded-[2.5rem] border border-white/5 bg-(--bg-surface)/90 shadow-[0_40px_100px_-20px_rgba(79,140,255,0.08)] overflow-hidden backdrop-blur-3xl">

                {/* Window Chrome */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-white/5 bg-white/2">
                  <div className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 bg-(--exec-node-active) rounded-full shadow-[0_0_8px_rgba(0,208,132,0.5)]"></span>
                    <span className="text-[10px] text-white/30 font-mono uppercase tracking-widest">Live Execution</span>
                  </div>
                  <div className="flex items-center gap-2 px-4 py-1.5 rounded-lg bg-white/5 border border-white/5">
                    <svg className="w-3 h-3 text-(--accent-secondary) opacity-60" fill="currentColor" viewBox="0 0 24 24"><path d="M4 22H2V2h2v20zM22 2v20h-2V2h2zm-4 16H6V6h12v12z" /></svg>
                    <span className="text-[10px] text-white/40 font-mono tracking-widest uppercase">QuickSort.java</span>
                  </div>
                  <div className="w-14" />
                </div>

                {/* Bento Grid */}
                <div className="p-4 sm:p-5 bg-background/80">
                  <div className="grid grid-cols-12 gap-4">
                    
                    {/* Source Code Panel */}
                    <Panel index={4} className="col-span-12 lg:col-span-5 h-[200px] sm:h-[260px] lg:h-[320px] flex flex-col p-4 sm:p-5">
                      <div className="text-[10px] text-white/30 uppercase tracking-[0.2em] font-sans font-medium mb-4 shrink-0">Source Code</div>
                      <pre className="font-mono text-[11px] leading-[2.2] text-white/40 overflow-x-auto flex-1">
                        <code className="block"><span className="text-(--exec-return)">public void</span> <span className="text-white/80">quickSort</span>(...) {"{"}</code>
                        <code className="block pl-4"><span className="text-(--exec-return)">if</span> (left {"<"} right) {"{"}</code>
                        <code className="block pl-8 relative text-white/90">
                          <div className="absolute -left-5 top-0 bottom-0 w-[3px] bg-(--accent-secondary) rounded-r-sm" />
                          <div className="absolute inset-0 -left-5 bg-(--accent-secondary)/10" />
                          int pivot = partition();
                        </code>
                        <code className="block pl-8 opacity-60">quickSort(arr, left, pivot-1);</code>
                        <code className="block pl-8 opacity-60">quickSort(arr, pivot+1, right);</code>
                        <code className="block pl-4 opacity-40">{"}"}</code>
                        <code className="block opacity-40">{"}"}</code>
                      </pre>
                    </Panel>

                    {/* Workspace Panel */}
                    <Panel index={3} className="col-span-12 lg:col-span-7 h-[200px] sm:h-[260px] lg:h-[320px] flex flex-col p-4 sm:p-6 items-center justify-center">
                      <div className="absolute top-5 left-5 text-[10px] text-white/30 uppercase tracking-[0.2em] font-sans font-medium">Memory Workspace</div>
                      
                      <div className="flex gap-3 sm:gap-4 mt-6">
                        {[4, 2, 7, 1, 9].map((v, i) => (
                          <div key={i} className={`w-12 h-12 sm:w-14 sm:h-14 rounded-xl flex items-center justify-center font-mono text-lg border ${i===2 ? 'border-(--exec-mutation)/40 bg-(--exec-mutation)/10 text-(--exec-mutation) shadow-[0_0_20px_rgba(255,176,32,0.15)] scale-105' : 'border-white/10 bg-background text-white/60'} relative transition-all duration-300`}>
                            {v}
                            {i === 0 && <div className="absolute -bottom-8 flex flex-col items-center text-[10px] text-(--exec-node-active) font-bold"><svg className="w-3 h-3 mb-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 10l7-7m0 0l7 7m-7-7v18" /></svg>L</div>}
                            {i === 4 && <div className="absolute -bottom-8 flex flex-col items-center text-[10px] text-(--accent-secondary) font-bold"><svg className="w-3 h-3 mb-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 10l7-7m0 0l7 7m-7-7v18" /></svg>R</div>}
                            {i === 2 && <div className="absolute -top-9 flex items-center gap-1.5 text-[9px] text-(--exec-mutation) px-2 py-1 rounded-md border border-(--exec-mutation)/30 bg-(--exec-mutation)/10 tracking-widest uppercase"><span className="w-1.5 h-1.5 rounded-full bg-(--exec-mutation) animate-pulse shadow-[0_0_5px_var(--exec-mutation)]" />Eval</div>}
                          </div>
                        ))}
                      </div>
                    </Panel>

                    {/* Variables Panel */}
                    <Panel index={1} className="col-span-12 lg:col-span-5 h-[140px] sm:h-[160px] lg:h-[180px] flex flex-col p-4 sm:p-5">
                      <div className="text-[10px] text-white/30 uppercase tracking-[0.2em] font-sans font-medium mb-4">Registers</div>
                      <div className="flex flex-col gap-3 font-mono text-[12px]">
                         <div className="flex justify-between items-center"><span className="text-(--exec-node-active) font-medium">left</span><span className="bg-white/5 border border-white/5 px-2.5 py-0.5 rounded-md text-white/80">0</span></div>
                         <div className="flex justify-between items-center"><span className="text-(--accent-secondary) font-medium">right</span><span className="bg-white/5 border border-white/5 px-2.5 py-0.5 rounded-md text-white/80">4</span></div>
                         <div className="flex justify-between items-center"><span className="text-(--exec-mutation) font-medium">pivot</span><span className="text-white/30 italic">pending</span></div>
                      </div>
                    </Panel>

                    {/* Call Stack Panel */}
                    <Panel index={2} className="col-span-12 lg:col-span-7 h-[140px] sm:h-[160px] lg:h-[180px] flex flex-col p-4 sm:p-5">
                      <div className="text-[10px] text-white/30 uppercase tracking-[0.2em] font-sans font-medium mb-4 flex justify-between items-center">
                        Call Stack 
                        <span className="bg-white/10 px-1.5 py-0.5 rounded text-[9px] text-white/60">3</span>
                      </div>
                      <div className="flex flex-col gap-2.5 font-mono text-[11px]">
                        <div className="bg-(--accent-secondary)/10 border border-(--accent-secondary)/20 text-white px-3 py-1.5 rounded-lg flex items-center gap-2 shadow-[0_0_10px_rgba(79,140,255,0.05)]">
                          <span className="w-1.5 h-1.5 bg-(--accent-secondary) rounded-full shadow-[0_0_5px_var(--accent-secondary)]"/>partition(...)
                        </div>
                        <div className="text-white/40 pl-3">quickSort(arr, 0, 4)</div>
                        <div className="text-white/20 pl-3">main(args)</div>
                      </div>
                    </Panel>

                    {/* Timeline Panel */}
                    <Panel index={0} className="col-span-12 h-[80px] flex flex-col justify-center px-5 relative">
                       <div className="absolute inset-0 bg-[linear-gradient(to_right,transparent,rgba(255,255,255,0.02),transparent)] pointer-events-none" />
                       <div className="flex items-center gap-5">
                         <div className="w-10 h-10 shrink-0 rounded-xl bg-(--accent-secondary)/10 border border-(--accent-secondary)/20 flex items-center justify-center text-(--accent-secondary) cursor-pointer hover:bg-(--accent-secondary)/20 hover:scale-105 transition-all">
                           <svg className="w-4 h-4 ml-0.5" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>
                         </div>
                         <div className="flex-1 flex flex-col gap-2 min-w-0">
                           <div className="flex justify-between text-[9px] text-white/40 uppercase tracking-[0.2em] font-sans font-medium">
                             <span className="truncate">Phase: Partitioning</span>
                             <span className="font-mono text-white/30 shrink-0 ml-2">14/32</span>
                           </div>
                           <div className="h-1.5 bg-white/5 rounded-full overflow-hidden relative">
                             <div className="absolute top-0 left-0 w-[45%] h-full bg-[linear-gradient(to_right,rgba(79,140,255,0.3),rgba(79,140,255,1))] rounded-full shadow-[0_0_10px_var(--accent-secondary)]" />
                           </div>
                         </div>
                       </div>
                    </Panel>

                  </div>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
