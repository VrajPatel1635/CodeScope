"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import Button from "@/app/components/landing/ui/Button";

export default function Hero() {
  return (
    <section className="relative min-h-screen pt-32 pb-20 flex items-center overflow-hidden">
      {/* Background Glow (Reduced) */}
      <div 
        className="absolute inset-0 z-0 pointer-events-none opacity-20" 
        style={{ background: "var(--hero-glow)" }} 
      />

      <div className="max-w-7xl mx-auto px-6 md:px-12 w-full relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-8 items-center">
          
          {/* Left Column: Copy & CTAs */}
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="flex flex-col items-start"
          >
            {/* Trust Badges */}
            <div className="flex flex-wrap gap-3 mb-8">
              {["Real Java Engine", "Execution Intelligence", "Diagnostics Engine"].map((badge, i) => (
                <motion.div
                  key={badge}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.2 + i * 0.1, duration: 0.4 }}
                  className="px-3 py-1 text-xs font-medium uppercase tracking-widest rounded-full border border-[#2A2D3E] bg-[#1F2130]/50 text-[#A8AABB] backdrop-blur-sm"
                >
                  {badge}
                </motion.div>
              ))}
            </div>

            {/* Headline */}
            <h1 className="display-lg text-[#F0F1F3] mb-6">
              Execution, <br className="hidden md:block" />
              <span className="text-accent text-[#E8A44A]">Illuminated.</span>
            </h1>

            {/* Supporting Text */}
            <p className="body-lg max-w-lg mb-10 text-[#A8AABB]">
              Stop guessing how your algorithms work. Experience real Java execution with step-by-step visual tracing, intelligent behavior detection, and actionable diagnostics.
            </p>

            {/* CTAs */}
            <div className="flex flex-wrap items-center gap-4">
              <Button 
                href="/visualizer" 
                variant="primary" 
                accent="primary"
                icon={<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>}
              >
                Launch Visualizer
              </Button>
              <Button 
                onClick={() => document.getElementById('interactive-demo')?.scrollIntoView({ behavior: 'smooth' })}
                variant="secondary" 
                accent="primary"
                icon={<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><polygon points="10 8 16 12 10 16 10 8"></polygon></svg>}
              >
                Try Interactive Demo
              </Button>
            </div>
          </motion.div>

          {/* Right Column: Product Showcase */}
          <div className="relative h-[400px] lg:h-[600px] mt-12 lg:mt-0 perspective-1000">
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 1, delay: 0.2, ease: "easeOut" }}
              className="relative w-full h-full"
            >
              {/* Layer 1: Code Editor */}
              <motion.div 
                whileHover={{ y: -5, transition: { duration: 0.3 } }}
                className="absolute top-[5%] lg:top-[10%] left-[5%] lg:left-[10%] w-[90%] lg:w-[80%] rounded-xl border border-[#2A2D3E] bg-[#161820]/90 shadow-2xl overflow-hidden backdrop-blur-md z-10 transition-transform"
              >
                <div className="flex items-center gap-2 px-4 py-3 border-b border-[#2A2D3E] bg-[#0E0F11]/80">
                  <div className="w-3 h-3 rounded-full bg-[#FF5D5D]/20 border border-[#FF5D5D]/50" />
                  <div className="w-3 h-3 rounded-full bg-[#FFB020]/20 border border-[#FFB020]/50" />
                  <div className="w-3 h-3 rounded-full bg-[#00D084]/20 border border-[#00D084]/50" />
                  <span className="ml-2 text-xs text-[#565869] font-code">Solution.java</span>
                </div>
                <div className="p-5 font-code text-sm text-[#A8AABB] leading-relaxed overflow-x-hidden">
                  <div className="flex gap-4"><span className="text-[#565869] w-4 text-right">1</span><span className="text-[#B388FF]">public void</span> <span className="text-[#4A8FD4]">process</span>() {'{'}</div>
                  <div className="flex gap-4 bg-[#4F8CFF]/10 border-l-2 border-[#4F8CFF] -ml-px pl-4 py-1"><span className="text-[#565869] w-4 text-right">2</span><span>  <span className="text-[#B388FF]">for</span> (<span className="text-[#E8A44A]">int</span> i = 0; i {'<'} arr.length; i++) {'{'}</span></div>
                  <div className="flex gap-4"><span className="text-[#565869] w-4 text-right">3</span><span>    sum += arr[i];</span></div>
                  <div className="flex gap-4"><span className="text-[#565869] w-4 text-right">4</span><span>  {'}'}</span></div>
                  <div className="flex gap-4"><span className="text-[#565869] w-4 text-right">5</span><span>{'}'}</span></div>
                </div>
              </motion.div>

              {/* Layer 2: Visualization Array */}
              <motion.div 
                whileHover={{ y: -5, transition: { duration: 0.3 } }}
                className="absolute bottom-[10%] lg:bottom-[20%] right-[0%] lg:right-[5%] w-[85%] lg:w-[75%] p-5 rounded-xl border border-[#2A2D3E] bg-[#1F2130]/95 shadow-[0_20px_50px_rgba(0,0,0,0.6)] backdrop-blur-xl z-20 transition-transform"
              >
                <div className="flex justify-between items-center mb-4">
                  <div className="text-[10px] uppercase tracking-widest text-[#565869] font-medium">Workspace State</div>
                  <div className="flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-[#00D084]"></span>
                    <span className="text-[10px] text-[#A8AABB]">Active</span>
                  </div>
                </div>
                <div className="flex gap-2">
                  {[12, 45, 89, 23, 56].map((num, i) => (
                    <div key={i} className={`flex-1 aspect-square rounded-lg flex items-center justify-center font-code text-sm lg:text-base transition-all duration-300 ${i === 2 ? 'border border-[#00D084] bg-[#00D084]/10 text-[#00D084] shadow-[0_0_15px_rgba(0,208,132,0.15)] scale-105 z-10' : 'border border-[#2A2D3E] bg-[#161820] text-[#F0F1F3]'}`}>
                      {num}
                    </div>
                  ))}
                </div>
              </motion.div>

              {/* Layer 3: Diagnostics Panel */}
              <motion.div 
                whileHover={{ y: -5, transition: { duration: 0.3 } }}
                className="absolute top-[60%] lg:top-[40%] -left-[5%] lg:-left-[10%] w-[200px] lg:w-[240px] p-4 rounded-xl border border-[#2A2D3E] bg-[#161820]/90 shadow-2xl backdrop-blur-lg z-30 transition-transform"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-[#E8A44A]/10 border border-[#E8A44A]/20 flex items-center justify-center shrink-0">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#E8A44A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline></svg>
                  </div>
                  <div>
                    <div className="text-sm font-medium text-[#F0F1F3]">O(N) Complexity</div>
                    <div className="text-[11px] text-[#A8AABB] mt-0.5">Linear Traversal Detected</div>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          </div>

        </div>
      </div>
    </section>
  );
}
