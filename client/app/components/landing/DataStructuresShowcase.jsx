"use client";

import React, { useRef } from "react";
import { motion, useScroll, useTransform, useSpring, useVelocity } from "framer-motion";
import SectionEyebrow from "./ui/SectionEyebrow";

// --- MICRO-VISUALIZATIONS ---

const MiniArray = () => (
  <div className="w-full h-full flex items-center justify-center p-4">
    <div className="flex gap-0.5 group-hover:gap-1.5 transition-all duration-500">
      {[4, 8, 15, 16, 23, 42].map((v, i) => (
        <div key={i} className={`w-8 h-8 rounded-[4px] flex items-center justify-center font-mono text-[11px] border ${i === 2 ? 'bg-(--accent-secondary)/10 border-(--accent-secondary)/50 text-(--accent-secondary) shadow-[0_0_10px_rgba(74,143,212,0.15)] group-hover:bg-(--accent-secondary)/20 transition-colors duration-500 scale-110 relative z-10' : 'bg-(--bg-surface) border-white/5 text-white/40 group-hover:border-white/10 transition-colors duration-500'}`}>
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
        <div key={i} className={`w-6 h-6 rounded-[2px] border flex items-center justify-center text-[9px] font-mono transition-all duration-500 ${i === 5 || i === 10 ? 'bg-(--accent-highlight)/10 border-(--accent-highlight)/40 text-(--accent-highlight) shadow-[0_0_8px_rgba(107,191,160,0.2)] group-hover:bg-(--accent-highlight)/20 group-hover:scale-110 z-10 relative' : 'bg-(--bg-surface) border-white/5 text-white/20'}`}>
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
          <div className={`w-11 h-11 rounded-xl flex items-center justify-center font-mono text-xs border ${i === 1 ? 'bg-(--accent-secondary)/10 border-(--accent-secondary)/50 text-(--accent-secondary) shadow-[0_0_15px_rgba(74,143,212,0.15)] group-hover:bg-(--accent-secondary)/20 transition-colors duration-500' : 'bg-(--bg-surface) border-white/5 text-white/50 shadow-inner'}`}>
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
         <div key={i} className={`w-full h-8 rounded border flex items-center justify-center font-mono text-xs ${i === 0 ? 'bg-(--accent-highlight)/10 border-(--accent-highlight)/40 text-(--accent-highlight) shadow-[0_0_15px_rgba(107,191,160,0.1)] group-hover:scale-105 transition-transform duration-500 z-10 relative mt-1' : 'bg-(--bg-surface) border-white/5 text-white/40 mt-1'}`}>
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
         <div key={i} className={`w-10 h-10 rounded border flex items-center justify-center font-mono text-xs ${i === 3 ? 'bg-(--accent-secondary)/10 border-(--accent-secondary)/40 text-(--accent-secondary) shadow-[0_0_10px_rgba(74,143,212,0.15)] group-hover:scale-110 transition-transform duration-500 z-10' : 'bg-(--bg-surface) border-white/5 text-white/40'}`}>
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
           <div key={i} className={`w-9 h-9 rounded-[4px] border flex items-center justify-center font-mono text-[11px] ${i === 0 ? 'bg-(--accent-primary)/10 border-(--accent-primary)/40 text-(--accent-primary) shadow-[0_0_10px_rgba(var(--accent-primary-rgb, 211, 123, 80), 0.15)]' : i === 3 ? 'bg-(--accent-secondary)/10 border-(--accent-secondary)/40 text-(--accent-secondary) shadow-[0_0_10px_rgba(74,143,212,0.15)]' : 'bg-(--bg-surface) border-white/5 text-white/40'}`}>
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
    <div className="w-11 h-11 rounded-full border border-(--accent-primary)/50 bg-(--accent-primary)/10 text-(--accent-primary) flex items-center justify-center font-mono text-xs shadow-[0_0_15px_rgba(var(--accent-primary-rgb, 211, 123, 80), 0.2)] group-hover:scale-110 group-hover:bg-(--accent-primary)/20 transition-all duration-500 z-10 relative">99</div>
    <div className="flex gap-10 relative">
       <svg className="absolute bottom-full left-1/2 -translate-x-1/2 w-14 h-6 overflow-visible -z-10" viewBox="0 0 56 24">
         <line x1="28" y1="0" x2="8" y2="24" stroke="rgba(255,255,255,0.1)" strokeWidth="2" className="group-hover:stroke-[rgba(255,255,255,0.2)] transition-colors duration-500" />
         <line x1="28" y1="0" x2="48" y2="24" stroke="rgba(255,255,255,0.1)" strokeWidth="2" className="group-hover:stroke-[rgba(255,255,255,0.2)] transition-colors duration-500" />
       </svg>
       <div className="w-9 h-9 rounded-full border border-white/10 bg-(--bg-surface) text-white/40 flex items-center justify-center font-mono text-[10px] shadow-inner">45</div>
       <div className="w-9 h-9 rounded-full border border-white/10 bg-(--bg-surface) text-white/40 flex items-center justify-center font-mono text-[10px] shadow-inner">72</div>
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
         <div className={`w-16 h-7 border rounded-[4px] flex items-center justify-center text-[10px] font-mono ${row.active ? 'bg-(--accent-secondary)/10 border-(--accent-secondary)/40 text-(--accent-secondary)' : 'bg-(--bg-surface) border-white/5 text-white/30'}`}>{row.k}</div>
         <span className={`text-[10px] font-mono transition-colors duration-500 ${row.active ? 'text-(--accent-secondary)/50 group-hover:text-(--accent-secondary)' : 'text-white/10'}`}>→</span>
         <div className={`w-16 h-7 border rounded-[4px] flex items-center justify-center text-[10px] font-mono ${row.active ? 'bg-(--accent-secondary)/10 border-(--accent-secondary)/40 text-(--accent-secondary) shadow-[0_0_10px_rgba(74,143,212,0.15)] group-hover:scale-105 transition-transform duration-500' : 'bg-(--bg-surface) border-white/5 text-white/30'}`}>{row.v}</div>
       </div>
     ))}
  </div>
);

const MiniHashSet = () => (
  <div className="w-full h-full flex items-center justify-center p-4">
     <div className="w-28 h-28 rounded-full border border-dashed border-white/20 flex flex-wrap items-center justify-center p-3 relative group-hover:border-white/30 group-hover:bg-white/2 transition-all duration-700">
        <div className="absolute -top-3 bg-background px-2 text-[9px] font-mono text-white/40">bucket</div>
        <div className="w-7 h-7 rounded-full bg-(--bg-surface) border border-white/10 text-[9px] font-mono text-white/50 flex items-center justify-center m-1">A</div>
        <div className="w-7 h-7 rounded-full bg-(--accent-highlight)/10 border border-(--accent-highlight)/40 text-[9px] font-mono text-(--accent-highlight) flex items-center justify-center m-1 shadow-[0_0_15px_rgba(107,191,160,0.15)] group-hover:scale-110 transition-transform duration-500">B</div>
        <div className="w-7 h-7 rounded-full bg-(--bg-surface) border border-white/10 text-[9px] font-mono text-white/50 flex items-center justify-center m-1">C</div>
     </div>
  </div>
);

const MiniGraph = () => (
  <div className="w-full h-full flex items-center justify-center p-4">
    <div className="relative w-24 h-24 group-hover:scale-105 transition-transform duration-500">
      <svg className="absolute inset-0 w-full h-full overflow-visible" viewBox="0 0 100 100">
        {/* Edges */}
        <line x1="50" y1="10" x2="10" y2="90" stroke="rgba(255,255,255,0.1)" strokeWidth="2" className="group-hover:stroke-[rgba(255,255,255,0.2)] transition-colors duration-500" />
        <line x1="50" y1="10" x2="90" y2="90" stroke="rgba(255,255,255,0.1)" strokeWidth="2" className="group-hover:stroke-[rgba(255,255,255,0.2)] transition-colors duration-500" />
        <line x1="10" y1="90" x2="90" y2="90" stroke="rgba(255,255,255,0.1)" strokeWidth="2" className="group-hover:stroke-[rgba(255,255,255,0.2)] transition-colors duration-500" />
        
        {/* Nodes */}
        <circle cx="50" cy="10" r="16" className="fill-(--bg-surface) stroke-white/10 stroke-2 group-hover:fill-(--accent-secondary)/10 group-hover:stroke-(--accent-secondary)/40 transition-all duration-500" />
        <text x="50" y="13" textAnchor="middle" className="text-[12px] font-mono fill-white/40 group-hover:fill-(--accent-secondary) transition-colors duration-500">A</text>
        
        <circle cx="10" cy="90" r="16" className="fill-(--bg-surface) stroke-white/10 stroke-2 group-hover:stroke-white/20 transition-all duration-500" />
        <text x="10" y="93" textAnchor="middle" className="text-[12px] font-mono fill-white/40 group-hover:fill-white/60 transition-colors duration-500">B</text>
        
        <circle cx="90" cy="90" r="16" className="fill-(--bg-surface) stroke-white/10 stroke-2 group-hover:stroke-white/20 transition-all duration-500" />
        <text x="90" y="93" textAnchor="middle" className="text-[12px] font-mono fill-white/40 group-hover:fill-white/60 transition-colors duration-500">C</text>
      </svg>
    </div>
  </div>
);


const MiniTree = () => (
  <div className="relative w-full h-full flex items-center justify-center p-4">
    <div className="flex flex-col items-center transition-transform duration-500 group-hover:scale-105">
      {/* Root Node */}
      <div className="w-10 h-10 rounded-full border border-white/10 bg-(--bg-surface) flex items-center justify-center font-mono text-[11px] text-white/40 shadow-inner group-hover:border-(--accent-primary)/40 group-hover:bg-(--accent-primary)/10 group-hover:text-(--accent-primary) transition-all duration-500 relative z-10">
        42
      </div>
      
      {/* Edges Level 1 */}
      <svg className="w-24 h-8 overflow-visible -mt-2" viewBox="0 0 96 32">
         <line x1="48" y1="0" x2="20" y2="32" stroke="rgba(255,255,255,0.1)" strokeWidth="2" className="group-hover:stroke-[rgba(255,255,255,0.2)] transition-colors duration-500" />
         <line x1="48" y1="0" x2="76" y2="32" stroke="rgba(255,255,255,0.1)" strokeWidth="2" className="group-hover:stroke-[rgba(255,255,255,0.2)] transition-colors duration-500" />
      </svg>
      
      {/* Level 1 Nodes */}
      <div className="flex gap-8 relative z-10 -mt-2">
         {/* Left Child */}
         <div className="relative flex flex-col items-center">
           <div className="w-10 h-10 rounded-full border border-white/10 bg-(--bg-surface) flex items-center justify-center font-mono text-[11px] text-white/40 shadow-inner transition-all duration-500 group-hover:border-white/20">
             15
           </div>
           
           {/* Edges Level 2 */}
           <svg className="w-16 h-6 overflow-visible -mt-1" viewBox="0 0 64 24">
              <line x1="32" y1="0" x2="12" y2="24" stroke="rgba(255,255,255,0.1)" strokeWidth="2" className="group-hover:stroke-[rgba(255,255,255,0.2)] transition-colors duration-500" />
              <line x1="32" y1="0" x2="52" y2="24" stroke="rgba(255,255,255,0.1)" strokeWidth="2" className="group-hover:stroke-[rgba(255,255,255,0.2)] transition-colors duration-500" />
           </svg>
           
           {/* Level 2 Nodes */}
           <div className="flex gap-2 relative z-10 -mt-1">
              <div className="w-8 h-8 rounded-full border border-white/10 bg-(--bg-surface) flex items-center justify-center font-mono text-[9px] text-white/40 shadow-inner transition-all duration-500 group-hover:border-(--accent-highlight)/30 group-hover:bg-(--accent-highlight)/10 group-hover:text-(--accent-highlight)">8</div>
              <div className="w-8 h-8 rounded-full border border-white/10 bg-(--bg-surface) flex items-center justify-center font-mono text-[9px] text-white/40 shadow-inner transition-all duration-500 group-hover:border-white/20">23</div>
           </div>
         </div>
         
         {/* Right Child */}
         <div className="relative flex flex-col items-center">
           <div className="w-10 h-10 rounded-full border border-white/10 bg-(--bg-surface) flex items-center justify-center font-mono text-[11px] text-white/40 shadow-inner transition-all duration-500 group-hover:border-(--accent-secondary)/30 group-hover:bg-(--accent-secondary)/10 group-hover:text-(--accent-secondary)">
             89
           </div>
           
           {/* Right Child's Right edge */}
           <svg className="w-16 h-6 overflow-visible -mt-1" viewBox="0 0 64 24">
              <line x1="32" y1="0" x2="52" y2="24" stroke="rgba(255,255,255,0.1)" strokeWidth="2" className="group-hover:stroke-[rgba(255,255,255,0.2)] transition-colors duration-500" />
           </svg>
           
           <div className="flex relative z-10 -mt-1 ml-10">
              <div className="w-8 h-8 rounded-full border border-white/10 bg-(--bg-surface) flex items-center justify-center font-mono text-[9px] text-white/40 shadow-inner transition-all duration-500 group-hover:border-white/20">99</div>
           </div>
         </div>
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
  { id: 'graphs', title: 'Graphs', desc: 'Complex relationships mapped and pathfinded.', Component: MiniGraph },
  { id: 'trees', title: 'Trees', desc: 'Visualized with full branch awareness.', Component: MiniTree },
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
    <section id="data-structures" ref={containerRef} className="relative bg-background h-[1000vh]">
      <div className="sticky top-0 w-full h-screen overflow-hidden flex flex-col py-16 md:py-20 lg:py-24">
        {/* Background glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1000px] h-[600px] bg-(--accent-secondary) blur-[200px] opacity-[0.03] rounded-full pointer-events-none" />

        {/* Section Header */}
        <div className="px-6 md:px-12 shrink-0 mb-10 md:mb-16 lg:mb-20 relative z-10 pointer-events-none">
          <div className="flex flex-col lg:flex-row items-start lg:items-end justify-between gap-6 lg:gap-10">
            <div className="max-w-2xl">
              <SectionEyebrow title="Data Structures" phase="SYS.TOPOLOGY" accentClass="text-(--accent-secondary)" />
              
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
                className="shrink-0 w-[80vw] sm:w-[45vw] lg:w-[32vw] xl:w-[24vw] h-[320px] md:h-[380px] lg:h-[400px] group relative rounded-[28px] bg-background border border-white/5 overflow-hidden flex flex-col transition-colors duration-700 hover:bg-(--bg-surface) cursor-pointer"
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
