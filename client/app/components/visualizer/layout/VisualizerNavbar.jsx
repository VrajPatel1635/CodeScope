import Link from "next/link";
import Button from "@/app/components/landing/ui/Button";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { useLoader } from "@/app/components/shared/LoaderContext";

export default function VisualizerNavbar({ children }) {
  const router = useRouter();
  const { triggerLoader } = useLoader();

  const handleRootNavigation = (e) => {
    e.preventDefault();
    triggerLoader();
    setTimeout(() => router.push("/"), 800);
  };

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
        <a href="/" onClick={handleRootNavigation} className="flex items-center gap-2 md:gap-3 group cursor-pointer">
          <img
            src="/codescopelogo.png"
            alt="CodeScope"
            className="w-6 h-6 md:w-8 md:h-8 object-contain transition-transform duration-500 group-hover:scale-110 opacity-90 group-hover:opacity-100 brightness-0 invert" 
          />
          <span className="font-ui font-semibold text-[15px] md:text-[17px] text-foreground tracking-tight group-hover:text-(--accent-primary) transition-colors hidden sm:block">
            CodeScope
          </span>
        </a>
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
