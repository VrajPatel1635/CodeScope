const { 
    handleCollectionTrace, 
    applyCollectionMutation, 
    attachCollectionState 
} = require("./collectionStateHandler");

// Queue uses the generic collection handler under the hood
// but maintains architectural separation for future visualizer support.

function handleQueueTrace(event, ctx) {
    return handleCollectionTrace(event, ctx);
}

function applyQueueMutation(currentStep, ctx) {
    return applyCollectionMutation(currentStep, ctx);
}

function attachQueueState(currentStep, ctx) {
    return attachCollectionState(currentStep, ctx);
}

module.exports = {
    handleQueueTrace,
    applyQueueMutation,
    attachQueueState
};
