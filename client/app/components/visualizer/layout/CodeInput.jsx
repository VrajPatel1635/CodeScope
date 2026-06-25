"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import CodeEditor from "@/app/components/visualizer/layout/CodeEditor";
import useExecutionStore from "@/app/store/useExecutionStore";

export default function CodeInput({ onRun, activeLine }) {
  const { code: globalCode, input: globalInput } = useExecutionStore();

  const [code, setCode] = useState(globalCode || `class Solution {
    public int solve(int[] arr) {
        
    }
}`);
  const [input, setInput] = useState(globalInput || "");
  const [loading, setLoading] = useState(false);

  const handleRun = async () => {
    if (!code.trim()) return;

    try {
      setLoading(true);

      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
      const res = await fetch(`${apiUrl}/execute`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          code,
          input,
        }),
      });

      const text = await res.text();
      let data;
      try {
        data = JSON.parse(text);
      } catch (e) {
        console.error("Failed to parse JSON. Raw response:", text);
        throw e;
      }

      // Send response to parent
      onRun(data, input, code);
    } catch (err) {
      console.error("API Error:", err);
      onRun({
        success: false,
        states: [],
        output: "",
        error: "Failed to connect to server",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col w-full gap-4 min-h-0">
      {/* Code Input */}
      <div className="flex-1 border rounded overflow-hidden flex flex-col min-h-0" style={{ borderColor: 'var(--border-color)', backgroundColor: 'var(--bg-primary)' }}>
        <label className="block font-semibold p-2 border-b text-sm" style={{ backgroundColor: 'var(--bg-elevated)', borderColor: 'var(--border-color)', color: 'var(--text-secondary)' }}>Java Code</label>
        <div className="flex-1 relative min-h-0">
          <div className="absolute inset-0">
            <CodeEditor code={code} setCode={setCode} activeLine={activeLine} />
          </div>
        </div>
      </div>

      {/* Bottom Controls: Input & Run */}
      <div className="flex flex-row items-end gap-4 w-full">
        <div className="flex-1 ml-2">
          <label className="block font-semibold mb-1 text-sm" style={{ color: 'var(--text-secondary)' }}>Input Data</label>
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            rows={1}
            className="w-full border px-3 py-2 rounded focus:outline-none focus:ring-1 focus:ring-blue-500/50 resize-y min-h-[42px]"
            style={{ backgroundColor: 'var(--bg-primary)', borderColor: 'var(--border-color)', color: 'var(--text-primary)' }}
            placeholder='Example: [1,2,3]'
          />
        </div>

        {/* Architectural Run Button */}
        <motion.button
          onClick={handleRun}
          disabled={loading}
          layout
          className="relative px-6 min-w-[160px] h-[42px] rounded overflow-hidden transition-colors duration-300 mr-2 mb-1.5 border cursor-pointer"
          style={{
            backgroundColor: loading ? 'var(--bg-elevated)' : 'var(--accent-primary)',
            color: loading ? 'var(--accent-primary)' : 'var(--bg-primary)',
            borderColor: loading ? 'var(--accent-primary)' : 'transparent',
          }}
        >
          <AnimatePresence mode="wait">
            {loading ? (
              <motion.div
                key="loading"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="flex items-center justify-center gap-3 w-full h-full font-mono text-[11px] uppercase tracking-widest font-medium"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-(--accent-primary) shadow-[0_0_8px_rgba(var(--accent-primary-rgb),0.8)] animate-pulse" />
                Compiling
                
                {/* Cinematic Data Scanner */}
                <motion.div
                  className="absolute bottom-0 left-0 h-[2px] bg-(--accent-primary) w-1/3 shadow-[0_0_10px_rgba(var(--accent-primary-rgb),1)]"
                  animate={{ x: ["-100%", "300%"] }}
                  transition={{ repeat: Infinity, duration: 1.2, ease: "linear" }}
                />
              </motion.div>
            ) : (
              <motion.div
                key="idle"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="flex items-center justify-center w-full h-full font-semibold text-sm whitespace-nowrap"
              >
                Run Execution
              </motion.div>
            )}
          </AnimatePresence>
        </motion.button>
      </div>
    </div>
  );
}