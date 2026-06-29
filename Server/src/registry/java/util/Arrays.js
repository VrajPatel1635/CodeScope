const { OPERATIONS } = require("../../constants");

module.exports = {
    namespace: "java.util",
    className: "Arrays",
    isInterface: false,
    methods: {
        sort: { mutatesTarget: true, returnsValue: false, operation: OPERATIONS.SORT, complexity: "O(N log N)", auxiliarySpace: "O(log N)", semanticCategory: "Sorting", executionPhase: "Sorting", characteristics: ["In Place", "Comparison Sort"], hotspotWeight: 10 },
        parallelSort: { mutatesTarget: true, returnsValue: false, operation: OPERATIONS.SORT, complexity: "O(N log N)", auxiliarySpace: "O(log N)", semanticCategory: "Sorting", executionPhase: "Sorting", characteristics: ["In Place", "Comparison Sort"], hotspotWeight: 10 },
        fill: { mutatesTarget: true, returnsValue: false, operation: OPERATIONS.FILL, complexity: "O(N)", auxiliarySpace: "O(1)", semanticCategory: "Array Mutation", executionPhase: "Initialization", characteristics: ["In Place"], hotspotWeight: 2 },
        setAll: { mutatesTarget: true, returnsValue: false, operation: OPERATIONS.FILL, complexity: "O(N)", auxiliarySpace: "O(1)", semanticCategory: "Array Mutation", executionPhase: "Initialization", characteristics: ["In Place"], hotspotWeight: 2 },
        parallelSetAll: { mutatesTarget: true, returnsValue: false, operation: OPERATIONS.FILL, complexity: "O(N)", auxiliarySpace: "O(1)", semanticCategory: "Array Mutation", executionPhase: "Initialization", characteristics: ["In Place"], hotspotWeight: 2 },
        copyOf: { mutatesTarget: false, returnsValue: true, operation: OPERATIONS.COPY, complexity: "O(N)", auxiliarySpace: "O(N)", semanticCategory: "Memory Allocation", executionPhase: "Copy", characteristics: ["Allocation"], hotspotWeight: 5 },
        copyOfRange: { mutatesTarget: false, returnsValue: true, operation: OPERATIONS.COPY, complexity: "O(N)", auxiliarySpace: "O(N)", semanticCategory: "Memory Allocation", executionPhase: "Copy", characteristics: ["Allocation"], hotspotWeight: 5 },
        equals: { mutatesTarget: false, returnsValue: true, operation: OPERATIONS.COMPUTE, complexity: "O(N)", auxiliarySpace: "O(1)", semanticCategory: "Comparison", executionPhase: "Validation", characteristics: ["Single Pass"], hotspotWeight: 3 },
        binarySearch: { mutatesTarget: false, returnsValue: true, operation: OPERATIONS.COMPUTE, complexity: "O(log N)", auxiliarySpace: "O(1)", semanticCategory: "Search", executionPhase: "Search", characteristics: ["Divide and Conquer"], hotspotWeight: 8 }
    }
};
