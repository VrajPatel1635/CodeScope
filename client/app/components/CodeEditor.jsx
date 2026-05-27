"use client";

import { useRef, useEffect } from "react";
import Editor, { useMonaco } from "@monaco-editor/react";

export default function CodeEditor({ code, setCode, activeLine }) {
  const editorRef = useRef(null);
  const monaco = useMonaco();
  const decorationsRef = useRef([]);

  const handleEditorDidMount = (editor) => {
    editorRef.current = editor;
  };

  useEffect(() => {
    if (!editorRef.current || !monaco) return;

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
  }, [activeLine, monaco]);

  return (
    <Editor
      onMount={handleEditorDidMount}
      height="400px"
      language="java"
      theme="vs-dark"
      value={code}
      onChange={(value) => setCode(value)}
      options={{
        fontSize: 14,
        minimap: { enabled: false },
        automaticLayout: true
      }}
    />
  );
}
