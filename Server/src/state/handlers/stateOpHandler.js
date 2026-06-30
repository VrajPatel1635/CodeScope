const { dispatchState } = require("../dispatchers/unifiedStateDispatcher");

function handleStateOpTrace(event, ctx) {
    if (event.type !== "STATE_OP") return null;

    // Resolve true targetClass dynamically
    const targetClass = ctx.declaredCollectionTypes[event.targetName];
    if (targetClass) {
        event.targetClass = targetClass;
    }

    return ctx.createStep(event.type, {
        stateOpEvent: event
    });
}

function applyStateOpMutation(currentStep, ctx) {
    if (currentStep.type !== "STATE_OP") return;
    const event = currentStep.stateOpEvent;
    
    let parsedState = event.serializedState;
    try {
        parsedState = JSON.parse(event.serializedState);
    } catch (e) {
        console.warn(`[Legacy Parser Fallback] used for ${event.targetName} with value ${event.serializedState}`);
        const value = event.serializedState;
        if (value.startsWith("[") && value.endsWith("]")) {
            const inner = value.slice(1, -1);
            if (inner.trim() === "") {
                parsedState = [];
            } else {
                parsedState = inner.split(", ").map(part => {
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
                parsedState = {};
            } else {
                parsedState = {};
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
                        
                        parsedState[parsedKey] = parsedVal;
                    }
                }
            }
        }
    }

    dispatchState(ctx, event.targetName, event.targetClass, parsedState);
}

module.exports = { handleStateOpTrace, applyStateOpMutation };
