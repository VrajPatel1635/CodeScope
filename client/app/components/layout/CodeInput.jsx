"use client";

import { useState } from "react";
import CodeEditor from "@/app/components/layout/CodeEditor";

export default function CodeInput({ onRun, activeLine }) {
  const [code, setCode] = useState(`class Solution {
    public int solve(int[] arr) {
        
    }
}`);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const handleRun = async () => {
    if (!code.trim()) return;

    try {
      setLoading(true);

      const res = await fetch("http://localhost:5000/execute", {
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
    <div className="flex flex-col h-full w-full gap-4">
      {/* Code Input */}
      <div className="flex-1 border rounded overflow-hidden flex flex-col" style={{ borderColor: 'var(--border-color)', backgroundColor: 'var(--bg-primary)' }}>
        <label className="block font-semibold p-2 border-b text-sm" style={{ backgroundColor: 'var(--bg-elevated)', borderColor: 'var(--border-color)', color: 'var(--text-secondary)' }}>Java Code</label>
        <div className="flex-1 min-h-0">
          <CodeEditor code={code} setCode={setCode} activeLine={activeLine} />
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

        {/* Run Button */}
        <button
          onClick={handleRun}
          disabled={loading}
          className="px-6 py-2 h-[42px] rounded font-semibold transition-transform hover-scale-sm whitespace-nowrap mr-2 mb-1.5"
          style={{ backgroundColor: 'var(--accent-primary)', color: 'var(--text-primary)' }}
        >
          {loading ? "Running..." : "Run Execution"}
        </button>
      </div>
    </div>
  );
}