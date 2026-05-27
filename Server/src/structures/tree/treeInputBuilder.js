const { parseJsonLoose } = require("../../execution/runtime/inputUtils");

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

function toJavaIntegerArrayLiteral(values) {
  const items = values.map((v) => (v == null ? "null" : String(v))).join(",");
  return `new Integer[]{${items}}`;
}

function buildTree({ paramName, inputRaw }) {
  const values = parseIntegerArrayLoose(inputRaw);
  const arrDecl = `Integer[] __vals_${paramName} = ${toJavaIntegerArrayLiteral(values)};`;
  const nodeDecl = `TreeNode ${paramName} = __DSAInput.buildTree(__vals_${paramName});`;

  let initialValue = null;
  if (values.length > 0 && values[0] !== null) {
    const nodes = {};
    let idCounter = 1;
    const rootId = `treeNode_${idCounter++}`;
    nodes[rootId] = { val: values[0], left: null, right: null };
    
    let q = [rootId];
    let idx = 1;
    while (q.length > 0 && idx < values.length) {
       let currId = q.shift();
       if (idx < values.length) {
          let lv = values[idx++];
          if (lv !== null) {
              let childId = `treeNode_${idCounter++}`;
              nodes[childId] = { val: lv, left: null, right: null };
              nodes[currId].left = childId;
              q.push(childId);
          }
       }
       if (idx < values.length) {
          let rv = values[idx++];
          if (rv !== null) {
              let childId = `treeNode_${idCounter++}`;
              nodes[childId] = { val: rv, left: null, right: null };
              nodes[currId].right = childId;
              q.push(childId);
          }
       }
    }
    initialValue = {
        type: "Tree",
        root: rootId,
        nodes: nodes
    };
  }

  return {
    decl: `${arrDecl}\n        ${nodeDecl}`,
    arg: paramName,
    initialValue: initialValue,
    wantsTreeNode: true,
  };
}

module.exports = {
  buildTree
};
