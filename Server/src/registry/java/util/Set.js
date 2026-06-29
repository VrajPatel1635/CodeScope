const { OPERATIONS } = require("../../constants");

module.exports = {
    namespace: "java.util",
    className: "Set",
    isInterface: true,
    methods: {
        add: { mutatesTarget: true, returnsValue: true, operation: OPERATIONS.ADD, complexity: "O(1)", auxiliarySpace: "O(1)", semanticCategory: "Insertion", executionPhase: "State Update", characteristics: ["Hash Set", "Uniqueness"], hotspotWeight: 4 },
        remove: { mutatesTarget: true, returnsValue: true, operation: OPERATIONS.REMOVE, complexity: "O(1)", auxiliarySpace: "O(1)", semanticCategory: "Removal", executionPhase: "State Update", characteristics: ["Hash Set"], hotspotWeight: 4 },
        clear: { mutatesTarget: true, returnsValue: false, operation: OPERATIONS.CLEAR, complexity: "O(N)", auxiliarySpace: "O(1)", semanticCategory: "Cleanup", executionPhase: "Cleanup", characteristics: ["Bulk Removal"], hotspotWeight: 2 },
        retainAll: { mutatesTarget: true, returnsValue: true, operation: OPERATIONS.FILTER, complexity: "O(N)", auxiliarySpace: "O(1)", semanticCategory: "Mutation", executionPhase: "Filtering", characteristics: ["Bulk Operation", "Intersection"], hotspotWeight: 5 },
        removeAll: { mutatesTarget: true, returnsValue: true, operation: OPERATIONS.FILTER, complexity: "O(N)", auxiliarySpace: "O(1)", semanticCategory: "Mutation", executionPhase: "Filtering", characteristics: ["Bulk Operation", "Difference"], hotspotWeight: 5 },
        contains: { mutatesTarget: false, returnsValue: true, operation: OPERATIONS.COMPUTE, complexity: "O(1)", auxiliarySpace: "O(1)", semanticCategory: "Read", executionPhase: "Search", characteristics: ["Hash Lookup"], hotspotWeight: 7 },
        size: { mutatesTarget: false, returnsValue: true, operation: OPERATIONS.COMPUTE, complexity: "O(1)", auxiliarySpace: "O(1)", semanticCategory: "Read", executionPhase: "Validation", characteristics: ["Constant Time"], hotspotWeight: 2 },
        isEmpty: { mutatesTarget: false, returnsValue: true, operation: OPERATIONS.COMPUTE, complexity: "O(1)", auxiliarySpace: "O(1)", semanticCategory: "Read", executionPhase: "Validation", characteristics: ["Constant Time"], hotspotWeight: 2 }
    }
};
