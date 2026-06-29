class ComplexityAnalyzer {
    static analyze(states, libraryOperations) {
        let maxStack = 0;
        let totalRecursiveCalls = 0;
        let hasNestedLoop = false;
        let loopIterCounts = {};
        let treeGraphVisits = 0;

        // Extract loop semantics and stack depths
        for (const s of states) {
            if (s.stack && s.stack.length > maxStack) {
                maxStack = s.stack.length;
            }
            if (s.type === "CALL") {
                const funcName = s.callEvent?.function || "unknown";
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
            if (s.type === "TREE_VISIT" || s.type === "GRAPH_VISIT") {
                treeGraphVisits++;
            }
        }

        let baseComplexity = "O(1)";
        let baseReason = "No loops or recursion detected.";

        if (totalRecursiveCalls > 0) {
            if (maxStack > 10) {
                baseComplexity = "O(2^N)";
                baseReason = "Deep recursion detected without memoization structure.";
            } else {
                baseComplexity = "O(log N)";
                baseReason = "Logarithmic recursive depth detected.";
            }
        } else if (hasNestedLoop) {
            baseComplexity = "O(N²)";
            baseReason = "Nested iteration over data structures.";
        } else if (Object.keys(loopIterCounts).length > 0) {
            baseComplexity = "O(N)";
            baseReason = "Linear iteration over data elements.";
        } else if (treeGraphVisits > 0) {
            baseComplexity = "O(V + E)";
            baseReason = "Traversal over nodes and edges.";
        }

        // Compare with library operations
        let finalComplexity = baseComplexity;
        let finalReason = baseReason;

        // Very basic complexity comparison
        const rank = {
            "O(1)": 1,
            "O(log N)": 2,
            "O(N)": 3,
            "O(N log N)": 4,
            "O(V + E)": 5,
            "O(N²)": 6,
            "O(2^N)": 7
        };

        for (const libOp of libraryOperations) {
            const comp = libOp.complexity;
            if (rank[comp] > rank[finalComplexity]) {
                finalComplexity = comp;
                finalReason = `Dominated by library operation: ${libOp.category} (${comp}).`;
            }
        }

        return {
            dominantComplexity: finalComplexity,
            reason: finalReason
        };
    }
}

module.exports = ComplexityAnalyzer;
