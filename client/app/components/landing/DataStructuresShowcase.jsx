"use client";

import React, { useRef } from "react";
import { motion, useScroll, useTransform, useSpring, useVelocity } from "framer-motion";

// --- MICRO-VISUALIZATIONS ---

const MiniArray = () => (
  <div className="w-full h-full flex items-center justify-center p-4">
    <div className="flex gap-0.5 group-hover:gap-1.5 transition-all duration-500">
      {[4, 8, 15, 16, 23, 42].map((v, i) => (
        <div key={i} className={`w-8 h-8 rounded-[4px] flex items-center justify-center font-mono text-[11px] border ${i === 2 ? 'bg-(--accent-secondary)/10 border-(--accent-secondary)/50 text-(--accent-secondary) shadow-[0_0_10px_rgba(74,143,212,0.15)] group-hover:bg-(--accent-secondary)/20 transition-colors duration-500 scale-110 relative z-10' : 'bg-[#090A0F] border-white/5 text-white/40 group-hover:border-white/10 transition-colors duration-500'}`}>
           {v}
        </div>
      ))}
    </div>
  </div>
);

const MiniMatrix = () => (
  <div className="w-full h-full flex items-center justify-center p-4">
    <div className="grid grid-cols-4 gap-[3px] group-hover:gap-[5px] transition-all duration-500">
      {Array.from({length: 16}).map((_, i) => (
        <div key={i} className={`w-6 h-6 rounded-[2px] border flex items-center justify-center text-[9px] font-mono transition-all duration-500 ${i === 5 || i === 10 ? 'bg-(--accent-highlight)/10 border-(--accent-highlight)/40 text-(--accent-highlight) shadow-[0_0_8px_rgba(107,191,160,0.2)] group-hover:bg-(--accent-highlight)/20 group-hover:scale-110 z-10 relative' : 'bg-[#090A0F] border-white/5 text-white/20'}`}>
          {i}
        </div>
      ))}
    </div>
  </div>
);

const MiniString = () => (
  <div className="w-full h-full flex items-center justify-center p-4 relative">
    <div className="flex gap-0.5 border-b border-white/5 pb-1 relative">
       {['r','e','c','u','r','s','i','o','n'].map((c, i) => (
         <div key={i} className={`w-5 h-6 flex items-center justify-center font-mono text-xs transition-colors duration-500 ${i >= 2 && i <= 5 ? 'text-(--accent-primary) group-hover:text-white' : 'text-white/30 group-hover:text-white/20'}`}>{c}</div>
       ))}
       <div className="absolute bottom-0 left-[44px] w-[84px] h-0.5 bg-(--accent-primary) rounded-full shadow-[0_0_8px_var(--accent-primary)] group-hover:w-[40px] group-hover:left-[130px] group-hover:bg-(--accent-secondary) group-hover:shadow-[0_0_8px_var(--accent-secondary)] transition-all duration-700 ease-in-out" />
    </div>
  </div>
);

const MiniLinkedList = () => (
  <div className="w-full h-full flex items-center justify-center gap-3 group-hover:gap-5 transition-all duration-700 ease-out p-4">
    {[12, 99, 37].map((val, i) => (
      <React.Fragment key={i}>
        <div className="relative flex flex-col items-center">
          <div className={`w-11 h-11 rounded-xl flex items-center justify-center font-mono text-xs border ${i === 1 ? 'bg-(--accent-secondary)/10 border-(--accent-secondary)/50 text-(--accent-secondary) shadow-[0_0_15px_rgba(74,143,212,0.15)] group-hover:bg-(--accent-secondary)/20 transition-colors duration-500' : 'bg-[#090A0F] border-white/5 text-white/50 shadow-inner'}`}>
             {val}
          </div>
          {i === 1 && <span className="absolute -bottom-5 text-[9px] text-(--accent-secondary) font-mono opacity-0 group-hover:opacity-100 transition-opacity duration-500">curr</span>}
        </div>
        {i < 2 && (
          <div className="w-6 h-px bg-white/10 relative group-hover:w-10 group-hover:bg-white/20 transition-all duration-700">
             <div className="absolute right-0 top-1/2 -translate-y-1/2 w-0 h-0 border-y-[3px] border-y-transparent border-l-4 border-l-white/10 group-hover:border-l-white/20 transition-colors duration-700" />
          </div>
        )}
      </React.Fragment>
    ))}
  </div>
);

const MiniStack = () => (
  <div className="w-full h-full flex flex-col items-center justify-center p-4">
    <div className="flex flex-col items-center w-24 relative group-hover:-translate-y-2 transition-transform duration-500">
       <div className="absolute -top-6 opacity-0 group-hover:opacity-100 group-hover:-top-8 transition-all duration-500 font-mono text-[9px] text-(--accent-secondary)">push(104)</div>
       <div className="w-full h-8 border border-dashed border-white/20 text-white/30 flex items-center justify-center font-mono text-[10px] rounded mb-1 transition-colors duration-500 group-hover:border-(--accent-secondary)/40 group-hover:bg-(--accent-secondary)/10 group-hover:text-(--accent-secondary)">...</div>
       {[104, 72, 19].map((v, i) => (
         <div key={i} className={`w-full h-8 rounded border flex items-center justify-center font-mono text-xs ${i === 0 ? 'bg-(--accent-highlight)/10 border-(--accent-highlight)/40 text-(--accent-highlight) shadow-[0_0_15px_rgba(107,191,160,0.1)] group-hover:scale-105 transition-transform duration-500 z-10 relative mt-1' : 'bg-[#090A0F] border-white/5 text-white/40 mt-1'}`}>
           {v}
         </div>
       ))}
       <div className="w-full h-2 border-b border-x border-white/20 rounded-b mt-1 opacity-50" />
    </div>
  </div>
);

const MiniQueue = () => (
  <div className="w-full h-full flex items-center justify-center p-4">
    <div className="flex items-center gap-1 relative pt-6 pb-6 group-hover:gap-2 transition-all duration-500">
       <div className="absolute left-0 top-0 text-[9px] text-white/30 font-mono opacity-0 group-hover:opacity-100 transition-opacity duration-500">dequeue</div>
       <div className="absolute right-0 bottom-0 text-[9px] text-(--accent-secondary) font-mono opacity-0 group-hover:opacity-100 transition-opacity duration-500">enqueue</div>
       
       <div className="h-10 w-4 border-l border-y border-white/20 rounded-l opacity-50" />
       {[1, 2, 3, 4].map((v, i) => (
         <div key={i} className={`w-10 h-10 rounded border flex items-center justify-center font-mono text-xs ${i === 3 ? 'bg-(--accent-secondary)/10 border-(--accent-secondary)/40 text-(--accent-secondary) shadow-[0_0_10px_rgba(74,143,212,0.15)] group-hover:scale-110 transition-transform duration-500 z-10' : 'bg-[#090A0F] border-white/5 text-white/40'}`}>
           {v}
         </div>
       ))}
       <div className="h-10 w-4 border-r border-y border-white/20 rounded-r opacity-50" />
    </div>
  </div>
);

const MiniDeque = () => (
  <div className="w-full h-full flex items-center justify-center p-4">
    <div className="flex items-center gap-1 relative pt-6 pb-6 group-hover:scale-105 transition-transform duration-500">
       <div className="absolute left-0 top-0 text-[9px] text-(--accent-primary) font-mono text-center w-8 opacity-0 group-hover:opacity-100 transition-opacity duration-500">push<br/>pop</div>
       <div className="absolute right-0 bottom-0 text-[9px] text-(--accent-secondary) font-mono text-center w-8 opacity-0 group-hover:opacity-100 transition-opacity duration-500">push<br/>pop</div>
       
       <div className="flex items-center gap-1">
         <div className="text-(--accent-primary) text-xs opacity-50 group-hover:opacity-100 transition-opacity duration-500">↔</div>
         {[1, 2, 3, 4].map((v, i) => (
           <div key={i} className={`w-9 h-9 rounded-[4px] border flex items-center justify-center font-mono text-[11px] ${i === 0 ? 'bg-(--accent-primary)/10 border-(--accent-primary)/40 text-(--accent-primary) shadow-[0_0_10px_rgba(232,164,74,0.15)]' : i === 3 ? 'bg-(--accent-secondary)/10 border-(--accent-secondary)/40 text-(--accent-secondary) shadow-[0_0_10px_rgba(74,143,212,0.15)]' : 'bg-[#090A0F] border-white/5 text-white/40'}`}>
             {v}
           </div>
         ))}
         <div className="text-(--accent-secondary) text-xs opacity-50 group-hover:opacity-100 transition-opacity duration-500">↔</div>
       </div>
    </div>
  </div>
);

const MiniPriorityQueue = () => (
  <div className="w-full h-full flex flex-col items-center justify-center gap-4 p-4 group-hover:-translate-y-2 transition-transform duration-500">
    <div className="w-11 h-11 rounded-full border border-(--accent-primary)/50 bg-(--accent-primary)/10 text-(--accent-primary) flex items-center justify-center font-mono text-xs shadow-[0_0_15px_rgba(232,164,74,0.2)] group-hover:scale-110 group-hover:bg-(--accent-primary)/20 transition-all duration-500 z-10 relative">99</div>
    <div className="flex gap-10 relative">
       <svg className="absolute bottom-full left-1/2 -translate-x-1/2 w-14 h-6 overflow-visible -z-10" viewBox="0 0 56 24">
         <line x1="28" y1="0" x2="8" y2="24" stroke="rgba(255,255,255,0.1)" strokeWidth="2" className="group-hover:stroke-[rgba(255,255,255,0.2)] transition-colors duration-500" />
         <line x1="28" y1="0" x2="48" y2="24" stroke="rgba(255,255,255,0.1)" strokeWidth="2" className="group-hover:stroke-[rgba(255,255,255,0.2)] transition-colors duration-500" />
       </svg>
       <div className="w-9 h-9 rounded-full border border-white/10 bg-[#090A0F] text-white/40 flex items-center justify-center font-mono text-[10px] shadow-inner">45</div>
       <div className="w-9 h-9 rounded-full border border-white/10 bg-[#090A0F] text-white/40 flex items-center justify-center font-mono text-[10px] shadow-inner">72</div>
    </div>
  </div>
);

const MiniHashMap = () => (
  <div className="w-full h-full flex flex-col items-center justify-center gap-3 p-4">
     {[
       {k: '"id"', v: '101', active: false},
       {k: '"user"', v: '"vraj"', active: true},
       {k: '"role"', v: '"admin"', active: false}
     ].map((row, i) => (
       <div key={i} className={`flex items-center gap-3 transition-transform duration-500 ${row.active ? 'group-hover:translate-x-2' : ''}`}>
         <div className={`w-16 h-7 border rounded-[4px] flex items-center justify-center text-[10px] font-mono ${row.active ? 'bg-(--accent-secondary)/10 border-(--accent-secondary)/40 text-(--accent-secondary)' : 'bg-[#090A0F] border-white/5 text-white/30'}`}>{row.k}</div>
         <span className={`text-[10px] font-mono transition-colors duration-500 ${row.active ? 'text-(--accent-secondary)/50 group-hover:text-(--accent-secondary)' : 'text-white/10'}`}>→</span>
         <div className={`w-16 h-7 border rounded-[4px] flex items-center justify-center text-[10px] font-mono ${row.active ? 'bg-(--accent-secondary)/10 border-(--accent-secondary)/40 text-(--accent-secondary) shadow-[0_0_10px_rgba(74,143,212,0.15)] group-hover:scale-105 transition-transform duration-500' : 'bg-[#090A0F] border-white/5 text-white/30'}`}>{row.v}</div>
       </div>
     ))}
  </div>
);

const MiniHashSet = () => (
  <div className="w-full h-full flex items-center justify-center p-4">
     <div className="w-28 h-28 rounded-full border border-dashed border-white/20 flex flex-wrap items-center justify-center p-3 relative group-hover:border-white/30 group-hover:bg-white/2 transition-all duration-700">
        <div className="absolute -top-3 bg-[#030305] px-2 text-[9px] font-mono text-white/40">bucket</div>
        <div className="w-7 h-7 rounded-full bg-[#090A0F] border border-white/10 text-[9px] font-mono text-white/50 flex items-center justify-center m-1">A</div>
        <div className="w-7 h-7 rounded-full bg-(--accent-highlight)/10 border border-(--accent-highlight)/40 text-[9px] font-mono text-(--accent-highlight) flex items-center justify-center m-1 shadow-[0_0_15px_rgba(107,191,160,0.15)] group-hover:scale-110 transition-transform duration-500">B</div>
        <div className="w-7 h-7 rounded-full bg-[#090A0F] border border-white/10 text-[9px] font-mono text-white/50 flex items-center justify-center m-1">C</div>
     </div>
  </div>
);

const MiniCallStack = () => (
  <div className="w-full h-full flex items-center justify-center p-4">
    <div className="flex flex-col gap-1.5 w-40 relative group-hover:translate-x-2 transition-transform duration-500">
       <div className="absolute -left-6 top-2 bottom-2 w-px bg-white/10">
         <div className="w-1.5 h-1.5 bg-(--accent-highlight) rounded-full absolute left-[-2.5px] top-0 shadow-[0_0_8px_var(--accent-highlight)]" />
       </div>
       {[
         {name: 'dfs(node.left)', active: true},
         {name: 'dfs(node)', active: false},
         {name: 'main()', active: false}
       ].map((frame, i) => (
         <div key={i} className={`w-full p-2.5 border rounded-[4px] text-[10px] font-mono flex items-center justify-between transition-colors duration-500 ${frame.active ? 'bg-(--accent-highlight)/10 border-(--accent-highlight)/40 text-(--accent-highlight) group-hover:bg-(--accent-highlight)/20' : 'bg-[#090A0F] border-white/5 text-white/30'}`}>
            <span>{frame.name}</span>
            {frame.active && <span className="w-1.5 h-1.5 rounded-full bg-(--accent-highlight) animate-pulse" />}
         </div>
       ))}
    </div>
  </div>
);

const MiniVariables = () => (
  <div className="w-full h-full flex items-center justify-center p-4">
    <div className="w-full max-w-[220px] border border-white/10 rounded-xl bg-[#090A0F] overflow-hidden group-hover:border-white/20 group-hover:shadow-[0_10px_30px_-10px_rgba(0,0,0,0.5)] transition-all duration-700">
       <div className="bg-white/5 border-b border-white/10 px-4 py-2 flex items-center gap-2">
         <div className="w-2 h-2 rounded-full bg-white/20" />
         <span className="text-[10px] uppercase tracking-wider text-white/40 font-mono">Watch</span>
       </div>
       <div className="p-4 flex flex-col gap-3">
         <div className="flex justify-between items-center font-mono text-[11px]">
           <span className="text-white/40">i</span>
           <span className="text-white/80">42</span>
         </div>
         <div className="flex justify-between items-center font-mono text-[11px] bg-(--accent-secondary)/10 -mx-2 px-2 py-1 rounded-[4px] border border-(--accent-secondary)/20 relative overflow-hidden">
           <div className="absolute inset-0 bg-(--accent-secondary)/5 opacity-0 group-hover:opacity-100 group-hover:animate-pulse transition-opacity duration-500" />
           <span className="text-(--accent-secondary) relative z-10">curr</span>
           <span className="text-(--accent-secondary) relative z-10">Node(12)</span>
         </div>
         <div className="flex justify-between items-center font-mono text-[11px]">
           <span className="text-white/40">found</span>
           <span className="text-white/80">false</span>
         </div>
       </div>
    </div>
  </div>
);

const MiniOperations = () => (
  <div className="w-full h-full flex items-center justify-center p-4">
    <div className="flex flex-col gap-2.5 font-mono text-[11px] w-full max-w-[240px]">
       <div className="text-white/20 transition-colors duration-500 group-hover:text-white/30">Comparing A[1] and A[2]</div>
       <div className="text-white/20 transition-colors duration-500 group-hover:text-white/30">A[1] &gt; A[2], proceeding</div>
       <div className="text-(--accent-highlight) bg-(--accent-highlight)/10 border border-(--accent-highlight)/30 p-2 rounded-[4px] shadow-[0_0_15px_rgba(107,191,160,0.1)] group-hover:scale-105 transition-transform duration-500">swap(A[1], A[2])</div>
       <div className="text-white/40 flex items-center gap-2 mt-1">
         <span className="w-1.5 h-1.5 rounded-full bg-white/40 animate-pulse" />
         Incrementing i
       </div>
    </div>
  </div>
);

const MiniTimeline = () => (
  <div className="w-full h-full flex items-center justify-center p-4">
    <div className="w-full max-w-[260px] relative flex items-center">
       <div className="w-full h-1.5 bg-white/5 rounded-full relative group-hover:bg-white/10 transition-colors duration-500">
         <div className="absolute left-0 top-0 bottom-0 w-[60%] bg-linear-to-r from-(--accent-primary)/20 to-(--accent-primary) rounded-full" />
         <div className="absolute left-[60%] top-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-white border-[3px] border-(--accent-primary) shadow-[0_0_15px_var(--accent-primary)] group-hover:scale-125 transition-transform duration-500 cursor-pointer" />
         
         <div className="absolute left-[20%] top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-white/40 group-hover:bg-white/60 transition-colors duration-500" />
         <div className="absolute left-[40%] top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-white/40 group-hover:bg-white/60 transition-colors duration-500" />
         <div className="absolute left-[80%] top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-white/20 group-hover:bg-white/40 transition-colors duration-500" />
       </div>
       <div className="absolute -top-8 left-[60%] -translate-x-1/2 text-[10px] font-mono text-(--accent-primary) opacity-0 group-hover:opacity-100 group-hover:-top-10 transition-all duration-500">Step 42</div>
    </div>
  </div>
);

const MiniTree = () => (
  <div className="relative w-full h-full flex items-center justify-center p-4">
    <div className="absolute inset-0 z-20 flex items-center justify-center backdrop-blur-[1px] bg-[#030305]/40 rounded-3xl">
      <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 shadow-xl group-hover:bg-white/10 group-hover:border-white/20 transition-all duration-500">
         <span className="text-white/80 uppercase tracking-widest text-[10px] font-mono font-medium">In Development</span>
      </div>
    </div>
    <div className="flex flex-col items-center gap-6 opacity-30 group-hover:opacity-40 transition-opacity duration-700">
      <div className="w-10 h-10 rounded-full border border-dashed border-white/30 flex items-center justify-center font-mono text-[10px] text-white/30"></div>
      <div className="flex gap-12 relative">
         <svg className="absolute bottom-full left-1/2 -translate-x-1/2 w-16 h-6 overflow-visible" viewBox="0 0 64 24">
           <line x1="32" y1="0" x2="8" y2="24" stroke="rgba(255,255,255,0.2)" strokeWidth="1" strokeDasharray="3 3" />
           <line x1="32" y1="0" x2="56" y2="24" stroke="rgba(255,255,255,0.2)" strokeWidth="1" strokeDasharray="3 3" />
         </svg>
         <div className="w-10 h-10 rounded-full border border-dashed border-white/30 flex items-center justify-center font-mono text-[10px] text-white/30"></div>
         <div className="w-10 h-10 rounded-full border border-dashed border-white/30 flex items-center justify-center font-mono text-[10px] text-white/30"></div>
      </div>
    </div>
  </div>
);

// --- SHOWCASE DATA ---

const STRUCTURES = [
  { id: 'arrays', title: 'Arrays', desc: '1D continuous memory mapped natively.', Component: MiniArray },
  { id: 'matrices', title: 'Matrices', desc: 'Multi-dimensional grids for spatial traversal.', Component: MiniMatrix },
  { id: 'strings', title: 'Strings', desc: 'Character sequences tracked with sliding pointers.', Component: MiniString },
  { id: 'linked-lists', title: 'Linked Lists', desc: 'Follow every reference pointer seamlessly.', Component: MiniLinkedList },
  { id: 'stacks', title: 'Stacks', desc: 'LIFO execution collections monitored live.', Component: MiniStack },
  { id: 'queues', title: 'Queues', desc: 'FIFO collections with enqueue/dequeue tracking.', Component: MiniQueue },
  { id: 'deques', title: 'Deques', desc: 'Double-ended queues with bidirectional access.', Component: MiniDeque },
  { id: 'priority-queues', title: 'Priority Queues', desc: 'Heap-based prioritization and sorting visualization.', Component: MiniPriorityQueue },
  { id: 'hashmaps', title: 'Hash Maps', desc: 'Key-value relationships and collisions exposed.', Component: MiniHashMap },
  { id: 'hashsets', title: 'Hash Sets', desc: 'Buckets of unique values organized automatically.', Component: MiniHashSet },
  { id: 'call-stack', title: 'Call Stack', desc: 'Live recursion depth and frame tracking.', Component: MiniCallStack },
  { id: 'variables', title: 'Variables', desc: 'Isolated scope watch panels updating per step.', Component: MiniVariables },
  { id: 'operations', title: 'Operations', desc: 'Micro-step execution logging for absolute clarity.', Component: MiniOperations },
  { id: 'timeline', title: 'Execution Timeline', desc: 'Time-travel debugging scrubber for complete control.', Component: MiniTimeline },
  { id: 'trees', title: 'Trees & Tries', desc: 'Deep recursion visualized with full branch awareness.', Component: MiniTree },
];

export default function DataStructuresShowcase() {
  const containerRef = useRef(null);
  
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"]
  });

  // Smooth progress for horizontal translation to avoid jitter
  const smoothProgress = useSpring(scrollYProgress, {
    damping: 30,
    stiffness: 100,
    mass: 0.5
  });

  // Translate the flex container to the left by [0, -100% + 100vw]
  // We use a callback function to return the complex calc string because
  // Framer Motion cannot interpolate between mismatched string formats like "0%" and "calc(...)".
  const x = useTransform(smoothProgress, (p) => `calc(${-p * 100}% + ${p * 100}vw)`);

  const { scrollY } = useScroll();
  const scrollVelocity = useVelocity(scrollY);
  
  // Smooth the velocity specifically for the morphing effect
  const smoothVelocity = useSpring(scrollVelocity, {
    damping: 50,
    stiffness: 400
  });

  // Map vertical velocity to a subtle horizontal skew (-3deg to 3deg)
  const skewX = useTransform(smoothVelocity, [-1000, 1000], [-3, 3]);

  return (
    <section ref={containerRef} className="relative bg-background h-[1000vh]">
      <div className="sticky top-0 w-full h-screen overflow-hidden flex flex-col py-16 md:py-20 lg:py-24">
        {/* Background glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1000px] h-[600px] bg-(--accent-secondary) blur-[200px] opacity-[0.03] rounded-full pointer-events-none" />

        {/* Section Header */}
        <div className="px-6 md:px-12 shrink-0 mb-10 md:mb-16 lg:mb-20 relative z-10 pointer-events-none">
          <div className="flex flex-col lg:flex-row items-start lg:items-end justify-between gap-6 lg:gap-10">
            <div className="max-w-2xl">
              <div className="flex items-center gap-3 mb-4 lg:mb-6">
                <div className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 backdrop-blur-md">
                  <span className="w-1.5 h-1.5 rounded-full bg-(--accent-secondary) shadow-[0_0_8px_var(--accent-secondary)]" />
                  <span className="text-white/80 uppercase tracking-[0.25em] text-[10px] font-semibold font-ui">Data Structures</span>
                </div>
              </div>
              
              <h2 className="text-[clamp(2.5rem,6vw,6.5rem)] font-display font-medium leading-[0.95] tracking-tighter text-white">
                Every structure.<br />
                <span className="font-serif italic font-light text-(--accent-secondary) tracking-normal pr-4">Visible.</span>
              </h2>
            </div>
            <p className="text-white/40 text-base md:text-lg lg:text-xl leading-[1.7] max-w-md font-light tracking-wide lg:pb-4 font-ui">
              Built for how algorithms actually work. The platform natively understands and visualizes <span className="text-white/80">standard data structures</span> and <span className="text-white/80">complex topologies</span> in real-time.
            </p>
          </div>
        </div>

        {/* Horizontal Gallery */}
        <div className="flex-1 w-full relative z-10 flex items-center min-h-0 mt-16">
          <motion.div style={{ x }} className="flex gap-4 md:gap-8 px-6 md:px-[10vw] pb-8 md:pb-12 w-max items-center h-full max-h-full">
            {STRUCTURES.map((struct, idx) => (
              <motion.div 
                key={struct.id}
                style={{ skewX }}
                className="shrink-0 w-[80vw] sm:w-[45vw] lg:w-[32vw] xl:w-[24vw] h-[320px] md:h-[380px] lg:h-[400px] group relative rounded-[28px] bg-[#030305] border border-white/5 overflow-hidden flex flex-col transition-colors duration-700 hover:bg-[#090A0F] cursor-pointer"
              >
                {/* Hover gradient overlay */}
                <div className="absolute inset-0 bg-linear-to-br from-white/0 via-white/2 to-white/0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none z-20" />
                
                {/* Large Background Index (Watermark) */}
                <div className="absolute top-0 right-0 p-6 md:p-8 opacity-[0.04] pointer-events-none group-hover:opacity-[0.1] transition-opacity duration-700 z-0">
                  <span className="text-[40px] md:text-[60px] leading-none font-display text-white">{String(idx + 1).padStart(2, '0')}</span>
                </div>
                
                {/* Card Header */}
                <div className="p-6 md:p-8 pr-24 md:pr-32 z-30 relative pointer-events-none border-b border-white/5 bg-white/2">
                  <h3 className="text-white/90 text-xl md:text-2xl font-medium tracking-wide mb-2 font-ui">{struct.title}</h3>
                  <p className="text-white/40 text-xs md:text-sm font-light leading-relaxed font-ui">{struct.desc}</p>
                </div>
                
                {/* Live Micro-Visualization */}
                <div className="flex-1 w-full h-full relative z-10 flex items-center justify-center p-6 overflow-hidden">
                   <struct.Component />
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>

      </div>
    </section>
  );
}
