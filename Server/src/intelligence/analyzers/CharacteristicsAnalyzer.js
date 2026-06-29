class CharacteristicsAnalyzer {
    static analyze(states, libraryOperations, patternEngineResult) {
        const characteristics = new Set();
        
        let hasNestedLoop = false;
        let loopIterCounts = {};
        let isRecursive = false;
        
        for (const s of states) {
            if (s.type === "CALL" && s.stack && s.stack.length > 2) {
                isRecursive = true;
            }
            if (s.type === "LOOP_ITER") {
                const loopId = s.loopId || s.loopEvent?.loopId;
                if (loopId) {
                    loopIterCounts[loopId] = (loopIterCounts[loopId] || 0) + 1;
                    if (s.loopContext && Object.keys(s.loopContext).length > 1) {
                        hasNestedLoop = true;
                    }
                }
            }
        }
        
        if (isRecursive) characteristics.add("Recursive");
        if (hasNestedLoop) characteristics.add("Multi Pass");
        else if (Object.keys(loopIterCounts).length > 0) characteristics.add("Single Pass");
        
        for (const libOp of libraryOperations) {
            if (libOp.category === "Sorting") characteristics.add("Sorting");
            if (libOp.characteristics) {
                libOp.characteristics.forEach(c => characteristics.add(c));
            }
        }
        
        if (patternEngineResult && patternEngineResult.name) {
            characteristics.add(patternEngineResult.name);
        }
        
        return Array.from(characteristics);
    }
}

module.exports = CharacteristicsAnalyzer;
