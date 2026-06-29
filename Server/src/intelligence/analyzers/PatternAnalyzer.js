class PatternAnalyzer {
    static analyze(patternEngineResult) {
        if (!patternEngineResult || !patternEngineResult.name) return null;
        
        return {
            pattern: patternEngineResult.name,
            confidence: patternEngineResult.confidence || 90,
            reason: patternEngineResult.reason || `Execution footprint strongly indicates a ${patternEngineResult.name} pattern.`
        };
    }
}

module.exports = PatternAnalyzer;
