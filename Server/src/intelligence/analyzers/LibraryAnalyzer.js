class LibraryAnalyzer {
    static analyze(states, registry) {
        const libraryOperations = [];
        
        for (const state of states) {
            // Check for library operation in STATE_OP
            if (state.type === "STATE_OP" && state.stateOpEvent) {
                const { operation, targetName } = state.stateOpEvent;
                // Get the variable type to find its registry class
                let targetClass = null;
                if (state.context && state.context.declaredCollectionTypes && state.context.declaredCollectionTypes[targetName]) {
                    targetClass = state.context.declaredCollectionTypes[targetName];
                }
                
                // If it's Array.sort, etc, the targetClass might be null or primitive, but wait, Arrays.sort targets arrays directly
                // Actually Arrays.sort() is logged as STATE_OP targetName=arr operation=SORT.
                // We need to resolve the registry entry.
                const registryEntry = this._resolveRegistryEntry(operation, targetClass, registry);
                
                if (registryEntry) {
                    libraryOperations.push({
                        stepId: state.stepId,
                        target: targetName,
                        operation: operation,
                        complexity: registryEntry.complexity || "O(1)",
                        category: registryEntry.semanticCategory || "Mutation",
                        characteristics: registryEntry.characteristics || [],
                        explanation: `Executed ${registryEntry.semanticCategory || operation} with complexity ${registryEntry.complexity || "O(1)"}.`
                    });
                }
            }
        }
        
        return libraryOperations;
    }

    static _resolveRegistryEntry(operation, targetClass, registry) {
        // If we know the exact target class (e.g., "List", "HashMap"), find it
        if (targetClass) {
            const cls = registry.lookupByClassName(targetClass);
            if (cls) {
                const methods = registry._getResolvedMethods(cls);
                // Find method by operation
                for (const [methodName, meta] of Object.entries(methods)) {
                    if (meta.operation === operation) {
                        return meta;
                    }
                }
            }
        }
        
        // If we don't know the class (e.g. primitive array Arrays.sort()), search Arrays/Collections
        const utilityClasses = ["Arrays", "Collections"];
        for (const util of utilityClasses) {
            const cls = registry.lookupByClassName(util);
            if (cls) {
                const methods = registry._getResolvedMethods(cls);
                for (const [methodName, meta] of Object.entries(methods)) {
                    if (meta.operation === operation) {
                        return meta;
                    }
                }
            }
        }
        return null;
    }
}

module.exports = LibraryAnalyzer;
