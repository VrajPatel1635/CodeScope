const ComplexityAnalyzer = require('./analyzers/ComplexityAnalyzer');
const MutationAnalyzer = require('./analyzers/MutationAnalyzer');
const PatternAnalyzer = require('./analyzers/PatternAnalyzer');
const TimelineAnalyzer = require('./analyzers/TimelineAnalyzer');
const HotspotAnalyzer = require('./analyzers/HotspotAnalyzer');
const MemoryAnalyzer = require('./analyzers/MemoryAnalyzer');
const CharacteristicsAnalyzer = require('./analyzers/CharacteristicsAnalyzer');
const LibraryAnalyzer = require('./analyzers/LibraryAnalyzer');
const IntelligenceModel = require('./model/IntelligenceModel');

class IntelligenceDeriver {
    /**
     * Derive semantic intelligence from raw execution data.
     * @param {Array} states - The linear state timeline from execution.
     * @param {Object} registry - The Java Knowledge Registry instance.
     * @param {Object} patternEngineResult - Output from the Pattern Engine.
     * @returns {IntelligenceModel} - The normalized intelligence model.
     */
    static derive(states, registry, patternEngineResult) {
        if (!states || states.length === 0) return null;

        // 1. Library Analyzer (Base layer, translates raw traces into semantic events)
        const libraryOperations = LibraryAnalyzer.analyze(states, registry);
        
        // 2. Pattern Analyzer
        const patterns = PatternAnalyzer.analyze(patternEngineResult);

        // 3. Complexity & Memory Analyzers
        const complexity = ComplexityAnalyzer.analyze(states, libraryOperations);
        const memory = MemoryAnalyzer.analyze(states, libraryOperations);

        // 4. Mutation & Hotspot Analyzers
        const mutations = MutationAnalyzer.analyze(states, libraryOperations);
        const hotspots = HotspotAnalyzer.analyze(states, libraryOperations);

        // 5. Characteristics & Timeline Analyzers
        const characteristics = CharacteristicsAnalyzer.analyze(states, libraryOperations, patternEngineResult);
        const { timeline, algorithmSummary } = TimelineAnalyzer.analyze(states, libraryOperations, characteristics);

        // 6. Return Normalized Model
        return new IntelligenceModel({
            complexity,
            memory,
            characteristics,
            patterns,
            libraryOperations,
            mutations,
            hotspots,
            timeline,
            algorithmSummary
        });
    }
}

module.exports = IntelligenceDeriver;
