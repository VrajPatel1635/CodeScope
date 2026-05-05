function normalizeType(type) {
  if (!type) return "";
  return String(type).replace(/\s+/g, "");
}

function parseJsonLoose(inputRaw) {
  if (inputRaw == null) return null;
  const text = String(inputRaw).trim();
  if (!text) return null;
  try {
    return JSON.parse(text);
  } catch {
    return null;
  }
}

function parseIntLoose(inputRaw) {
  const text = String(inputRaw ?? "").trim();
  if (!text) return 0;
  const n = Number(text);
  if (Number.isFinite(n)) return Math.trunc(n);
  throw new Error(`Invalid int input: ${text}`);
}

function parseIntArrayLoose(inputRaw) {
  const parsed = parseJsonLoose(inputRaw);
  if (Array.isArray(parsed)) {
    return parsed.map((x) => {
      if (x == null) throw new Error("int[] cannot contain null");
      const n = Number(x);
      if (!Number.isFinite(n)) throw new Error(`Invalid number in int[]: ${x}`);
      return Math.trunc(n);
    });
  }

  // Fallback: allow "1,2,3" or "[1,2,3]"-ish
  const text = String(inputRaw ?? "").trim();
  const cleaned = text.replace(/[\[\]\s]/g, "");
  if (!cleaned) return [];
  return cleaned.split(",").filter(Boolean).map((part) => {
    const n = Number(part);
    if (!Number.isFinite(n)) throw new Error(`Invalid number in int[]: ${part}`);
    return Math.trunc(n);
  });
}

function parseIntMatrixLoose(inputRaw) {
  const parsed = parseJsonLoose(inputRaw);
  if (Array.isArray(parsed)) {
    return parsed.map((row) => {
      if (!Array.isArray(row)) throw new Error("int[][] must be an array of arrays");
      return row.map((x) => {
        if (x == null) throw new Error("int[][] cannot contain null");
        const n = Number(x);
        if (!Number.isFinite(n)) throw new Error(`Invalid number in int[][]: ${x}`);
        return Math.trunc(n);
      });
    });
  }

  // No safe non-JSON fallback here; require proper [[...],[...]]
  const text = String(inputRaw ?? "").trim();
  if (!text) return [];
  throw new Error("Invalid int[][] input. Use JSON like [[1,2],[3,4]]");
}

function parseIntegerArrayLoose(inputRaw) {
  const parsed = parseJsonLoose(inputRaw);
  if (!Array.isArray(parsed)) {
    const text = String(inputRaw ?? "").trim();
    if (!text) return [];
    throw new Error("Invalid Integer[] input. Use JSON like [1,2,3,null,4]");
  }

  return parsed.map((x) => {
    if (x == null) return null;
    const n = Number(x);
    if (!Number.isFinite(n)) throw new Error(`Invalid number in Integer[]: ${x}`);
    return Math.trunc(n);
  });
}

function toJavaIntArrayLiteral(values) {
  return `new int[]{${values.join(",")}}`;
}

function toJavaIntMatrixLiteral(matrix) {
  const rows = matrix.map((row) => `{${row.join(",")}}`).join(",");
  return `new int[][]{${rows}}`;
}

function toJavaIntegerArrayLiteral(values) {
  const items = values.map((v) => (v == null ? "null" : String(v))).join(",");
  return `new Integer[]{${items}}`;
}

function splitJavaPreamble(javaCode) {
  const lines = String(javaCode ?? "").split(/\r?\n/);
  const preamble = [];
  let idx = 0;

  // package must be first if present
  if (lines[idx] && lines[idx].trim().startsWith("package ")) {
    preamble.push(lines[idx]);
    idx += 1;
  }

  // consume consecutive imports (allow blank lines in between)
  while (idx < lines.length) {
    const t = lines[idx].trim();
    if (t === "" || t.startsWith("import ")) {
      preamble.push(lines[idx]);
      idx += 1;
      continue;
    }
    break;
  }

  return {
    preamble: preamble.join("\n"),
    rest: lines.slice(idx).join("\n"),
  };
}

function needsHelper(userCode, className) {
  const re = new RegExp(`\\bclass\\s+${className}\\b`);
  return !re.test(userCode);
}

function buildHelperCode({ userCode, wantsListNode, wantsTreeNode }) {
  const parts = [];
  const needList = wantsListNode && needsHelper(userCode, "ListNode");
  const needTree = wantsTreeNode && needsHelper(userCode, "TreeNode");

  if (!wantsListNode && !wantsTreeNode) return "";

  if (needList) {
    parts.push(
      "class ListNode {\n" +
        "  int val;\n" +
        "  ListNode next;\n" +
        "  ListNode(int val) {\n" +
        "    this.val = val;\n" +
        "    this.next = null;\n" +
        "  }\n" +
      "}\n"
    );
  }

  if (needTree) {
    parts.push(
      "class TreeNode {\n" +
        "  int val;\n" +
        "  TreeNode left;\n" +
        "  TreeNode right;\n" +
        "  TreeNode() {}\n" +
        "  TreeNode(int val) { this.val = val; }\n" +
        "  TreeNode(int val, TreeNode left, TreeNode right) { this.val = val; this.left = left; this.right = right; }\n" +
      "}\n"
    );
  }

  const dsaInputParts = [];
  dsaInputParts.push("class __DSAInput {");

  if (wantsListNode) {
    dsaInputParts.push(
      "  static java.util.IdentityHashMap<ListNode, String> nodeMap = new java.util.IdentityHashMap<>();\n" +
      "  static int nodeCount = 1;\n" +
      "  static String getNodeId(ListNode node) {\n" +
      "    if (node == null) return \"null\";\n" +
      "    if (!nodeMap.containsKey(node)) {\n" +
      "      nodeMap.put(node, \"node_\" + nodeCount++);\n" +
      "    }\n" +
      "    return nodeMap.get(node);\n" +
      "  }\n" +
      "  static String formatNode(Object o) {\n" +
      "    if (o != null && o.getClass().getName().equals(\"ListNode\")) return getNodeId((ListNode)o);\n" +
      "    return String.valueOf(o);\n" +
      "  }\n\n" +
      "  static ListNode buildLinkedList(int[] vals) {\n" +
      "    if (vals == null || vals.length == 0) return null;\n" +
      "    ListNode head = new ListNode(vals[0]);\n" +
      "    getNodeId(head);\n" +
      "    ListNode cur = head;\n" +
      "    for (int i = 1; i < vals.length; i++) {\n" +
      "      cur.next = new ListNode(vals[i]);\n" +
      "      getNodeId(cur.next);\n" +
      "      System.out.println(\"TRACE|NODE_LINK|\" + getNodeId(cur) + \"|\" + getNodeId(cur.next));\n" +
      "      cur = cur.next;\n" +
      "    }\n" +
      "    return head;\n" +
      "  }"
    );
  }

  if (wantsTreeNode) {
    dsaInputParts.push(
      "  static TreeNode buildTree(Integer[] vals) {\n" +
      "    if (vals == null || vals.length == 0 || vals[0] == null) return null;\n" +
      "    TreeNode root = new TreeNode(vals[0]);\n" +
      "    java.util.Queue<TreeNode> q = new java.util.ArrayDeque<>();\n" +
      "    q.add(root);\n" +
      "    int idx = 1;\n" +
      "    while (!q.isEmpty() && idx < vals.length) {\n" +
      "      TreeNode node = q.remove();\n" +
      "      if (idx < vals.length) {\n" +
      "        Integer lv = vals[idx++];\n" +
      "        if (lv != null) {\n" +
      "          node.left = new TreeNode(lv);\n" +
      "          q.add(node.left);\n" +
      "        }\n" +
      "      }\n" +
      "      if (idx < vals.length) {\n" +
      "        Integer rv = vals[idx++];\n" +
      "        if (rv != null) {\n" +
      "          node.right = new TreeNode(rv);\n" +
      "          q.add(node.right);\n" +
      "        }\n" +
      "      }\n" +
      "    }\n" +
      "    return root;\n" +
      "  }"
    );
  }

  dsaInputParts.push("}\n");
  parts.push(dsaInputParts.join("\n\n"));

  return parts.join("\n");
}

function buildInt({ paramName, inputRaw }) {
  const value = parseIntLoose(inputRaw);
  return { decl: `int ${paramName} = ${value};`, arg: paramName, initialValue: value };
}

function buildIntArray({ paramName, inputRaw }) {
  const values = parseIntArrayLoose(inputRaw);
  return { decl: `int[] ${paramName} = ${toJavaIntArrayLiteral(values)};`, arg: paramName, initialValue: values };
}

function buildIntMatrix({ paramName, inputRaw }) {
  const values = parseIntMatrixLoose(inputRaw);
  return { decl: `int[][] ${paramName} = ${toJavaIntMatrixLiteral(values)};`, arg: paramName, initialValue: values };
}

function buildLinkedList({ paramName, inputRaw }) {
  const values = parseIntArrayLoose(inputRaw);
  const arrDecl = `int[] __vals_${paramName} = ${toJavaIntArrayLiteral(values)};`;
  const nodeDecl = `ListNode ${paramName} = __DSAInput.buildLinkedList(__vals_${paramName});`;
  
  let initialValue = null;
  if (values.length > 0) {
    const nodes = {};
    for (let i = 0; i < values.length; i++) {
      const nodeId = `node_${i + 1}`;
      const nextId = i < values.length - 1 ? `node_${i + 2}` : null;
      nodes[nodeId] = { val: values[i], next: nextId };
    }
    initialValue = {
      type: "LinkedList",
      head: "node_1",
      nodes: nodes
    };
  }

  return {
    decl: `${arrDecl}\n        ${nodeDecl}`,
    arg: paramName,
    initialValue: initialValue,
    wantsListNode: true,
  };
}

function buildTree({ paramName, inputRaw }) {
  const values = parseIntegerArrayLoose(inputRaw);
  const arrDecl = `Integer[] __vals_${paramName} = ${toJavaIntegerArrayLiteral(values)};`;
  const nodeDecl = `TreeNode ${paramName} = __DSAInput.buildTree(__vals_${paramName});`;
  return {
    decl: `${arrDecl}\n        ${nodeDecl}`,
    arg: paramName,
    initialValue: null,
    wantsTreeNode: true,
  };
}

const builders = {
  int: buildInt,
  "int[]": buildIntArray,
  "int[][]": buildIntMatrix,
  ListNode: buildLinkedList,
  TreeNode: buildTree,
};

function getBuilderForType(paramType) {
  const normalized = normalizeType(paramType);
  return builders[normalized] || null;
}

function buildJavaInputsFromSignature({ userCode, methodName, methodParams, inputRaw }) {
  const params = Array.isArray(methodParams) ? methodParams : [];
  if (params.length === 0) {
    throw new Error(`No parameters found for method ${methodName || "solve"}().`);
  }

  // If multiple params: expect JSON array of values in same order.
  let perParamInputs;
  if (params.length === 1) {
    perParamInputs = [inputRaw];
  } else {
    const parsed = parseJsonLoose(inputRaw);
    if (!Array.isArray(parsed) || parsed.length !== params.length) {
      throw new Error(`For ${params.length} parameters, input must be a JSON array of length ${params.length}.`);
    }
    perParamInputs = parsed;
  }

  const decls = [];
  const args = [];
  let initialValueForState = null;
  let wantsListNode = false;
  let wantsTreeNode = false;

  params.forEach((p, idx) => {
    const builder = getBuilderForType(p.type);
    if (!builder) {
      throw new Error(`Unsupported parameter type: ${p.type}`);
    }

    const built = builder({ paramName: p.name, inputRaw: params.length === 1 ? perParamInputs[idx] : JSON.stringify(perParamInputs[idx]) });
    decls.push(built.decl);
    args.push(built.arg);

    if (idx === 0 && (p.type === "int[]" || p.type === "int[][]" || p.type === "ListNode")) {
      // Preserve existing array/matrix visualization behavior, and add linked list initial tree.
      initialValueForState = built.initialValue;
    }

    wantsListNode = wantsListNode || Boolean(built.wantsListNode);
    wantsTreeNode = wantsTreeNode || Boolean(built.wantsTreeNode);
  });

  const helperCode = buildHelperCode({ userCode, wantsListNode, wantsTreeNode });

  return {
    declarations: decls.join("\n        "),
    argsList: args.join(", "),
    helperCode,
    initialValueForState,
  };
}

module.exports = {
  builders,
  normalizeType,
  splitJavaPreamble,
  buildJavaInputsFromSignature,
};
