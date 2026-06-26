"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { useLoader } from "@/app/components/shared/LoaderContext";

export default function Footer() {
  const currentYear = new Date().getFullYear();
  const router = useRouter();
  const { triggerLoader } = useLoader();

  const footerLinks = [
    { label: "VISUALIZER", href: "/visualizer" },
    { label: "INTELLIGENCE", href: "#intelligence" },
    { label: "SHOWCASE", href: "#data-structures" },
    { label: "ARCHITECT", href: "https://vraj-patel.me", external: true },
    { label: "DOCUMENTATION", href: "/docs" }
  ];

  const handleNavigation = (e, link) => {
    if (link.external) return; // Let native <a> handle external links
    if (link.href.startsWith("#")) return; // Let native <a> handle anchor scrolling
    
    e.preventDefault();
    triggerLoader();
    setTimeout(() => {
      router.push(link.href);
    }, 800);
  };

  return (
    <footer className="relative bg-background pt-16 sm:pt-28 pb-0 overflow-hidden selection:bg-(--accent-primary)/30 selection:text-white border-t border-white/5">

      {/* Ambient light */}
      <div className="absolute -bottom-40 -left-40 w-[600px] h-[600px] bg-linear-to-tr from-(--accent-primary)/5 via-transparent to-transparent blur-[80px] pointer-events-none" />

      {/* Top gradient hairline */}
      <div
        className="absolute inset-x-0 top-0 h-px opacity-50"
        style={{ background: "linear-gradient(to right, transparent, rgba(var(--accent-primary-rgb, 211, 123, 80), 0.35), transparent)" }}
      />

      <div className="relative mx-auto max-w-[1180px] px-6 z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          <div className="lg:col-span-7">
            <h3 className="font-serif text-[clamp(56px,7vw,96px)] leading-[0.95] tracking-tight text-foreground">
              Execution
              <br />
              <span className="italic text-(--text-muted)">made visible.</span>
            </h3>
            <p className="mt-8 max-w-md text-[14.5px] leading-relaxed text-(--text-secondary)">
              Stop reading stack traces. Start experiencing your code through
              interactive, multi-dimensional analysis.
            </p>
          </div>

          <div className="lg:col-span-5">
            <ol className="space-y-3 font-mono text-[12px]">
              {footerLinks.map((link, i) => (
                <li key={link.label}>
                  <a 
                    href={link.href}
                    onClick={(e) => handleNavigation(e, link)}
                    target={link.external ? "_blank" : undefined}
                    rel={link.external ? "noopener noreferrer" : undefined}
                    className="flex items-center gap-4 border-b border-(--border-color)/50 py-2 transition-colors hover:text-foreground text-(--text-secondary) cursor-pointer group outline-none"
                  >
                    <span className="text-(--text-muted)/50 group-hover:text-(--accent-primary)/50 transition-colors">{String(i + 1).padStart(2, "0")}.</span>
                    <span className="tracking-[0.18em] transition-colors">{link.label}</span>
                    <span className="ml-auto text-(--text-muted)/50 group-hover:text-(--accent-primary)/50 transition-colors">
                      {link.external ? "↗" : "→"}
                    </span>
                  </a>
                </li>
              ))}
            </ol>

            <dl className="mt-8 sm:mt-10 grid grid-cols-[100px_1fr] sm:grid-cols-[120px_1fr] gap-y-3 font-mono text-[10px] sm:text-[11px] tracking-[0.16em]">
              <dt className="text-(--text-muted)">SYS.STATUS</dt>
              <dd className="text-right text-(--accent-highlight) flex items-center justify-end gap-2">
                <span className="w-1.5 h-1.5 bg-(--accent-highlight) shadow-[0_0_8px_rgba(107,191,160,0.6)]"></span>
                OPERATIONAL
              </dd>
              <dt className="text-(--text-muted)">ENGINEER</dt>
              <dd className="text-right text-foreground">VRAJ PATEL</dd>
              <dt className="text-(--text-muted)">COPYRIGHT</dt>
              <dd className="text-right text-(--text-secondary)">© {currentYear} CODESCOPE</dd>
            </dl>
          </div>
        </div>

        {/* Ghost wordmark */}
        <div className="mt-12 sm:mt-16 mb-8 sm:mb-12 select-none whitespace-nowrap text-[clamp(80px,18vw,280px)] font-serif italic tracking-tighter leading-none text-white/3 flex justify-center pointer-events-none">
          CodeScope
        </div>
      </div>
    </footer>
  );
}