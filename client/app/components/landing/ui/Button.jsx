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
  const isPrimary = variant === "primary";

  // Map accent prop to CSS variable
  const accentVars = {
    primary: "var(--accent-primary)",
    secondary: "var(--accent-secondary)",
    highlight: "var(--accent-highlight)",
    neutral: "var(--text-primary)"
  };

  const accentColor = accentVars[accent] || accentVars.primary;

  // Base structural classes
  const baseClasses = "btn-capsule cursor-pointer font-ui font-medium tracking-wide transition-all duration-300 ease-out outline-none active:scale-[0.98]";
  
  // Sizing
  const sizeClasses = "px-6 py-3 md:px-8 md:py-3.5 text-[13px] md:text-[14px]";

  // Inline styles for dynamic theming based on variant
  const primaryStyles = {
    background: accentColor,
    border: `2px solid ${accentColor}`,
    color: "var(--bg-primary)",
    boxShadow: `0 4px 20px -5px color-mix(in srgb, ${accentColor} 40%, transparent)`,
  };

  const primarySweepStyles = {
    background: "var(--bg-primary)",
  };

  const primaryTextBackStyles = {
    color: accentColor,
  };

  const secondaryStyles = {
    background: "transparent",
    border: "1px solid rgba(255, 255, 255, 0.1)",
    color: "rgba(255, 255, 255, 0.7)",
  };

  const secondarySweepStyles = {
    background: "rgba(255, 255, 255, 0.05)",
  };

  const secondaryTextBackStyles = {
    color: "#ffffff",
  };

  const containerStyles = isPrimary ? primaryStyles : secondaryStyles;
  const sweepStyles = isPrimary ? primarySweepStyles : secondarySweepStyles;
  const textBackStyles = isPrimary ? primaryTextBackStyles : secondaryTextBackStyles;

  const renderContent = () => (
    <>
      <span className="bg-sweep" style={sweepStyles}></span>
      <span className="text-wrapper">
        <span className="text-cube">
          <span className="text-front gap-2">
            {children}
            {icon && <span className="opacity-80 shrink-0">{icon}</span>}
          </span>
          <span className="text-back gap-2" style={textBackStyles}>
            {children}
            {icon && <span className="opacity-90 shrink-0">{icon}</span>}
          </span>
        </span>
      </span>
    </>
  );

  const finalClassName = `${baseClasses} ${sizeClasses} ${className}`;

  if (href) {
    return (
      <Link href={href} className={finalClassName} style={containerStyles} {...props}>
        {renderContent()}
      </Link>
    );
  }

  return (
    <button onClick={onClick} className={finalClassName} style={containerStyles} {...props}>
      {renderContent()}
    </button>
  );
}
