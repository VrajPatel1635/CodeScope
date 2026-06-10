"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const faqs = [
  {
    q: "What languages are supported?",
    a: "Currently Java (Temurin 17). All execution runs securely inside a controlled, isolated environment without requiring local configuration."
  },
  {
    q: "Is execution real or simulated?",
    a: "The platform executes real Java code. It instruments the bytecode and reconstructs the execution state directly from actual runtime behavior—no simulation or approximations."
  },
  {
    q: "How is this different from a debugger?",
    a: "Traditional debuggers simply expose raw variable state. DSA Visualizer makes that state understandable through high-fidelity visualization, execution intelligence, and root-cause diagnostics."
  },
  {
    q: "Can I visualize Trees and Graphs?",
    a: "Yes. The platform natively understands and renders Arrays, Matrices, Strings, Linked Lists, Trees, Graphs, HashMaps, HashSets, Queues, Stacks, Priority Queues, and more."
  },
  {
    q: "What happens if my code has an error?",
    a: "The built-in Diagnostic Engine intercepts the failure, identifies the issue, explains why it happened in plain English, and suggests actionable fixes rather than dumping raw stack traces."
  },
  {
    q: "Does it support recursion?",
    a: "Yes. Recursive calls, stack frames, variable isolation, and execution flow are fully tracked, analyzed, and visualized."
  },
  {
    q: "Can it detect infinite loops?",
    a: "Yes. Runtime protections, deep execution limits, and intelligence heuristics automatically detect and halt problematic execution patterns before they crash your browser."
  }
];

const FAQItem = ({ faq, idx }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.6, delay: idx * 0.05, ease: [0.16, 1, 0.3, 1] }}
      className={`group relative overflow-hidden rounded-2xl md:rounded-4xl transition-all duration-500 border ${
        isOpen 
        ? 'bg-[#090A0F] border-white/10 shadow-[0_30px_60px_-15px_rgba(0,0,0,0.6)] backdrop-blur-3xl' 
        : 'bg-transparent border-white/5 hover:border-white/10 hover:bg-white/2'
      }`}
    >
       {/* Ambient glow when open */}
       <div className={`absolute inset-0 bg-linear-to-b from-white/3 to-transparent pointer-events-none transition-opacity duration-500 ${isOpen ? 'opacity-100' : 'opacity-0'}`} />

       <button 
         onClick={() => setIsOpen(!isOpen)}
         className="w-full px-6 py-6 md:px-8 md:py-8 flex items-center justify-between gap-6 text-left relative z-10"
       >
          <span className={`text-lg md:text-xl font-display font-medium transition-colors duration-300 ${isOpen ? 'text-white' : 'text-white/80 group-hover:text-white'}`}>
             {faq.q}
          </span>
          <div className={`relative shrink-0 w-8 h-8 flex items-center justify-center rounded-full border transition-all duration-500 ${isOpen ? 'border-white/20 bg-white/5' : 'border-white/10 bg-[#050508] group-hover:border-white/20 group-hover:bg-white/5'}`}>
             <div className={`w-3 h-[1.5px] bg-white absolute transition-transform duration-500 ${isOpen ? 'rotate-180' : ''}`} />
             <div className={`w-[1.5px] h-3 bg-white absolute transition-all duration-500 ${isOpen ? 'rotate-90 opacity-0' : ''}`} />
          </div>
       </button>
       
       <AnimatePresence>
          {isOpen && (
            <motion.div
               initial={{ height: 0, opacity: 0 }}
               animate={{ height: "auto", opacity: 1 }}
               exit={{ height: 0, opacity: 0 }}
               transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
               className="relative z-10"
            >
               <div className="px-6 pb-6 md:px-8 md:pb-8 pt-0 text-white/50 text-base md:text-lg leading-relaxed font-light pr-12 md:pr-24">
                  {faq.a}
               </div>
            </motion.div>
          )}
       </AnimatePresence>
    </motion.div>
  );
};

export default function FAQSection() {
  return (
    <section className="relative py-32 md:py-48 bg-background overflow-hidden border-t border-white/2">
      {/* Background Ambience (Reduced) */}
      <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-(--exec-active) blur-[150px] opacity-[0.01] rounded-full pointer-events-none translate-x-1/3 -translate-y-1/3" />

      <div className="max-w-[1400px] mx-auto px-6 md:px-12 relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-16 lg:gap-24">
        
        {/* Left Column: Intro */}
        <div className="lg:col-span-5 flex flex-col relative">
          <div className="lg:sticky lg:top-48 h-fit">
             <motion.div 
               initial={{ opacity: 0, x: -20 }}
               whileInView={{ opacity: 1, x: 0 }}
               viewport={{ once: true, margin: "-100px" }}
               transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
             >
                <div className="flex items-center gap-4 mb-8">
                   <span className="text-(--exec-active) uppercase tracking-[0.25em] text-xs font-semibold">FAQ</span>
                   <div className="h-px w-8 bg-linear-to-r from-(--exec-active) to-transparent" />
                </div>
                
                <h2 className="text-4xl sm:text-5xl md:text-[4.5rem] font-display font-medium leading-[1.05] tracking-tight mb-8">
                   <span className="text-transparent bg-clip-text bg-linear-to-b from-white to-white/70">Questions.</span><br />
                   <span className="font-serif italic font-light text-white tracking-normal">Answered.</span>
                </h2>
                
                <p className="text-white/40 text-lg md:text-xl leading-relaxed font-light max-w-md">
                   Clear, confident answers to common questions about the platform's capabilities, architecture, and features.
                </p>
             </motion.div>
          </div>
        </div>

        {/* Right Column: Accordion List */}
        <div className="lg:col-span-7 flex flex-col gap-4">
           {faqs.map((faq, idx) => (
             <FAQItem key={idx} faq={faq} idx={idx} />
           ))}
        </div>

      </div>
    </section>
  );
}
