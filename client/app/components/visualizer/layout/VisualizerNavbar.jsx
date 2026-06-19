import Button from "@/app/components/landing/ui/Button";
import { motion } from "framer-motion";

export default function VisualizerNavbar({ children }) {
  return (
    <motion.nav 
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
      className="w-full flex items-center justify-between px-6 py-4 border-b z-50 relative"
      style={{ 
        borderColor: "var(--border-color)", 
        backgroundColor: "var(--bg-primary)" 
      }}
    >
      {/* Brand / Logo */}
      <div className="flex items-center gap-3 shrink-0">
        <div className="w-8 h-8 rounded-md flex items-center justify-center" style={{ backgroundColor: "var(--bg-elevated)", border: "1px solid var(--border-color)" }}>
          <div className="w-4 h-4 rounded-sm" style={{ backgroundColor: "var(--accent-primary)" }} />
        </div>
        <span className="font-semibold tracking-wide text-lg hidden md:block" style={{ fontFamily: "var(--font-display)", color: "var(--text-primary)" }}>
          CodeScope
        </span>
      </div>

      {/* Center Content (Controls) */}
      <div className="hidden lg:flex absolute left-1/2 -translate-x-1/2 w-full max-w-2xl px-8 items-center justify-center pointer-events-none">
        <div className="w-full pointer-events-auto">
          {children}
        </div>
      </div>

      {/* Navigation / Actions */}
      <div className="flex items-center shrink-0">
        <div className="scale-[0.85] origin-right">
          <Button 
            href="/docs" 
            variant="secondary"
            triggerLoader={true}
            className="rounded-[16px]!"
          >
            DOCUMENTATION
          </Button>
        </div>
      </div>
    </motion.nav>
  );
}
