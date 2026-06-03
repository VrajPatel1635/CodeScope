const { 
    handleCollectionTrace, 
    applyCollectionMutation, 
    attachCollectionState 
} = require("./collectionStateHandler");

// HashMap uses the generic collection handler under the hood
// but maintains architectural separation for future visualizer support.

function handleHashMapTrace(event, ctx) {
    return handleCollectionTrace(event, ctx);
}

function applyHashMapMutation(currentStep, ctx) {
    return applyCollectionMutation(currentStep, ctx);
}

function attachHashMapState(currentStep, ctx) {
    return attachCollectionState(currentStep, ctx);
}

module.exports = {
    handleHashMapTrace,
    applyHashMapMutation,
    attachHashMapState
};
