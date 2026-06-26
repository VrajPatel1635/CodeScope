"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import SectionEyebrow from "./ui/SectionEyebrow";

const faqs = [
  {
    id: "01",
    q: "What languages are supported?",
    a: "Currently Java (Temurin 17). All execution runs securely inside a controlled, isolated environment without requiring local configuration."
  },
  {
    id: "02",
    q: "Is execution real or simulated?",
    a: "The platform executes real Java code. It instruments the bytecode and reconstructs the execution state directly from actual runtime behavior—no simulation or approximations."
  },
  {
    id: "03",
    q: "How is this different from a debugger?",
    a: "Traditional debuggers simply expose raw variable state. DSA Visualizer makes that state understandable through high-fidelity visualization, execution intelligence, and root-cause diagnostics."
  },
  {
    id: "04",
    q: "Can I visualize Trees and Graphs?",
    a: "Yes. The platform natively understands and renders Arrays, Matrices, Strings, Linked Lists, Trees, Graphs, HashMaps, HashSets, Queues, Stacks, Priority Queues, and more."
  },
  {
    id: "05",
    q: "What happens if my code has an error?",
    a: "The built-in Diagnostic Engine intercepts the failure, identifies the issue, explains why it happened in plain English, and suggests actionable fixes rather than dumping raw stack traces."
  },
  {
    id: "06",
    q: "Does it support recursion?",
    a: "Yes. Recursive calls, stack frames, variable isolation, and execution flow are fully tracked, analyzed, and visualized."
  },
  {
    id: "07",
    q: "Can it detect infinite loops?",
    a: "Yes. Runtime protections, deep execution limits, and intelligence heuristics automatically detect and halt problematic execution patterns before they crash your browser."
  }
];

const TerminalFAQItem = ({ faq, isOpen, onToggle }) => {
  return (
    <div className="group border-b border-(--border-color)/50 last:border-b-0">
      <button 
        onClick={onToggle}
        className="w-full py-6 flex items-start gap-4 text-left cursor-pointer focus:outline-none"
      >
        <div className="shrink-0 pt-[2px]">
          <span className={`text-[13px] font-mono transition-colors duration-300 ${isOpen ? 'text-(--accent-primary)' : 'text-white/20 group-hover:text-(--accent-primary)/60'}`}>
            &gt;
          </span>
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-6">
            <span className={`font-mono text-[14px] md:text-[15px] leading-snug transition-colors duration-300 ${isOpen ? 'text-foreground' : 'text-(--text-secondary) group-hover:text-foreground'}`}>
              {faq.q}
            </span>
            
            {/* Custom Interaction indicator instead of chevron */}
            <div className="shrink-0 flex items-center">
              <div className={`text-[10px] font-mono uppercase tracking-widest px-2.5 py-1 border transition-all duration-300 ${
                isOpen 
                ? 'border-(--accent-primary)/30 text-(--accent-primary) bg-(--accent-primary)/5' 
                : 'border-transparent text-white/20 group-hover:border-white/10 group-hover:text-white/40'
              }`}>
                {isOpen ? '[HALT]' : '[EXEC]'}
              </div>
            </div>
          </div>

          <AnimatePresence>
            {isOpen && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                className="overflow-hidden"
              >
                <div className="pt-5 pb-2">
                  <div className="relative pl-4 border-l border-(--border-color)">
                    <span className="absolute left-[-4.5px] top-2 w-2 h-2 rounded-sm bg-(--border-color)" />
                    <p className="text-(--text-secondary) text-[14px] md:text-[15px] leading-relaxed font-mono whitespace-pre-wrap">
                      <span className="text-(--accent-highlight) mr-2">Output:</span>
                      {faq.a}
                    </p>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </button>
    </div>
  );
};

export default function FAQSection() {
  const [openId, setOpenId] = useState("01"); // First one open by default

  return (
    <section className="relative py-16 sm:py-24 md:py-40 bg-background overflow-hidden">
      <div className="max-w-[1400px] mx-auto px-6 md:px-12 relative z-10">
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 sm:gap-16 lg:gap-20">
          
          {/* Left Column (5/12) */}
          <div className="lg:col-span-5 relative">
            <div className="lg:sticky lg:top-32">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
              >
                <SectionEyebrow title="System.Query" phase="SYS.KNOWLEDGE" accentClass="text-(--accent-primary)" />
                
                <h2 className="mb-8">
                  <span className="block text-[clamp(2.5rem,4vw,3.5rem)] font-display font-medium leading-[1.1] tracking-tight text-foreground">
                    Knowledge
                  </span>
                  <span className="block text-[clamp(2.5rem,4vw,3.5rem)] font-serif italic font-light leading-[1.1] tracking-tight text-(--text-muted)">
                    Base
                  </span>
                </h2>
                
                <div className="font-mono text-[13px] text-(--text-secondary) leading-relaxed max-w-sm">
                  <div className="flex items-start gap-3 mb-4">
                    <span className="text-(--border-color) mt-0.5">01</span>
                    <p>Execute queries to understand platform architecture, capabilities, and execution environments.</p>
                  </div>
                  <div className="flex items-start gap-3">
                    <span className="text-(--border-color) mt-0.5">02</span>
                    <p>Responses are statically generated from core system specifications.</p>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>

          {/* Right Column (7/12) */}
          <div className="lg:col-span-7">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
              className="bg-(--bg-surface) border border-(--border-color) rounded-xl p-4 sm:p-6 md:p-8 relative overflow-hidden"
            >
              {/* Terminal Header */}
              <div className="flex items-center justify-between mb-8 pb-6 border-b border-(--border-color)/60">
                <div className="flex items-center">
                  <span className="text-[10px] font-mono text-(--text-muted) uppercase tracking-widest">INDEX</span>
                </div>
                <div className="font-mono text-[10px] text-(--text-muted) tracking-widest uppercase ml-4">
                  Terminal
                </div>
              </div>

              {/* Terminal Body */}
              <div className="flex flex-col">
                {faqs.map((faq) => (
                  <TerminalFAQItem 
                    key={faq.id} 
                    faq={faq} 
                    isOpen={openId === faq.id}
                    onToggle={() => setOpenId(openId === faq.id ? null : faq.id)}
                  />
                ))}
              </div>
            </motion.div>
          </div>
          
        </div>
      </div>
    </section>
  );
}
