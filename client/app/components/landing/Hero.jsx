"use client";

import { motion } from "framer-motion";
import Button from "./ui/Button";
import ThreeBackground from "./ThreeBackground";

export default function Hero() {
  return (
    <section className="relative min-h-screen pt-32 md:pt-40 pb-20 flex items-center overflow-hidden">
      <ThreeBackground />

      <div className="max-w-[1400px] mx-auto px-6 md:px-12 w-full relative z-10">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-16 lg:gap-8">
          
          <motion.div 
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
            className="flex flex-col items-start lg:w-7/12 pt-10"
          >
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3, duration: 0.8 }}
              className="mb-8"
            >
              <span className="text-[10px] md:text-[11px] font-mono text-white/40 uppercase tracking-[0.3em] pl-1">
                Real-Time Diagnostics Framework
              </span>
            </motion.div>

            <h1 className="mb-10 relative">
              <motion.span
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2, duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
                className="block text-[clamp(4rem,9vw,8rem)] font-display font-medium leading-[0.85] tracking-tighter text-white"
              >
                Execution,
              </motion.span>
              <motion.span
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4, duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
                className="block text-[clamp(4rem,9vw,8rem)] font-serif italic font-light leading-[0.9] tracking-tight text-(--accent-primary) ml-8 md:ml-16 mt-2"
              >
                Illuminated.
              </motion.span>
            </h1>

            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.8 }}
              className="text-lg md:text-xl leading-[1.8] text-white/50 max-w-xl mb-14 font-light pl-1 md:pl-2 border-l border-white/10"
            >
              Stop guessing how your algorithms work. Experience{" "}
              <span className="text-white/80 font-medium">real Java execution</span> with 
              step-by-step visual tracing and actionable diagnostics.
            </motion.p>

            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6, duration: 0.8 }}
              className="flex flex-wrap items-center gap-6"
            >
              <Button 
                href="/visualizer" 
                variant="primary" 
                accent="primary"
                triggerLoader={true}
                icon={
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                }
              >
                Launch Visualizer
              </Button>

              <Button
                href="/docs"
                variant="secondary"
                triggerLoader={true}
                icon={
                  <span className="flex items-center justify-center w-5 h-5 rounded-full bg-white/10">
                    <svg className="w-2 h-2 ml-0.5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M8 5v14l11-7z" />
                    </svg>
                  </span>
                }
              >
                Documentation
              </Button>
            </motion.div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 1.4, delay: 0.5, ease: [0.16, 1, 0.3, 1] }}
            className="lg:w-5/12 relative mt-16 lg:mt-0 right-0 lg:-right-12 w-full"
          >
            <div className="relative w-full aspect-square md:aspect-4/3 lg:aspect-auto lg:h-[650px]">
              <motion.div 
                whileHover={{ y: -8, transition: { duration: 0.5, ease: "easeOut" } }}
                className="absolute top-0 right-0 w-[90%] rounded-2xl border border-white/10 bg-background/80 shadow-[0_40px_80px_-20px_rgba(0,0,0,0.8)] overflow-hidden backdrop-blur-2xl z-10"
              >
                <div className="flex items-center justify-between px-4 py-3 border-b border-white/5 bg-white/5">
                  <span className="text-[9px] text-white/30 font-mono tracking-[0.2em] uppercase">// SYS.CORE_INIT</span>
                  <span className="text-[9px] text-white/30 font-mono tracking-widest uppercase">Solution.java</span>
                </div>
                
                <div className="p-6 font-mono text-[13px] text-white/50 leading-loose overflow-x-hidden">
                  <div className="flex gap-4"><span className="text-white/20 w-5 text-right select-none">1</span><span><span className="text-(--exec-return)">public void</span> <span className="text-white/90">process</span>() {'{'}</span></div>
                  <div className="flex gap-4 bg-(--accent-secondary)/10 border-l-2 border-(--accent-secondary) -ml-px pl-5 py-1 mt-1 rounded-r"><span className="text-white/20 w-5 text-right select-none">2</span><span className="text-white/80">  <span className="text-(--exec-return)">for</span> (<span className="text-(--accent-primary)">int</span> i = 0; i {'<'} arr.length; i++) {'{'}</span></div>
                  <div className="flex gap-4 mt-1"><span className="text-white/20 w-5 text-right select-none">3</span><span>    sum += arr[i];</span></div>
                  <div className="flex gap-4"><span className="text-white/20 w-5 text-right select-none">4</span><span>  {'}'}</span></div>
                  <div className="flex gap-4"><span className="text-white/20 w-5 text-right select-none">5</span><span>{'}'}</span></div>
                </div>
              </motion.div>

              <motion.div 
                whileHover={{ y: -8, transition: { duration: 0.5, ease: "easeOut" } }}
                className="absolute bottom-12 -left-8 md:bottom-24 md:-left-16 w-[85%] p-6 rounded-2xl border border-white/10 bg-background/90 shadow-[0_30px_60px_rgba(0,0,0,0.7)] backdrop-blur-2xl z-20"
              >
                <div className="flex justify-between items-center mb-6">
                  <div className="text-[10px] uppercase tracking-[0.25em] text-white/40 font-medium">Heap State</div>
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-(--exec-node-active) shadow-[0_0_8px_rgba(0,208,132,0.6)]" />
                    <span className="text-[10px] text-white/50 font-mono tracking-widest uppercase">Active</span>
                  </div>
                </div>
                <div className="flex gap-3">
                  {[12, 45, 89, 23, 56].map((num, i) => (
                    <div key={i} className={`flex-1 aspect-square rounded-xl flex items-center justify-center font-mono text-sm lg:text-lg transition-all duration-500 ${i === 2 ? 'border border-(--exec-node-active)/50 bg-(--exec-node-active)/10 text-(--exec-node-active) shadow-[0_0_25px_rgba(0,208,132,0.15)] scale-[1.08] z-10' : 'border border-white/10 bg-white/5 text-white/60'}`}>
                      {num}
                    </div>
                  ))}
                </div>
              </motion.div>
            </div>
          </motion.div>

        </div>
      </div>
    </section>
  );
}
