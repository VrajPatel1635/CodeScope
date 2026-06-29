function handleStateOpTrace(event, ctx) {
    if (event.type !== "STATE_OP") return null;

    // Resolve true targetClass dynamically
    const targetClass = ctx.declaredCollectionTypes[event.targetName];
    if (targetClass) {
        event.targetClass = targetClass;
    } else if (event.targetName === ctx.primaryArrayName) {
        event.targetClass = "java.util.Arrays";
    }

    return ctx.createStep(event.type, {
        stateOpEvent: event
    });
}

function applyStateOpMutation(currentStep, ctx) {
    if (currentStep.type !== "STATE_OP") return;
    const event = currentStep.stateOpEvent;
    
    // 1. Update variable snapshot
    ctx.stack[ctx.stack.length - 1].variables[event.targetName] = event.serializedState;

    // Parse the serialized state for structural updates
    let parsedState;
    if (event.serializedState.startsWith("[") && event.serializedState.endsWith("]")) {
        const inner = event.serializedState.substring(1, event.serializedState.length - 1).trim();
        if (inner === "") {
            parsedState = [];
        } else {
            parsedState = inner.split(",").map(x => {
                const trimmed = x.trim();
                return !isNaN(Number(trimmed)) ? Number(trimmed) : trimmed;
            });
        }
    } else {
        parsedState = event.serializedState;
    }

    // 2. Update structural visualizer
    if (event.targetClass === "java.util.Arrays" || event.targetName === ctx.primaryArrayName) {
        if (ctx.primaryArrayName === event.targetName || (ctx.currentArrayState && !ctx.primaryArrayName)) {
            ctx.currentArrayState = parsedState;
        }
    } else if (event.targetClass && event.targetClass.startsWith("java.util.")) {
        if (!ctx.currentCollectionsState) {
            ctx.currentCollectionsState = {};
        }
        if (!ctx.previousCollectionsState) {
            ctx.previousCollectionsState = {};
        }
        ctx.previousCollectionsState[event.targetName] = ctx.currentCollectionsState[event.targetName];
        
        let parsedCollectionState = event.serializedState;
        try {
            parsedCollectionState = JSON.parse(event.serializedState);
        } catch (e) {
            console.warn(`[Legacy Parser Fallback] used for ${event.targetName} with value ${event.serializedState}`);
            const value = event.serializedState;
            if (value.startsWith("[") && value.endsWith("]")) {
                const inner = value.slice(1, -1);
                if (inner.trim() === "") {
                    parsedCollectionState = [];
                } else {
                    parsedCollectionState = inner.split(", ").map(part => {
                        const trimmed = part.trim();
                        if (trimmed === "true") return true;
                        if (trimmed === "false") return false;
                        if (!isNaN(Number(trimmed))) return Number(trimmed);
                        return trimmed;
                    });
                }
            } else if (value.startsWith("{") && value.endsWith("}")) {
                const inner = value.slice(1, -1);
                if (inner.trim() === "") {
                    parsedCollectionState = {};
                } else {
                    parsedCollectionState = {};
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
                            
                            parsedCollectionState[parsedKey] = parsedVal;
                        }
                    }
                }
            }
        }
        ctx.currentCollectionsState[event.targetName] = parsedCollectionState;
    }
}

module.exports = { handleStateOpTrace, applyStateOpMutation };
