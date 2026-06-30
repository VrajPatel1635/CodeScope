/**
 * GraphTraversalAnalyzer.js
 *
 * Semantic Interpretation Layer for Graphs.
 * Derives comprehensive DFS path and component semantics.
 */

"use strict";

function hasUndirectedPath(adjacency, start, target) {
    if (start === target) return true;
    const visited = new Set();
    const queue = [start];
    visited.add(start);
    
    const undir = {};
    for (const u in adjacency) {
        for (const v of adjacency[u]) {
            if (!undir[u]) undir[u] = [];
            if (!undir[v]) undir[v] = [];
            undir[u].push(v);
            undir[v].push(u);
        }
    }
    
    while(queue.length > 0) {
        const curr = queue.shift();
        if (curr === target) return true;
        const neighbors = undir[curr] || [];
        for (const n of neighbors) {
            if (!visited.has(n)) {
                visited.add(n);
                queue.push(n);
            }
        }
    }
    return false;
}

function analyzeGraphTraversal(states) {
  if (!Array.isArray(states) || states.length === 0) return [];

  const semanticFrames = [];
  
  // DFS State
  let pendingParentRestore = false;
  let returningFromDeep = false;
  
  // BFS State
  let isComponentActive = false;

  // Mutation State
  const recentMutations = []; // To track TOPOLOGY_REWIRED

  for (let i = 0; i < states.length; i++) {
    const state = states[i];
    const semantics = [];
    const graph = state.graph;

    if (!graph) {
      semanticFrames.push({ step: state.step, semantics });
      continue;
    }

    const currentStack = state.stack || [];
    const ownership = graph.traversalOwnership || "DFS";

    if (ownership === "DFS") {
        // 1. DFS_PATH_ACTIVE
        const activePath = [];
        for (let j = 0; j < currentStack.length; j++) {
          const frame = currentStack[j];
          if (frame.function === "global" || frame.function === "solve") continue;
          
          let foundNode = null;
          for (const [key, descriptor] of Object.entries(frame.variables)) {
             if (descriptor && descriptor.category === "pointer") {
                 foundNode = `graphNode_${descriptor.value}`;
                 break;
             }
          }
          if (foundNode) {
              activePath.push(foundNode);
          }
        }
    
        if (activePath.length > 0) {
           semantics.push({ type: "DFS_PATH_ACTIVE", path: activePath });
        }
        
        // 2. DFS_BACKTRACK, PATH_RESUME
        if (pendingParentRestore && state.type !== "RETURN") {
          semantics.push({ type: "DFS_BACKTRACK" });
          semantics.push({ type: "PATH_RESUME" });
          pendingParentRestore = false;
          returningFromDeep = false;
          
          // Mark this frame as having recently resumed so we can detect BRANCH_SWITCH
          if (currentStack.length > 0) {
              currentStack[currentStack.length - 1]._recentlyResumed = true;
          }
        }
    
        // BRANCH_SWITCH detection
        if (state.type === "VAR" && ["neighbor", "next", "v", "u"].includes(state.name)) {
            if (currentStack.length > 0 && currentStack[currentStack.length - 1]._recentlyResumed) {
                semantics.push({ type: "BRANCH_SWITCH" });
                currentStack[currentStack.length - 1]._recentlyResumed = false;
            }
        }
    
        // 3. GRAPH_VISIT processing (Descent & Components)
        if (state.graphVisitEvent) {
          const { node } = state.graphVisitEvent;
          const prevState = i > 0 ? states[i - 1] : null;
          const wasVisited = prevState && prevState.graph && prevState.graph.visitedState[node];
    
          if (wasVisited) {
            semantics.push({ type: "NODE_REVISIT", nodeId: node });
          } else {
            semantics.push({ type: "DFS_DESCENT", nodeId: node });
          }
    
          // If this is the shallowest DFS call (stack length = 3 usually: global -> solve -> dfs)
          if (currentStack.length === 3 && !wasVisited) {
              semantics.push({ type: "CONNECTED_COMPONENT_START", nodeId: node });
          }
        }
    
        // 4. Cycle prevention / visited skip detection
        if (state.type === "VAR" && state.name) {
          const currentFrame = currentStack[currentStack.length - 1];
          const descriptor = currentFrame?.variables[state.name];
          if (descriptor && descriptor.category === "pointer") {
            const neighborId = `graphNode_${descriptor.value}`;
            const isVisited = graph.visitedState[neighborId];
            
            if (isVisited) {
               semantics.push({ type: "CYCLE_PREVENTED", nodeId: neighborId });
               semantics.push({ type: "VISITED_SKIP", nodeId: neighborId });
            }
          }
        }
    
        // 5. SUBTREE_RETURNING / DFS_BACKTRACK initiator & Component Completion
        if (state.type === "RETURN" && state.returnFlow) {
          pendingParentRestore = true;
          
          if (currentStack.length > 3) {
              returningFromDeep = true;
              semantics.push({ type: "RECURSIVE_PATH_RETURN" });
          } else if (currentStack.length === 3) {
              // Returning from depth 3 means the connected component finished
              semantics.push({ type: "CONNECTED_COMPONENT_COMPLETE" });
          }
        }
    } else if (ownership === "BFS") {
        if (state.queueEnqueueEvent) {
            semantics.push({ type: "QUEUE_ENQUEUE", nodeId: state.queueEnqueueEvent.node });
            semantics.push({ type: "FRONTIER_EXPANSION", nodeId: state.queueEnqueueEvent.node });
            
            if (!isComponentActive) {
                semantics.push({ type: "COMPONENT_EXPANSION", nodeId: state.queueEnqueueEvent.node });
                isComponentActive = true;
            }
        }
        
        if (state.queueDequeueEvent) {
            semantics.push({ type: "QUEUE_DEQUEUE", nodeId: state.queueDequeueEvent.node });
            semantics.push({ type: "QUEUE_PROGRESS", nodeId: state.queueDequeueEvent.node });
            semantics.push({ type: "BFS_PATH_ACTIVE", nodeId: state.queueDequeueEvent.node });
            
            if (graph.queue.length === 0) {
                semantics.push({ type: "QUEUE_DRAINING" });
                semantics.push({ type: "FRONTIER_EXHAUSTED" });
            }
        }
        
        if (state.bfsLevelStartEvent) {
            semantics.push({ type: "LEVEL_TRANSITION", level: state.bfsLevelStartEvent.level });
            semantics.push({ type: "BFS_WAVE_ADVANCE", level: state.bfsLevelStartEvent.level });
        }
        
        if (state.type === "VAR" && state.name) {
            const currentFrame = currentStack[currentStack.length - 1];
            const descriptor = currentFrame?.variables[state.name];
            if (descriptor && descriptor.category === "pointer") {
                const neighborId = `graphNode_${descriptor.value}`;
                const isVisited = graph.visitedState[neighborId];
            const inFrontier = graph.frontier.includes(neighborId);
            
            if (isVisited || inFrontier) {
                semantics.push({ type: "VISITED_SKIP", nodeId: neighborId });
                if (isVisited) {
                    semantics.push({ type: "CYCLE_PREVENTED", nodeId: neighborId });
                }
            }
          }
        }
        
        if (state.type === "LOOP_END" && graph.queue.length === 0 && isComponentActive) {
            semantics.push({ type: "COMPONENT_COMPLETE" });
            isComponentActive = false;
        }
    }

    // Graph Mutation Semantics
    if (state.graphEdgeEvent) {
        const { from, to, type } = state.graphEdgeEvent;
        const fromNodeId = `graphNode_${from}`;
        const toNodeId = `graphNode_${to}`;
        
        if (type === "GRAPH_EDGE_ADD") {
            semantics.push({ type: "EDGE_CREATED", from: fromNodeId, to: toNodeId });
            semantics.push({ type: "ADJACENCY_EXPANDED", from: fromNodeId, to: toNodeId });
            
            // Component Merge detection (using previous state's adjacency)
            const prevState = i > 0 ? states[i - 1] : null;
            if (prevState && prevState.graph) {
                const hadPath = hasUndirectedPath(prevState.graph.adjacency, fromNodeId, toNodeId);
                if (!hadPath) {
                    semantics.push({ type: "COMPONENT_MERGED" });
                    semantics.push({ type: "CONNECTIVITY_GAINED" });
                }
            }
            
            recentMutations.push({ type: "ADD", from: fromNodeId, to: toNodeId, step: i });
        } else if (type === "GRAPH_EDGE_REMOVE") {
            semantics.push({ type: "EDGE_REMOVED", from: fromNodeId, to: toNodeId });
            semantics.push({ type: "ADJACENCY_REDUCED", from: fromNodeId, to: toNodeId });
            
            // Component Split detection (using current state's adjacency)
            const stillHasPath = hasUndirectedPath(graph.adjacency, fromNodeId, toNodeId);
            if (!stillHasPath) {
                semantics.push({ type: "COMPONENT_SPLIT" });
                semantics.push({ type: "CONNECTIVITY_LOST" });
            }
            
            recentMutations.push({ type: "REMOVE", from: fromNodeId, to: toNodeId, step: i });
        }
        
        // Detect TOPOLOGY_REWIRED
        // If there's a recent opposite mutation involving 'from' or 'to' within 10 steps
        const oppositeType = type === "GRAPH_EDGE_ADD" ? "REMOVE" : "ADD";
        const recentOpposite = recentMutations.find(m => 
            m.type === oppositeType && 
            (m.from === fromNodeId || m.to === toNodeId || m.from === toNodeId || m.to === fromNodeId) &&
            (i - m.step) <= 10
        );
        
        if (recentOpposite) {
            // Ensure we only emit TOPOLOGY_REWIRED once per pair
            if (!recentOpposite.rewiredEmitted) {
                semantics.push({ type: "TOPOLOGY_REWIRED" });
                recentOpposite.rewiredEmitted = true;
            }
        }
    }

    semanticFrames.push({ step: state.step, semantics });
  }

  return semanticFrames;
}

module.exports = { analyzeGraphTraversal };
