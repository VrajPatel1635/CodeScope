"use client";

import { motion } from "framer-motion";

const MarqueeRow = ({ items, direction = "left", speed = 40, className = "" }) => {
  return (
    <div className={`flex overflow-hidden whitespace-nowrap w-full py-1 ${className}`}>
      <motion.div
        className="flex items-center w-max"
        animate={{ x: direction === "left" ? ["0%", "-50%"] : ["-50%", "0%"] }}
        transition={{ repeat: Infinity, ease: "linear", duration: speed }}
      >
        {[...items, ...items, ...items, ...items].map((item, i) => (
          <span
            key={i}
            className={`text-lg md:text-3xl font-ui font-medium uppercase tracking-[0.2em] text-transparent bg-clip-text bg-linear-to-b from-white/50 via-white/20 to-white/5 select-none ${item === "✦" ? "px-6 md:px-12 opacity-40 font-light text-white/30 text-sm md:text-xl" : ""
              }`}
          >
            {item}
          </span>
        ))}
      </motion.div>
    </div>
  );
};

export default function FeaturesMarquee() {
  const row1 = ["Arrays", "✦", "Matrices", "✦", "Strings", "✦", "Collections", "✦", "Trees", "✦", "Graphs", "✦"];
  const row2 = ["HashMaps", "✦", "HashSets", "✦", "Queues", "✦", "Stacks", "✦", "Priority Queues", "✦"];
  const row3 = ["Execution Intelligence", "✦", "Diagnostics", "✦", "Hotspots", "✦", "Recursion", "✦", "DFS", "✦", "BFS", "✦"];

  return (
    <section className="relative w-full py-8 md:py-12 flex flex-col items-center justify-center bg-background">
      {/* Modern CSS Mask for smooth fade-out on the left and right edges */}
      <div
        className="w-full flex flex-col gap-2 md:gap-4 relative"
        style={{
          maskImage: "linear-gradient(to right, transparent, black 15%, black 85%, transparent)",
          WebkitMaskImage: "linear-gradient(to right, transparent, black 15%, black 85%, transparent)"
        }}
      >
        <MarqueeRow items={row1} direction="left" speed={70} />
        <MarqueeRow items={row2} direction="right" speed={85} />
        <MarqueeRow items={row3} direction="left" speed={100} className="hidden md:flex" />
      </div>
    </section>
  );
}
