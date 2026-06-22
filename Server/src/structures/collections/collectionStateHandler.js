function handleCollectionTrace(event, ctx) {
    if (event.type === "COLLECTION_MUT") {
        return ctx.createStep(event.type, { collectionEvent: event });
    } else if (event.type === "COLLECTION_TYPE") {
        if (!ctx.declaredCollectionTypes) {
            ctx.declaredCollectionTypes = {};
        }
        ctx.declaredCollectionTypes[event.name] = event.collectionType;
        return null;
    }
    return null;
}

function applyCollectionMutation(currentStep, ctx) {
    if (currentStep.collectionEvent) {
        const { name, value } = currentStep.collectionEvent;
        if (!ctx.currentCollectionsState) {
            ctx.currentCollectionsState = {};
        }
        // Store previous state for diffing BEFORE assigning new state
        if (!ctx.previousCollectionsState) {
            ctx.previousCollectionsState = {};
        }
        ctx.previousCollectionsState[name] = ctx.currentCollectionsState ? ctx.currentCollectionsState[name] : undefined;

        try {
            // Attempt to parse array/object structure (e.g. "[10, 20]" or "{"A": 1}")
            ctx.currentCollectionsState[name] = JSON.parse(value);
        } catch (e) {
            let parsedValue = value;
            if (typeof value === "string") {
                if (value.startsWith("[") && value.endsWith("]")) {
                    // Fallback for native Java Array/Collection toString() outputs like "[A, B]"
                    const inner = value.slice(1, -1);
                    if (inner.trim() === "") {
                        parsedValue = [];
                    } else {
                        parsedValue = inner.split(", ").map(part => {
                            const trimmed = part.trim();
                            if (trimmed === "true") return true;
                            if (trimmed === "false") return false;
                            if (!isNaN(Number(trimmed))) return Number(trimmed);
                            return trimmed;
                        });
                    }
                } else if (value.startsWith("{") && value.endsWith("}")) {
                    // Fallback for native Java Map toString() outputs like "{A=1, B=2}"
                    const inner = value.slice(1, -1);
                    if (inner.trim() === "") {
                        parsedValue = {};
                    } else {
                        parsedValue = {};
                        const pairs = inner.split(", ");
                        for (const pair of pairs) {
                            const eqIdx = pair.indexOf("=");
                            if (eqIdx !== -1) {
                                const rawKey = pair.slice(0, eqIdx).trim();
                                const rawVal = pair.slice(eqIdx + 1).trim();
                                
                                let parsedKey = rawKey;
                                if (rawKey === "true") parsedKey = true;
                                else if (rawKey === "false") parsedKey = false;
                                else if (!isNaN(Number(rawKey))) parsedKey = Number(rawKey);
                                
                                let parsedVal = rawVal;
                                if (rawVal === "true") parsedVal = true;
                                else if (rawVal === "false") parsedVal = false;
                                else if (!isNaN(Number(rawVal))) parsedVal = Number(rawVal);
                                
                                parsedValue[parsedKey] = parsedVal;
                            }
                        }
                    }
                }
            }
            ctx.currentCollectionsState[name] = parsedValue;
        }
    }
}

const { generateCollectionContracts } = require('./collectionContractBuilder');

function attachCollectionState(currentStep, ctx) {
    if (ctx.currentCollectionsState) {
        // Deep copy the state to avoid temporal leakage
        currentStep.collections = JSON.parse(JSON.stringify(ctx.currentCollectionsState));
        currentStep.collectionContracts = generateCollectionContracts(ctx, currentStep);
    }
}

module.exports = {
    handleCollectionTrace,
    applyCollectionMutation,
    attachCollectionState
};
