"use client";

import { useRef, useEffect } from "react";
import Editor from "@monaco-editor/react";
import { motion } from "framer-motion";

const CodeEditorLoadingSkeleton = () => (
  <div className="w-full h-full flex flex-col p-4 bg-background">
    <div className="flex items-center gap-2 mb-4">
      <div className="w-2 h-2 rounded-full bg-(--accent-primary) animate-pulse" />
      <span className="text-[10px] font-mono text-(--text-muted) uppercase tracking-widest">Initializing Editor</span>
    </div>
    {[...Array(12)].map((_, i) => (
      <div key={i} className="flex gap-4 mb-2 opacity-50">
        <div className="w-4 h-4 text-[10px] font-mono text-(--text-muted) text-right">{i + 1}</div>
        <motion.div 
          className="h-4 bg-(--bg-surface) rounded"
          initial={{ width: "20%" }}
          animate={{ width: `${Math.random() * 40 + 20}%` }}
          transition={{ repeat: Infinity, repeatType: "reverse", duration: 1.5 + Math.random() }}
        />
      </div>
    ))}
  </div>
);

export default function CodeEditor({ code, setCode, activeLine }) {
  const editorRef = useRef(null);
  const monacoRef = useRef(null);
  const decorationsRef = useRef([]);

  const handleEditorDidMount = (editor, monaco) => {
    editorRef.current = editor;
    monacoRef.current = monaco;
  };

  useEffect(() => {
    if (!editorRef.current || !monacoRef.current) return;
    const monaco = monacoRef.current;

    if (activeLine) {
      decorationsRef.current = editorRef.current.deltaDecorations(
        decorationsRef.current,
        [
          {
            range: new monaco.Range(activeLine, 1, activeLine, 1),
            options: {
              isWholeLine: true,
              className: 'monaco-active-line-highlight'
            }
          }
        ]
      );
      editorRef.current.revealLineInCenterIfOutsideViewport(activeLine);
    } else {
      decorationsRef.current = editorRef.current.deltaDecorations(decorationsRef.current, []);
    }
  }, [activeLine]);

  return (
    <Editor
      onMount={handleEditorDidMount}
      height="100%"
      language="java"
      theme="vs-dark"
      value={code}
      loading={<CodeEditorLoadingSkeleton />}
      onChange={(value) => setCode(value)}
      options={{
        fontSize: 14,
        minimap: { enabled: false },
        automaticLayout: true
      }}
    />
  );
}
