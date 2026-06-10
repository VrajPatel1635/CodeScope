"use client";

import React from "react";
import { motion } from "framer-motion";

// --- Mini Visualizers for Bento Grid ---

const MiniTrees = () => (
  <div className="relative w-full h-full flex flex-col items-center justify-center scale-90 md:scale-100">
    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 bg-(--accent-highlight) blur-[100px] opacity-[0.05] rounded-full pointer-events-none" />
    <div className="flex flex-col items-center gap-6 z-10">
      <div className="w-10 h-10 rounded-full border border-white/10 bg-[#090A0F] text-white/70 flex items-center justify-center font-mono text-xs relative z-10 shadow-inner group-hover:border-white/30 transition-colors duration-500">
        8
        <svg className="absolute top-full left-1/2 w-32 h-8 -translate-x-1/2 overflow-visible -z-10" viewBox="0 0 128 32">
           <path d="M64 0 L16 32" stroke="rgba(255,255,255,0.05)" strokeWidth="2" fill="none" />
           <path d="M64 0 L112 32" stroke="rgba(255,255,255,0.05)" strokeWidth="2" fill="none" />
        </svg>
      </div>
      <div className="flex gap-20">
         <div className="w-10 h-10 rounded-full border border-white/10 bg-[#090A0F] text-white/70 flex items-center justify-center font-mono text-xs relative z-10 shadow-inner group-hover:border-white/30 transition-colors duration-500">
           3
           <svg className="absolute top-full left-1/2 w-16 h-8 -translate-x-1/2 overflow-visible -z-10" viewBox="0 0 64 32">
             <path d="M32 0 L16 32" stroke="rgba(255,255,255,0.05)" strokeWidth="2" fill="none" />
             <path d="M32 0 L48 32" stroke="rgba(255,255,255,0.05)" strokeWidth="2" fill="none" />
           </svg>
         </div>
         <div className="w-10 h-10 rounded-full border border-(--accent-highlight)/50 bg-(--accent-highlight)/10 text-(--accent-highlight) flex items-center justify-center font-mono text-xs relative z-10 shadow-[0_0_15px_rgba(107,191,160,0.2)] group-hover:scale-110 group-hover:bg-(--accent-highlight)/20 transition-all duration-500">
           10
           <svg className="absolute top-full left-1/2 w-16 h-8 -translate-x-1/2 overflow-visible -z-10" viewBox="0 0 64 32">
             <path d="M32 0 L48 32" stroke="var(--accent-highlight)" strokeOpacity="0.3" strokeWidth="2" fill="none" className="group-hover:stroke-opacity-60 transition-opacity duration-500" />
           </svg>
         </div>
      </div>
      <div className="flex gap-4 ml-[-80px]">
         <div className="w-10 h-10 rounded-full border border-white/10 bg-[#090A0F] text-white/70 flex items-center justify-center font-mono text-xs relative z-10 shadow-inner">1</div>
         <div className="w-10 h-10 rounded-full border border-white/10 bg-[#090A0F] text-white/70 flex items-center justify-center font-mono text-xs relative z-10 shadow-inner">6</div>
         <div className="w-16"></div>
         <div className="w-10 h-10 rounded-full border border-(--accent-highlight) bg-(--accent-highlight) text-white flex items-center justify-center font-mono text-xs relative z-10 shadow-[0_0_20px_rgba(107,191,160,0.4)] group-hover:shadow-[0_0_30px_rgba(107,191,160,0.6)] transition-shadow duration-500">
           14
           <div className="absolute -inset-2 rounded-full border border-(--accent-highlight) opacity-20 animate-ping group-hover:opacity-40 transition-opacity" />
         </div>
      </div>
    </div>
  </div>
);

const MiniLinkedList = () => (
  <div className="w-full h-full flex items-center justify-center gap-3 group-hover:gap-5 transition-all duration-700 ease-out p-4">
    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-32 bg-(--accent-secondary) blur-[80px] opacity-[0.04] rounded-full pointer-events-none" />
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

const MiniArray = () => (
  <div className="w-full h-full flex items-center justify-center relative p-4">
    <div className="flex gap-0.5 group-hover:gap-1.5 transition-all duration-500">
      {[4, 8, 15, 16].map((v, i) => (
        <div key={i} className={`w-7 h-7 rounded-[4px] flex items-center justify-center font-mono text-[11px] border ${i === 2 ? 'bg-(--accent-secondary)/10 border-(--accent-secondary)/50 text-(--accent-secondary) shadow-[0_0_10px_rgba(74,143,212,0.15)] group-hover:bg-(--accent-secondary)/20 transition-colors duration-500' : 'bg-[#090A0F] border-white/5 text-white/40'}`}>
           {v}
        </div>
      ))}
    </div>
  </div>
);

const MiniString = () => (
  <div className="w-full h-full flex items-center justify-center relative p-4">
    <div className="flex gap-0.5 border-b border-white/5 pb-1 relative">
       {['a','b','c','a','b'].map((c, i) => (
         <div key={i} className={`w-5 h-6 flex items-center justify-center font-mono text-xs transition-colors duration-500 ${i >= 1 && i <= 3 ? 'text-(--accent-highlight) group-hover:text-white' : 'text-white/30 group-hover:text-white/20'}`}>{c}</div>
       ))}
       <div className="absolute bottom-0 left-[22px] w-[62px] h-0.5 bg-(--accent-highlight) rounded-full shadow-[0_0_8px_var(--accent-highlight)] group-hover:w-[40px] group-hover:left-[44px] group-hover:bg-(--accent-secondary) group-hover:shadow-[0_0_8px_var(--accent-secondary)] transition-all duration-700 ease-in-out" />
    </div>
  </div>
);

const MiniCollections = () => (
  <div className="w-full h-full flex items-center justify-center gap-10 sm:gap-16 relative p-4">
     <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-20 bg-(--accent-secondary) blur-[80px] opacity-[0.03] pointer-events-none" />
     {/* Stack */}
     <div className="flex flex-col items-center">
       <div className="flex flex-col gap-1 w-14 items-center group-hover:-translate-y-2 transition-transform duration-500 ease-out relative">
          <div className="w-12 h-5 rounded-[4px] bg-(--accent-secondary)/10 border border-(--accent-secondary)/40 text-(--accent-secondary) text-[10px] flex items-center justify-center font-mono absolute -top-7 opacity-0 group-hover:opacity-100 transition-all duration-500 delay-100 group-hover:translate-y-1 shadow-[0_0_10px_rgba(74,143,212,0.15)]">8</div>
          <div className="w-12 h-5 rounded-[4px] bg-[#090A0F] border border-white/5 text-white/40 text-[10px] flex items-center justify-center font-mono">42</div>
          <div className="w-12 h-5 rounded-[4px] bg-[#090A0F] border border-white/5 text-white/40 text-[10px] flex items-center justify-center font-mono">17</div>
       </div>
       <div className="w-16 h-2 border-b border-x border-white/20 rounded-b mt-1 opacity-50" />
     </div>

     {/* Queue */}
     <div className="flex flex-col items-center">
       <div className="flex items-center gap-1 h-6 px-2 border-y border-white/10 group-hover:gap-2 transition-all duration-500 ease-out relative">
          <div className="absolute -left-5 opacity-0 group-hover:opacity-100 transition-all duration-500 delay-100 group-hover:translate-x-1 w-5 h-5 rounded-[3px] bg-(--accent-highlight)/10 border border-(--accent-highlight)/40 text-(--accent-highlight) text-[10px] flex items-center justify-center font-mono shadow-[0_0_10px_rgba(107,191,160,0.15)]">A</div>
          <div className="w-5 h-5 rounded-[3px] bg-[#090A0F] border border-white/5 text-white/40 text-[10px] flex items-center justify-center font-mono">B</div>
          <div className="w-5 h-5 rounded-[3px] bg-[#090A0F] border border-white/5 text-white/40 text-[10px] flex items-center justify-center font-mono">C</div>
          <div className="w-5 h-5 rounded-[3px] bg-[#090A0F] border border-white/5 text-white/40 text-[10px] flex items-center justify-center font-mono opacity-100 group-hover:opacity-0 group-hover:translate-x-2 transition-all duration-500">D</div>
       </div>
     </div>
  </div>
);

const MiniGraphs = () => (
  <div className="w-full h-full relative flex items-center justify-center p-4 overflow-hidden">
    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 bg-(--accent-secondary) blur-[100px] opacity-[0.05] rounded-full pointer-events-none" />
    <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ overflow: 'visible' }}>
       <line x1="30%" y1="35%" x2="70%" y2="35%" stroke="rgba(255,255,255,0.05)" strokeWidth="2" />
       <line x1="30%" y1="35%" x2="50%" y2="65%" stroke="var(--accent-secondary)" strokeWidth="2" strokeOpacity="0.3" strokeDasharray="4 2" className="group-hover:stroke-opacity-80 transition-all duration-700" />
       <line x1="70%" y1="35%" x2="50%" y2="65%" stroke="rgba(255,255,255,0.05)" strokeWidth="2" />
       <line x1="50%" y1="65%" x2="75%" y2="80%" stroke="rgba(255,255,255,0.05)" strokeWidth="2" />
    </svg>
    <div className="absolute top-[35%] left-[30%] -translate-x-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-[#090A0F] border border-white/10 flex items-center justify-center text-[9px] text-white/40 font-mono shadow-inner group-hover:scale-110 transition-transform duration-500">0</div>
    <div className="absolute top-[35%] left-[70%] -translate-x-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-[#090A0F] border border-white/10 flex items-center justify-center text-[9px] text-white/40 font-mono shadow-inner group-hover:scale-110 transition-transform duration-500">1</div>
    <div className="absolute top-[65%] left-[50%] -translate-x-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-(--accent-secondary)/10 border border-(--accent-secondary)/40 flex items-center justify-center text-[10px] text-(--accent-secondary) font-mono shadow-[0_0_15px_rgba(74,143,212,0.2)] z-10 group-hover:scale-110 group-hover:bg-(--accent-secondary)/20 transition-all duration-500">2</div>
    <div className="absolute top-[80%] left-[75%] -translate-x-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-[#090A0F] border border-white/10 flex items-center justify-center text-[9px] text-white/40 font-mono shadow-inner group-hover:scale-110 transition-transform duration-500">3</div>
  </div>
);

const MiniMatrix = () => (
  <div className="w-full h-full flex items-center justify-center relative p-4">
    <div className="grid grid-cols-3 gap-[3px]">
      {Array.from({length: 9}).map((_, i) => (
        <div key={i} className={`w-5 h-5 rounded-[2px] border flex items-center justify-center text-[9px] font-mono transition-all duration-500 ${i === 4 ? 'bg-(--accent-highlight)/10 border-(--accent-highlight)/40 text-(--accent-highlight) shadow-[0_0_8px_rgba(107,191,160,0.2)] group-hover:bg-(--accent-highlight)/20 group-hover:scale-110 z-10 relative' : 'bg-[#090A0F] border-white/5 text-white/20'}`}>
          {i}
        </div>
      ))}
    </div>
  </div>
);

const MiniHashMap = () => (
  <div className="w-full h-full flex flex-col items-center justify-center gap-2 relative p-4">
     <div className="flex items-center gap-2">
       <div className="w-8 h-5 border border-white/5 bg-[#090A0F] rounded-[3px] flex items-center justify-center text-[9px] font-mono text-white/30 shadow-inner">"id"</div>
       <span className="text-white/10 text-xs font-mono">→</span>
       <div className="w-5 h-5 border border-white/5 bg-[#090A0F] rounded-[3px] flex items-center justify-center text-[9px] font-mono text-white/30 shadow-inner">1</div>
     </div>
     <div className="flex items-center gap-2 group-hover:translate-x-1 transition-transform duration-500">
       <div className="w-8 h-5 border border-(--accent-secondary)/20 bg-(--accent-secondary)/5 rounded-[3px] flex items-center justify-center text-[9px] font-mono text-(--accent-secondary) transition-colors duration-500 group-hover:bg-(--accent-secondary)/15">"v"</div>
       <span className="text-(--accent-secondary)/30 text-xs font-mono group-hover:text-(--accent-secondary)/60 transition-colors duration-500">→</span>
       <div className="w-5 h-5 border border-(--accent-secondary)/30 bg-(--accent-secondary)/10 rounded-[3px] flex items-center justify-center text-[9px] font-mono text-(--accent-secondary) shadow-[0_0_8px_rgba(74,143,212,0.15)] group-hover:scale-110 transition-transform duration-500">9</div>
     </div>
  </div>
);

// --- Bento Card Container ---

const BentoCard = ({ className, title, desc, children }) => (
  <motion.div 
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true, margin: "-50px" }}
    className={`group relative rounded-3xl bg-[#030305] border border-white/5 overflow-hidden flex flex-col transition-all duration-500 hover:-translate-y-1 hover:shadow-[0_20px_40px_-15px_rgba(0,0,0,0.5)] hover:border-white/10 ${className}`}
  >
    {/* Inner Ambient Glow */}
    <div className="absolute inset-0 bg-linear-to-br from-white/0 via-white/2 to-white/0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none z-20" />
    
    {/* Content Area */}
    <div className="absolute top-0 left-0 right-0 p-6 z-30 pointer-events-none">
      <h3 className="text-white/90 text-[15px] sm:text-base font-medium tracking-wide mb-1">{title}</h3>
      {desc && <p className="text-white/40 text-[12px] sm:text-[13px] font-light leading-snug">{desc}</p>}
    </div>
    
    {/* Visualizer Container */}
    <div className="flex-1 w-full h-full relative z-10 flex items-center justify-center pt-16 pb-4 px-4 bg-linear-to-b from-transparent to-white/1">
       {children}
    </div>
  </motion.div>
);

// --- Main Showcase Component ---

export default function DataStructuresShowcase() {
  return (
    <section className="relative py-24 md:py-32 bg-background overflow-hidden border-t border-white/2">
      <div className="max-w-[1200px] mx-auto px-6 md:px-8 relative z-10">
        
        {/* Editorial Section Header */}
        <div className="text-center mb-16 md:mb-24 max-w-2xl mx-auto flex flex-col items-center">
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="flex items-center justify-center gap-4 mb-8"
          >
             <div className="h-px w-8 bg-linear-to-r from-transparent to-(--accent-secondary)" />
             <span className="text-(--accent-secondary) uppercase tracking-[0.25em] text-xs font-semibold">Supported Structures</span>
             <div className="h-px w-8 bg-linear-to-l from-transparent to-(--accent-secondary)" />
          </motion.div>
          
          <motion.h2 
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-4xl sm:text-5xl md:text-6xl font-display font-medium leading-[1.1] tracking-tight mb-6 text-white"
          >
            Every structure.<br />
            <span className="text-white/50">Every state.</span><br />
            <span className="font-serif italic font-light text-(--accent-secondary) tracking-normal pr-2">Visible.</span>
          </motion.h2>
          
          <motion.p 
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="text-white/40 text-[15px] md:text-[17px] leading-relaxed font-light"
          >
            Built for how algorithms actually work. The platform natively understands and visualizes standard data structures and complex topologies.
          </motion.p>
        </div>

        {/* Asymmetrical Bento Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 auto-rows-[200px] md:auto-rows-[180px] lg:auto-rows-[200px]">
          
          {/* Row 1 & 2 */}
          <BentoCard 
            title="Trees & Tries" 
            desc="Deep recursion visualized." 
            className="md:col-span-2 md:row-span-2 lg:col-span-2 lg:row-span-2"
          >
             <MiniTrees />
          </BentoCard>
          
          <BentoCard 
            title="Linked Lists" 
            desc="Follow every reference." 
            className="md:col-span-2 md:row-span-1 lg:col-span-2 lg:row-span-1"
          >
             <MiniLinkedList />
          </BentoCard>
          
          <BentoCard 
            title="Arrays" 
            desc="1D continuous memory." 
            className="md:col-span-1 md:row-span-1 lg:col-span-1 lg:row-span-1"
          >
             <MiniArray />
          </BentoCard>
          
          <BentoCard 
            title="Strings" 
            desc="Character sequences." 
            className="md:col-span-1 md:row-span-1 lg:col-span-1 lg:row-span-1"
          >
             <MiniString />
          </BentoCard>
          
          {/* Row 3 & 4 */}
          <BentoCard 
            title="Linear Collections" 
            desc="Stacks, Queues, Deques & Priority Queues." 
            className="md:col-span-2 md:row-span-1 lg:col-span-2 lg:row-span-1"
          >
             <MiniCollections />
          </BentoCard>
          
          <BentoCard 
            title="Graphs" 
            desc="Topology mapped in real-time." 
            className="md:col-span-2 md:row-span-2 lg:col-span-2 lg:row-span-2"
          >
             <MiniGraphs />
          </BentoCard>
          
          <BentoCard 
            title="Matrices" 
            desc="Multi-dimensional grids." 
            className="md:col-span-1 md:row-span-1 lg:col-span-1 lg:row-span-1"
          >
             <MiniMatrix />
          </BentoCard>
          
          <BentoCard 
            title="Hash Maps & Sets" 
            desc="Key-value relationships." 
            className="md:col-span-1 md:row-span-1 lg:col-span-1 lg:row-span-1"
          >
             <MiniHashMap />
          </BentoCard>
          
        </div>

      </div>
    </section>
  );
}
