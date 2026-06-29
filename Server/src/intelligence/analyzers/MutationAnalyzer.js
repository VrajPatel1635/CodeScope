class MutationAnalyzer {
    static analyze(states, libraryOperations) {
        const mutations = {
            Array: { writes: 0, reads: 0, swaps: 0, inPlace: false },
            Collection: { inserted: 0, removed: 0, updated: 0 },
            Map: { inserted: 0, removed: 0, updated: 0 },
            LinkedList: { rewires: 0, insertions: 0, removals: 0 },
            Tree: { pointerMutations: 0, valueUpdates: 0 },
            Graph: { edgeAdditions: 0, edgeRemovals: 0 }
        };

        for (const s of states) {
            if (s.type === "ARRAY") {
                mutations.Array.writes++;
            } else if (s.type === "STATE_OP" && s.stateOpEvent) {
                const op = s.stateOpEvent.operation;
                const targetName = s.stateOpEvent.targetName;
                const targetClass = s.context?.declaredCollectionTypes?.[targetName] || "";
                
                if (targetClass.includes("Map")) {
                    if (op === "ADD") mutations.Map.inserted++;
                    else if (op === "REMOVE") mutations.Map.removed++;
                    else if (op === "SET" || op === "MERGE" || op === "COMPUTE") mutations.Map.updated++;
                } else if (targetClass.includes("List") || targetClass.includes("Queue") || targetClass.includes("Set")) {
                    if (op === "ADD" || op === "OFFER" || op === "PUSH") mutations.Collection.inserted++;
                    else if (op === "REMOVE" || op === "POLL" || op === "POP") mutations.Collection.removed++;
                    else if (op === "SET") mutations.Collection.updated++;
                }
            } else if (s.type === "NODE_MUTATE" || s.type === "NODE_LINK") {
                mutations.LinkedList.rewires++;
            } else if (s.type === "TREE_MUTATE" || s.type === "TREE_LINK") {
                if (s.field === "val") mutations.Tree.valueUpdates++;
                else mutations.Tree.pointerMutations++;
            } else if (s.type === "GRAPH_EDGE_ADD") {
                mutations.Graph.edgeAdditions++;
            } else if (s.type === "GRAPH_EDGE_REMOVE") {
                mutations.Graph.edgeRemovals++;
            }
        }

        // Check if array mutations were in-place
        for (const libOp of libraryOperations) {
            if (libOp.category === "Sorting" && libOp.characteristics.includes("In Place")) {
                mutations.Array.inPlace = true;
            }
        }

        return mutations;
    }
}

module.exports = MutationAnalyzer;
