const { OPERATIONS } = require("../../constants");

module.exports = {
    namespace: "java.util",
    className: "List",
    isInterface: true,
    structuralType: "Collection",
    methods: {
        add: { mutatesTarget: true, returnsValue: true, operation: OPERATIONS.ADD, complexity: "O(1)", auxiliarySpace: "O(1)", semanticCategory: "Insertion", executionPhase: "State Update", characteristics: ["Amortized O(1)", "Dynamic Sizing"], hotspotWeight: 4 },
        addFirst: { mutatesTarget: true, returnsValue: false, operation: OPERATIONS.ADD, complexity: "O(1)", auxiliarySpace: "O(1)", semanticCategory: "Insertion", executionPhase: "State Update", characteristics: ["Head Insertion", "Queue Operation"], hotspotWeight: 5 },
        addLast: { mutatesTarget: true, returnsValue: false, operation: OPERATIONS.ADD, complexity: "O(1)", auxiliarySpace: "O(1)", semanticCategory: "Insertion", executionPhase: "State Update", characteristics: ["Tail Insertion"], hotspotWeight: 4 },
        remove: { mutatesTarget: true, returnsValue: true, operation: OPERATIONS.REMOVE, complexity: "O(N)", auxiliarySpace: "O(1)", semanticCategory: "Removal", executionPhase: "State Update", characteristics: ["Linear Search", "Shift Overhead"], hotspotWeight: 6 },
        removeFirst: { mutatesTarget: true, returnsValue: true, operation: OPERATIONS.REMOVE, complexity: "O(1)", auxiliarySpace: "O(1)", semanticCategory: "Removal", executionPhase: "State Update", characteristics: ["Head Removal", "Queue Operation"], hotspotWeight: 5 },
        removeLast: { mutatesTarget: true, returnsValue: true, operation: OPERATIONS.REMOVE, complexity: "O(1)", auxiliarySpace: "O(1)", semanticCategory: "Removal", executionPhase: "State Update", characteristics: ["Tail Removal"], hotspotWeight: 5 },
        set: { mutatesTarget: true, returnsValue: true, operation: OPERATIONS.SET, complexity: "O(1)", auxiliarySpace: "O(1)", semanticCategory: "Mutation", executionPhase: "State Update", characteristics: ["In Place", "Random Access"], hotspotWeight: 3 },
        clear: { mutatesTarget: true, returnsValue: false, operation: OPERATIONS.CLEAR, complexity: "O(N)", auxiliarySpace: "O(1)", semanticCategory: "Cleanup", executionPhase: "Cleanup", characteristics: ["Bulk Removal"], hotspotWeight: 2 },
        retainAll: { mutatesTarget: true, returnsValue: true, operation: OPERATIONS.FILTER, complexity: "O(N)", auxiliarySpace: "O(1)", semanticCategory: "Mutation", executionPhase: "Filtering", characteristics: ["Bulk Operation"], hotspotWeight: 4 },
        removeAll: { mutatesTarget: true, returnsValue: true, operation: OPERATIONS.FILTER, complexity: "O(N)", auxiliarySpace: "O(1)", semanticCategory: "Mutation", executionPhase: "Filtering", characteristics: ["Bulk Operation"], hotspotWeight: 4 },
        get: { mutatesTarget: false, returnsValue: true, operation: OPERATIONS.COMPUTE, complexity: "O(1)", auxiliarySpace: "O(1)", semanticCategory: "Read", executionPhase: "Search", characteristics: ["Random Access"], hotspotWeight: 2 },
        size: { mutatesTarget: false, returnsValue: true, operation: OPERATIONS.COMPUTE, complexity: "O(1)", auxiliarySpace: "O(1)", semanticCategory: "Read", executionPhase: "Validation", characteristics: ["Constant Time"], hotspotWeight: 2 },
        isEmpty: { mutatesTarget: false, returnsValue: true, operation: OPERATIONS.COMPUTE, complexity: "O(1)", auxiliarySpace: "O(1)", semanticCategory: "Read", executionPhase: "Validation", characteristics: ["Constant Time"], hotspotWeight: 2 }
    }
};
