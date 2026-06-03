const { 
    handleCollectionTrace, 
    applyCollectionMutation, 
    attachCollectionState 
} = require("./collectionStateHandler");

// PriorityQueue uses the generic collection handler under the hood
// but maintains architectural separation for future visualizer support.

function handlePriorityQueueTrace(event, ctx) {
    return handleCollectionTrace(event, ctx);
}

function applyPriorityQueueMutation(currentStep, ctx) {
    return applyCollectionMutation(currentStep, ctx);
}

function attachPriorityQueueState(currentStep, ctx) {
    return attachCollectionState(currentStep, ctx);
}

module.exports = {
    handlePriorityQueueTrace,
    applyPriorityQueueMutation,
    attachPriorityQueueState
};
