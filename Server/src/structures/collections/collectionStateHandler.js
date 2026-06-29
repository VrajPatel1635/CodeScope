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
    attachCollectionState
};
