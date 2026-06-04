function handleArrayTrace(event, ctx) {
    if (event.type === "ARRAY") {
        return ctx.createStep(event.type, {
            arrayEvent: { name: event.name, index: event.index, value: event.value }
        });
    } else if (event.type === "ARRAY2D") {
        return ctx.createStep(event.type, {
            array2dEvent: { name: event.name, row: event.row, col: event.col, value: event.value }
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
    if (currentStep.array2dEvent && ctx.currentMatrixState) {
        const row = parseInt(currentStep.array2dEvent.row);
        const col = parseInt(currentStep.array2dEvent.col);
        const value = parseInt(currentStep.array2dEvent.value);
        if (ctx.currentMatrixState[row]) {
            ctx.currentMatrixState[row][col] = value;
        }
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
