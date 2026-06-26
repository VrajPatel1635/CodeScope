"use client";

import { motion } from "framer-motion";
import Button from "@/app/components/landing/ui/Button";

const EASE = [0.16, 1, 0.3, 1];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
      delayChildren: 0.2,
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 1.2, ease: EASE }
  }
};

export default function DesktopRequiredOverlay() {
  return (
    <div className="fixed inset-0 z-100 flex flex-col items-center justify-center overflow-hidden bg-background px-6">
      {/* Deep Radial Glow */}
      <div 
        className="absolute inset-0 pointer-events-none opacity-40"
        style={{
          background: "radial-gradient(circle at 50% 40%, rgba(232, 164, 74, 0.08) 0%, transparent 60%)"
        }}
      />
      
      {/* Faint Blueprint Texture */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.03]"
        style={{
          backgroundImage:
            "linear-gradient(to right, color-mix(in srgb, var(--text-primary) 10%, transparent) 1px, transparent 1px), linear-gradient(to bottom, color-mix(in srgb, var(--text-primary) 10%, transparent) 1px, transparent 1px)",
          backgroundSize: "40px 40px",
        }}
      />

      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="relative z-10 flex flex-col items-center text-center max-w-md mx-auto"
      >
        <motion.div variants={itemVariants} className="mb-8">
          <div className="w-16 h-16 rounded-full border border-(--border-color) bg-(--bg-elevated) flex items-center justify-center mb-6 mx-auto relative overflow-hidden">
            <div className="absolute inset-0 border-t border-(--accent-primary) opacity-50 rounded-full animate-[spin_4s_linear_infinite]" />
            <svg className="w-6 h-6 text-(--text-secondary)" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-(--border-color) bg-(--bg-surface)/50 backdrop-blur-sm mb-6">
            <span className="w-1.5 h-1.5 rounded-full bg-(--accent-primary) shadow-[0_0_8px_var(--accent-primary)]" />
            <span className="font-mono text-[10px] uppercase tracking-widest text-(--text-muted)">
              SYS.REQ // DESKTOP CLASS
            </span>
          </div>
        </motion.div>

        <motion.h1 variants={itemVariants} className="text-5xl sm:text-6xl font-display text-foreground leading-[0.9] tracking-tight mb-6">
          Workspace<br />
          <span className="text-(--text-muted) italic">Unavailable.</span>
        </motion.h1>

        <motion.p variants={itemVariants} className="text-(--text-secondary) font-light text-[14px] sm:text-[15px] leading-relaxed mb-10">
          The CodeScope Visualizer is a high-density IDE environment. Please switch to a laptop or tablet to access execution telemetry, full canvases, and code editing features.
        </motion.p>

        <motion.div variants={itemVariants} className="flex flex-col gap-4 w-full sm:w-auto">
          <Button 
            href="/docs" 
            variant="primary"
            accent="primary"
            triggerLoader={true}
            className="w-full flex flex-row-reverse"
            icon={
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="mr-2 rotate-180">
                <path d="M5 12h14M12 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            }
          >
            Return to Documentation
          </Button>
          <Button
            href="/"
            variant="secondary"
            triggerLoader={true}
            className="w-full"
          >
            Go to Landing Page
          </Button>
        </motion.div>
      </motion.div>
    </div>
  );
}
