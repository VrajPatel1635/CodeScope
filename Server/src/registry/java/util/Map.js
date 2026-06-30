const { OPERATIONS } = require("../../constants");

module.exports = {
    namespace: "java.util",
    className: "Map",
    isInterface: true,
    structuralType: "Collection",
    methods: {
        put: { mutatesTarget: true, returnsValue: true, operation: OPERATIONS.ADD, complexity: "O(1)", auxiliarySpace: "O(1)", semanticCategory: "Insertion", executionPhase: "State Update", characteristics: ["Average O(1)", "Hash Table"], hotspotWeight: 5 },
        putIfAbsent: { mutatesTarget: true, returnsValue: true, operation: OPERATIONS.ADD, complexity: "O(1)", auxiliarySpace: "O(1)", semanticCategory: "Insertion", executionPhase: "State Update", characteristics: ["Average O(1)", "Hash Table"], hotspotWeight: 5 },
        remove: { mutatesTarget: true, returnsValue: true, operation: OPERATIONS.REMOVE, complexity: "O(1)", auxiliarySpace: "O(1)", semanticCategory: "Removal", executionPhase: "State Update", characteristics: ["Average O(1)", "Hash Table"], hotspotWeight: 5 },
        replace: { mutatesTarget: true, returnsValue: true, operation: OPERATIONS.SET, complexity: "O(1)", auxiliarySpace: "O(1)", semanticCategory: "Mutation", executionPhase: "State Update", characteristics: ["Average O(1)", "Hash Table"], hotspotWeight: 4 },
        clear: { mutatesTarget: true, returnsValue: false, operation: OPERATIONS.CLEAR, complexity: "O(N)", auxiliarySpace: "O(1)", semanticCategory: "Cleanup", executionPhase: "Cleanup", characteristics: ["Bulk Removal"], hotspotWeight: 2 },
        compute: { mutatesTarget: true, returnsValue: true, operation: OPERATIONS.COMPUTE, complexity: "O(1)", auxiliarySpace: "O(1)", semanticCategory: "Computation", executionPhase: "Processing", characteristics: ["Average O(1)", "Dynamic Updates"], hotspotWeight: 6 },
        merge: { mutatesTarget: true, returnsValue: true, operation: OPERATIONS.MERGE, complexity: "O(1)", auxiliarySpace: "O(1)", semanticCategory: "Computation", executionPhase: "Processing", characteristics: ["Average O(1)", "Dynamic Updates"], hotspotWeight: 6 },
        get: { mutatesTarget: false, returnsValue: true, operation: OPERATIONS.COMPUTE, complexity: "O(1)", auxiliarySpace: "O(1)", semanticCategory: "Read", executionPhase: "Search", characteristics: ["Average O(1)", "Hash Table"], hotspotWeight: 8 },
        getOrDefault: { mutatesTarget: false, returnsValue: true, operation: OPERATIONS.COMPUTE, complexity: "O(1)", auxiliarySpace: "O(1)", semanticCategory: "Read", executionPhase: "Search", characteristics: ["Average O(1)", "Hash Table"], hotspotWeight: 8 },
        containsKey: { mutatesTarget: false, returnsValue: true, operation: OPERATIONS.COMPUTE, complexity: "O(1)", auxiliarySpace: "O(1)", semanticCategory: "Search", executionPhase: "Search", characteristics: ["Average O(1)", "Hash Table"], hotspotWeight: 8 },
        containsValue: { mutatesTarget: false, returnsValue: true, operation: OPERATIONS.COMPUTE, complexity: "O(N)", auxiliarySpace: "O(1)", semanticCategory: "Search", executionPhase: "Search", characteristics: ["Linear Search", "Values Collection"], hotspotWeight: 6 },
        size: { mutatesTarget: false, returnsValue: true, operation: OPERATIONS.COMPUTE, complexity: "O(1)", auxiliarySpace: "O(1)", semanticCategory: "Read", executionPhase: "Validation", characteristics: ["Constant Time"], hotspotWeight: 2 },
        isEmpty: { mutatesTarget: false, returnsValue: true, operation: OPERATIONS.COMPUTE, complexity: "O(1)", auxiliarySpace: "O(1)", semanticCategory: "Read", executionPhase: "Validation", characteristics: ["Constant Time"], hotspotWeight: 2 }
    }
};
