function handleCollectionTrace(event, ctx) {
    if (event.type === "COLLECTION_MUT") {
        return ctx.createStep(event.type, { collectionEvent: event });
    }
    return null;
}

function applyCollectionMutation(currentStep, ctx) {
    if (currentStep.collectionEvent) {
        const { name, value } = currentStep.collectionEvent;
        if (!ctx.currentCollectionsState) {
            ctx.currentCollectionsState = {};
        }
        try {
            // Attempt to parse array/object structure (e.g. "[10, 20]")
            ctx.currentCollectionsState[name] = JSON.parse(value);
        } catch (e) {
            // Fallback to raw string snapshot
            ctx.currentCollectionsState[name] = value;
        }
    }
}

function attachCollectionState(currentStep, ctx) {
    if (ctx.currentCollectionsState) {
        // Deep copy the state to avoid temporal leakage
        currentStep.collections = JSON.parse(JSON.stringify(ctx.currentCollectionsState));
    }
}

module.exports = {
    handleCollectionTrace,
    applyCollectionMutation,
    attachCollectionState
};
