const { OPERATIONS } = require("../../constants");

module.exports = {
    namespace: "java.util",
    className: "Queue",
    isInterface: true,
    methods: {
        add: { mutatesTarget: true, returnsValue: true, operation: OPERATIONS.ADD, complexity: "O(1)", auxiliarySpace: "O(1)", semanticCategory: "Queue Insert", executionPhase: "State Update", characteristics: ["Tail Insertion"], hotspotWeight: 4 },
        offer: { mutatesTarget: true, returnsValue: true, operation: OPERATIONS.OFFER, complexity: "O(1)", auxiliarySpace: "O(1)", semanticCategory: "Queue Insert", executionPhase: "State Update", characteristics: ["Tail Insertion"], hotspotWeight: 4 },
        remove: { mutatesTarget: true, returnsValue: true, operation: OPERATIONS.REMOVE, complexity: "O(1)", auxiliarySpace: "O(1)", semanticCategory: "Queue Remove", executionPhase: "State Update", characteristics: ["Head Removal"], hotspotWeight: 4 },
        poll: { mutatesTarget: true, returnsValue: true, operation: OPERATIONS.POLL, complexity: "O(1)", auxiliarySpace: "O(1)", semanticCategory: "Queue Remove", executionPhase: "State Update", characteristics: ["Head Removal"], hotspotWeight: 4 },
        element: { mutatesTarget: false, returnsValue: true, operation: OPERATIONS.COMPUTE, complexity: "O(1)", auxiliarySpace: "O(1)", semanticCategory: "Read", executionPhase: "Search", characteristics: ["Head Access"], hotspotWeight: 2 },
        peek: { mutatesTarget: false, returnsValue: true, operation: OPERATIONS.COMPUTE, complexity: "O(1)", auxiliarySpace: "O(1)", semanticCategory: "Read", executionPhase: "Search", characteristics: ["Head Access"], hotspotWeight: 2 }
    }
};
