"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

// --- Mock Visualizers ---

const BinarySearchDemo = ({ step }) => {
  const arr = [2, 4, 6, 8, 10, 12, 14, 16];
  const states = [
    { L: 0, R: 7, M: 3, msg: "mid = 3 (val: 8). 8 < 10, searching right half." },
    { L: 4, R: 7, M: 5, msg: "mid = 5 (val: 12). 12 > 10, searching left half." },
    { L: 4, R: 4, M: 4, msg: "mid = 4 (val: 10). Target found!" },
    { L: 4, R: 4, M: 4, msg: "Execution complete." }
  ];
  const s = states[step] || states[0];

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="w-full h-full flex flex-col items-center justify-center relative p-8">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-(--accent-secondary) blur-[120px] opacity-[0.05] rounded-full pointer-events-none" />
      <div className="flex gap-2 relative z-10">
        {arr.map((val, i) => {
          const isL = i === s.L;
          const isR = i === s.R;
          const isM = i === s.M;
          const isOutOfRange = i < s.L || i > s.R;
          
          return (
            <div key={i} className="flex flex-col items-center">
              <div className={`w-10 h-10 md:w-12 md:h-12 flex items-center justify-center rounded-xl border font-mono text-sm md:text-base transition-all duration-500 ${isM ? 'bg-(--accent-secondary)/20 border-(--accent-secondary) text-(--accent-secondary) shadow-[0_0_20px_rgba(79,140,255,0.3)] scale-110 z-10' : isOutOfRange ? 'bg-white/2 border-white/5 text-white/20' : 'bg-[#090A0F] border-white/10 text-white/80 shadow-inner'}`}>
                {val}
              </div>
              <div className="h-8 mt-3 relative w-full flex justify-center">
                <AnimatePresence>
                  {isL && <motion.span key="L" initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -5 }} className="absolute text-[10px] text-(--accent-highlight) font-mono font-bold bg-[#050508] px-1 rounded">L</motion.span>}
                  {isR && <motion.span key="R" initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -5 }} className="absolute text-[10px] text-(--accent-secondary) font-mono font-bold bg-[#050508] px-1 rounded">R</motion.span>}
                  {isM && <motion.span key="M" initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 5 }} className="absolute text-[10px] text-(--accent-secondary) font-mono font-bold top-4 bg-[#050508] px-1 rounded">M</motion.span>}
                </AnimatePresence>
              </div>
            </div>
          )
        })}
      </div>
      <div className="absolute bottom-6 px-5 py-2.5 bg-black/40 backdrop-blur-md border border-white/10 rounded-full text-xs text-white/60 font-mono shadow-xl">
        {s.msg}
      </div>
    </motion.div>
  );
};

const ReverseListDemo = ({ step }) => {
  const states = [
    { prev: null, curr: 0, next: 1, msg: "Initialize pointers. prev = null, curr = head." },
    { prev: 0, curr: 1, next: 2, msg: "Reverse link: 1 -> 0. Move pointers forward." },
    { prev: 1, curr: 2, next: 3, msg: "Reverse link: 2 -> 1. Move pointers forward." },
    { prev: 2, curr: 3, next: null, msg: "Reverse link: 3 -> 2. Done. New head is 3." },
  ];
  const s = states[step] || states[0];

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="w-full h-full flex flex-col items-center justify-center relative p-8">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-(--accent-highlight) blur-[120px] opacity-[0.05] rounded-full pointer-events-none" />
      <div className="flex items-center gap-10 md:gap-16 z-10">
        {[12, 99, 37, 42].map((val, i) => {
          const isPrev = i === s.prev;
          const isCurr = i === s.curr;
          const isNext = i === s.next;
          const isReversed = s.prev !== null && i <= s.prev;

          return (
            <div key={i} className="relative flex flex-col items-center">
              <div className={`w-12 h-12 md:w-14 md:h-14 flex items-center justify-center rounded-2xl border font-mono text-sm md:text-base transition-all duration-500 z-10 ${isCurr ? 'bg-(--accent-secondary)/20 border-(--accent-secondary) text-(--accent-secondary) shadow-[0_0_20px_rgba(79,140,255,0.3)] scale-110' : isPrev ? 'bg-(--accent-highlight)/15 border-(--accent-highlight)/50 text-(--accent-highlight)' : 'bg-[#090A0F] border-white/10 text-white/80 shadow-inner'}`}>
                {val}
              </div>
              <div className="h-6 mt-3 relative w-full flex justify-center">
                {isPrev && <motion.span key="prev" layoutId="prev" className="absolute text-[10px] text-(--accent-highlight) font-mono bg-[#050508] px-1 rounded">prev</motion.span>}
                {isCurr && <motion.span key="curr" layoutId="curr" className="absolute text-[10px] text-(--accent-secondary) font-mono bg-[#050508] px-1 rounded">curr</motion.span>}
                {isNext && <motion.span key="next" layoutId="next" className="absolute text-[10px] text-white/40 font-mono bg-[#050508] px-1 rounded">next</motion.span>}
              </div>
              
              {/* Edge */}
              {i < 3 && (
                <div className="absolute left-full top-[40%] md:top-[45%] -translate-y-1/2 w-10 md:w-16 h-[2px] transition-all duration-500 z-0">
                  {isReversed ? (
                    <div className="w-full h-full bg-(--accent-highlight) relative opacity-80">
                        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-0 h-0 border-y-[5px] border-y-transparent border-r-[7px] border-r-(--accent-highlight)" />
                    </div>
                  ) : (
                    <div className="w-full h-full bg-white/20 relative">
                        <div className="absolute right-0 top-1/2 -translate-y-1/2 w-0 h-0 border-y-[5px] border-y-transparent border-l-[7px] border-l-white/20" />
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
      <div className="absolute bottom-6 px-5 py-2.5 bg-black/40 backdrop-blur-md border border-white/10 rounded-full text-xs text-white/60 font-mono shadow-xl">
        {s.msg}
      </div>
    </motion.div>
  )
};

const SlidingWindowDemo = ({ step }) => {
  const chars = ['a', 'b', 'c', 'a', 'b', 'c', 'b', 'b'];
  const states = [
    { L: 0, R: 0, msg: "Expand window to include 'a'." },
    { L: 0, R: 1, msg: "Expand window to include 'b'." },
    { L: 0, R: 2, msg: "Expand window to include 'c'. Max length = 3." },
    { L: 1, R: 3, msg: "Duplicate 'a' found. Shrink left pointer." },
  ];
  const s = states[step] || states[0];
  
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="w-full h-full flex flex-col items-center justify-center relative p-8">
       <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-(--accent-highlight) blur-[120px] opacity-[0.05] rounded-full pointer-events-none" />
       <div className="flex gap-2 relative p-4 z-10">
         {chars.map((char, i) => {
            const inWindow = i >= s.L && i <= s.R;
            return (
              <div key={i} className={`w-8 h-12 md:w-10 md:h-14 flex items-center justify-center font-mono text-base md:text-lg border-b-2 transition-colors duration-500 ${inWindow ? 'border-(--accent-highlight) text-(--accent-highlight)' : 'border-white/10 text-white/40'}`}>
                {char}
              </div>
            )
         })}
         {/* The Window Box - Calculated using rem offsets based on cell widths */}
         {/* cell = 2.5rem (w-10) + 0.5rem gap = 3rem stride. container padding = 1rem. */}
         <motion.div 
            animate={{ left: `${(s.L * 3) + 1}rem`, width: `${((s.R - s.L) * 3) + 2.5}rem` }}
            transition={{ duration: 0.5, ease: "easeInOut" }}
            className="absolute top-2 bottom-4 border-2 border-(--accent-highlight)/50 bg-(--accent-highlight)/10 rounded-lg pointer-events-none shadow-[0_0_20px_rgba(0,208,132,0.15)] flex flex-col items-center"
         >
            <span className="absolute -top-6 text-[9px] text-(--accent-highlight) font-mono tracking-widest uppercase bg-[#050508] px-2 py-0.5 rounded-full border border-(--accent-highlight)/20">Window</span>
         </motion.div>
       </div>
       <div className="absolute bottom-6 px-5 py-2.5 bg-black/40 backdrop-blur-md border border-white/10 rounded-full text-xs text-white/60 font-mono shadow-xl">
         {s.msg}
       </div>
    </motion.div>
  )
};

const DFSTraversalDemo = ({ step }) => {
  const states = [
    { curr: 0, visited: [0], msg: "Start at root node 0." },
    { curr: 1, visited: [0, 1], msg: "Traverse down to left child 1." },
    { curr: 3, visited: [0, 1, 3], msg: "Traverse down to leaf 3." },
    { curr: 1, visited: [0, 1, 3], msg: "Backtrack to 1." },
  ];
  const s = states[step] || states[0];

  const nodes = [
    { id: 0, x: "50%", y: "20%" },
    { id: 1, x: "30%", y: "50%" },
    { id: 2, x: "70%", y: "50%" },
    { id: 3, x: "20%", y: "80%" },
    { id: 4, x: "40%", y: "80%" },
  ];

  const edges = [
    { from: 0, to: 1 }, { from: 0, to: 2 },
    { from: 1, to: 3 }, { from: 1, to: 4 }
  ];

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="w-full h-full relative p-8 flex items-center justify-center">
       <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-(--accent-secondary) blur-[120px] opacity-[0.05] rounded-full pointer-events-none" />
       <div className="relative w-64 h-64 z-10">
         <svg className="absolute inset-0 w-full h-full overflow-visible z-0">
           {edges.map((edge, i) => {
             const fromNode = nodes[edge.from];
             const toNode = nodes[edge.to];
             const isActive = s.visited.includes(edge.from) && s.visited.includes(edge.to);
             return (
               <line key={i} x1={fromNode.x} y1={fromNode.y} x2={toNode.x} y2={toNode.y} stroke={isActive ? "var(--accent-secondary)" : "rgba(255,255,255,0.1)"} strokeWidth={isActive ? 3 : 2} className="transition-all duration-500" />
             )
           })}
         </svg>
         {nodes.map(node => {
            const isCurr = s.curr === node.id;
            const isVisited = s.visited.includes(node.id);
            return (
              <div key={node.id} className={`absolute -translate-x-1/2 -translate-y-1/2 w-10 h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center font-mono text-sm transition-all duration-500 z-10 ${isCurr ? 'bg-(--accent-secondary) text-white shadow-[0_0_25px_rgba(157,78,221,0.5)] scale-110 border-2 border-white' : isVisited ? 'bg-(--accent-secondary)/20 border border-(--accent-secondary)/50 text-(--accent-secondary)' : 'bg-[#090A0F] border border-white/20 text-white/50 shadow-inner'}`} style={{ top: node.y, left: node.x }}>
                {node.id}
              </div>
            )
         })}
       </div>
       <div className="absolute bottom-6 px-5 py-2.5 bg-black/40 backdrop-blur-md border border-white/10 rounded-full text-xs text-white/60 font-mono text-center shadow-xl">
         {s.msg}
       </div>
    </motion.div>
  )
};


// --- Icons ---
const PlayIcon = () => <svg className="w-4 h-4 ml-0.5" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>;
const PauseIcon = () => <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/></svg>;
const ResetIcon = () => <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12 5V1L7 6l5 5V7c3.31 0 6 2.69 6 6s-2.69 6-6 6-6-2.69-6-6H4c0 4.42 3.58 8 8 8s8-3.58 8-8-3.58-8-8-8z"/></svg>;
const StepIcon = () => <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M5 5h2v14H5zm3 7l8.5 6V6z"/></svg>;


// --- Main Component ---
export default function InteractiveDemoExperience() {
  const [activeTab, setActiveTab] = useState("binary-search");
  const [step, setStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);

  const algorithms = {
    "binary-search": {
      name: "Binary Search",
      maxSteps: 4,
      render: (step) => <BinarySearchDemo step={step} />
    },
    "reverse-list": {
      name: "Reverse Linked List",
      maxSteps: 4,
      render: (step) => <ReverseListDemo step={step} />
    },
    "sliding-window": {
      name: "Sliding Window",
      maxSteps: 4,
      render: (step) => <SlidingWindowDemo step={step} />
    },
    "dfs": {
      name: "DFS Traversal",
      maxSteps: 4,
      render: (step) => <DFSTraversalDemo step={step} />
    }
  };

  useEffect(() => {
    let timer;
    if (isPlaying) {
      timer = setInterval(() => {
        setStep((s) => {
          if (s >= algorithms[activeTab].maxSteps - 1) {
            setIsPlaying(false);
            return s; // Stay on last step
          }
          return s + 1;
        });
      }, 1800);
    }
    return () => clearInterval(timer);
  }, [isPlaying, activeTab, algorithms]);

  const handleTabChange = (id) => {
    setIsPlaying(false);
    setActiveTab(id);
    setStep(0);
  };

  const handlePlayPause = () => {
    if (step >= algorithms[activeTab].maxSteps - 1) {
      setStep(0); // auto reset if at end
    }
    setIsPlaying(!isPlaying);
  };

  const handleStep = () => {
    setIsPlaying(false);
    if (step < algorithms[activeTab].maxSteps - 1) {
      setStep(step + 1);
    }
  };

  const handleReset = () => {
    setIsPlaying(false);
    setStep(0);
  };

  return (
    <section id="interactive-demo" className="relative py-32 md:py-48 bg-background overflow-hidden border-t border-white/2">
      <div className="max-w-[1200px] mx-auto px-6 md:px-12 relative z-10">
        
        {/* Section Header */}
        <div className="text-center mb-12 md:mb-16">
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="flex items-center justify-center gap-4 mb-8"
          >
             <div className="h-px w-8 bg-linear-to-r from-transparent to-(--accent-secondary)" />
             <span className="text-(--accent-secondary) uppercase tracking-[0.25em] text-xs font-semibold">Interactive Demo</span>
             <div className="h-px w-8 bg-linear-to-l from-transparent to-(--accent-secondary)" />
          </motion.div>
          
          <motion.h2 
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-5xl sm:text-6xl md:text-7xl lg:text-[5.5rem] font-display font-medium leading-[1.05] tracking-tight mb-8 text-white"
          >
            Pick an <span className="font-mono font-medium text-[0.85em] tracking-tight text-white/80 align-baseline">algorithm</span>.<br />
            <span className="text-white/60">Watch it unfold.</span>
          </motion.h2>
          
          <motion.p 
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="text-white/40 text-lg md:text-xl leading-relaxed font-light max-w-xl mx-auto"
          >
            Don't imagine it. Watch it. Experience how the platform makes <span className="font-mono text-[0.9em] text-white/60 uppercase tracking-widest">complex transitions</span> immediately obvious.
          </motion.p>
        </div>

        {/* Interactive Experience Container */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8 }}
          className="w-full max-w-5xl mx-auto flex flex-col gap-8"
        >
          
          {/* Segmented Control */}
          <div className="flex flex-wrap justify-center gap-2 md:gap-3">
            {Object.entries(algorithms).map(([id, alg]) => (
              <button 
                key={id}
                onClick={() => handleTabChange(id)}
                className={`px-5 py-2.5 rounded-full text-[13px] md:text-sm font-medium transition-all duration-300 border ${
                  activeTab === id 
                  ? 'bg-white/10 border-white/20 text-white shadow-[0_0_20px_rgba(255,255,255,0.1)] backdrop-blur-md' 
                  : 'bg-transparent border-transparent text-white/40 hover:text-white/70 hover:bg-white/5'
                }`}
              >
                {alg.name}
              </button>
            ))}
          </div>

          {/* Premium Player Chrome */}
          <div className="w-full rounded-4xl p-px bg-linear-to-b from-white/10 via-white/5 to-transparent shadow-[0_40px_100px_-20px_rgba(0,0,0,0.6)] group relative overflow-hidden">
             <div className="w-full rounded-4xl bg-[#090A0F] border border-white/5 shadow-2xl flex flex-col relative z-10 backdrop-blur-3xl overflow-hidden">
                
                {/* Window Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-white/5 bg-white/2">
                  <div className="flex gap-2.5">
                    <div className="w-3 h-3 rounded-full bg-(--accent-secondary)/40 border border-(--accent-secondary)/20" />
                    <div className="w-3 h-3 rounded-full bg-(--accent-highlight)/40 border border-(--accent-highlight)/20" />
                    <div className="w-3 h-3 rounded-full bg-(--accent-highlight)/40 border border-(--accent-highlight)/20" />
                  </div>
                  <div className="flex items-center gap-2 border border-white/5 bg-[#050508] px-4 py-1.5 rounded-full shadow-inner">
                     <span className="w-2 h-2 rounded-full bg-(--accent-secondary) animate-pulse" />
                     <span className="text-[10px] text-white/50 font-mono uppercase tracking-widest">{algorithms[activeTab].name}</span>
                  </div>
                  <div className="w-[50px]" /> {/* Spacer for centering */}
                </div>

                {/* Main View Area */}
                <div className="h-[350px] md:h-[450px] relative bg-[#050508] overflow-hidden">
                   {/* Blueprint Grid Background */}
                   <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff03_1px,transparent_1px),linear-gradient(to_bottom,#ffffff03_1px,transparent_1px)] bg-size-[32px_32px]" />
                   
                   {/* Render active algorithm with AnimatePresence for tab switching */}
                   <AnimatePresence mode="wait">
                      <div key={activeTab} className="absolute inset-0">
                         {algorithms[activeTab].render(step)}
                      </div>
                   </AnimatePresence>
                </div>

                {/* Controls & Timeline */}
                <div className="px-6 py-4 border-t border-white/5 bg-white/2 flex flex-col sm:flex-row items-center gap-6">
                  
                  {/* Buttons */}
                  <div className="flex items-center gap-3">
                    <button onClick={handlePlayPause} className="w-12 h-12 rounded-full bg-white/10 border border-white/10 flex items-center justify-center text-white hover:bg-white/20 hover:scale-105 transition-all shadow-lg">
                      {isPlaying ? <PauseIcon /> : <PlayIcon />}
                    </button>
                    <button onClick={handleStep} className="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center text-white/50 hover:text-white hover:bg-white/5 hover:border-white/20 transition-all">
                      <StepIcon />
                    </button>
                    <button onClick={handleReset} className="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center text-white/50 hover:text-white hover:bg-white/5 hover:border-white/20 transition-all">
                      <ResetIcon />
                    </button>
                  </div>
                  
                  {/* Timeline Scrubber */}
                  <div className="flex-1 w-full flex items-center gap-2">
                     {Array.from({ length: algorithms[activeTab].maxSteps }).map((_, i) => (
                       <div key={i} className="flex-1 flex flex-col gap-2">
                         <div className={`h-1.5 w-full rounded-full transition-all duration-500 ${i <= step ? 'bg-(--accent-secondary) shadow-[0_0_10px_rgba(79,140,255,0.4)]' : 'bg-white/10'}`} />
                         <span className={`text-[9px] font-mono uppercase tracking-wider transition-colors duration-500 text-center ${i === step ? 'text-white/80' : 'text-white/20'}`}>
                           Step {i + 1}
                         </span>
                       </div>
                     ))}
                  </div>

                </div>

             </div>
          </div>

        </motion.div>
      </div>
    </section>
  );
}
