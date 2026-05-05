"use client";

import { useState } from "react";
import CodeInput from "./components/CodeInput";
import StepViewer from "./components/StepViewer";

export default function Home() {
  const [result, setResult] = useState(null);
  const [input, setInput] = useState("");
  const [code, setCode] = useState("");

  return (
    <main className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">DSA Visualizer</h1>

      <CodeInput
        onRun={(data, inputValue, codeValue) => {
          setResult(data);
          setInput(inputValue);
          setCode(codeValue);
        }}
      />

      {result?.error && (
        <div className="text-red-500">{result.error}</div>
      )}

      {result?.states && <StepViewer states={result.states} input={input} code={code} />}

      {result?.output && (
        <div className="bg-gray-100 text-gray-900 p-3 rounded">
          <strong>Output:</strong> {result.output}
        </div>
      )}
    </main>
  );
}