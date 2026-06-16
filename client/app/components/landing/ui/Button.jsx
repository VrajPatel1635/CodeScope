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

  const accentVars = {
    primary: "var(--accent-primary)",
    secondary: "var(--accent-secondary)",
    highlight: "var(--accent-highlight)",
    neutral: "var(--text-primary)"
  };

  const accentColor = accentVars[accent] || accentVars.primary;

  const baseClasses = "group relative w-auto inline-flex items-center justify-center cursor-pointer overflow-hidden rounded-full transition-all duration-300 ease-out outline-none active:scale-[0.98] font-ui font-medium tracking-wide";
  const sizeClasses = "px-6 py-3 md:px-8 md:py-3.5 text-[13px] md:text-[14px]";

  const containerStyles = isPrimary ? {
    background: accentColor,
    border: `2px solid ${accentColor}`,
    color: "var(--bg-primary)",
  } : {
    background: "transparent",
    border: "2px solid var(--border-color)",
    color: "var(--text-primary)",
  };

  const dotStyles = {
    background: isPrimary ? "var(--bg-primary)" : "var(--text-primary)",
  };

  const hoverOverlayStyles = {
    background: isPrimary ? "var(--bg-primary)" : "var(--text-primary)",
    color: isPrimary ? accentColor : "var(--bg-primary)",
  };

  const renderContent = () => (
    <>
      <div className="flex items-center gap-3 relative z-10">
        <div
          className="h-2 w-2 shrink-0 rounded-full transition-transform duration-600 ease-in-out group-hover:scale-[150]"
          style={dotStyles}
        ></div>
        <span
          className="inline-block transition-all duration-300 ease-out group-hover:translate-x-12 group-hover:opacity-0"
        >
          {children}
        </span>
      </div>

      <div
        className="absolute top-0 left-0 z-20 flex h-full w-full translate-x-12 items-center justify-center gap-3 opacity-0 transition-all duration-400 ease-out group-hover:translate-x-0 group-hover:opacity-100"
        style={hoverOverlayStyles}
      >
        <div className="flex items-center gap-2 whitespace-nowrap">
          <span className="leading-none font-medium">{children}</span>
          {icon ? (
            <span className="leading-none shrink-0">{icon}</span>
          ) : (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4 shrink-0 leading-none"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth="2.5"
              aria-hidden="true"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 12h14"></path>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13 6l6 6-6 6"></path>
            </svg>
          )}
        </div>
      </div>
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
