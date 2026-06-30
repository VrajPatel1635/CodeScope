const { OPERATIONS } = require("../../constants");

module.exports = {
    namespace: "java.util",
    className: "PriorityQueue",
    isInterface: false,
    structuralType: "Collection",
    implements: ["Queue"],
    methods: {
        add: { mutatesTarget: true, returnsValue: true, operation: OPERATIONS.ADD, complexity: "O(log N)", auxiliarySpace: "O(1)", semanticCategory: "Heap Insert", executionPhase: "Heapification", characteristics: ["Sift Up"], hotspotWeight: 6 },
        offer: { mutatesTarget: true, returnsValue: true, operation: OPERATIONS.OFFER, complexity: "O(log N)", auxiliarySpace: "O(1)", semanticCategory: "Heap Insert", executionPhase: "Heapification", characteristics: ["Sift Up"], hotspotWeight: 6 },
        remove: { mutatesTarget: true, returnsValue: true, operation: OPERATIONS.REMOVE, complexity: "O(log N)", auxiliarySpace: "O(1)", semanticCategory: "Heap Remove", executionPhase: "Heapification", characteristics: ["Sift Down"], hotspotWeight: 6 },
        poll: { mutatesTarget: true, returnsValue: true, operation: OPERATIONS.POLL, complexity: "O(log N)", auxiliarySpace: "O(1)", semanticCategory: "Heap Remove", executionPhase: "Heapification", characteristics: ["Sift Down"], hotspotWeight: 6 }
    }
};
