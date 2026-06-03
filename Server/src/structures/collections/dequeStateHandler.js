const { 
    handleCollectionTrace, 
    applyCollectionMutation, 
    attachCollectionState 
} = require("./collectionStateHandler");

// Deque uses the generic collection handler under the hood
// but maintains architectural separation for future visualizer support.

function handleDequeTrace(event, ctx) {
    return handleCollectionTrace(event, ctx);
}

function applyDequeMutation(currentStep, ctx) {
    return applyCollectionMutation(currentStep, ctx);
}

function attachDequeState(currentStep, ctx) {
    return attachCollectionState(currentStep, ctx);
}

module.exports = {
    handleDequeTrace,
    applyDequeMutation,
    attachDequeState
};
