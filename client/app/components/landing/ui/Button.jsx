import React from "react";
import Link from "next/link";

export default function Button({
  children,
  href,
  onClick,
  variant = "primary",
  accent = "primary", 
  icon,
  className = "",
  ...props
}) {
  // Map accent prop to CSS variable
  const accentVars = {
    primary: "var(--accent-primary)",
    secondary: "var(--accent-secondary)",
    highlight: "var(--accent-highlight)",
    neutral: "var(--text-primary)"
  };

  const accentColor = accentVars[accent] || accentVars.primary;
  
  // Inject dynamic properties for glowing borders/shadows
  const style = {
    "--btn-accent": accentColor,
    "--btn-accent-glow": `color-mix(in srgb, ${accentColor} 30%, transparent)`,
  };

  const isPrimary = variant === "primary";

  // Base premium structural classes
  // Uses subtle flex layout, optimized tracking, and clean shape
  const baseClasses = `
    relative inline-flex items-center justify-center gap-2.5 
    px-6 py-3 md:px-8 md:py-3.5 
    text-[13px] md:text-[14px] font-medium tracking-wide
    rounded-full transition-all duration-300 ease-out
    overflow-hidden group outline-none
    active:scale-[0.98]
  `;

  // Primary CTA: Object-like presence
  // Features: Subtle inner highlight (inset shadow), soft outer shadow, white/light base
  // Hover: Slight lift (-translate-y), intensified shadow with chapter accent color
  const primaryClasses = `
    bg-[#F0F1F3] text-[#0E0F11] 
    border border-white/60
    shadow-[0_2px_8px_rgba(0,0,0,0.4),inset_0_1px_0_rgba(255,255,255,1)]
    hover:bg-white hover:-translate-y-0.5
    hover:shadow-[0_8px_16px_var(--btn-accent-glow),inset_0_1px_0_rgba(255,255,255,1)]
  `;

  // Secondary CTA: Transparent and elegant
  // Features: Hairline border, backdrop blur, soft background
  // Hover: Increased opacity, border takes a hint of white, elegant shadow
  const secondaryClasses = `
    bg-[#161820]/30 text-[#F0F1F3] backdrop-blur-md
    border border-white/10
    shadow-[0_2px_4px_rgba(0,0,0,0.1)]
    hover:bg-white/5 hover:border-white/20 hover:-translate-y-0.5
    hover:shadow-[0_6px_12px_var(--btn-accent-glow)]
  `;

  const classes = `${baseClasses} ${isPrimary ? primaryClasses : secondaryClasses} ${className}`;

  const renderContent = () => (
    <>
      <span className="relative z-10 flex items-center justify-center gap-2 w-full">
        {children}
        {icon && (
          <span 
            className={`
              shrink-0 transition-all duration-300 group-hover:translate-x-0.5 
              ${isPrimary ? 'opacity-70 group-hover:opacity-100' : 'opacity-60 group-hover:opacity-100 group-hover:text-(--btn-accent)'}
            `}
          >
            {icon}
          </span>
        )}
      </span>
      {/* Micro-elevation detail for primary button object-feel */}
      {isPrimary && (
        <span className="absolute bottom-0 inset-x-4 h-px bg-black/5 opacity-50 blur-[1px]"></span>
      )}
    </>
  );

  if (href) {
    return (
      <Link href={href} className={classes} style={style} {...props}>
        {renderContent()}
      </Link>
    );
  }

  return (
    <button onClick={onClick} className={classes} style={style} {...props}>
      {renderContent()}
    </button>
  );
}
