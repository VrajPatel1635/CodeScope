"use client";

import { use, useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import Editor from "@monaco-editor/react";
import Button from "@/app/components/landing/ui/Button";
import CustomYouTubePlayer from "@/app/components/landing/ui/CustomYouTubePlayer";
import { DOCS_DATA_DETAILS, DOCS_NAVIGATION } from "@/app/lib/docs-data";

// Helper to determine if a URL is YouTube
const isYouTube = (url) => {
  if (!url) return false;
  return url.includes("youtube.com") || url.includes("youtu.be");
};

// Helper to extract YouTube video ID
const getYouTubeID = (url) => {
  if (!url) return null;
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
  const match = url.match(regExp);
  return (match && match[2].length === 11) ? match[2] : null;
};

const CodeEditorLoadingSkeleton = () => (
  <div className="w-full h-full flex flex-col p-4 bg-(--bg-elevated)">
    <div className="flex items-center gap-2 mb-4">
      <div className="w-2 h-2 rounded-full bg-(--accent-primary) animate-pulse" />
      <span className="text-[10px] font-mono text-(--text-secondary) uppercase tracking-widest">Initializing Editor</span>
    </div>
    {[...Array(10)].map((_, i) => (
      <div key={i} className="flex gap-4 mb-2 opacity-50">
        <div className="w-4 h-4 text-[10px] font-mono text-(--text-muted) text-right">{i + 1}</div>
        <motion.div 
          className="h-4 bg-(--border-color) rounded"
          initial={{ width: "20%" }}
          animate={{ width: `${Math.random() * 40 + 20}%` }}
          transition={{ repeat: Infinity, repeatType: "reverse", duration: 1.5 + Math.random() }}
        />
      </div>
    ))}
  </div>
);

export default function DocsDetail({ params }) {
  const resolvedParams = use(params);
  const topicSlug = resolvedParams.topic;
  
  const topicData = DOCS_DATA_DETAILS[topicSlug] || {
    name: topicSlug.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
    description: "Detailed specification, memory models, and compilation pipeline interfaces for this architecture.",
    signatures: ["public void execute(Object input)"],
    formats: ["Standard JSON", "Binary Serialized"],
    unsupported: ["Self-referential cyclical graphs via JSON."],
    examples: [
      { name: "Standard Initialization", code: "const ds = new Structure();\nds.insert(42);\nconsole.log(ds);", reason: "Standard memory allocation sequence." }
    ],
    diagnostics: [
      { scenario: "Memory OOB", why: "Pointer exceeded allocated bounds.", fix: "Verify array boundaries prior to mutation." }
    ],
    videoUrl: "https://www.youtube.com/watch?v=ri1Ar5nEq4s"
  };

  const flatItems = DOCS_NAVIGATION.flatMap(c => c.items);
  const currentIndex = flatItems.findIndex(i => i.slug === topicSlug);
  const prevTopic = currentIndex > 0 ? flatItems[currentIndex - 1] : null;
  const nextTopic = currentIndex < flatItems.length - 1 ? flatItems[currentIndex + 1] : null;

  const [activeTab, setActiveTab] = useState(0);
  const [copied, setCopied] = useState(false);
  const [videoLoaded, setVideoLoaded] = useState(false);
  const [videoError, setVideoError] = useState(false);

  const videoToPlay = topicData.videoUrl || "https://www.youtube.com/watch?v=ri1Ar5nEq4s";

  const codeString = topicData.examples[activeTab]?.code || "// No example code provided.";
  const lineCount = codeString.split('\n').length;
  const displayLines = Math.min(lineCount, 25);
  // Approx 21px per line with font-size 14 + 32px vertical padding
  const editorHeight = `${Math.max(150, displayLines * 21 + 32)}px`;

  const handleCopy = () => {
    navigator.clipboard.writeText(codeString);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen pb-20 md:pb-32 pt-20 md:pt-24 px-5 md:px-6 lg:px-12 xl:px-20 font-ui relative overflow-x-hidden selection:bg-(--accent-primary) selection:text-background">
      {/* Background glow for aesthetic */}
      <div className="fixed top-[-20%] right-[-10%] w-[800px] h-[800px] bg-(--accent-primary) opacity-[0.02] blur-[150px] pointer-events-none rounded-full" />

      {/* SECTION 1: Introductory Typographic Moment */}
      <motion.section 
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1.4, ease: [0.16, 1, 0.3, 1] }}
        className="mb-24 md:mb-40 md:ml-16 max-w-5xl relative"
      >
        {/* Subtle grid accent behind title */}
        <div className="absolute -left-12 top-4 w-6 h-6 border-t border-l border-(--border-color) opacity-50 hidden md:block" />
        <div className="absolute -left-12 bottom-4 w-6 h-6 border-b border-l border-(--border-color) opacity-50 hidden md:block" />
        
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-10 md:gap-12">
          <div>
            <h1 className="text-5xl sm:text-6xl md:text-8xl lg:text-[140px] font-display text-foreground leading-[0.85] tracking-tighter mb-6 md:mb-8 ml-0 md:-ml-2">
              {topicData.name}
            </h1>
            <p className="text-xl md:text-2xl text-(--text-secondary) max-w-2xl font-light leading-relaxed pl-2 md:border-l border-(--accent-primary)/30">
              {topicData.description}
            </p>
          </div>
          
          <div className="shrink-0 lg:pb-2">
            <Button 
              href="/visualizer" 
              variant="primary" 
              accent="primary"
              triggerLoader={true}
            >
              Launch Environment
            </Button>
          </div>
        </div>
      </motion.section>

      {/* SECTION 3: Input Interfaces & Limitations (Asymmetric layout) */}
      <motion.section 
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 1.2 }}
        className="mb-24 md:mb-40 grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-20"
      >
        {/* Left Column (Spans 5) */}
        <div className="lg:col-span-5 relative">
          <div className="sticky top-32">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-display text-foreground leading-tight tracking-tight mb-6">
              Protocol Interfaces
            </h2>
            <p className="text-lg text-(--text-secondary) font-light leading-relaxed mb-8 md:mb-12">
              Strictly defined method signatures and supported structures required by the internal compilation engine for successful memory allocation.
            </p>
            
            {topicData.unsupported.length > 0 && (
              <div className="bg-(--bg-elevated) border border-(--border-color) p-8 rounded-xl relative overflow-hidden group">
                <div className="absolute top-0 left-0 w-1 h-full bg-(--exec-error) opacity-50 group-hover:opacity-100 transition-opacity" />
                <h3 className="text-(--exec-error) font-mono text-xs uppercase tracking-widest mb-6">Execution Limitations</h3>
                <ul className="list-none space-y-4">
                  {topicData.unsupported.map((unsup, i) => (
                    <li key={i} className="flex items-start gap-4 text-(--text-secondary) text-sm font-mono leading-relaxed">
                      <span className="mt-1 text-[10px] text-(--border-color)">[{i+1}]</span>
                      {unsup}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>

        {/* Right Column (Spans 7) */}
        <div className="lg:col-span-7 space-y-16">
          <div>
            <h3 className="flex items-center gap-4 text-(--text-muted) font-mono text-xs uppercase tracking-widest mb-8">
              <span className="w-8 h-px bg-(--border-color)" />
              Accepted Signatures
            </h3>
            <div className="bg-background border border-(--border-color) rounded-xl overflow-hidden shadow-xl">
              <div className="h-8 bg-(--bg-surface) border-b border-(--border-color) flex items-center px-4">
                <div className="text-[10px] text-(--text-muted) font-mono">interfaces.d.ts</div>
              </div>
              <div className="p-6 font-mono text-[13px] md:text-[14px] text-(--text-secondary) leading-loose">
                {topicData.signatures.map((sig, i) => (
                  <div key={i} className="flex gap-6 group hover:bg-(--bg-elevated) -mx-6 px-6 py-1 transition-colors">
                    <span className="text-(--border-color) select-none opacity-50">{(i + 1).toString().padStart(2, '0')}</span>
                    <span className="text-foreground group-hover:text-(--accent-highlight) transition-colors">{sig}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div>
            <h3 className="flex items-center gap-4 text-(--text-muted) font-mono text-xs uppercase tracking-widest mb-8">
              <span className="w-8 h-px bg-(--border-color)" />
              Supported Formats
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {topicData.formats.map((fmt, i) => (
                <div key={i} className="border border-(--border-color) bg-(--bg-surface) p-6 rounded-xl hover:border-(--accent-primary) transition-colors duration-500 group">
                  <div className="w-8 h-8 rounded-full border border-(--border-color) bg-background flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-500">
                    <div className="w-2 h-2 rounded-full bg-(--accent-primary)" />
                  </div>
                  <div className="text-foreground font-mono text-sm">{fmt}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </motion.section>

      {/* SECTION 4: Recommended Test Cases (Monaco Editor) */}
      <motion.section 
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 1.2 }}
        className="mb-24 md:mb-40"
      >
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 md:gap-8 mb-8 md:mb-12">
          <div>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-display text-foreground leading-tight tracking-tight mb-4">
              Architectural Test Cases
            </h2>
            <p className="text-(--text-secondary) font-light">Recommended initialization sequences for compiler validation.</p>
          </div>
          
          {/* Tab Navigation for Multiple Examples */}
          {topicData.examples.length > 1 && (
            <div className="flex border border-(--border-color) rounded-lg p-1 bg-(--bg-surface) self-start md:self-auto">
              {topicData.examples.map((ex, i) => (
                <button
                  key={i}
                  onClick={() => setActiveTab(i)}
                  className={`px-4 py-2 text-xs font-mono uppercase tracking-widest rounded-md transition-colors ${activeTab === i ? 'bg-(--accent-primary) text-background' : 'text-(--text-muted) hover:text-foreground'}`}
                >
                  Case {(i+1).toString().padStart(2, '0')}
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-0 border border-(--border-color) rounded-2xl overflow-hidden shadow-[0_20px_50px_-20px_rgba(0,0,0,0.5)]">
          {/* Info Panel */}
          <div className="lg:col-span-4 bg-(--bg-surface) p-8 lg:border-r border-(--border-color)">
            <h3 className="text-2xl text-foreground font-display mb-4">{topicData.examples[activeTab]?.name || "Code Example"}</h3>
            <div className="w-12 h-px bg-(--accent-primary) mb-6" />
            <p className="text-(--text-secondary) text-sm leading-relaxed font-light mb-8">
              {topicData.examples[activeTab]?.reason || "Recommended structural implementation."}
            </p>

            {topicData.examples[activeTab]?.input && (
              <div className="mb-8">
                <div className="text-[10px] font-mono uppercase tracking-widest text-(--text-muted) mb-3 flex items-center gap-2">
                  <span className="w-3 h-px bg-(--border-color)" />
                  Target Input
                </div>
                <div className="bg-background border border-(--border-color) rounded-md py-3 px-4 font-mono text-sm text-foreground shadow-inner overflow-x-auto whitespace-pre-wrap">
                  {topicData.examples[activeTab].input}
                </div>
              </div>
            )}

            <div className="inline-flex items-center gap-2 text-[10px] font-mono text-(--accent-primary) uppercase tracking-widest bg-(--accent-primary)/10 px-3 py-1.5 rounded-full">
              <div className="w-1.5 h-1.5 rounded-full bg-(--accent-primary) animate-pulse" />
              Ready for Compilation
            </div>
          </div>
          
          {/* Monaco Editor Panel */}
          <div className="lg:col-span-8 bg-(--bg-elevated) relative group border-t lg:border-t-0 lg:border-l border-(--border-color)">
            <button
              onClick={handleCopy}
              className="absolute top-4 right-6 z-10 px-3 py-1.5 bg-(--bg-elevated)/90 hover:bg-(--border-color) border border-(--border-color) rounded-md text-[10px] uppercase tracking-widest font-mono text-(--text-secondary) hover:text-(--accent-primary) transition-all backdrop-blur-md flex items-center gap-2 opacity-0 group-hover:opacity-100 shadow-xl"
            >
              {copied ? (
                <>
                  <div className="w-1.5 h-1.5 rounded-full bg-(--exec-node-active) shadow-[0_0_8px_var(--exec-node-active)]" />
                  Copied
                </>
              ) : (
                <>
                  <div className="w-1.5 h-1.5 rounded-full bg-(--accent-primary) opacity-50" />
                  Copy Code
                </>
              )}
            </button>
            <div className="p-4 w-full transition-all duration-300" style={{ height: editorHeight }}>
               <Editor
                 height="100%"
                 defaultLanguage="java"
                 theme="vs-dark"
                 value={codeString}
                 loading={<CodeEditorLoadingSkeleton />}
                 options={{
                   readOnly: true,
                   minimap: { enabled: false },
                   scrollBeyondLastLine: false,
                   fontSize: 14,
                   fontFamily: "JetBrains Mono, monospace",
                   padding: { top: 16, bottom: 16 },
                   contextmenu: false,
                   lineNumbersMinChars: 3,
                   renderLineHighlight: "none",
                   scrollbar: {
                     vertical: "auto",
                     horizontal: "auto"
                   }
                 }}
               />
             </div>
          </div>
        </div>
      </motion.section>

      {/* SECTION 4.5: Visualization Preview (Mac Window) */}
      {videoToPlay && (
        <motion.section 
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
          className="mb-24 md:mb-40 relative max-w-6xl mx-auto"
        >
          <div className="flex items-center gap-4 mb-6 px-4">
            <h2 className="text-(--accent-primary) font-mono text-[10px] md:text-xs uppercase tracking-widest">
              Runtime Visualization
            </h2>
            <div className="flex-1 h-px bg-linear-to-r from-(--accent-primary)/20 to-transparent" />
          </div>

          <div className="w-full bg-(--bg-elevated) border border-(--border-color) rounded-xl overflow-hidden shadow-[0_30px_80px_-20px_rgba(0,0,0,0.6)] group">
            {/* MacOS Title Bar */}
            <div className="h-10 bg-background border-b border-(--border-color) flex items-center justify-between px-4 relative z-10">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-(--accent-primary) animate-pulse" />
                <span className="text-[10px] font-mono text-(--accent-primary) uppercase tracking-widest">LIVE</span>
              </div>
              <div className="absolute left-1/2 -translate-x-1/2 text-[10px] font-mono text-(--text-muted) uppercase tracking-widest select-none">
                {topicSlug}-visualizer.mp4
              </div>
              <div className="w-12" />
            </div>

            {/* Video Player Area */}
            <div className="relative aspect-video bg-black flex items-center justify-center overflow-hidden">
              {!videoLoaded && !videoError && (
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-(--bg-elevated)">
                  <div className="w-8 h-8 border border-(--border-color) rounded-full flex items-center justify-center relative overflow-hidden">
                    <div className="absolute inset-0 border-t border-r rounded-full animate-spin border-(--accent-secondary) transition-all duration-300" style={{ animationDuration: "2s" }} />
                  </div>
                  <span className="text-[10px] font-mono uppercase tracking-widest text-(--text-muted)">Initializing Media Pipeline</span>
                </div>
              )}
              {videoError && (
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-(--bg-surface)">
                  <div className="w-8 h-8 rounded-full bg-red-950/30 flex items-center justify-center border border-red-900/50">
                    <div className="w-2 h-2 rounded-full bg-red-500 opacity-50" />
                  </div>
                  <span className="text-[10px] font-mono uppercase tracking-widest text-red-400">Media Unreachable</span>
                </div>
              )}

              {isYouTube(videoToPlay) ? (
                <div className="w-full h-full relative z-10">
                  <CustomYouTubePlayer videoId={getYouTubeID(videoToPlay)} />
                </div>
              ) : (
                <video 
                  className={`w-full h-full object-cover relative z-10 transition-opacity duration-700 ${videoLoaded ? "opacity-100" : "opacity-0"}`}
                  src={videoToPlay}
                  loop
                  controls
                  playsInline
                  onLoadedData={() => setVideoLoaded(true)}
                  onError={() => setVideoError(true)}
                />
              )}
              {/* Scanline overlay for aesthetic */}
              <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px)] bg-size-[100%_4px] mix-blend-overlay opacity-30" />
            </div>
          </div>
        </motion.section>
      )}

      {/* SECTION 5: Diagnostic Signatures */}
      <motion.section 
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 1.2 }}
        className="mb-24 md:mb-40"
      >
        <h2 className="text-3xl sm:text-4xl md:text-5xl font-display text-foreground leading-tight tracking-tight mb-12 md:mb-16 text-center">
          Diagnostic Signatures
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 max-w-7xl mx-auto">
          {topicData.diagnostics.map((diag, i) => (
            <div key={i} className="group bg-(--bg-surface) border border-(--border-color) hover:border-(--accent-secondary) p-8 rounded-xl transition-all duration-500 hover:-translate-y-2 hover:shadow-[0_20px_40px_-15px_rgba(0,0,0,0.5)]">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-10 h-10 border border-(--accent-secondary) flex items-center justify-center rotate-45 group-hover:bg-(--accent-secondary) transition-colors duration-500">
                  <div className="w-2 h-2 bg-(--accent-secondary) group-hover:bg-background transition-colors -rotate-45" />
                </div>
                <h3 className="font-mono text-foreground text-sm tracking-wider">ERR_{diag.scenario}</h3>
              </div>
              <p className="text-(--text-secondary) mb-6 text-sm leading-relaxed min-h-[60px]"><strong className="text-(--text-muted) font-mono text-[11px] uppercase tracking-widest block mb-2">Cause</strong>{diag.why}</p>
              <div className="bg-background px-5 py-4 border border-(--border-color) rounded-lg border-l-2 border-l-(--accent-primary)">
                <p className="text-foreground text-sm"><strong className="text-(--accent-primary) font-mono text-[11px] uppercase tracking-widest block mb-1">Resolution</strong>{diag.fix}</p>
              </div>
            </div>
          ))}
        </div>
      </motion.section>

      {/* SECTION 6: Pagination (Luxurious Split Navigation) */}
      <section className="-mx-5 md:-mx-6 lg:-mx-12 xl:-mx-20 border-t border-(--border-color) mt-16 md:mt-24 overflow-hidden">
        <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-(--border-color)">
          
          {/* Previous Topic */}
          {prevTopic ? (
            <Link href={`/docs/${prevTopic.slug}`} className="group relative py-10 md:py-20 px-6 md:px-16 lg:px-24 flex flex-col items-start justify-center hover:bg-(--bg-elevated) transition-colors duration-700 overflow-hidden">
              <div className="absolute inset-0 bg-linear-to-r from-(--accent-primary)/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
              
              <div className="flex items-center gap-4 md:gap-6 mb-4 md:mb-6 text-(--text-muted) group-hover:text-(--accent-primary) transition-colors duration-500">
                <svg width="48" height="12" viewBox="0 0 48 12" fill="none" className="transform group-hover:-translate-x-3 transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)]">
                  <path d="M6 1L1 6L6 11M1 6H48" stroke="currentColor" strokeWidth="1.5" strokeLinecap="square" />
                </svg>
                <span className="font-mono text-[10px] uppercase tracking-[0.25em]">Previous Structure</span>
              </div>
              
              <span className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-display text-foreground tracking-tighter group-hover:text-(--accent-primary) transition-colors duration-500 relative z-10">
                {prevTopic.name}
              </span>
            </Link>
          ) : (
            <div className="py-10 md:py-20 px-6 md:px-16 lg:px-24 flex items-center justify-start bg-(--bg-surface)/30">
              <span className="text-(--text-muted) font-mono text-[10px] uppercase tracking-widest opacity-30">Origin Module</span>
            </div>
          )}
          
          {/* Next Topic */}
          {nextTopic ? (
            <Link href={`/docs/${nextTopic.slug}`} className="group relative py-10 md:py-20 px-6 md:px-16 lg:px-24 flex flex-col items-end justify-center hover:bg-(--bg-elevated) transition-colors duration-700 overflow-hidden text-right">
              <div className="absolute inset-0 bg-linear-to-l from-(--accent-primary)/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
              
              <div className="flex items-center gap-4 md:gap-6 mb-4 md:mb-6 text-(--text-muted) group-hover:text-(--accent-primary) transition-colors duration-500">
                <span className="font-mono text-[10px] uppercase tracking-[0.25em]">Next Structure</span>
                <svg width="48" height="12" viewBox="0 0 48 12" fill="none" className="transform group-hover:translate-x-3 transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)]">
                  <path d="M42 1L47 6L42 11M47 6H0" stroke="currentColor" strokeWidth="1.5" strokeLinecap="square" />
                </svg>
              </div>
              
              <span className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-display text-foreground tracking-tighter group-hover:text-(--accent-primary) transition-colors duration-500 relative z-10">
                {nextTopic.name}
              </span>
            </Link>
          ) : (
            <div className="py-10 md:py-20 px-6 md:px-16 lg:px-24 flex items-center justify-end bg-(--bg-surface)/30 text-right">
              <span className="text-(--text-muted) font-mono text-[10px] uppercase tracking-widest opacity-30">Terminal Module</span>
            </div>
          )}

        </div>
      </section>

      {/* SECTION 7: Bottom Visualizer Navigator */}
      <section className="mt-16 md:mt-24 mb-8 md:mb-12 flex justify-end">
        <Button 
          href="/visualizer" 
          variant="secondary" 
          triggerLoader={true}
        >
          Enter the Visualizer Sandbox
        </Button>
      </section>
    </div>
  );
}
