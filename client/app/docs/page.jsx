"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { DOCS_NAVIGATION } from "@/app/lib/docs-data";

function VisualizerGraphic({ slug }) {
  const renderGraphic = () => {
    switch(slug) {
      case 'arrays':
      case 'strings':
        return (
          <div className="relative w-48 h-12 flex items-center gap-1 justify-center">
             <div className="absolute inset-0 top-1/2 -translate-y-1/2 h-px bg-(--border-color) group-hover:bg-(--accent-primary)/30 transition-colors duration-700" />
             {[...Array(5)].map((_, i) => (
               <div key={i} className="relative w-8 h-8 border border-(--border-color) group-hover:border-(--accent-primary) transition-all duration-700 bg-background flex items-center justify-center group-hover:-translate-y-1" style={{ transitionDelay: `${i * 50}ms` }}>
                  <div className={`w-2 h-2 ${slug === 'strings' ? 'rounded-full' : 'rounded-none'} bg-(--text-muted) group-hover:bg-(--accent-primary) transition-colors duration-700`} />
               </div>
             ))}
          </div>
        );
      
      case 'matrices':
        return (
          <div className="relative w-32 h-32 flex flex-col gap-1 items-center justify-center">
             {[...Array(4)].map((_, r) => (
               <div key={r} className="flex gap-1">
                 {[...Array(4)].map((_, c) => (
                   <div key={c} className="w-6 h-6 border border-(--border-color) group-hover:border-(--accent-primary) transition-all duration-700 bg-background flex items-center justify-center group-hover:scale-110" style={{ transitionDelay: `${(r+c) * 40}ms` }}>
                      <div className="w-1 h-1 bg-(--text-muted) group-hover:bg-(--accent-primary) transition-colors duration-700" />
                   </div>
                 ))}
               </div>
             ))}
          </div>
        );

      case 'linked-lists':
        return (
          <div className="relative w-48 h-16 flex items-center justify-between">
             {[...Array(3)].map((_, i) => (
               <div key={i} className="relative flex items-center group-hover:-translate-y-1 transition-transform duration-700" style={{ transitionDelay: `${i * 100}ms` }}>
                  {/* Node */}
                  <div className="flex w-12 h-8 border border-(--border-color) group-hover:border-(--accent-primary) transition-colors duration-700 bg-background z-10">
                     <div className="flex-1 flex items-center justify-center">
                        <div className="w-2 h-1 bg-(--text-muted) group-hover:bg-(--accent-primary) transition-colors duration-700" />
                     </div>
                     <div className="w-3 border-l border-(--border-color) group-hover:border-(--accent-primary) transition-colors duration-700 flex items-center justify-center">
                        <div className="w-1 h-1 rounded-full bg-(--text-muted) group-hover:bg-(--accent-primary) transition-colors duration-700" />
                     </div>
                  </div>
                  {/* Pointer */}
                  {i < 2 && (
                    <div className="w-6 h-px bg-(--border-color) group-hover:bg-(--accent-primary)/50 transition-colors duration-700 relative -ml-px z-0">
                       <div className="absolute right-0 top-1/2 -translate-y-1/2 w-1.5 h-1.5 border-t border-r border-(--border-color) group-hover:border-(--accent-primary)/50 rotate-45 transition-colors duration-700" />
                    </div>
                  )}
               </div>
             ))}
          </div>
        );

      case 'trees':
      case 'priority-queue':
        return (
          <div className="relative w-40 h-32 flex items-center justify-center">
             <svg className="absolute inset-0 w-full h-full overflow-visible" viewBox="0 0 160 128">
               <g className="text-(--border-color) group-hover:text-(--accent-primary) transition-colors duration-700 opacity-50 group-hover:opacity-80" stroke="currentColor" strokeWidth="1" fill="none">
                  {/* Root to L1 */}
                  <line x1="80" y1="24" x2="48" y2="64" />
                  <line x1="80" y1="24" x2="112" y2="64" />
                  {/* L1 Left to L2 */}
                  <line x1="48" y1="64" x2="24" y2="104" />
                  <line x1="48" y1="64" x2="72" y2="104" />
                  {/* L1 Right to L2 */}
                  <line x1="112" y1="64" x2="88" y2="104" />
                  <line x1="112" y1="64" x2="136" y2="104" />
               </g>
             </svg>
             
             {/* Nodes positioned absolutely */}
             <div className="absolute top-[8px] left-[64px] w-8 h-8 rounded-full border border-(--border-color) group-hover:border-(--accent-primary) bg-background transition-all duration-700 group-hover:-translate-y-1 shadow-[0_0_0_rgba(232,164,74,0)] group-hover:shadow-[0_0_12px_rgba(232,164,74,0.3)] flex items-center justify-center">
                <div className="w-2 h-2 rounded-full bg-(--text-muted) group-hover:bg-(--accent-primary) transition-colors duration-700" />
             </div>

             <div className="absolute top-[48px] left-[32px] w-8 h-8 rounded-full border border-(--border-color) group-hover:border-(--accent-primary) bg-background transition-all duration-700 group-hover:-translate-y-1 delay-75 flex items-center justify-center">
                <div className="w-2 h-2 rounded-full bg-(--text-muted) group-hover:bg-(--accent-primary) transition-colors duration-700" />
             </div>
             <div className="absolute top-[48px] left-[96px] w-8 h-8 rounded-full border border-(--border-color) group-hover:border-(--accent-primary) bg-background transition-all duration-700 group-hover:-translate-y-1 delay-75 flex items-center justify-center">
                <div className="w-2 h-2 rounded-full bg-(--text-muted) group-hover:bg-(--accent-primary) transition-colors duration-700" />
             </div>

             <div className="absolute top-[88px] left-[8px] w-8 h-8 rounded-full border border-(--border-color) group-hover:border-(--accent-primary) bg-background transition-all duration-700 group-hover:-translate-y-1 delay-150 flex items-center justify-center">
                <div className="w-2 h-2 rounded-full bg-(--text-muted) group-hover:bg-(--accent-primary) transition-colors duration-700" />
             </div>
             <div className="absolute top-[88px] left-[56px] w-8 h-8 rounded-full border border-(--border-color) group-hover:border-(--accent-primary) bg-background transition-all duration-700 group-hover:-translate-y-1 delay-150 flex items-center justify-center">
                <div className="w-2 h-2 rounded-full bg-(--text-muted) group-hover:bg-(--accent-primary) transition-colors duration-700" />
             </div>
             <div className="absolute top-[88px] left-[72px] w-8 h-8 rounded-full border border-(--border-color) group-hover:border-(--accent-primary) bg-background transition-all duration-700 group-hover:-translate-y-1 delay-150 flex items-center justify-center">
                <div className="w-2 h-2 rounded-full bg-(--text-muted) group-hover:bg-(--accent-primary) transition-colors duration-700" />
             </div>
             <div className="absolute top-[88px] left-[120px] w-8 h-8 rounded-full border border-(--border-color) group-hover:border-(--accent-primary) bg-background transition-all duration-700 group-hover:-translate-y-1 delay-150 flex items-center justify-center">
                <div className="w-2 h-2 rounded-full bg-(--text-muted) group-hover:bg-(--accent-primary) transition-colors duration-700" />
             </div>
          </div>
        );

      case 'graphs':
        return (
          <div className="relative w-40 h-40">
             <svg className="absolute inset-0 w-full h-full overflow-visible" viewBox="0 0 160 160">
               <g className="text-(--border-color) group-hover:text-(--accent-primary) transition-colors duration-700 opacity-50 group-hover:opacity-80" stroke="currentColor" strokeWidth="1" fill="none">
                  <line x1="80" y1="30" x2="130" y2="80" />
                  <line x1="130" y1="80" x2="80" y2="130" />
                  <line x1="80" y1="130" x2="30" y2="80" />
                  <line x1="30" y1="80" x2="80" y2="30" />
                  <line x1="80" y1="30" x2="80" y2="80" />
                  <line x1="80" y1="130" x2="80" y2="80" />
                  <line x1="30" y1="80" x2="80" y2="80" />
                  <line x1="130" y1="80" x2="80" y2="80" />
               </g>
             </svg>
             <div className="absolute top-[14px] left-[64px] w-8 h-8 rounded-full border border-(--border-color) group-hover:border-(--accent-primary) bg-background flex items-center justify-center z-10 transition-all duration-700 group-hover:-translate-y-1" />
             <div className="absolute top-[64px] left-[14px] w-8 h-8 rounded-full border border-(--border-color) group-hover:border-(--accent-primary) bg-background flex items-center justify-center z-10 transition-all duration-700 group-hover:-translate-x-1" />
             <div className="absolute top-[64px] left-[114px] w-8 h-8 rounded-full border border-(--border-color) group-hover:border-(--accent-primary) bg-background flex items-center justify-center z-10 transition-all duration-700 group-hover:translate-x-1" />
             <div className="absolute top-[114px] left-[64px] w-8 h-8 rounded-full border border-(--border-color) group-hover:border-(--accent-primary) bg-background flex items-center justify-center z-10 transition-all duration-700 group-hover:translate-y-1" />
             <div className="absolute top-[64px] left-[64px] w-8 h-8 rounded-full border border-(--border-color) group-hover:border-(--accent-primary) bg-background flex items-center justify-center z-10 transition-all duration-700">
               <div className="w-2 h-2 rounded-full bg-(--accent-primary) opacity-0 group-hover:opacity-100 transition-opacity duration-700 delay-300 shadow-[0_0_10px_rgba(232,164,74,0.8)]" />
             </div>
          </div>
        );

      case 'stack':
      case 'call-stack':
        return (
          <div className="relative w-24 h-40 flex flex-col items-center justify-end gap-1 pb-4">
             {[...Array(5)].map((_, i) => (
               <div key={i} className={`w-full h-6 border ${i === 0 ? 'border-(--accent-primary) shadow-[0_0_15px_rgba(232,164,74,0.15)] -translate-y-2' : 'border-(--border-color)'} group-hover:border-(--accent-primary) bg-background flex items-center justify-center transition-all duration-700 group-hover:-translate-y-2`} style={{ transitionDelay: `${(4-i) * 50}ms` }}>
                 <div className={`w-2 h-1 ${i === 0 ? 'bg-(--accent-primary)' : 'bg-(--text-muted)'} group-hover:bg-(--accent-primary) transition-colors duration-700`} />
               </div>
             ))}
             <div className="absolute bottom-0 w-full h-px bg-(--border-color) group-hover:bg-(--accent-primary)/50 transition-colors duration-700" />
          </div>
        );

      case 'queue':
      case 'deque':
        return (
          <div className="relative w-48 h-16 flex flex-col justify-center">
             <div className="w-full flex items-center justify-center gap-1 border-t border-b border-(--border-color) group-hover:border-(--accent-primary)/50 transition-colors duration-700 py-2">
               {slug === 'deque' && <div className="absolute left-[-10px] w-0 h-0 border-t-4 border-t-transparent border-b-4 border-b-transparent border-r-[6px] border-r-(--border-color) group-hover:border-r-(--accent-primary) transition-colors duration-700" />}
               <div className="absolute left-0 w-0 h-0 border-t-4 border-t-transparent border-b-4 border-b-transparent border-l-[6px] border-l-(--border-color) group-hover:border-l-(--accent-primary) transition-colors duration-700" />
               
               {[...Array(5)].map((_, i) => (
                 <div key={i} className="w-6 h-10 border border-(--border-color) group-hover:border-(--accent-primary) bg-background transition-all duration-700 flex items-center justify-center" style={{ transitionDelay: `${(4-i) * 50}ms`, transform: 'translateX(0)' }}>
                    <div className="w-1 h-1 bg-(--text-muted) group-hover:bg-(--accent-primary) transition-colors duration-700" />
                 </div>
               ))}

               <div className="absolute right-0 w-0 h-0 border-t-4 border-t-transparent border-b-4 border-b-transparent border-l-[6px] border-l-(--border-color) group-hover:border-l-(--accent-primary) transition-colors duration-700" />
               {slug === 'deque' && <div className="absolute right-[-10px] w-0 h-0 border-t-4 border-t-transparent border-b-4 border-b-transparent border-r-[6px] border-r-(--border-color) group-hover:border-r-(--accent-primary) transition-colors duration-700" />}
             </div>
          </div>
        );

      case 'hashmap':
      case 'hashset':
        return (
          <div className="relative w-48 h-32 flex items-center justify-between">
             {/* Keys */}
             <div className="flex flex-col gap-2">
                <div className="w-10 h-6 border border-(--border-color) group-hover:border-(--accent-primary) bg-background flex items-center justify-center transition-colors duration-700">
                  <span className="text-[8px] font-mono text-(--text-muted) group-hover:text-(--accent-primary) transition-colors duration-700">"A"</span>
                </div>
                <div className="w-10 h-6 border border-(--border-color) group-hover:border-(--accent-primary) bg-background flex items-center justify-center transition-colors duration-700">
                  <span className="text-[8px] font-mono text-(--text-muted) group-hover:text-(--accent-primary) transition-colors duration-700">"B"</span>
                </div>
                <div className="w-10 h-6 border border-(--border-color) group-hover:border-(--accent-primary) bg-background flex items-center justify-center transition-colors duration-700">
                  <span className="text-[8px] font-mono text-(--text-muted) group-hover:text-(--accent-primary) transition-colors duration-700">"C"</span>
                </div>
             </div>

             {/* SVG connecting lines (Hash function) */}
             <svg className="absolute inset-0 w-full h-full overflow-visible" viewBox="0 0 192 128">
               <g className="text-(--border-color) group-hover:text-(--accent-primary) transition-colors duration-700 opacity-50 group-hover:opacity-80" stroke="currentColor" strokeWidth="1" fill="none">
                  {/* From "A" to bucket 2 */}
                  <path d="M 40 32 C 86 32, 86 75, 132 75" strokeDasharray="4 4" className="group-hover:animate-pulse" />
                  {/* From "B" to bucket 0 */}
                  <path d="M 40 64 C 86 64, 86 27, 132 27" strokeDasharray="4 4" className="group-hover:animate-pulse" />
                  {/* From "C" to bucket 3 */}
                  <path d="M 40 96 C 86 96, 86 99, 132 99" strokeDasharray="4 4" className="group-hover:animate-pulse" />
               </g>
             </svg>

             {/* Buckets */}
             <div className="flex flex-col gap-0 border border-(--border-color) group-hover:border-(--accent-primary) bg-background transition-colors duration-700 p-1">
                {[0,1,2,3].map((bucket) => (
                  <div key={bucket} className="w-14 h-6 border-b border-(--border-color) last:border-0 flex items-center justify-center group-hover:bg-(--accent-primary)/5 transition-colors duration-700">
                     <div className={`w-8 h-2 ${bucket === 0 || bucket === 2 || bucket === 3 ? 'bg-(--text-muted) group-hover:bg-(--accent-primary)' : 'bg-transparent'} transition-colors duration-700 rounded-sm`} />
                  </div>
                ))}
             </div>
          </div>
        );

      case 'variables':
        return (
          <div className="relative w-32 h-32 flex items-center justify-center">
             <div className="w-20 h-12 border border-(--border-color) group-hover:border-(--accent-primary) bg-background transition-all duration-700 flex items-center justify-center group-hover:scale-110 shadow-[0_0_0_rgba(232,164,74,0)] group-hover:shadow-[0_0_20px_rgba(232,164,74,0.2)]">
                <div className="absolute -top-3 left-2 px-1 bg-background text-[8px] font-mono text-(--text-muted) group-hover:text-(--accent-primary) transition-colors duration-700">PTR</div>
                <div className="w-8 h-2 bg-(--border-color) group-hover:bg-(--accent-primary) transition-colors duration-700" />
             </div>
          </div>
        );

      case 'operations':
      case 'execution-pipeline':
        return (
          <div className="relative w-40 h-16 flex items-center justify-between">
             <div className="absolute inset-0 top-1/2 -translate-y-1/2 h-px bg-(--border-color) group-hover:bg-(--accent-primary)/30 transition-colors duration-700" />
             {[...Array(3)].map((_, i) => (
               <div key={i} className="relative w-10 h-10 border border-(--border-color) group-hover:border-(--accent-primary) transition-all duration-700 bg-background flex items-center justify-center group-hover:rotate-45" style={{ transitionDelay: `${i * 100}ms` }}>
                  <div className="w-3 h-3 border border-(--border-color) group-hover:border-(--accent-primary) transition-colors duration-700" />
               </div>
             ))}
          </div>
        );

      case 'timelines':
        return (
          <div className="relative w-48 h-24 flex items-center justify-center">
             <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 h-px bg-(--border-color) group-hover:bg-(--accent-primary)/50 transition-colors duration-700" />
             <div className="absolute w-full flex justify-between px-2">
               {[...Array(7)].map((_, i) => (
                 <div key={i} className={`w-px ${i%2===0 ? 'h-4 -translate-y-2' : 'h-2 -translate-y-1'} bg-(--border-color) group-hover:bg-(--accent-primary) transition-all duration-700`} style={{ transitionDelay: `${i * 50}ms`, transform: i%2===0 ? 'scaleY(1.5)' : 'scaleY(1)' }} />
               ))}
             </div>
             <div className="absolute w-2 h-2 rounded-full bg-(--text-muted) group-hover:bg-(--accent-primary) shadow-none group-hover:shadow-[0_0_10px_rgba(232,164,74,0.8)] transition-all duration-1000 -translate-x-20 group-hover:translate-x-20" />
          </div>
        );

      case 'runtime-errors':
      case 'compilation-errors':
      case 'input-errors':
        return (
          <div className="relative w-32 h-32 flex items-center justify-center">
             <div className="absolute w-20 h-20 border border-(--border-color) group-hover:border-red-500/50 transition-colors duration-700 rotate-45" />
             <div className="w-16 h-16 border border-(--border-color) group-hover:border-red-500 transition-colors duration-700 flex items-center justify-center bg-background group-hover:scale-110">
                <div className="w-px h-6 bg-(--text-muted) group-hover:bg-red-500 transition-colors duration-700 rotate-45 absolute" />
                <div className="w-px h-6 bg-(--text-muted) group-hover:bg-red-500 transition-colors duration-700 -rotate-45 absolute" />
             </div>
          </div>
        );

      case 'input-system':
      case 'docker-sandbox':
        return (
          <div className="relative w-32 h-32 flex items-center justify-center">
             <div className="absolute w-24 h-24 border border-dashed border-(--border-color) group-hover:border-(--accent-primary)/50 transition-colors duration-700" />
             <div className="w-16 h-16 border border-(--border-color) group-hover:border-(--accent-primary) transition-all duration-700 bg-background flex flex-col justify-between p-2 group-hover:scale-110 shadow-[0_0_0_rgba(232,164,74,0)] group-hover:shadow-[0_0_20px_rgba(232,164,74,0.15)]">
                <div className="w-full h-px bg-(--border-color) group-hover:bg-(--accent-primary)/50 transition-colors" />
                <div className="w-full flex justify-between">
                  <div className="w-2 h-2 bg-(--border-color) group-hover:bg-(--accent-primary) transition-colors" />
                  <div className="w-2 h-2 bg-(--border-color) group-hover:bg-(--accent-primary) transition-colors delay-75" />
                </div>
                <div className="w-full h-px bg-(--border-color) group-hover:bg-(--accent-primary)/50 transition-colors" />
             </div>
          </div>
        );

      default:
        // Generic geometric fallback for anything missed
        return (
          <div className="relative w-40 h-40 flex items-center justify-center">
             <div className="absolute w-full h-px bg-(--border-color) group-hover:bg-(--accent-primary)/30 transition-colors duration-700" />
             <div className="absolute w-px h-full bg-(--border-color) group-hover:bg-(--accent-primary)/30 transition-colors duration-700" />
             <div className="absolute w-20 h-20 border border-(--border-color) group-hover:border-(--accent-primary)/60 transition-all duration-700 rounded-full scale-90 group-hover:scale-100" />
             <div className="absolute w-2 h-2 bg-(--text-muted) group-hover:bg-(--accent-primary) transition-colors duration-700 rounded-full" />
          </div>
        );
    }
  };

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none flex items-center justify-center">
      {/* Ambient glow */}
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-1000 bg-[radial-gradient(circle_at_center,rgba(232,164,74,0.04)_0%,transparent_60%)]" />
      {renderGraphic()}
    </div>
  );
}

export default function DocsHome() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1, delayChildren: 0.2 },
    },
  };

  const plateVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] },
    },
  };

  return (
    <div className="min-h-screen pb-32 pt-12 px-6 lg:px-12 xl:px-20 font-ui">
      {/* Hero Section */}
      <div className="relative min-h-[40vh] flex flex-col justify-end pb-24 border-b border-(--border-color) mb-24">
        {/* Abstract background for hero */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
           <div className="absolute right-0 top-0 w-[500px] h-[500px] bg-[radial-gradient(circle_at_center,rgba(232,164,74,0.03)_0%,transparent_70%)]" />
           <div className="absolute right-12 top-12 w-[300px] h-[300px] border border-(--border-color) rounded-full opacity-10" />
           <div className="absolute right-24 top-24 w-[200px] h-[200px] border border-(--border-color) rounded-full opacity-10" />
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
          className="max-w-5xl relative z-10"
        >
          <div className="flex items-center gap-3 mb-8">
            <span className="w-2 h-2 bg-(--accent-primary) shadow-[0_0_10px_rgba(232,164,74,0.5)]" />
            <span className="text-(--accent-primary) font-mono text-xs tracking-[0.2em] uppercase">
              System Architecture
            </span>
          </div>
          <h1 className="text-5xl md:text-7xl lg:text-8xl font-display text-foreground leading-none tracking-tight mb-8">
            Execution. <br />
            <span className="text-(--text-muted)">Visualized.</span>
          </h1>
        </motion.div>
      </div>

      {/* Categories Mapping */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="space-y-40"
      >
        {DOCS_NAVIGATION.map((category, categoryIdx) => (
          <div key={categoryIdx} className="relative">
            {/* Massive Category Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-16">
              <div>
                 <span className="block text-(--text-muted) font-mono text-xs mb-4 tracking-[0.2em] uppercase">
                   INDEX // {(categoryIdx + 1).toString().padStart(2, "0")}
                 </span>
                 <h2 className="text-3xl md:text-5xl font-display tracking-tight text-foreground">
                   {category.category}
                 </h2>
              </div>
              <div className="hidden md:block flex-1 max-w-sm h-px bg-(--border-color) mb-2" />
            </div>

            {/* Seamless Architectural Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 border-t border-l border-(--border-color) bg-(--bg-surface)/10">
              {category.items.map((item, itemIdx) => (
                <motion.div variants={plateVariants} key={item.slug} className="relative aspect-square border-r border-b border-(--border-color) bg-background overflow-hidden">
                  <Link
                    href={`/docs/${item.slug}`}
                    className="absolute inset-0 group hover:bg-(--bg-surface) transition-colors duration-500 outline-none focus-visible:ring-2 focus-visible:ring-(--accent-primary) focus-visible:z-10 block"
                  >
                    <VisualizerGraphic slug={item.slug} />
                    
                    {/* Name */}
                    <div className="absolute bottom-6 left-6 right-6 z-10 flex items-end justify-between">
                      <h3 className="text-xl md:text-2xl font-ui font-medium tracking-tight text-(--text-secondary) group-hover:text-foreground transition-colors duration-300">
                        {item.name}
                      </h3>
                      {/* Arrow indicator */}
                      <span className="font-mono text-(--text-muted) opacity-0 group-hover:opacity-100 group-hover:text-(--accent-primary) -translate-x-2 group-hover:translate-x-0 transition-all duration-300">
                        -&gt;
                      </span>
                    </div>

                    {/* Corner brackets - Architectural Detail */}
                    <div className="absolute top-4 left-4 w-2 h-2 border-t border-l border-(--border-color) opacity-40 group-hover:opacity-100 group-hover:border-(--accent-primary) transition-colors duration-500" />
                    <div className="absolute top-4 right-4 w-2 h-2 border-t border-r border-(--border-color) opacity-40 group-hover:opacity-100 group-hover:border-(--accent-primary) transition-colors duration-500" />
                    <div className="absolute bottom-4 left-4 w-2 h-2 border-b border-l border-(--border-color) opacity-40 group-hover:opacity-100 group-hover:border-(--accent-primary) transition-colors duration-500" />
                    <div className="absolute bottom-4 right-4 w-2 h-2 border-b border-r border-(--border-color) opacity-40 group-hover:opacity-100 group-hover:border-(--accent-primary) transition-colors duration-500" />
                  </Link>
                </motion.div>
              ))}
            </div>
          </div>
        ))}
      </motion.div>
    </div>
  );
}
