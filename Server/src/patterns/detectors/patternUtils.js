"use strict";

function extractIntegerVariableHistories(states) {
    const history = {};

    for (const state of states) {
        if (!state.currentFrameVariables) continue;
        
        for (const [varName, descriptor] of Object.entries(state.currentFrameVariables)) {
            // Only track primitive integer variables
            if (descriptor && descriptor.category === 'scalar' && typeof descriptor.value === 'number' && Number.isInteger(descriptor.value)) {
                const value = descriptor.value;
                if (!history[varName]) {
                    history[varName] = [];
                }
                
                const varArr = history[varName];
                if (varArr.length === 0 || varArr[varArr.length - 1].value !== value) {
                    varArr.push({ step: state.step, value });
                }
            }
        }
    }

    return history;
}

module.exports = { extractIntegerVariableHistories };
