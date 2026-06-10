"use client";

import React from "react";
import { motion } from "framer-motion";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="relative bg-[#030304] border-t border-white/5 overflow-hidden pt-24 pb-8 md:pt-32 md:pb-10">
      
      {/* Premium Ambient Base Glow */}
      <div className="absolute bottom-[-20%] left-1/2 -translate-x-1/2 w-[1000px] h-[500px] bg-linear-to-t from-(--accent-primary)/10 via-(--accent-secondary)/5 to-transparent blur-[120px] pointer-events-none" />

      <div className="max-w-[1400px] mx-auto px-6 md:px-12 flex flex-col relative z-10">
         
         {/* Top Section: Brand & Navigation */}
         <div className="flex flex-col lg:flex-row justify-between items-start gap-16 mb-24 md:mb-32">
            
            {/* Brand Area */}
            <div className="flex flex-col items-start max-w-sm">
                 <div className="flex items-center gap-4 mb-6">
                    <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-white font-medium font-mono shadow-[0_0_20px_rgba(255,255,255,0.03)] relative overflow-hidden group">
                       <div className="absolute inset-0 bg-linear-to-tr from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                       <span className="text-base relative z-10">C</span>
                    </div>
                    <span className="text-2xl font-display font-medium text-white tracking-tight">CodeScope</span>
                 </div>
                 
                 <p className="text-white/40 text-base md:text-lg font-light mb-10 leading-relaxed max-w-md">
                    Execution made visible. Stop reading stack traces and start understanding code through rich, interactive visualization.
                 </p>
                 
                 <div className="flex gap-4">
                    <a href="#" className="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center text-white/40 hover:text-white hover:border-white/30 hover:bg-white/10 transition-all duration-500 hover:shadow-[0_0_20px_rgba(255,255,255,0.1)]">
                       <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/></svg>
                    </a>
                    <a href="#" className="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center text-white/40 hover:text-white hover:border-white/30 hover:bg-white/10 transition-all duration-500 hover:shadow-[0_0_20px_rgba(255,255,255,0.1)]">
                       <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723 10.054 10.054 0 01-3.127 1.184 4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/></svg>
                    </a>
                 </div>
            </div>

            {/* Navigation Area */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-12 lg:gap-24">
               <div className="flex flex-col gap-4 md:gap-5">
                  <span className="text-white/80 text-[13px] font-medium tracking-wide mb-1">Product</span>
                  <a href="#" className="text-white/40 hover:text-white text-sm transition-colors duration-500 w-fit">Visualizer</a>
                  <a href="#" className="text-white/40 hover:text-white text-sm transition-colors duration-500 w-fit">Intelligence</a>
                  <a href="#" className="text-white/40 hover:text-white text-sm transition-colors duration-500 w-fit">Diagnostics</a>
                  <a href="#" className="text-white/40 hover:text-white text-sm transition-colors duration-500 w-fit">Features</a>
               </div>

               <div className="flex flex-col gap-4 md:gap-5">
                  <span className="text-white/80 text-[13px] font-medium tracking-wide mb-1">Resources</span>
                  <a href="#" className="text-white/40 hover:text-white text-sm transition-colors duration-500 w-fit">Documentation</a>
                  <a href="#" className="text-white/40 hover:text-white text-sm transition-colors duration-500 w-fit">API Reference</a>
                  <a href="#" className="text-white/40 hover:text-white text-sm transition-colors duration-500 w-fit">Architecture</a>
                  <a href="#" className="text-white/40 hover:text-white text-sm transition-colors duration-500 w-fit">FAQ</a>
               </div>

               <div className="flex flex-col gap-4 md:gap-5 col-span-2 sm:col-span-1">
                  <span className="text-white/80 text-[13px] font-medium tracking-wide mb-1">Company</span>
                  <a href="#" className="text-white/40 hover:text-white text-sm transition-colors duration-500 w-fit">About</a>
                  <a href="#" className="text-white/40 hover:text-white text-sm transition-colors duration-500 w-fit">Blog</a>
                  <a href="#" className="text-white/40 hover:text-white text-sm transition-colors duration-500 w-fit">Contact</a>
               </div>
            </div>
         </div>

         {/* Middle Section: Premium Editorial Typography */}
         <div className="w-full flex justify-start items-center mb-10 select-none pointer-events-none overflow-hidden relative">
            <span className="font-serif italic font-light text-[18vw] lg:text-[17vw] xl:text-[16vw] leading-[0.85] tracking-tight ml-[-1vw] text-transparent bg-clip-text bg-linear-to-br from-white via-white/90 to-(--accent-primary)/40 drop-shadow-2xl">
               CodeScope.
            </span>
         </div>

         {/* Elegant Separator */}
         <div className="w-full h-px bg-linear-to-r from-transparent via-white/10 to-transparent mb-8" />

         {/* Bottom Section: Secondary Information, Author & Status */}
         <div className="flex flex-col lg:flex-row items-center justify-between gap-8 lg:gap-6">
            
            {/* Copyright */}
            <div className="flex items-center gap-6 text-white/40 text-[13px] font-light tracking-wide order-2 lg:order-1">
               <span>&copy; {currentYear} CodeScope Inc.</span>
            </div>
            
            {/* Author Badge */}
            <div className="flex items-center gap-2 px-5 py-2 rounded-full border border-white/5 bg-white/5 shadow-inner backdrop-blur-md text-[13px] text-white/60 font-light group hover:border-white/20 transition-all duration-700 hover:shadow-[0_0_30px_rgba(255,255,255,0.05)] order-1 lg:order-2">
               <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-(--accent-primary) drop-shadow-[0_0_8px_rgba(232,164,74,0.6)] mr-1 group-hover:scale-110 transition-transform duration-500">
                  <path d="M12 2l3 7 7 3-7 3-3 7-3-7-7-3 7-3z" fill="currentColor" fillOpacity="0.2"/>
               </svg>
               <span className="text-white/40">Engineered by</span>
               <span className="text-white font-medium group-hover:text-(--accent-primary) transition-colors duration-500">Vraj Patel</span>
            </div>
            
            {/* Legal & Status */}
            <div className="flex flex-wrap justify-center items-center gap-6 md:gap-8 text-white/40 text-[13px] font-light order-3 lg:order-3">
               <a href="#" className="hover:text-white transition-colors duration-500">Privacy</a>
               <a href="#" className="hover:text-white transition-colors duration-500">Terms</a>
               <span className="hidden sm:inline opacity-20">|</span>
               <div className="flex items-center gap-2 font-mono text-[11px] text-white/60">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#6BBFA0] shadow-[0_0_10px_rgba(107,191,160,0.6)]" />
                  <span className="tracking-widest uppercase text-[9px] opacity-80">All Systems Operational</span>
               </div>
            </div>

         </div>

      </div>
    </footer>
  );
}
