"use strict";

const { detectDFS } = require("./detectors/DFSPatternDetector");
const { detectBFS } = require("./detectors/BFSPatternDetector");
const { detectTwoPointer } = require("./detectors/TwoPointerPatternDetector");
const { detectSlidingWindow } = require("./detectors/SlidingWindowPatternDetector");

/**
 * Derives algorithm patterns purely from execution traces, states, and semantics.
 * 
 * @param {Object} input - Contains { states, sourceSteps, semantics }
 * @returns {Array} List of detected pattern objects { type, confidence, evidence }
 */
function detectPatterns({ states, sourceSteps, semantics }) {
    const patterns = [];
    
    try {
        const dfs = detectDFS(states, semantics);
        if (dfs) patterns.push(dfs);
        
        const bfs = detectBFS(states, semantics);
        if (bfs) patterns.push(bfs);
        
        const twoPointer = detectTwoPointer(states, semantics);
        if (twoPointer) patterns.push(twoPointer);
        
        const slidingWindow = detectSlidingWindow(states, semantics);
        if (slidingWindow) patterns.push(slidingWindow);
    } catch (err) {
        const logger = require("../utils/logger");
        logger.error("Error during pattern detection:", err);
    }

    return patterns;
}

module.exports = { detectPatterns };
