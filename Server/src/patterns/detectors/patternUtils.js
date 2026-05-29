"use strict";

function extractIntegerVariableHistories(states) {
    const history = {};

    for (const state of states) {
        if (!state.currentFrameVariables) continue;
        
        for (const [varName, value] of Object.entries(state.currentFrameVariables)) {
            // Only track primitive integer variables
            if (typeof value === 'number' && Number.isInteger(value)) {
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
