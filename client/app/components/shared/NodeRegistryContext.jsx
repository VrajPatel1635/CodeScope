"use client";

import React, { createContext, useContext, useState, useRef, useCallback, useEffect, useLayoutEffect } from "react";

const NodeRegistryContext = createContext(null);

export function NodeRegistryProvider({ children }) {
  const [nodes, setNodes] = useState(new Map());
  const containerRef = useRef(null);
  
  // Keep track of the raw DOM elements
  const elementMapRef = useRef(new Map());
  
  // Measure a single node
  const measureNode = useCallback((element) => {
    if (!containerRef.current || !element) return null;
    const containerRect = containerRef.current.getBoundingClientRect();
    const rect = element.getBoundingClientRect();
    return {
      left: rect.left - containerRect.left,
      top: rect.top - containerRect.top,
      width: rect.width,
      height: rect.height,
      right: (rect.left - containerRect.left) + rect.width,
      bottom: (rect.top - containerRect.top) + rect.height,
      cx: (rect.left - containerRect.left) + rect.width / 2,
      cy: (rect.top - containerRect.top) + rect.height / 2
    };
  }, []);

  const recalculateAll = useCallback(() => {
    setNodes(prev => {
      let changed = false;
      const next = new Map(prev);
      for (const [nodeId, el] of elementMapRef.current.entries()) {
        const newRect = measureNode(el);
        if (!newRect) continue;
        const oldRect = prev.get(nodeId);
        
        if (!oldRect || 
            Math.abs(oldRect.top - newRect.top) > 0.5 || 
            Math.abs(oldRect.left - newRect.left) > 0.5 ||
            Math.abs(oldRect.width - newRect.width) > 0.5 ||
            Math.abs(oldRect.height - newRect.height) > 0.5) {
          next.set(nodeId, newRect);
          changed = true;
        }
      }
      return changed ? next : prev;
    });
  }, [measureNode]);

  // Recalculate after every render (catches layout shifts from state changes)
  useLayoutEffect(() => {
    recalculateAll();
  });

  // Also catch window/container resizes
  useEffect(() => {
    if (!containerRef.current) return;
    const observer = new ResizeObserver(() => {
      window.requestAnimationFrame(recalculateAll);
    });
    observer.observe(containerRef.current);
    
    // Also observe all elements to catch their specific resizes
    const elObserver = new ResizeObserver(() => {
      window.requestAnimationFrame(recalculateAll);
    });
    for (const el of elementMapRef.current.values()) {
      elObserver.observe(el);
    }
    
    return () => {
      observer.disconnect();
      elObserver.disconnect();
    };
  }, [recalculateAll, nodes.size]); // Re-bind observer when node count changes

  const registerNode = useCallback((nodeId, element) => {
    if (element) {
      elementMapRef.current.set(nodeId, element);
      recalculateAll();
    }
  }, [recalculateAll]);

  const unregisterNode = useCallback((nodeId) => {
    elementMapRef.current.delete(nodeId);
    setNodes(prev => {
      const next = new Map(prev);
      next.delete(nodeId);
      return next;
    });
  }, []);

  return (
    <NodeRegistryContext.Provider value={{ nodes, registerNode, unregisterNode, containerRef }}>
      {children}
    </NodeRegistryContext.Provider>
  );
}

export function useNodeRegistry() {
  const context = useContext(NodeRegistryContext);
  if (!context) {
    throw new Error("useNodeRegistry must be used within a NodeRegistryProvider");
  }
  return context;
}
