const { parseIntArrayLoose } = require("../arrays/arrayInputBuilder");

function toJavaIntArrayLiteral(values) {
  return `new int[]{${values.join(",")}}`;
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

module.exports = {
  buildLinkedList
};
