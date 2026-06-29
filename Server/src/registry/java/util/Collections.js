const { OPERATIONS } = require("../../constants");

module.exports = {
    namespace: "java.util",
    className: "Collections",
    isInterface: false,
    methods: {
        sort: { mutatesTarget: true, returnsValue: false, operation: OPERATIONS.SORT, complexity: "O(N log N)", auxiliarySpace: "O(log N)", semanticCategory: "Sorting", executionPhase: "Sorting", characteristics: ["In Place", "Comparison Sort"], hotspotWeight: 10 },
        reverse: { mutatesTarget: true, returnsValue: false, operation: OPERATIONS.REVERSE, complexity: "O(N)", auxiliarySpace: "O(1)", semanticCategory: "Reordering", executionPhase: "Reordering", characteristics: ["In Place", "Linear"], hotspotWeight: 5 },
        shuffle: { mutatesTarget: true, returnsValue: false, operation: OPERATIONS.SHUFFLE, complexity: "O(N)", auxiliarySpace: "O(1)", semanticCategory: "Reordering", executionPhase: "Randomization", characteristics: ["In Place", "Linear"], hotspotWeight: 5 },
        rotate: { mutatesTarget: true, returnsValue: false, operation: OPERATIONS.ROTATE, complexity: "O(N)", auxiliarySpace: "O(1)", semanticCategory: "Reordering", executionPhase: "Reordering", characteristics: ["In Place", "Linear"], hotspotWeight: 5 },
        swap: { mutatesTarget: true, returnsValue: false, operation: OPERATIONS.SWAP, complexity: "O(1)", auxiliarySpace: "O(1)", semanticCategory: "Mutation", executionPhase: "Processing", characteristics: ["In Place", "Constant Time"], hotspotWeight: 2 },
        fill: { mutatesTarget: true, returnsValue: false, operation: OPERATIONS.FILL, complexity: "O(N)", auxiliarySpace: "O(1)", semanticCategory: "Mutation", executionPhase: "Initialization", characteristics: ["In Place", "Linear"], hotspotWeight: 2 },
        copy: { mutatesTarget: true, returnsValue: false, operation: OPERATIONS.COPY, complexity: "O(N)", auxiliarySpace: "O(N)", semanticCategory: "Memory Allocation", executionPhase: "Copy", characteristics: ["Allocation", "Linear"], hotspotWeight: 5 },
        replaceAll: { mutatesTarget: true, returnsValue: true, operation: OPERATIONS.SET, complexity: "O(N)", auxiliarySpace: "O(1)", semanticCategory: "Mutation", executionPhase: "Processing", characteristics: ["In Place", "Linear"], hotspotWeight: 4 },
        frequency: { mutatesTarget: false, returnsValue: true, operation: OPERATIONS.COMPUTE, complexity: "O(N)", auxiliarySpace: "O(1)", semanticCategory: "Computation", executionPhase: "Processing", characteristics: ["Linear"], hotspotWeight: 4 },
        binarySearch: { mutatesTarget: false, returnsValue: true, operation: OPERATIONS.COMPUTE, complexity: "O(log N)", auxiliarySpace: "O(1)", semanticCategory: "Search", executionPhase: "Search", characteristics: ["Divide and Conquer"], hotspotWeight: 8 }
    }
};
