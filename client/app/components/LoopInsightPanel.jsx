import React from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function LoopInsightPanel({ loopContext }) {
  const loops = Object.entries(loopContext || {});
  if (loops.length === 0) return null;

  return (
    <div className="p-4 border rounded-lg shadow-sm space-y-3 bg-indigo-50 border-indigo-200">
      <div className="font-bold text-xs uppercase text-indigo-700 flex items-center gap-2">
        <motion.span 
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 3, ease: "linear" }}
          className="text-lg inline-block origin-center"
        >
          ↻
        </motion.span> 
        Active Loops
      </div>
      <div className="flex flex-col gap-2">
        <AnimatePresence>
          {loops.map(([id, iter], index) => {
            // Extract line number if it's "loop_X"
            const lineMatch = id.match(/loop_(\d+)/);
            const lineText = lineMatch ? ` (Line ${lineMatch[1]})` : "";
            
            return (
              <motion.div
                key={id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                className="flex items-center justify-between bg-white px-4 py-2 rounded shadow-sm border border-indigo-100"
              >
                <div className="font-semibold text-indigo-900 font-mono text-sm">
                  Loop #{index + 1}{lineText}
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-gray-500 text-sm">Iteration:</span>
                  <motion.div
                    key={`${id}-${iter}`}
                    initial={{ scale: 1.4, color: "#4f46e5" }}
                    animate={{ scale: 1, color: "#312e81" }}
                    className="font-black text-xl w-8 text-center"
                  >
                    {iter}
                  </motion.div>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </div>
  );
}
