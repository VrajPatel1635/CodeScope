"use strict";
const { extractIntegerVariableHistories } = require("./patternUtils");

function detectSlidingWindow(states, semantics) {
    const evidence = [];
    let confidence = "LOW";
    
    const history = extractIntegerVariableHistories(states);
    const varNames = Object.keys(history);
    
    let foundWindow = false;
    let foundLead = null;
    let foundLag = null;

    for (let i = 0; i < varNames.length; i++) {
        for (let j = i + 1; j < varNames.length; j++) {
            const v1 = varNames[i];
            const v2 = varNames[j];
            
            const h1 = history[v1];
            const h2 = history[v2];
            
            if (h1.length < 2 && h2.length < 2) continue; // Not enough movement

            let v1Increases = 0;
            let v1Decreases = 0;
            for (let k = 1; k < h1.length; k++) {
                if (h1[k].value > h1[k-1].value) v1Increases++;
                if (h1[k].value < h1[k-1].value) v1Decreases++;
            }
            
            let v2Increases = 0;
            let v2Decreases = 0;
            for (let k = 1; k < h2.length; k++) {
                if (h2[k].value > h2[k-1].value) v2Increases++;
                if (h2[k].value < h2[k-1].value) v2Decreases++;
            }
            
            const v1StrictlyAsc = v1Increases > 0 && v1Decreases === 0;
            const v2StrictlyAsc = v2Increases > 0 && v2Decreases === 0;
            
            const v1StrictlyDesc = v1Decreases > 0 && v1Increases === 0;
            const v2StrictlyDesc = v2Decreases > 0 && v2Increases === 0;
            
            if ((v1StrictlyAsc && v2StrictlyAsc) || (v1StrictlyDesc && v2StrictlyDesc)) {
                // Both move in the same direction!
                // Are they active at the same time? We check states where both exist.
                let v1AlwaysGreaterEqual = true;
                let v2AlwaysGreaterEqual = true;
                let overlapCount = 0;
                
                for (const state of states) {
                    const vars = state.currentFrameVariables;
                    if (vars && 
                        vars[v1]?.category === 'scalar' && typeof vars[v1].value === 'number' && 
                        vars[v2]?.category === 'scalar' && typeof vars[v2].value === 'number') {
                        overlapCount++;
                        if (vars[v1].value < vars[v2].value) v1AlwaysGreaterEqual = false;
                        if (vars[v2].value < vars[v1].value) v2AlwaysGreaterEqual = false;
                    }
                }
                
                if (overlapCount > 2 && (v1AlwaysGreaterEqual || v2AlwaysGreaterEqual)) {
                    foundWindow = true;
                    if (v1AlwaysGreaterEqual) {
                        foundLead = v1;
                        foundLag = v2;
                    } else {
                        foundLead = v2;
                        foundLag = v1;
                    }
                    break;
                }
            }
        }
        if (foundWindow) break;
    }

    if (foundWindow) {
        evidence.push(`Variables '${foundLead}' and '${foundLag}' represent an expanding/contracting boundary moving in the same direction.`);
        confidence = "HIGH";
    }

    if (evidence.length > 0) {
        return {
            type: "SLIDING_WINDOW_PATTERN",
            confidence,
            evidence
        };
    }

    return null;
}

module.exports = { detectSlidingWindow };
