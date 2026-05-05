"use client";
import { useEffect, useRef } from "react";
import { motion } from "framer-motion";

export default function ArrayVisualizer({ currentStep, changedIndex, pointers = [] }) {
  const array = currentStep?.array || [];
  const matrix = currentStep?.matrix || null;

  // For matrix visualization, keep the last valid (i,j) so the highlight
  // doesn't briefly disappear when one pointer is out-of-scope between loops.
  const lastValidMatrixPtrRef = useRef(null);

  const rawI = matrix ? pointers.find(p => p.name.toLowerCase() === "i")?.index : undefined;
  const rawJ = matrix ? pointers.find(p => p.name.toLowerCase() === "j")?.index : undefined;
  const hasValidIJ = Boolean(matrix) && typeof rawI === "number" && typeof rawJ === "number";

  useEffect(() => {
    if (hasValidIJ) {
      lastValidMatrixPtrRef.current = { i: rawI, j: rawJ };
    }
  }, [hasValidIJ, rawI, rawJ]);

  if (!matrix && (!array || array.length === 0)) return null;

  // ── 2D GRID RENDERER ──────────────────────────────────────────────────
  if (matrix) {
    const iVar = hasValidIJ ? rawI : lastValidMatrixPtrRef.current?.i;
    const jVar = hasValidIJ ? rawJ : lastValidMatrixPtrRef.current?.j;

    return (
      <div className="space-y-4 pt-4 pb-8 overflow-auto">
        <div className="font-semibold text-lg flex items-center justify-between">
          Matrix Layout:
        </div>
        
        <div className="inline-flex flex-col gap-2 p-2 bg-gray-50 border w-fit rounded-lg shadow-sm">
          {matrix.map((row, rIdx) => (
            <div key={`row-${rIdx}`} className="flex gap-2">
              {row.map((val, cIdx) => {
                const isTargetCell = rIdx === iVar && cIdx === jVar;
                return (
                  <div key={`col-${cIdx}`} className="flex flex-col items-center">
                    <div
                      className={`w-12 h-12 flex items-center justify-center border font-bold text-lg rounded-md transition-all duration-300 ${
                        isTargetCell
                          ? "bg-yellow-300 border-yellow-600 text-yellow-900 shadow-md ring-2 ring-yellow-400"
                          : "bg-white text-gray-800 border-gray-300"
                      }`}
                    >
                      {val}
                    </div>
                    {/* Matrix Pointer Notation per-cell hover space */}
                    <div className={`h-6 flex items-center justify-center mt-1 transition-opacity duration-300 ${isTargetCell ? "opacity-100" : "opacity-0"}`}>
                      {isTargetCell && (
                        <div className="text-yellow-600 font-extrabold text-xs flex gap-1 whitespace-nowrap">
                          ↑ i={iVar}, j={jVar}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>
    );
  }

  // ── 1D ARRAY RENDERER ─────────────────────────────────────────────────
  return (
    <div className="space-y-4 pt-4 pb-8">
      <div className="font-semibold text-lg flex items-center justify-between">
        Array:
      </div>

      <div className="flex gap-2">
        {array.map((val, idx) => {
          const isChanged = idx === changedIndex;
          const activePointers = pointers.filter(p => p.index === idx);
          const isRead = !isChanged && activePointers.length > 0;

          return (
            <div key={idx} className="flex flex-col items-center">
              
              {/* Array Cell */}
              {isChanged ? (
                <motion.div
                  key={`write-${currentStep?.step}-${idx}`}
                  animate={{ scale: [1, 1.2, 1], backgroundColor: ["#f87171", "#4ade80"] }}
                  transition={{ duration: 0.5 }}
                  className="w-10 h-10 flex items-center justify-center border font-bold rounded shadow-md text-gray-900 border-green-600"
                >
                  {val}
                </motion.div>
              ) : (
                <div
                  className={`w-10 h-10 flex items-center justify-center border rounded transition-all duration-300 font-bold ${
                    isRead
                      ? "bg-blue-200 border-blue-500 text-blue-900 shadow-inner"
                      : "bg-white text-black border-gray-300"
                  }`}
                >
                  {val}
                </div>
              )}
              
              {/* Pointer UI Below Cell */}
              <div className={`flex flex-col items-center mt-1 transition-opacity duration-300 ${activePointers.length > 0 ? "opacity-100" : "opacity-0"}`}>
                {activePointers.length > 0 && (
                  <div className="flex flex-col items-center animate-bounce">
                    <div className="text-blue-600 font-extrabold text-lg flex gap-1 -mb-1">
                      ↑
                    </div>
                    <div className="text-blue-600 font-extrabold text-xs">
                      {activePointers.map((p, idx) => (
                        <span key={p.name}>
                          {p.name}
                          {idx < activePointers.length - 1 ? "," : ""}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}