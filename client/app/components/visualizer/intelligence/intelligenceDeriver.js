export function deriveIntelligence(states) {
  if (!states || states.length === 0) return null;

  let comparisons = 0, assignments = 0, mutations = 0, overhead = 0;
  
  const structureCounts = {};
  const functionCallCounts = {};
  
  let treeVisits = 0, graphVisits = 0;
  let maxStack = 0;
  let totalRecursiveCalls = 0;
  let deepestChain = [];
  let deepestStackStr = "";

  const lineCounts = {};
  const lineTypes = {};

  let hasNestedLoop = false;
  const loopIterCounts = {};

  for (const s of states) {
    // Stack & Recursion tracking
    if (s.stack) {
      if (s.stack.length > maxStack) {
        maxStack = s.stack.length;
        deepestChain = s.stack.map(f => f.function || "unknown");
        deepestStackStr = deepestChain.join("-");
      }
    }

    if (s.type === "CALL") {
        const funcName = s.callEvent?.function || "unknown";
        functionCallCounts[funcName] = (functionCallCounts[funcName] || 0) + 1;
        
        let countInStack = 0;
        if (s.stack) {
            for (const f of s.stack) {
                if (f.function === funcName) countInStack++;
            }
        }
        if (countInStack > 1) {
            totalRecursiveCalls++;
        }
    }

    if (s.type === "LOOP_ITER") {
        const loopId = s.loopId || s.loopEvent?.loopId;
        if (loopId) {
            loopIterCounts[loopId] = (loopIterCounts[loopId] || 0) + 1;
            if (s.loopContext && Object.keys(s.loopContext).length > 1) {
                if (loopIterCounts[loopId] > 2) {
                    hasNestedLoop = true;
                }
            }
        }
    }

    if (s.line) {
      lineCounts[s.line] = (lineCounts[s.line] || 0) + 1;
    }

    if (s.type === "COND") {
      comparisons++;
      if (s.line) lineTypes[s.line] = "Condition / Comparison";
    }
    else if (s.type === "VAR" || s.type === "ASSIGN") {
      assignments++;
      if (s.line && !lineTypes[s.line]) lineTypes[s.line] = "Assignment";
    }
    else if (["ARRAY", "ARRAY2D", "COLLECTION_MUT", "NODE_MUTATE", "NODE_LINK", "TREE_MUTATE", "TREE_LINK", "GRAPH_EDGE", "GRAPH_EDGE_ADD", "GRAPH_EDGE_REMOVE"].includes(s.type)) {
      mutations++;
      if (s.line && !lineTypes[s.line]) lineTypes[s.line] = "Mutation";
      
      // Structure tracking
      if (s.type === "ARRAY") structureCounts["Array"] = (structureCounts["Array"] || 0) + 1;
      else if (s.type === "ARRAY2D") structureCounts["Matrix"] = (structureCounts["Matrix"] || 0) + 1;
      else if (s.type === "COLLECTION_MUT") structureCounts["Collection"] = (structureCounts["Collection"] || 0) + 1;
      else if (s.type.startsWith("NODE_")) structureCounts["Linked List"] = (structureCounts["Linked List"] || 0) + 1;
      else if (s.type.startsWith("TREE_")) structureCounts["Tree"] = (structureCounts["Tree"] || 0) + 1;
      else if (s.type.startsWith("GRAPH_")) structureCounts["Graph"] = (structureCounts["Graph"] || 0) + 1;
    }
    else {
      overhead++;
    }

    if (s.type === "TREE_VISIT") treeVisits++;
    if (s.type === "GRAPH_VISIT") graphVisits++;
  }

  const totalCost = comparisons + assignments + mutations + overhead || 1;
  const costDistribution = {
    comparisons: Math.round((comparisons / totalCost) * 100),
    assignments: Math.round((assignments / totalCost) * 100),
    mutations: Math.round((mutations / totalCost) * 100),
    overhead: Math.round((overhead / totalCost) * 100)
  };

  const hotspotEntries = Object.entries(lineCounts)
    .map(([line, count]) => ({
      id: `hotspot-${line}`,
      line: parseInt(line, 10),
      count,
      percentage: Math.round((count / states.length) * 100),
      type: lineTypes[line] || "Execution"
    }))
    .filter(h => h.percentage >= 5)
    .sort((a, b) => b.percentage - a.percentage)
    .slice(0, 3);

  // Parse structures
  let totalStructureMuts = Object.values(structureCounts).reduce((a, b) => a + b, 0) || 1;
  const structuresList = Object.entries(structureCounts)
    .map(([name, count]) => ({
        name,
        count,
        percentage: Math.round((count / totalStructureMuts) * 100)
    }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 3);

  // Parse functions
  let totalFunctionCalls = Object.values(functionCallCounts).reduce((a, b) => a + b, 0) || 1;
  const functionsList = Object.entries(functionCallCounts)
    .map(([name, count]) => ({
        name,
        count,
        percentage: Math.round((count / totalFunctionCalls) * 100)
    }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 3);

  const chars = [];
  
  if (hasNestedLoop) chars.push("Nested Iteration");
  
  if (totalRecursiveCalls > 0) {
    chars.push("Recursion");
  } else if (!hasNestedLoop) {
    chars.push("Single Pass");
  }

  const arrayMuts = structureCounts["Array"] || 0;
  const collectionMuts = structureCounts["Collection"] || 0;

  if (arrayMuts > states.length * 0.15) chars.push("Array Mutation Heavy");
  if (collectionMuts > states.length * 0.05) chars.push("Collection Heavy");
  if (treeVisits > 0) chars.push("Tree Traversal");
  if (graphVisits > 0) chars.push("Graph Traversal");
  
  if (arrayMuts === 0 && collectionMuts === 0 && maxStack <= 2) {
      chars.push("In-Place Processing");
  }

  let memChar = "In-Place";
  if (maxStack > 20) memChar = "Deep Recursion";
  else if (collectionMuts > 5 || arrayMuts > 15) memChar = "Heavy Allocation";

  const isCollectionHeavy = collectionMuts > states.length * 0.05;
  const isTraversal = treeVisits > 0 || graphVisits > 0 || (structureCounts["Graph"] || 0) > 0 || (structureCounts["Tree"] || 0) > 0;

  // Simple Timeline Heuristic
  let timeline = [];
  if (totalRecursiveCalls > 0) {
      timeline = [
          { phase: "Initialization", startPercentage: 0, widthPercentage: 10 },
          { phase: "Recursive Expansion", startPercentage: 10, widthPercentage: 40 },
          { phase: "Backtracking", startPercentage: 50, widthPercentage: 40 },
          { phase: "Cleanup", startPercentage: 90, widthPercentage: 10 }
      ];
  } else if (isTraversal) {
      timeline = [
          { phase: "Initialization", startPercentage: 0, widthPercentage: 10 },
          { phase: "Traversal", startPercentage: 10, widthPercentage: 80 },
          { phase: "Cleanup", startPercentage: 90, widthPercentage: 10 }
      ];
  } else if (isCollectionHeavy) {
      timeline = [
          { phase: "Initialization", startPercentage: 0, widthPercentage: 10 },
          { phase: "Collection Processing", startPercentage: 10, widthPercentage: 80 },
          { phase: "Cleanup", startPercentage: 90, widthPercentage: 10 }
      ];
  } else {
      timeline = [
          { phase: "Initialization", startPercentage: 0, widthPercentage: 10 },
          { phase: "Processing", startPercentage: 10, widthPercentage: 80 },
          { phase: "Cleanup", startPercentage: 90, widthPercentage: 10 }
      ];
  }

  // Derive Time Complexity
  let timeComplexity = "O(1)";
  if (totalRecursiveCalls > 0) {
      if (maxStack > 10) timeComplexity = "O(2^N)";
      else timeComplexity = "O(log N)";
  } else if (hasNestedLoop) {
      timeComplexity = "O(N²)";
  } else if (Object.keys(loopIterCounts).length > 0) {
      timeComplexity = "O(N)";
  } else if (treeVisits > 0 || graphVisits > 0) {
      timeComplexity = "O(V + E)";
  }

  return {
    characteristics: chars,
    timeComplexity,
    costDistribution,
    hotspots: hotspotEntries,
    structures: structuresList,
    functions: functionsList,
    recursion: {
        maxDepth: maxStack,
        totalCalls: totalRecursiveCalls,
        averageDepth: Math.max(1, Math.round(totalRecursiveCalls > 0 ? (maxStack / 2) : 1)),
        deepestChain
    },
    timeline,
    memory: {
      peakStackDepth: maxStack,
      allocations: 0,
      characteristic: memChar
    }
  };
}
