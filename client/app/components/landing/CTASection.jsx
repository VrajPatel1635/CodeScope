"use client";

import React from "react";
import Button from "./ui/Button";

export default function CTASection() {
  return (
    <section
      id="cta"
      className="bg-background px-4 py-16"
    >
      {/* Increased padding and added min-h to adjust height proportions */}
      <div className="relative w-full mx-auto max-w-screen overflow-hidden rounded-[40px] border border-(--border-color) bg-(--bg-surface) px-10 py-32 lg:py-40 min-h-[60vh] flex flex-col justify-center shadow-[0_60px_120px_-40px_rgba(0,0,0,0.9)]">
        
        {/* warm amber inner glow at top */}
        <div
          className="pointer-events-none absolute inset-x-0 top-0 h-72 opacity-60"
          style={{ background: "radial-gradient(80% 100% at 50% 0%, rgba(var(--accent-primary-rgb, 211, 123, 80), 0.15) 0%, transparent 70%)" }}
        />
        
        {/* faint blueprint grid */}
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage:
              "linear-gradient(to right, color-mix(in srgb, var(--text-primary) 10%, transparent) 1px, transparent 1px), linear-gradient(to bottom, color-mix(in srgb, var(--text-primary) 10%, transparent) 1px, transparent 1px)",
            backgroundSize: "48px 48px",
          }}
        />

        <div className="relative grid grid-cols-12 gap-10">
          <div className="col-span-12 lg:col-span-7">
            <h2 
              className="text-[clamp(56px,9vw,140px)] leading-[0.92] tracking-[-0.02em] text-foreground"
              style={{ fontFamily: 'var(--font-display)' }}
            >
              Leave the
              <br />
              <span className="italic text-(--text-muted)">darkness</span>
              <br />
              behind.
            </h2>
          </div>

          <div className="col-span-12 flex flex-col justify-end lg:col-span-5">
            <div className="mb-6 flex items-center justify-between border-t border-(--border-color) pt-5 font-mono text-[10px] tracking-[0.22em]">
              <span className="text-(--accent-primary)">▪ SYS.READY</span>
              <span className="text-(--text-muted)">2026</span>
            </div>
            <p className="text-right text-[14.5px] leading-relaxed text-(--text-secondary)">
              Step into a visual, interactive runtime environment designed for
              complete code clarity. Mastery isn't inherited—it's built.
            </p>
            <div className="mt-8 flex flex-wrap items-center justify-end gap-3">
              <Button
                variant="secondary"
                href="/docs"
                triggerLoader={true}
                className="cursor-pointer"
              >
                Documentation
              </Button>
              <Button
                variant="primary"
                accent="primary"
                href="/visualizer"
                icon={<span>→</span>}
                triggerLoader={true}
                className="cursor-pointer"
              >
                Initialize Visualizer
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}