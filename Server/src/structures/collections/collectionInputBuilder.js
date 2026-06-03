const { parseJsonLoose } = require("../../execution/runtime/inputUtils");
const { parseIntArrayLoose } = require("../arrays/arrayInputBuilder");

function buildIntegerList({ paramName, inputRaw }) {
  let values = [];
  try {
    values = parseIntArrayLoose(inputRaw);
  } catch (e) {
    // default to empty if parsing fails
  }
  const valsString = values.join(",");
  const decl = `java.util.List<Integer> ${paramName} = new java.util.ArrayList<>(java.util.Arrays.asList(${valsString}));`;
  return { decl, arg: paramName, initialValue: values };
}

function buildIntegerStack({ paramName, inputRaw }) {
  let values = [];
  try {
    values = parseIntArrayLoose(inputRaw);
  } catch (e) {
    // default to empty if parsing fails
  }
  const valsString = values.join(",");
  const decl = `java.util.Stack<Integer> ${paramName} = new java.util.Stack<>();\n` +
               `    for(int _v : new int[]{${valsString}}) { ${paramName}.push(_v); }`;
  return { decl, arg: paramName, initialValue: values };
}

function buildIntegerQueue({ paramName, inputRaw }) {
  let values = [];
  try {
    values = parseIntArrayLoose(inputRaw);
  } catch (e) {
  }
  const valsString = values.join(",");
  const decl = `java.util.Queue<Integer> ${paramName} = new java.util.LinkedList<>();\n` +
               `    for(int _v : new int[]{${valsString}}) { ${paramName}.offer(_v); }`;
  return { decl, arg: paramName, initialValue: values };
}

function buildIntegerDeque({ paramName, inputRaw }) {
  let values = [];
  try {
    values = parseIntArrayLoose(inputRaw);
  } catch (e) {
  }
  const valsString = values.join(",");
  const decl = `java.util.Deque<Integer> ${paramName} = new java.util.ArrayDeque<>();\n` +
               `    for(int _v : new int[]{${valsString}}) { ${paramName}.offerLast(_v); }`;
  return { decl, arg: paramName, initialValue: values };
}

function buildMap({ paramName, inputRaw }) {
  let values = {};
  try {
    values = JSON.parse(inputRaw);
    if (typeof values !== 'object' || Array.isArray(values)) {
      values = {}; // Fallback to empty map if it's not a valid object
    }
  } catch (e) {
    // Default to empty if parsing fails
  }

  let decl = `java.util.Map<Object, Object> ${paramName} = new java.util.HashMap<>();\n`;
  for (const [key, val] of Object.entries(values)) {
    // Format keys and values. Assume numbers are Integers, strings are Strings
    const formattedKey = isNaN(Number(key)) ? `"${key}"` : Number(key);
    const formattedVal = typeof val === 'string' ? `"${val}"` : val;
    decl += `    ${paramName}.put(${formattedKey}, ${formattedVal});\n`;
  }

  return { decl, arg: paramName, initialValue: values };
}

function buildSet({ paramName, inputRaw }) {
  let values = [];
  try {
    values = JSON.parse(inputRaw);
    if (!Array.isArray(values)) {
      values = [];
    }
  } catch (e) {
    // Default to empty if parsing fails
  }

  let decl = `java.util.Set<Object> ${paramName} = new java.util.HashSet<>();\n`;
  for (const v of values) {
    const formattedVal = typeof v === 'string' ? `"${v}"` : v;
    decl += `    ${paramName}.add(${formattedVal});\n`;
  }

  return { decl, arg: paramName, initialValue: values };
}

function buildPriorityQueue({ paramName, inputRaw }) {
  let values = [];
  try {
    values = JSON.parse(inputRaw);
    if (!Array.isArray(values)) {
      values = [];
    }
  } catch (e) {
    // Default to empty if parsing fails
  }

  let decl = `java.util.PriorityQueue<Object> ${paramName} = new java.util.PriorityQueue<>();\n`;
  for (const v of values) {
    const formattedVal = typeof v === 'string' ? `"${v}"` : v;
    decl += `    ${paramName}.offer(${formattedVal});\n`;
  }

  return { decl, arg: paramName, initialValue: values };
}

module.exports = {
  buildIntegerList,
  buildIntegerStack,
  buildIntegerQueue,
  buildIntegerDeque,
  buildMap,
  buildSet,
  buildPriorityQueue
};
