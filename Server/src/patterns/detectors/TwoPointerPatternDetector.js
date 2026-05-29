"use strict";
const { extractIntegerVariableHistories } = require("./patternUtils");

function detectTwoPointer(states, semantics) {
    const evidence = [];
    let confidence = "LOW";
    
    // Check semantic pointers (Linked list Fast/Slow or Meet)
    if (semantics.pointerSemanticFrames) {
        let hasOverlapOrMeet = false;
        for (const frame of semantics.pointerSemanticFrames) {
             for (const sem of (frame.semantics || [])) {
                 if (sem.type === "STABLE_MEET" || sem.type === "TRANSIENT_OVERLAP" || sem.type === "CONVERGING") {
                     hasOverlapOrMeet = true;
                 }
             }
        }
        if (hasOverlapOrMeet) {
             evidence.push("Semantic convergence or stable meet of pointer variables observed.");
             confidence = "HIGH";
        }
    }

    // Analyze integer variables for array-based two pointers
    const history = extractIntegerVariableHistories(states);
    const varNames = Object.keys(history);
    
    // Look for a pair of variables that converge from opposite directions
    let foundConverging = false;
    let foundVar1 = null;
    let foundVar2 = null;

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
            const v1StrictlyDesc = v1Decreases > 0 && v1Increases === 0;
            
            const v2StrictlyAsc = v2Increases > 0 && v2Decreases === 0;
            const v2StrictlyDesc = v2Decreases > 0 && v2Increases === 0;
            
            if ((v1StrictlyAsc && v2StrictlyDesc) || (v1StrictlyDesc && v2StrictlyAsc)) {
                foundConverging = true;
                foundVar1 = v1;
                foundVar2 = v2;
                break;
            }
        }
        if (foundConverging) break;
    }

    if (foundConverging) {
        evidence.push(`Variables '${foundVar1}' and '${foundVar2}' converge concurrently within a loop.`);
        confidence = "HIGH";
    }

    if (evidence.length > 0) {
        return {
            type: "TWO_POINTER_PATTERN",
            confidence,
            evidence
        };
    }

    return null;
}

module.exports = { detectTwoPointer };
