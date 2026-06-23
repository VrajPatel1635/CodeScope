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
      "public int[] solve(int[] nums)",
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
        Number: "LeetCode 238",
        name: "Product of Array Except Self",
        input: "[1, 2, 3, 4]",
        code: `class Solution {
    public int[] solve(int[] nums) {
        int n = nums.length;
        int[] answer = new int[n];

        answer[0] = 1;

        for (int i = 1; i < n; i++) {
            answer[i] = answer[i - 1] * nums[i - 1];
        }

        int rightProduct = 1;

        for (int i = n - 1; i >= 0; i--) {
            answer[i] = answer[i] * rightProduct;
            rightProduct *= nums[i];
        }

        return answer;
    }
}`,
        reason: "Demonstrates prefix and suffix product accumulation using a single output array."
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
    videoUrl: "https://youtu.be/ILg9t7ed3Ro"
  },
  "matrices": {
    name: "Matrices",
    description: "2D contiguous allocations representing grid-based states. Highly optimized for pathfinding and dynamic programming state representations.",
    signatures: [
      "public List<Integer> solve(int[][] matrix)",
      "public void traverse(int[][] grid)",
      "public int path(char[][] board)"
    ],
    formats: ["Nested JSON Arrays: [[1,2], [3,4]]"],
    unsupported: ["3D tensor representations", "Non-rectangular (jagged) matrices"],
    examples: [
      {
        Number: "LeetCode 54",
        name: "Spiral Matrix",
        input: "[[1, 2, 3], [4, 5, 6], [7, 8, 9]]",
        code: `import java.util.*;

class Solution {
    public List<Integer> solve(int[][] matrix) {
        List<Integer> result = new ArrayList<>();

        int top = 0;
        int bottom = matrix.length - 1;
        int left = 0;
        int right = matrix[0].length - 1;

        while (top <= bottom && left <= right) {

            for (int col = left; col <= right; col++) {
                result.add(matrix[top][col]);
            }
            top++;

            for (int row = top; row <= bottom; row++) {
                result.add(matrix[row][right]);
            }
            right--;

            if (top <= bottom) {
                for (int col = right; col >= left; col--) {
                    result.add(matrix[bottom][col]);
                }
                bottom--;
            }

            if (left <= right) {
                for (int row = bottom; row >= top; row--) {
                    result.add(matrix[row][left]);
                }
                left++;
            }
        }

        return result;
    }
}`,
        reason: "Demonstrates complex 2D boundary management and layered boundary shrinking."
      }
    ],
    diagnostics: [{ scenario: "Row Length Mismatch", why: "Jagged inputs passed to strict 2D array parameter.", fix: "Ensure uniform row lengths." }],
    videoUrl: "https://youtu.be/37pO2vjz6LE"
  },
  "strings": {
    name: "Strings",
    description: "Immutable character sequences mapped as arrays in visual memory for granular character-by-character mutation tracking.",
    signatures: [
      "public String solve(String s)",
      "public void analyze(String s)",
      "public String manipulate(String s, String t)"
    ],
    formats: ["Standard JSON String: \"hello\"", "Raw String: hello"],
    unsupported: ["Enormous strings exceeding 1MB.", "Complex Unicode/Emoji composites might skew cell width."],
    examples: [
      {
        Number: "LeetCode 394",
        name: "Decode String",
        input: "\"3[a2[c]]\"",
        code: `import java.util.*;

class Solution {
    public String solve(String s) {
        Stack<Integer> countStack = new Stack<>();
        Stack<String> stringStack = new Stack<>();

        String currentString = "";
        int currentNumber = 0;

        for (char ch : s.toCharArray()) {

            if (Character.isDigit(ch)) {
                currentNumber = currentNumber * 10 + (ch - '0');
            }

            else if (ch == '[') {
                countStack.push(currentNumber);
                stringStack.push(currentString);

                currentNumber = 0;
                currentString = "";
            }

            else if (ch == ']') {
                int repeat = countStack.pop();
                String previous = stringStack.pop();

                StringBuilder temp = new StringBuilder(previous);

                for (int i = 0; i < repeat; i++) {
                    temp.append(currentString);
                }

                currentString = temp.toString();
            }

            else {
                currentString += ch;
            }
        }

        return currentString;
    }
}`,
        reason: "Demonstrates using two stacks to track nested character expansions and visual state management."
      }
    ],
    diagnostics: [{ scenario: "Encoding Error", why: "Invalid character encoding in input JSON.", fix: "Ensure standard UTF-8 formatting." }],
    videoUrl: "https://youtu.be/-HwbIWasC6A"
  },
  "linked-lists": {
    name: "Linked Lists",
    description: "Dynamically allocated nodes connected via pointer references. Layout engine auto-resolves cyclical graphs and detached sub-lists.",
    signatures: [
      "public ListNode solve(ListNode head, int k)",
      "public void reverse(ListNode head)",
      "public ListNode merge(ListNode l1, ListNode l2)"
    ],
    formats: ["JSON Array mapping to Nodes: [1, 2, 3]"],
    unsupported: ["Complex graph-like cross linkages inside standard list rendering.", "Doubly-linked lists (defaults to graph rendering)."],
    examples: [
      {
        Number: "LeetCode 25",
        name: "Reverse Nodes in k-Group",
        input: "[[1, 2, 3, 4, 5], 2]",
        code: `class Solution {
    public ListNode solve(ListNode head, int k) {
        ListNode dummy = new ListNode(0);
        dummy.next = head;

        ListNode groupPrev = dummy;

        while (true) {
            ListNode kth = getKthNode(groupPrev, k);

            if (kth == null) {
                break;
            }

            ListNode groupNext = kth.next;

            ListNode prev = groupNext;
            ListNode curr = groupPrev.next;

            while (curr != groupNext) {
                ListNode temp = curr.next;
                curr.next = prev;
                prev = curr;
                curr = temp;
            }

            ListNode temp = groupPrev.next;

            groupPrev.next = kth;
            groupPrev = temp;
        }

        return dummy.next;
    }

    private ListNode getKthNode(ListNode node, int k) {
        while (node != null && k > 0) {
            node = node.next;
            k--;
        }

        return node;
    }
}`,
        reason: "Complex multi-pointer manipulation perfect for visualizing detached sub-list resolution and reattachment."
      }
    ],
    diagnostics: [{ scenario: "Cyclic Dependency", why: "Infinite loop detected during traversal.", fix: "Ensure cycle detection if cycle is intended, or fix pointer mutation." }],
    videoUrl: "https://youtu.be/NYFNAcBzkbQ"
  },
  "trees": {
    name: "Trees",
    description: "Hierarchical memory structures rendered via physics-based directed graphs, strictly constrained to downward branch flow.",
    signatures: [
      "public TreeNode solve(TreeNode root)",
      "public void traverse(TreeNode root)",
      "public TreeNode invert(TreeNode root)"
    ],
    formats: ["Level-order JSON Array: [1, 2, 3, null, 4]"],
    unsupported: ["N-ary trees with extreme branching factors (>10)."],
    examples: [
      {
        Number: "LeetCode 297",
        name: "Serialize and Deserialize Binary Tree",
        input: "[1, 2, 3, null, null, 4, 5]",
        code: `class Solution {

    private int index;

    public TreeNode solve(TreeNode root) {
        String serialized = serialize(root);

        index = 0;
        String[] values = serialized.split(",");

        return deserialize(values);
    }

    private String serialize(TreeNode root) {
        StringBuilder sb = new StringBuilder();

        buildString(root, sb);

        return sb.toString();
    }

    private void buildString(TreeNode node, StringBuilder sb) {

        if (node == null) {
            sb.append("null,");
            return;
        }

        sb.append(node.val).append(",");

        buildString(node.left, sb);
        buildString(node.right, sb);
    }

    private TreeNode deserialize(String[] values) {

        if (values[index].equals("null")) {
            index++;
            return null;
        }

        TreeNode node = new TreeNode(Integer.parseInt(values[index]));
        index++;

        node.left = deserialize(values);
        node.right = deserialize(values);

        return node;
    }
}`,
        reason: "Visualizes the complete lifecycle of converting a tree to a string and rebuilding it via recursive preorder traversal."
      }
    ],
    diagnostics: [{ scenario: "Malformed Level-Order", why: "Input array does not map to a valid binary tree structure.", fix: "Ensure null padding is correct for missing nodes." }],
    videoUrl: "https://youtu.be/dOXifzbu9CI"
  },
  "graphs": {
    name: "Graphs",
    description: "Unconstrained directional or bi-directional node networks rendered using force-directed geometric simulations.",
    signatures: [
      "public int[] solve(int numCourses, int[][] prerequisites)",
      "public void search(Node node)",
      "public List<Integer> traverse(int[][] edges)"
    ],
    formats: ["Adjacency List (JSON Object): {\"1\": [2,3]}", "Edge List: [[1,2], [2,3]]"],
    unsupported: ["Massive graphs (>500 nodes) due to physics simulation constraints.", "Disconnected multigraphs."],
    examples: [
      {
        Number: "LeetCode 210",
        name: "Course Schedule II",
        input: `[
  4,
  [
    [1, 0],
    [2, 0],
    [3, 1],
    [3, 2]
  ]
]`,
        code: `import java.util.*;

class Solution {
    public int[] solve(int numCourses, int[][] prerequisites) {

        List<List<Integer>> graph = new ArrayList<>();

        for (int i = 0; i < numCourses; i++) {
            graph.add(new ArrayList<>());
        }

        int[] indegree = new int[numCourses];

        for (int[] prerequisite : prerequisites) {
            int course = prerequisite[0];
            int prereq = prerequisite[1];

            graph.get(prereq).add(course);
            indegree[course]++;
        }

        Queue<Integer> queue = new LinkedList<>();

        for (int i = 0; i < numCourses; i++) {
            if (indegree[i] == 0) {
                queue.offer(i);
            }
        }

        int[] order = new int[numCourses];
        int index = 0;

        while (!queue.isEmpty()) {

            int current = queue.poll();

            order[index++] = current;

            for (int neighbor : graph.get(current)) {

                indegree[neighbor]--;

                if (indegree[neighbor] == 0) {
                    queue.offer(neighbor);
                }
            }
        }

        if (index != numCourses) {
            return new int[0];
        }

        return order;
    }
}`,
        reason: "Demonstrates topological sorting using Kahn's algorithm, tracking indegrees and cycle detection."
      }
    ],
    diagnostics: [{ scenario: "Disconnected Component", why: "Orphaned nodes detected without incoming/outgoing edges.", fix: "Verify edge definitions." }],
    videoUrl: "https://youtu.be/KuZHuVigbrM"
  },
  "stack": {
    name: "Stack",
    description: "LIFO (Last-In-First-Out) collections rendered as vertical silos to visually emphasize push and pop mechanics.",
    signatures: ["public int solve(int[] heights)"],
    formats: ["JSON Array representing bottom-to-top: [1,2,3]"],
    unsupported: ["Concurrent multi-stack overlaps in a single view."],
    examples: [
      {
        Number: "LeetCode 84",
        name: "Largest Rectangle in Histogram",
        input: "[2,1,5,6,2,3]",
        code: `import java.util.*;

class Solution {
    public int solve(int[] heights) {
        Stack<Integer> stack = new Stack<>();
        int maxArea = 0;
        int n = heights.length;

        for (int i = 0; i <= n; i++) {

            int currentHeight = (i == n) ? 0 : heights[i];

            while (!stack.isEmpty()
                    && currentHeight < heights[stack.peek()]) {

                int height = heights[stack.pop()];

                int width;

                if (stack.isEmpty()) {
                    width = i;
                } else {
                    width = i - stack.peek() - 1;
                }

                maxArea = Math.max(maxArea, height * width);
            }

            stack.push(i);
        }

        return maxArea;
    }
}`,
        reason: "Demonstrates the use of a monotonic stack to efficiently calculate boundaries, showcasing continuous pushes and cascading pop mechanics during constraint resolution."
      }
    ],
    diagnostics: [{ scenario: "EmptyPop", why: "Attempted to pop from a size-0 stack.", fix: "Implement isEmpty checks." }],
    videoUrl: "https://youtu.be/r3kSGORitdk"
  },
  "queue": {
    name: "Queue",
    description: "FIFO (First-In-First-Out) pipelines rendered horizontally to illustrate enqueue/dequeue lifecycle constraints.",
    signatures: ["public String solve(String senate)"],
    formats: ["JSON Array representing front-to-back: [1,2,3]"],
    unsupported: ["Priority inversion inside standard queues (use Priority Queue instead)."],
    examples: [
      {
        Number: "LeetCode 649",
        name: "Dota2 Senate",
        input: "\"RRD\"",
        code: `import java.util.*;

class Solution {
    public String solve(String senate) {

        Queue<Integer> radiant = new LinkedList<>();
        Queue<Integer> dire = new LinkedList<>();

        int n = senate.length();

        for (int i = 0; i < n; i++) {

            if (senate.charAt(i) == 'R') {
                radiant.offer(i);
            } else {
                dire.offer(i);
            }
        }

        while (!radiant.isEmpty() && !dire.isEmpty()) {

            int r = radiant.poll();
            int d = dire.poll();

            if (r < d) {
                radiant.offer(r + n);
            } else {
                dire.offer(d + n);
            }
        }

        return radiant.isEmpty() ? "Dire" : "Radiant";
    }
}`,
        reason: "Demonstrates using multiple queues to simulate a cyclic elimination process, visually emphasizing simultaneous polling and delayed enqueue mechanics."
      }
    ],
    diagnostics: [{ scenario: "EmptyDequeue", why: "Attempted to dequeue from a size-0 queue.", fix: "Implement isEmpty checks." }],
    videoUrl: "https://youtu.be/WOecx4nFIso"
  },
  "priority-queue": {
    name: "Priority Queue",
    description: "Heap-backed dynamic collections mapping logical array structures to visual binary tree hierarchies.",
    signatures: ["public double solve(int[] nums)"],
    formats: ["JSON Array: [1,2,3]"],
    unsupported: ["Custom complex object comparators without `toString` overrides."],
    examples: [
      {
        Number: "LeetCode 295",
        name: "Find Median from Data Stream",
        input: "[5, 15, 1, 3]",
        code: `import java.util.*;

class Solution {
    public double solve(int[] nums) {

        PriorityQueue<Integer> lower =
                new PriorityQueue<>(Collections.reverseOrder());

        PriorityQueue<Integer> upper =
                new PriorityQueue<>();

        double median = 0;

        for (int num : nums) {

            lower.offer(num);

            upper.offer(lower.poll());

            if (upper.size() > lower.size()) {
                lower.offer(upper.poll());
            }

            if (lower.size() == upper.size()) {
                median = (lower.peek() + upper.peek()) / 2.0;
            } else {
                median = lower.peek();
            }
        }

        return median;
    }
}`,
        reason: "Demonstrates the interaction between a min-heap and a max-heap to dynamically balance data streams, visually highlighting comparative bubbling and sinking across two distinct trees."
      }
    ],
    diagnostics: [{ scenario: "Comparator Error", why: "Failed to order objects.", fix: "Ensure objects implement Comparable." }],
    videoUrl: "https://youtu.be/8GPMdtA24nE"
  },
  "hashmap": {
    name: "HashMap",
    description: "Key-value binding registries simulating bucket allocation and collision resolution algorithms.",
    signatures: ["public int solve(int[] nums, int k)"],
    formats: ["JSON Object: {\"key\": 1}"],
    unsupported: ["Extreme collision scenarios (>50 items in one bucket)."],
    examples: [
      {
        Number: "LeetCode 560",
        name: "Subarray Sum Equals K",
        input: "[[1, 2, 1, 2, 1], 3]",
        code: `import java.util.*;

class Solution {
    public int solve(int[] nums, int k) {

        HashMap<Integer, Integer> prefixCount = new HashMap<>();

        prefixCount.put(0, 1);

        int currentSum = 0;
        int count = 0;

        for (int num : nums) {

            currentSum += num;

            count += prefixCount.getOrDefault(currentSum - k, 0);

            prefixCount.put(
                currentSum,
                prefixCount.getOrDefault(currentSum, 0) + 1
            );
        }

        return count;
    }
}`,
        reason: "Illustrates dynamic bucket allocation and constant-time value lookups to track running prefix sums."
      }
    ],
    diagnostics: [{ scenario: "Hash Collision Overload", why: "Too many elements resolving to identical hash.", fix: "Ensure standard hash functions." }],
    videoUrl: "https://youtu.be/ioIIapVywuA"
  },
  "hashset": {
    name: "HashSet",
    description: "Unique item registries mapping presence to bucket allocations without associated values.",
    signatures: ["public int solve(int[] nums)"],
    formats: ["JSON Array: [1,2,3]"],
    unsupported: ["Complex nested objects as keys without proper hash implementations."],
    examples: [
      {
        Number: "LeetCode 128",
        name: "Longest Consecutive Sequence",
        input: "[100, 4, 200, 1, 3, 2]",
        code: `import java.util.*;

class Solution {
    public int solve(int[] nums) {

        HashSet<Integer> set = new HashSet<>();

        for (int num : nums) {
            set.add(num);
        }

        int longest = 0;

        for (int num : set) {

            if (!set.contains(num - 1)) {

                int current = num;
                int length = 1;

                while (set.contains(current + 1)) {
                    current++;
                    length++;
                }

                longest = Math.max(longest, length);
            }
        }

        return longest;
    }
}`,
        reason: "Shows rapid constant-time presence checks to efficiently identify sequence boundaries and build consecutive chains."
      }
    ],
    diagnostics: [{ scenario: "Unstable Hash", why: "Object mutated after being added to Set.", fix: "Use immutable objects as Set keys." }],
    videoUrl: "https://youtu.be/InOsYwH58yo"
  },
  "deque": {
    name: "Deque",
    description: "Double-ended queues allowing bidirectional mutations, rendered with distinct head/tail pointer tracking.",
    signatures: ["public int[] solve(int[] nums, int k)"],
    formats: ["JSON Array: [1,2,3]"],
    unsupported: ["Mid-queue mutations."],
    examples: [
      {
        Number: "LeetCode 239",
        name: "Sliding Window Maximum",
        input: "[[1, 3, -1, -3, 5, 3, 6, 7], 3]",
        code: `import java.util.*;

class Solution {
    public int[] solve(int[] nums, int k) {

        Deque<Integer> deque = new LinkedList<>();
        int[] result = new int[nums.length - k + 1];

        int index = 0;

        for (int i = 0; i < nums.length; i++) {

            while (!deque.isEmpty()
                    && deque.peekFirst() <= i - k) {

                deque.pollFirst();
            }

            while (!deque.isEmpty()
                    && nums[deque.peekLast()] <= nums[i]) {

                deque.pollLast();
            }

            deque.offerLast(i);

            if (i >= k - 1) {
                result[index++] = nums[deque.peekFirst()];
            }
        }

        return result;
    }
}`,
        reason: "Demonstrates bidirectional mutation capabilities of a Deque by actively polling from both ends to maintain a monotonic sliding window."
      }
    ],
    diagnostics: [{ scenario: "Bounds Error", why: "Removed from empty Deque.", fix: "Check size before polling." }],
    videoUrl: "https://youtu.be/8OPF2VX2UqE"
  }
};
