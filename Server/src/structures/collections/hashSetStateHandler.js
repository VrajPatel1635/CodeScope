const { 
    handleCollectionTrace, 
    applyCollectionMutation, 
    attachCollectionState 
} = require("./collectionStateHandler");

// HashSet uses the generic collection handler under the hood
// but maintains architectural separation for future visualizer support.

function handleHashSetTrace(event, ctx) {
    return handleCollectionTrace(event, ctx);
}

function applyHashSetMutation(currentStep, ctx) {
    return applyCollectionMutation(currentStep, ctx);
}

function attachHashSetState(currentStep, ctx) {
    return attachCollectionState(currentStep, ctx);
}

module.exports = {
    handleHashSetTrace,
    applyHashSetMutation,
    attachHashSetState
};
