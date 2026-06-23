"use client";

import React from "react";
import { motion } from "framer-motion";
import SectionEyebrow from "./ui/SectionEyebrow";

export default function DiagnosticEngineShowcase() {
  const journey = [
    {
      step: "01",
      title: "The Confusion",
      desc: "A raw JVM exception is thrown. It's vague, dense, and disconnected from your logic."
    },
    {
      step: "02",
      title: "The Translation",
      desc: "CodeScope pinpoints the exact line and explains the failure in plain English."
    },
    {
      step: "03",
      title: "The Resolution",
      desc: "Get actionable, specific advice on how to fix the issue and move forward."
    }
  ];

  return (
    <section className="relative py-24 md:py-48 bg-background overflow-hidden">
      
      {/* Base Void */}
      <div className="absolute inset-0 bg-background z-0" />

      {/* The Left-Anchored Bleeding Surface */}
      <div className="relative w-[95%] md:w-[90%] mr-auto bg-[linear-gradient(to_bottom_right,var(--bg-surface),var(--bg-primary))] rounded-r-[3rem] md:rounded-r-[4rem] border border-white/5 border-l-0 py-24 md:py-32 shadow-[50px_0_150px_-20px_rgba(0,0,0,1),inset_-1px_0_1px_rgba(255,255,255,0.05)] z-10 overflow-hidden">
        
        {/* Inner Glow Rim on the Right Edge */}
        <div className="absolute top-0 right-0 w-px h-[80%] bg-linear-to-b from-transparent via-emerald-500/20 to-transparent mix-blend-screen" />

        {/* Massive Typographic Watermark */}
        <div className="absolute right-[-5%] top-1/2 -translate-y-1/2 rotate-90 origin-center text-[12vw] font-display font-bold text-white/1.5 whitespace-nowrap pointer-events-none select-none">
          SYS.DIAGNOSTICS
        </div>

        {/* Core Energy Ambient */}
        <div className="absolute bottom-0 left-[10%] w-[600px] h-[600px] bg-emerald-500 opacity-[0.03] blur-[120px] rounded-full pointer-events-none z-0" />

        <div className="max-w-[1300px] mx-auto px-6 md:px-12 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 lg:gap-20 items-center">

            {/* Content (Left) */}
            <div className="lg:col-span-5 flex flex-col order-1">
              <SectionEyebrow title="Instant Clarity" phase="SYS.DIAGNOSTICS" accentClass="text-emerald-400" />

              <motion.h2
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.1 }}
                className="text-4xl md:text-5xl lg:text-6xl font-display font-medium leading-[1.05] tracking-tight mb-8 text-white"
              >
                The stack trace is useless.
              </motion.h2>

              <motion.p
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.2 }}
                className="text-white/60 text-lg md:text-xl leading-relaxed max-w-lg mb-12 font-light"
              >
                Stop guessing what went wrong. CodeScope translates raw exceptions into plain English, explaining exactly <strong className="text-white font-medium">why your code failed</strong> and <strong className="text-white font-medium">how to fix it</strong>.
              </motion.p>

              <div className="flex flex-col gap-6">
                {journey.map((item, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -10 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.3 + (i * 0.1), duration: 0.5 }}
                    className="flex items-start gap-4 group"
                  >
                    <span className="text-emerald-400/50 font-mono text-sm mt-0.5">{item.step}</span>
                    <div className="flex flex-col gap-1.5 border-l border-white/5 pl-4 group-hover:border-emerald-400/30 transition-colors duration-300">
                      <h5 className="text-white/80 group-hover:text-white text-base font-medium tracking-wide transition-colors">{item.title}</h5>
                      <p className="text-white/40 text-sm font-light leading-relaxed">{item.desc}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Diagnostic Experience (Right) */}
            <div className="lg:col-span-7 order-2 relative lg:ml-4 lg:translate-x-[10%]">
              <div className="relative w-full flex flex-col md:flex-row items-stretch gap-4 md:gap-6">

                {/* Raw Exception Panel (Starts chaotic/blurred, snaps to clear) */}
                <motion.div
                  initial={{ opacity: 0, x: 20, filter: "blur(12px)" }}
                  whileInView={{ opacity: 1, x: 0, filter: "blur(0px)" }}
                  viewport={{ once: true, margin: "-100px" }}
                  transition={{ duration: 0.9, ease: "easeOut" }}
                  className="w-full md:w-[40%] rounded-2xl bg-background border border-white/5 p-5 flex flex-col mt-0 md:mt-8 mb-0 md:mb-8 relative overflow-hidden opacity-60 mix-blend-luminosity"
                >
                  <div className="absolute top-0 left-0 w-full h-px bg-linear-to-r from-red-500/0 via-red-500/10 to-red-500/0" />

                  <div className="text-[9px] text-white/20 uppercase tracking-widest font-sans mb-4 flex items-center gap-2 border-b border-white/5 pb-3">
                    <div className="w-1.5 h-1.5 rounded-full bg-red-500/30" /> Raw Output
                  </div>

                  <div className="font-mono text-[10px] sm:text-[11px] leading-[1.8] text-white/30 wrap-break-word">
                    <span className="text-red-400/60 font-medium">Exception in thread "main"</span><br />
                    <span className="text-red-400/60 font-medium break-all block">java.lang.ArrayIndexOutOfBoundsException: Index 5 out of bounds for length 5</span>
                    <span className="pl-3 mt-1 block break-all">at Solution.merge(Solution.java:42)</span>
                    <span className="pl-3 block break-all">at Solution.mergeSort(Solution.java:24)</span>
                    <span className="pl-3 block opacity-50 break-all">at Solution.solve(Solution.java:12)</span>
                    <span className="pl-3 opacity-30 block break-all">at Main.main(Main.java:8)</span>
                  </div>
                </motion.div>

                {/* Premium Diagnostic Panel (Foreground) */}
                <motion.div
                  initial={{ opacity: 0, x: 40, scale: 0.95 }}
                  whileInView={{ opacity: 1, x: 0, scale: 1 }}
                  viewport={{ once: true, margin: "-100px" }}
                  transition={{ duration: 0.8, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
                  className="w-full md:w-[60%] rounded-3xl p-px bg-linear-to-b from-white/10 via-white/5 to-transparent shadow-2xl relative z-10"
                >
                  <div className="w-full h-full rounded-3xl bg-(--bg-surface) flex flex-col relative overflow-hidden">

                    {/* Resolution Glow */}
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1/2 h-px bg-linear-to-r from-transparent via-emerald-400/40 to-transparent" />
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[200px] bg-emerald-400/5 blur-[80px] pointer-events-none" />

                    <div className="p-6 md:p-8 flex flex-col h-full relative z-10">

                      {/* Header */}
                      <div className="flex justify-between items-start mb-6">
                        <div className="flex items-center gap-3">
                          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-red-500/10 text-red-400 border border-red-500/20 text-[10px] uppercase tracking-widest font-bold">
                            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" /></svg>
                            Crash
                          </div>
                          <span className="text-white/40 text-[10px] font-mono border border-white/5 px-2 py-1 rounded bg-white/5">Line 42</span>
                        </div>
                      </div>

                      {/* Title */}
                      <div className="mb-6">
                        <h3 className="text-xl md:text-2xl font-display font-medium text-white/90 mb-2 leading-tight">Array Index Out Of Bounds</h3>
                        <p className="text-white/40 font-mono text-[11px] md:text-[12px] break-all inline-block">java.lang.ArrayIndexOutOfBoundsException</p>
                      </div>

                      <div className="h-px w-full bg-white/5 mb-6" />

                      {/* Diagnostic Fields */}
                      <div className="flex flex-col gap-6 flex-1">

                        {/* What Happened */}
                        <div className="flex flex-col gap-2">
                          <span className="text-[10px] text-white/50 uppercase tracking-[0.15em] font-medium">
                            What Happened
                          </span>
                          <p className="text-white/80 text-[13px] leading-relaxed font-light">Your merge operation attempted to access an index that does not exist in the destination array.</p>
                        </div>

                        {/* Why */}
                        <div className="flex flex-col gap-2">
                          <span className="text-[10px] text-white/50 uppercase tracking-[0.15em] font-medium">
                            Why
                          </span>
                          <p className="text-white/80 text-[13px] leading-relaxed font-light">
                            The merge pointer <code className="bg-white/5 text-emerald-300 px-1.5 py-0.5 rounded text-[11px] font-mono border border-white/10 mx-1">k = 5</code> exceeded the valid range while copying elements.
                          </p>
                        </div>

                        {/* Suggested Fix (Resolution Focus) */}
                        <div className="flex flex-col gap-2 mt-auto pt-4">
                          <div className="bg-emerald-950/20 border border-emerald-500/20 rounded-xl p-4 relative overflow-hidden">
                            {/* Inner glow */}
                            <div className="absolute top-0 left-0 w-1 h-full bg-emerald-500/50" />
                            <span className="text-[10px] text-emerald-400 uppercase tracking-[0.15em] font-medium flex items-center gap-2 mb-2">
                              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                              Resolution
                            </span>
                            <p className="text-emerald-100/90 text-[13px] leading-relaxed font-light">Verify merge loop bounds and destination array indexing. Ensure <code className="text-emerald-300 font-mono text-[11px]">k &lt; arr.length</code> before assignment.</p>
                          </div>
                        </div>

                      </div>
                    </div>
                  </div>
                </motion.div>

              </div>
            </div>

          </div>
        </div>
      </div>
    </section>
  );
}

