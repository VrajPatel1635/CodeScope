export const DOCS_NAVIGATION = [
  {
    category: "Core Structures",
    items: [
      { name: "Arrays", slug: "arrays" },
      { name: "Matrices", slug: "matrices" },
      { name: "Strings", slug: "strings" },
      { name: "Linked Lists", slug: "linked-lists" },
      { name: "Trees", slug: "trees" },
      { name: "Graphs", slug: "graphs" },
    ],
  },
  {
    category: "Collections",
    items: [
      { name: "Stack", slug: "stack" },
      { name: "Queue", slug: "queue" },
      { name: "Priority Queue", slug: "priority-queue" },
      { name: "HashMap", slug: "hashmap" },
      { name: "HashSet", slug: "hashset" },
      { name: "Deque", slug: "deque" },
    ],
  }
];

export const DOCS_DATA_DETAILS = {
  "arrays": {
    name: "Arrays",
    description: "Contiguous memory blocks for sequential data storage. Supported fundamentally across the visualizer with built-in diffing.",
    signatures: [
      "public void solve(int[] nums)",
      "public int[] sort(int[] arr)",
      "public void process(String[] items)"
    ],
    formats: [
      "JSON Array: [1, 2, 3, 4]",
      "Comma-separated: 1, 2, 3, 4"
    ],
    unsupported: [
      "Multidimensional arrays deeper than 2D are not currently visualized.",
      "Jagged arrays might render inconsistently."
    ],
    examples: [
      {
        name: "Two Sum",
        code: "// Insert code here",
        reason: "Excellent for visualizing two-pointer traversal and state changes."
      },
      {
        name: "Bubble Sort",
        code: "// Insert code here",
        reason: "Clear demonstration of element swapping and array mutations."
      }
    ],
    diagnostics: [
      {
        scenario: "IndexOutOfBoundsException",
        why: "The code attempted to access an index outside the bounds of [0, arr.length - 1].",
        fix: "Check your loop bounds and pointer logic."
      },
      {
        scenario: "NullPointerException",
        why: "The array parameter was passed as null instead of an empty array [].",
        fix: "Ensure your input JSON provides an actual array structure."
      }
    ],
    videoUrl: ""
  },
  "matrices": {
    name: "Matrices",
    description: "2D contiguous allocations representing grid-based states. Highly optimized for pathfinding and dynamic programming state representations.",
    signatures: ["public void traverse(int[][] grid)", "public int path(char[][] board)"],
    formats: ["Nested JSON Arrays: [[1,2], [3,4]]"],
    unsupported: ["3D tensor representations", "Non-rectangular (jagged) matrices"],
    examples: [{ name: "Grid Traversal", code: "// Insert code here", reason: "Demonstrates 2D state changes during graph traversal." }],
    diagnostics: [{ scenario: "Row Length Mismatch", why: "Jagged inputs passed to strict 2D array parameter.", fix: "Ensure uniform row lengths." }],
    videoUrl: ""
  },
  "strings": {
    name: "Strings",
    description: "Immutable character sequences mapped as arrays in visual memory for granular character-by-character mutation tracking.",
    signatures: ["public void analyze(String s)", "public String manipulate(String s, String t)"],
    formats: ["Standard JSON String: \"hello\"", "Raw String: hello"],
    unsupported: ["Enormous strings exceeding 1MB.", "Complex Unicode/Emoji composites might skew cell width."],
    examples: [{ name: "Sliding Window", code: "// Insert code here", reason: "Visualizes substring window boundaries shifting across characters." }],
    diagnostics: [{ scenario: "Encoding Error", why: "Invalid character encoding in input JSON.", fix: "Ensure standard UTF-8 formatting." }],
    videoUrl: ""
  },
  "linked-lists": {
    name: "Linked Lists",
    description: "Dynamically allocated nodes connected via pointer references. Layout engine auto-resolves cyclical graphs and detached sub-lists.",
    signatures: ["public void reverse(ListNode head)", "public ListNode merge(ListNode l1, ListNode l2)"],
    formats: ["JSON Array mapping to Nodes: [1, 2, 3]"],
    unsupported: ["Complex graph-like cross linkages inside standard list rendering.", "Doubly-linked lists (defaults to graph rendering)."],
    examples: [{ name: "List Reversal", code: "// Insert code here", reason: "Tracks pointer mutation dynamically frame-by-frame." }],
    diagnostics: [{ scenario: "Cyclic Dependency", why: "Infinite loop detected during traversal.", fix: "Ensure cycle detection if cycle is intended, or fix pointer mutation." }],
    videoUrl: ""
  },
  "trees": {
    name: "Trees",
    description: "Hierarchical memory structures rendered via physics-based directed graphs, strictly constrained to downward branch flow.",
    signatures: ["public void traverse(TreeNode root)", "public TreeNode invert(TreeNode root)"],
    formats: ["Level-order JSON Array: [1, 2, 3, null, 4]"],
    unsupported: ["N-ary trees with extreme branching factors (>10)."],
    examples: [{ name: "Tree Inversion", code: "// Insert code here", reason: "Shows recursive state shifts and subtree swaps." }],
    diagnostics: [{ scenario: "Malformed Level-Order", why: "Input array does not map to a valid binary tree structure.", fix: "Ensure null padding is correct for missing nodes." }],
    videoUrl: ""
  },
  "graphs": {
    name: "Graphs",
    description: "Unconstrained directional or bi-directional node networks rendered using force-directed geometric simulations.",
    signatures: ["public void search(Node node)", "public List<Integer> traverse(int[][] edges)"],
    formats: ["Adjacency List (JSON Object): {\"1\": [2,3]}", "Edge List: [[1,2], [2,3]]"],
    unsupported: ["Massive graphs (>500 nodes) due to physics simulation constraints.", "Disconnected multigraphs."],
    examples: [{ name: "Dijkstra Traversal", code: "// Insert code here", reason: "Visualizes active frontiers and path weight resolution." }],
    diagnostics: [{ scenario: "Disconnected Component", why: "Orphaned nodes detected without incoming/outgoing edges.", fix: "Verify edge definitions." }],
    videoUrl: ""
  },
  "stack": {
    name: "Stack",
    description: "LIFO (Last-In-First-Out) collections rendered as vertical silos to visually emphasize push and pop mechanics.",
    signatures: ["public void process(Stack<Integer> s)"],
    formats: ["JSON Array representing bottom-to-top: [1,2,3]"],
    unsupported: ["Concurrent multi-stack overlaps in a single view."],
    examples: [{ name: "Monotonic Stack", code: "// Insert code here", reason: "Demonstrates pop cascades during constraint resolution." }],
    diagnostics: [{ scenario: "EmptyPop", why: "Attempted to pop from a size-0 stack.", fix: "Implement isEmpty checks." }],
    videoUrl: ""
  },
  "queue": {
    name: "Queue",
    description: "FIFO (First-In-First-Out) pipelines rendered horizontally to illustrate enqueue/dequeue lifecycle constraints.",
    signatures: ["public void simulate(Queue<String> q)"],
    formats: ["JSON Array representing front-to-back: [1,2,3]"],
    unsupported: ["Priority inversion inside standard queues (use Priority Queue instead)."],
    examples: [{ name: "BFS Traversal", code: "// Insert code here", reason: "Perfect for showing frontier expansion in graph searches." }],
    diagnostics: [{ scenario: "EmptyDequeue", why: "Attempted to dequeue from a size-0 queue.", fix: "Implement isEmpty checks." }],
    videoUrl: ""
  },
  "priority-queue": {
    name: "Priority Queue",
    description: "Heap-backed dynamic collections mapping logical array structures to visual binary tree hierarchies.",
    signatures: ["public void execute(PriorityQueue<Integer> pq)"],
    formats: ["JSON Array: [1,2,3]"],
    unsupported: ["Custom complex object comparators without `toString` overrides."],
    examples: [{ name: "Heapify", code: "// Insert code here", reason: "Shows internal bubbling and sinking logic." }],
    diagnostics: [{ scenario: "Comparator Error", why: "Failed to order objects.", fix: "Ensure objects implement Comparable." }],
    videoUrl: ""
  },
  "hashmap": {
    name: "HashMap",
    description: "Key-value binding registries simulating bucket allocation and collision resolution algorithms.",
    signatures: ["public void map(HashMap<String, Integer> map)"],
    formats: ["JSON Object: {\"key\": 1}"],
    unsupported: ["Extreme collision scenarios (>50 items in one bucket)."],
    examples: [{ name: "Frequency Map", code: "// Insert code here", reason: "Illustrates bucket creation and value updates." }],
    diagnostics: [{ scenario: "Hash Collision Overload", why: "Too many elements resolving to identical hash.", fix: "Ensure standard hash functions." }],
    videoUrl: ""
  },
  "hashset": {
    name: "HashSet",
    description: "Unique item registries mapping presence to bucket allocations without associated values.",
    signatures: ["public void filter(HashSet<Integer> set)"],
    formats: ["JSON Array: [1,2,3]"],
    unsupported: ["Complex nested objects as keys without proper hash implementations."],
    examples: [{ name: "Deduplication", code: "// Insert code here", reason: "Shows rapid constant-time presence checks." }],
    diagnostics: [{ scenario: "Unstable Hash", why: "Object mutated after being added to Set.", fix: "Use immutable objects as Set keys." }],
    videoUrl: ""
  },
  "deque": {
    name: "Deque",
    description: "Double-ended queues allowing bidirectional mutations, rendered with distinct head/tail pointer tracking.",
    signatures: ["public void slide(Deque<Integer> dq)"],
    formats: ["JSON Array: [1,2,3]"],
    unsupported: ["Mid-queue mutations."],
    examples: [{ name: "Sliding Window Maximum", code: "// Insert code here", reason: "Demonstrates rapid front/back culling." }],
    diagnostics: [{ scenario: "Bounds Error", why: "Removed from empty Deque.", fix: "Check size before polling." }],
    videoUrl: ""
  }
};
