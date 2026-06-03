const { 
    handleCollectionTrace, 
    applyCollectionMutation, 
    attachCollectionState 
} = require("./collectionStateHandler");

// Stack uses the generic collection handler under the hood
// but maintains architectural separation for future visualizer support.

function handleStackTrace(event, ctx) {
    // Stack events are captured as generic COLLECTION_MUT
    return handleCollectionTrace(event, ctx);
}

function applyStackMutation(currentStep, ctx) {
    return applyCollectionMutation(currentStep, ctx);
}

function attachStackState(currentStep, ctx) {
    return attachCollectionState(currentStep, ctx);
}

module.exports = {
    handleStackTrace,
    applyStackMutation,
    attachStackState
};
