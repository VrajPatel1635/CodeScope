function handleArrayTrace(event, ctx) {
    if (event.type === "ARRAY") {
        return ctx.createStep(event.type, {
            arrayEvent: { name: event.name, index: event.index, value: event.value }
        });
    }
    return null;
}

function applyArrayMutation(currentStep, ctx) {
    if (currentStep.arrayEvent && ctx.currentArrayState) {
        const index = parseInt(currentStep.arrayEvent.index);
        const value = parseInt(currentStep.arrayEvent.value);
        ctx.currentArrayState[index] = value;
    }
}

function attachArrayState(currentStep, ctx) {
    if (ctx.currentArrayState) {
        currentStep.array = [...ctx.currentArrayState];
    } else if (ctx.currentMatrixState) {
        currentStep.matrix = ctx.currentMatrixState.map(r => [...r]);
    }
}

module.exports = {
    handleArrayTrace,
    applyArrayMutation,
    attachArrayState
};
