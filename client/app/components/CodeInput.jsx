"use client";

import { useState } from "react";
import CodeEditor from "./CodeEditor";

export default function CodeInput({ onRun }) {
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

      const data = await res.json();

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
    <div className="max-w-3xl mx-auto space-y-4">
      {/* Code Input */}
      <div className="border rounded overflow-hidden">
        <label className="block font-semibold mb-1 p-2 bg-gray-50 border-b">Java Code</label>
        <CodeEditor code={code} setCode={setCode} />
      </div>

      {/* Input Data */}
      <div>
        <label className="block font-semibold mb-1">Input</label>
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          rows={3}
          className="w-full border p-2 rounded"
          placeholder='Example: [1,2,3]'
        />
      </div>

      {/* Run Button */}
      <button
        onClick={handleRun}
        disabled={loading}
        className="bg-black text-white px-4 py-2 rounded"
      >
        {loading ? "Running..." : "Run"}
      </button>
    </div>
  );
}