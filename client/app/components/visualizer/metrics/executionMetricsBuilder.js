export function buildExecutionMetrics(states) {
  const metrics = {
    totalSteps: 0,
    assignments: 0,
    comparisons: 0,
    arrayMutations: 0,
    matrixMutations: 0,
    collectionMutations: 0,
    linkedListMutations: 0,
    treeMutations: 0,
    graphMutations: 0,
    functionCalls: 0,
    recursiveCalls: 0,
    maxRecursionDepth: 0,
    maxCallStackSize: 0,
  };

  if (!states || !Array.isArray(states)) {
    return metrics;
  }

  metrics.totalSteps = states.length;

  for (const state of states) {
    if (state.stack && state.stack.length > metrics.maxCallStackSize) {
      metrics.maxCallStackSize = state.stack.length;
    }

    if (state.type === "CALL") {
      metrics.functionCalls++;
      const funcName = state.callEvent?.function;
      if (funcName && state.stack) {
        let count = 0;
        for (const frame of state.stack) {
          if (frame.function === funcName) {
            count++;
          }
        }
        if (count > 1) {
          metrics.recursiveCalls++;
        }
        if (count > metrics.maxRecursionDepth) {
          metrics.maxRecursionDepth = count;
        }
      }
    }

    if (state.type === "VAR") metrics.assignments++;
    if (state.type === "COND") metrics.comparisons++;
    if (state.type === "ARRAY") metrics.arrayMutations++;
    if (state.type === "ARRAY2D") metrics.matrixMutations++;
    if (state.type === "COLLECTION_MUT") metrics.collectionMutations++;
    if (state.type === "NODE_MUTATE" || state.type === "NODE_LINK") metrics.linkedListMutations++;
    if (state.type === "TREE_MUTATE" || state.type === "TREE_LINK") metrics.treeMutations++;
    if (state.type === "GRAPH_EDGE" || state.type === "GRAPH_EDGE_ADD" || state.type === "GRAPH_EDGE_REMOVE") metrics.graphMutations++;
  }

  return metrics;
}
