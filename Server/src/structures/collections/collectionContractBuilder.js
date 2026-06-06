function inferCollectionTypeFromDeclared(declaredType) {
    if (!declaredType) return "unknown";
    
    // Normalize and extract generic wrapper (e.g. "Queue<Integer>" -> "Queue")
    const match = declaredType.match(/^(?:java\.util\.)?([a-zA-Z]+)(?:<.*>)?$/);
    const baseType = match ? match[1].toLowerCase() : declaredType.toLowerCase();

    if (baseType.includes("stack")) return "stack";
    if (baseType.includes("queue") && !baseType.includes("priority") && !baseType.includes("deque")) return "queue";
    if (baseType.includes("deque")) return "deque";
    if (baseType.includes("hashset") || baseType.includes("set")) return "hashset";
    if (baseType.includes("priorityqueue")) return "priorityqueue";
    if (baseType.includes("hashmap") || baseType.includes("map")) return "hashmap";
    if (baseType.includes("list") || baseType.includes("arraylist")) return "list";
    
    return baseType;
}

function extractOperation(prev, curr, type) {
    let opType = null;
    let opValue = null;
    let opKey = null;

    if (type === "hashmap") {
        if (!prev) prev = {};
        if (!curr) curr = {};
        
        // Find added or updated keys
        for (const key in curr) {
            if (!(key in prev)) {
                opType = "put";
                opKey = key;
                opValue = curr[key];
                break;
            } else if (prev[key] !== curr[key]) {
                opType = "replace";
                opKey = key;
                opValue = curr[key];
                break;
            }
        }
        
        // If not added or updated, check if removed
        if (!opType) {
            for (const key in prev) {
                if (!(key in curr)) {
                    opType = "remove";
                    opKey = key;
                    opValue = prev[key];
                    break;
                }
            }
        }
        
        return { type: opType, key: opKey, value: opValue };
    }
    
    // Linear Collections / Sets
    if (!prev) prev = [];
    if (!curr) curr = [];
    
    // Detect additions
    if (curr.length > prev.length) {
        if (type === "stack") {
            opType = "push";
            opValue = curr[curr.length - 1];
        } else if (type === "queue" || type === "priorityqueue") {
            opType = "offer";
            // PriorityQueue re-orders, so we find the element in curr that's not in prev
            for (const item of curr) {
                if (!prev.includes(item)) {
                    opValue = item;
                    break;
                }
            }
            if (opValue === null) opValue = curr[curr.length - 1];
        } else if (type === "deque") {
            if (curr[0] !== prev[0]) {
                opType = "addFirst";
                opValue = curr[0];
            } else {
                opType = "addLast";
                opValue = curr[curr.length - 1];
            }
        } else if (type === "hashset") {
            opType = "add";
            for (const item of curr) {
                if (!prev.includes(item)) {
                    opValue = item;
                    break;
                }
            }
        } else {
            opType = "add";
            opValue = curr[curr.length - 1];
        }
    } 
    // Detect removals
    else if (prev.length > curr.length) {
        if (type === "stack") {
            opType = "pop";
            opValue = prev[prev.length - 1];
        } else if (type === "queue" || type === "priorityqueue") {
            opType = "poll";
            for (const item of prev) {
                if (!curr.includes(item)) {
                    opValue = item;
                    break;
                }
            }
            if (opValue === null) opValue = prev[0];
        } else if (type === "deque") {
            if (prev[prev.length - 1] !== curr[curr.length - 1] && curr.length > 0) {
                opType = "removeLast";
                opValue = prev[prev.length - 1];
            } else {
                opType = "removeFirst";
                opValue = prev[0];
            }
            // fallback if empty
            if (curr.length === 0 && prev.length === 1) {
                opType = "removeFirst"; // default arbitrary
                opValue = prev[0];
            }
        } else if (type === "hashset") {
            opType = "remove";
            for (const item of prev) {
                if (!curr.includes(item)) {
                    opValue = item;
                    break;
                }
            }
        } else {
            opType = "remove";
            opValue = prev[prev.length - 1];
        }
    } 
    // Size didn't change: could be peek/contains or no-op/duplicates
    else {
        // We cannot reliably guess `peek` vs `contains` unless we track the method called.
        // But since we can't change TRACE, we will leave operation type null if state didn't change,
        // unless it's a replacement or something, which isn't standard for these collections except HashMap.
        opType = null;
        opValue = null;
    }
    
    return { type: opType, value: opValue };
}

function generateCollectionContracts(ctx, currentStep) {
    const contracts = {};
    if (!ctx.currentCollectionsState) return contracts;

    const declaredTypes = ctx.declaredCollectionTypes || {};

    for (const [name, currentState] of Object.entries(ctx.currentCollectionsState)) {
        const declaredType = declaredTypes[name];
        const cType = inferCollectionTypeFromDeclared(declaredType);
        
        let previousState = null;
        if (ctx.previousCollectionsState && name in ctx.previousCollectionsState) {
            previousState = ctx.previousCollectionsState[name];
        }

        const contract = {
            collectionType: cType,
            name: name
        };

        // If this collection was mutated in this step, attach the operation
        if (currentStep.collectionEvent && currentStep.collectionEvent.name === name) {
            contract.operation = extractOperation(previousState, currentState, cType);
        } else {
            if (cType === "hashmap") {
                contract.operation = { type: null, key: null, value: null };
            } else {
                contract.operation = { type: null, value: null };
            }
        }

        if (cType === "stack") {
            contract.values = [...currentState];
            contract.size = currentState.length;
        } else if (cType === "queue") {
            contract.values = [...currentState];
            contract.front = 0;
            contract.rear = Math.max(0, currentState.length - 1);
        } else if (cType === "deque") {
            contract.values = [...currentState];
        } else if (cType === "hashset") {
            contract.values = [...currentState];
        } else if (cType === "priorityqueue") {
            contract.values = [...currentState];
        } else if (cType === "hashmap") {
            contract.entries = Object.entries(currentState).map(([k, v]) => ({ key: k, value: v }));
        } else {
            contract.values = Array.isArray(currentState) ? [...currentState] : currentState;
        }

        contracts[name] = contract;
    }

    return contracts;
}

module.exports = { generateCollectionContracts };
