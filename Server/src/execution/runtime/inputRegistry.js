const { normalizeType, parseJsonLoose } = require("./inputUtils");

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

  if (wantsListNode || wantsTreeNode) {
    dsaInputParts.push(
      "  static java.util.IdentityHashMap<Object, String> nodeMap = new java.util.IdentityHashMap<>();\n" +
      "  static int nodeCount = 1;\n" +
      "  static int treeNodeCount = 1;"
    );
  }

  if (wantsListNode) {
    dsaInputParts.push(
      "  static String getNodeId(ListNode node) {\n" +
      "    if (node == null) return \"null\";\n" +
      "    if (!nodeMap.containsKey(node)) {\n" +
      "      nodeMap.put(node, \"node_\" + nodeCount++);\n" +
      "    }\n" +
      "    return nodeMap.get(node);\n" +
      "  }\n" +
      "  static String getNextId(ListNode node) {\n" +
      "    if (node == null) return \"null\";\n" +
      "    return getNodeId(node.next);\n" +
      "  }"
    );
  }

  if (wantsTreeNode) {
    dsaInputParts.push(
      "  static String getTreeNodeId(TreeNode node) {\n" +
      "    if (node == null) return \"null\";\n" +
      "    if (!nodeMap.containsKey(node)) {\n" +
      "      nodeMap.put(node, \"treeNode_\" + treeNodeCount++);\n" +
      "    }\n" +
      "    return nodeMap.get(node);\n" +
      "  }"
    );
  }

  if (wantsListNode || wantsTreeNode) {
    dsaInputParts.push(
      "  static String formatNode(Object o) {"
    );
    if (wantsListNode) {
      dsaInputParts.push("    if (o != null && o.getClass().getName().equals(\"ListNode\")) return getNodeId((ListNode)o);");
    }
    if (wantsTreeNode) {
      dsaInputParts.push("    if (o != null && o.getClass().getName().equals(\"TreeNode\")) return getTreeNodeId((TreeNode)o);");
    }
    dsaInputParts.push(
      "    return String.valueOf(o);\n" +
      "  }"
    );
  }

  if (wantsListNode) {
    dsaInputParts.push(
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
      "    getTreeNodeId(root);\n" +
      "    java.util.Queue<TreeNode> q = new java.util.ArrayDeque<>();\n" +
      "    q.add(root);\n" +
      "    int idx = 1;\n" +
      "    while (!q.isEmpty() && idx < vals.length) {\n" +
      "      TreeNode node = q.remove();\n" +
      "      if (idx < vals.length) {\n" +
      "        Integer lv = vals[idx++];\n" +
      "        if (lv != null) {\n" +
      "          node.left = new TreeNode(lv);\n" +
      "          getTreeNodeId(node.left);\n" +
      "          System.out.println(\"TRACE|TREE_LINK|parent=\" + getTreeNodeId(node) + \"|dir=left|child=\" + getTreeNodeId(node.left));\n" +
      "          q.add(node.left);\n" +
      "        }\n" +
      "      }\n" +
      "      if (idx < vals.length) {\n" +
      "        Integer rv = vals[idx++];\n" +
      "        if (rv != null) {\n" +
      "          node.right = new TreeNode(rv);\n" +
      "          getTreeNodeId(node.right);\n" +
      "          System.out.println(\"TRACE|TREE_LINK|parent=\" + getTreeNodeId(node) + \"|dir=right|child=\" + getTreeNodeId(node.right));\n" +
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

const { buildInt, buildIntArray, buildIntMatrix } = require("../../structures/arrays/arrayInputBuilder");
const { buildLinkedList } = require("../../structures/linkedlist/linkedListInputBuilder");
const { buildTree } = require("../../structures/tree/treeInputBuilder");

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

    if (idx === 0 && (p.type === "int[]" || p.type === "int[][]" || p.type === "ListNode" || p.type === "TreeNode")) {
      // Preserve existing array/matrix visualization behavior, and add linked list/tree initial state.
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
  normalizeType,
  parseJsonLoose,
  splitJavaPreamble,
  buildHelperCode,
  buildJavaInputsFromSignature
};
