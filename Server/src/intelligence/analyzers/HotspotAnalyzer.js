class HotspotAnalyzer {
    static analyze(states, libraryOperations) {
        const lineCounts = {};
        const lineTypes = {};
        
        for (const s of states) {
            if (s.line) {
                lineCounts[s.line] = (lineCounts[s.line] || 0) + 1;
                
                if (s.type === "COND") lineTypes[s.line] = "Condition / Comparison";
                else if (s.type === "VAR" || s.type === "ASSIGN") lineTypes[s.line] = "Assignment";
                else if (["ARRAY", "ARRAY2D", "COLLECTION_MUT", "NODE_MUTATE", "NODE_LINK", "TREE_MUTATE", "TREE_LINK", "GRAPH_EDGE", "GRAPH_EDGE_ADD", "GRAPH_EDGE_REMOVE", "STATE_OP"].includes(s.type)) {
                    lineTypes[s.line] = "Mutation";
                }
            }
        }
        
        const hotspots = Object.entries(lineCounts)
            .map(([line, count]) => {
                let type = lineTypes[line] || "Execution";
                let percentage = Math.round((count / states.length) * 100);
                let reason = `Executed ${count} times. Primary Cost Center.`;
                
                // Match with library operations that might have occurred on this line
                for (const libOp of libraryOperations) {
                    // Check if the libOp step matches the state on this line
                    // We don't have perfect line mapping for libOps, but we can assume if it's a mutation it's high cost
                    if (type === "Mutation") {
                        reason = `Dominates Runtime. High semantic cost.`;
                    }
                }
                
                return {
                    id: `hotspot-${line}`,
                    line: parseInt(line, 10),
                    count,
                    percentage,
                    type,
                    explanation: reason
                };
            })
            .filter(h => h.percentage >= 5)
            .sort((a, b) => b.percentage - a.percentage)
            .slice(0, 3);
            
        return hotspots;
    }
}

module.exports = HotspotAnalyzer;
