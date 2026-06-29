class MemoryAnalyzer {
    static analyze(states, libraryOperations) {
        let maxStack = 0;
        let allocations = 0;
        
        for (const s of states) {
            if (s.stack && s.stack.length > maxStack) {
                maxStack = s.stack.length;
            }
            if (s.type === "STATE_OP" && s.stateOpEvent && ["ADD", "OFFER", "PUSH", "PUT"].includes(s.stateOpEvent.operation)) {
                allocations++;
            }
            if (s.type === "NODE_MUTATE" || s.type === "TREE_MUTATE") {
                allocations++;
            }
        }
        
        let memChar = "In-Place";
        let auxiliarySpace = "O(1)";
        
        if (maxStack > 20) {
            memChar = "Deep Recursion";
            auxiliarySpace = "O(N)";
        } else if (allocations > 15) {
            memChar = "Heavy Allocation";
            auxiliarySpace = "O(N)";
        }
        
        // Enhance with library metadata
        for (const libOp of libraryOperations) {
            if (libOp.characteristics && libOp.characteristics.includes("Allocation")) {
                memChar = "Heavy Allocation";
            }
            if (libOp.auxiliarySpace && libOp.auxiliarySpace !== "O(1)") {
                auxiliarySpace = libOp.auxiliarySpace;
            }
        }
        
        return {
            peakStackDepth: maxStack,
            allocations: allocations,
            characteristic: memChar,
            auxiliarySpace: auxiliarySpace
        };
    }
}

module.exports = MemoryAnalyzer;
