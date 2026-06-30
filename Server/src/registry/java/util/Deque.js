const { OPERATIONS } = require("../../constants");

module.exports = {
    namespace: "java.util",
    className: "Deque",
    isInterface: true,
    structuralType: "Collection",
    implements: ["Queue"],
    methods: {
        addFirst: { mutatesTarget: true, returnsValue: false, operation: OPERATIONS.ADD, complexity: "O(1)", auxiliarySpace: "O(1)", semanticCategory: "Deque Insert", executionPhase: "State Update", characteristics: ["Head Insertion"], hotspotWeight: 5 },
        addLast: { mutatesTarget: true, returnsValue: false, operation: OPERATIONS.ADD, complexity: "O(1)", auxiliarySpace: "O(1)", semanticCategory: "Deque Insert", executionPhase: "State Update", characteristics: ["Tail Insertion"], hotspotWeight: 4 },
        offerFirst: { mutatesTarget: true, returnsValue: true, operation: OPERATIONS.OFFER, complexity: "O(1)", auxiliarySpace: "O(1)", semanticCategory: "Deque Insert", executionPhase: "State Update", characteristics: ["Head Insertion"], hotspotWeight: 5 },
        offerLast: { mutatesTarget: true, returnsValue: true, operation: OPERATIONS.OFFER, complexity: "O(1)", auxiliarySpace: "O(1)", semanticCategory: "Deque Insert", executionPhase: "State Update", characteristics: ["Tail Insertion"], hotspotWeight: 4 },
        removeFirst: { mutatesTarget: true, returnsValue: true, operation: OPERATIONS.REMOVE, complexity: "O(1)", auxiliarySpace: "O(1)", semanticCategory: "Deque Remove", executionPhase: "State Update", characteristics: ["Head Removal"], hotspotWeight: 5 },
        removeLast: { mutatesTarget: true, returnsValue: true, operation: OPERATIONS.REMOVE, complexity: "O(1)", auxiliarySpace: "O(1)", semanticCategory: "Deque Remove", executionPhase: "State Update", characteristics: ["Tail Removal"], hotspotWeight: 5 },
        pollFirst: { mutatesTarget: true, returnsValue: true, operation: OPERATIONS.POLL, complexity: "O(1)", auxiliarySpace: "O(1)", semanticCategory: "Deque Remove", executionPhase: "State Update", characteristics: ["Head Removal"], hotspotWeight: 5 },
        pollLast: { mutatesTarget: true, returnsValue: true, operation: OPERATIONS.POLL, complexity: "O(1)", auxiliarySpace: "O(1)", semanticCategory: "Deque Remove", executionPhase: "State Update", characteristics: ["Tail Removal"], hotspotWeight: 5 },
        getFirst: { mutatesTarget: false, returnsValue: true, operation: OPERATIONS.COMPUTE, complexity: "O(1)", auxiliarySpace: "O(1)", semanticCategory: "Read", executionPhase: "Search", characteristics: ["Head Access"], hotspotWeight: 2 },
        getLast: { mutatesTarget: false, returnsValue: true, operation: OPERATIONS.COMPUTE, complexity: "O(1)", auxiliarySpace: "O(1)", semanticCategory: "Read", executionPhase: "Search", characteristics: ["Tail Access"], hotspotWeight: 2 },
        peekFirst: { mutatesTarget: false, returnsValue: true, operation: OPERATIONS.COMPUTE, complexity: "O(1)", auxiliarySpace: "O(1)", semanticCategory: "Read", executionPhase: "Search", characteristics: ["Head Access"], hotspotWeight: 2 },
        peekLast: { mutatesTarget: false, returnsValue: true, operation: OPERATIONS.COMPUTE, complexity: "O(1)", auxiliarySpace: "O(1)", semanticCategory: "Read", executionPhase: "Search", characteristics: ["Tail Access"], hotspotWeight: 2 },
        push: { mutatesTarget: true, returnsValue: false, operation: OPERATIONS.PUSH, complexity: "O(1)", auxiliarySpace: "O(1)", semanticCategory: "Stack Insert", executionPhase: "State Update", characteristics: ["Head Insertion", "LIFO"], hotspotWeight: 5 },
        pop: { mutatesTarget: true, returnsValue: true, operation: OPERATIONS.POP, complexity: "O(1)", auxiliarySpace: "O(1)", semanticCategory: "Stack Remove", executionPhase: "State Update", characteristics: ["Head Removal", "LIFO"], hotspotWeight: 5 }
    }
};
