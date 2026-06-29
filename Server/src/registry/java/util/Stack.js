const { OPERATIONS } = require("../../constants");

module.exports = {
    namespace: "java.util",
    className: "Stack",
    isInterface: false,
    implements: ["List"],
    methods: {
        push: { mutatesTarget: true, returnsValue: true, operation: OPERATIONS.PUSH, complexity: "O(1)", auxiliarySpace: "O(1)", semanticCategory: "Stack Insert", executionPhase: "State Update", characteristics: ["LIFO", "Tail Insertion"], hotspotWeight: 5 },
        pop: { mutatesTarget: true, returnsValue: true, operation: OPERATIONS.POP, complexity: "O(1)", auxiliarySpace: "O(1)", semanticCategory: "Stack Remove", executionPhase: "State Update", characteristics: ["LIFO", "Tail Removal"], hotspotWeight: 5 },
        peek: { mutatesTarget: false, returnsValue: true, operation: OPERATIONS.COMPUTE, complexity: "O(1)", auxiliarySpace: "O(1)", semanticCategory: "Read", executionPhase: "Search", characteristics: ["Tail Access"], hotspotWeight: 2 },
        empty: { mutatesTarget: false, returnsValue: true, operation: OPERATIONS.COMPUTE, complexity: "O(1)", auxiliarySpace: "O(1)", semanticCategory: "Read", executionPhase: "Validation", characteristics: ["Constant Time"], hotspotWeight: 2 },
        search: { mutatesTarget: false, returnsValue: true, operation: OPERATIONS.COMPUTE, complexity: "O(N)", auxiliarySpace: "O(1)", semanticCategory: "Search", executionPhase: "Search", characteristics: ["Linear Search"], hotspotWeight: 6 }
    }
};
