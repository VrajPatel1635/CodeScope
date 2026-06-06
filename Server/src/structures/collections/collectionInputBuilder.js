const { parseJsonLoose } = require("../../execution/runtime/inputUtils");
const { 
  parseNumericArrayLoose, 
  parseStringArrayLoose, 
  parseBooleanArrayLoose, 
  parseCharArrayLoose 
} = require("../arrays/arrayInputBuilder");

function getParserForType(type) {
  switch (type) {
    case "Integer":
    case "Long":
    case "Double":
    case "Float":
      return parseNumericArrayLoose;
    case "String":
      return parseStringArrayLoose;
    case "Boolean":
      return parseBooleanArrayLoose;
    case "Character":
      return parseCharArrayLoose;
    default:
      return parseNumericArrayLoose;
  }
}

function formatJavaValue(val, type) {
  if (type === "Integer") return String(Math.trunc(val));
  if (type === "Long") return `${val}L`;
  if (type === "Float") return `${val}f`;
  if (type === "Double") return String(val);
  if (type === "Boolean") return String(val);
  if (type === "String") {
    const escaped = String(val).replace(/\\/g, "\\\\").replace(/"/g, '\\"').replace(/\n/g, "\\n").replace(/\r/g, "\\r");
    return `"${escaped}"`;
  }
  if (type === "Character") {
     const escaped = String(val).replace(/\\/g, "\\\\").replace(/'/g, "\\'").replace(/\n/g, "\\n").replace(/\r/g, "\\r").replace(/\t/g, "\\t");
     return `'${escaped}'`;
  }
  return String(val);
}

function buildGenericCollection(collectionType, elementType, { paramName, inputRaw }) {
  const parser = getParserForType(elementType);
  let values = [];
  try {
    values = parser(inputRaw);
  } catch (e) {
  }
  
  const formattedVals = values.map(v => formatJavaValue(v, elementType)).join(",");
  let decl = "";
  let baseClass = collectionType;
  if (collectionType === "List") baseClass = "ArrayList";
  if (collectionType === "Queue") baseClass = "LinkedList";
  if (collectionType === "Deque") baseClass = "ArrayDeque";
  if (collectionType === "Set") baseClass = "HashSet";

  if (values.length === 0) {
    decl = `java.util.${collectionType}<${elementType}> ${paramName} = new java.util.${baseClass}<>();`;
  } else if (["List", "ArrayList", "Set", "HashSet", "PriorityQueue"].includes(collectionType)) {
    decl = `java.util.${collectionType}<${elementType}> ${paramName} = new java.util.${baseClass}<>(java.util.Arrays.asList(${formattedVals}));`;
  } else {
    decl = `java.util.${collectionType}<${elementType}> ${paramName} = new java.util.${baseClass}<>();\n` +
           `    ${paramName}.addAll(java.util.Arrays.asList(${formattedVals}));`;
  }
  return { decl, arg: paramName, initialValue: values };
}

function buildGenericMap(mapType, keyType, valueType, { paramName, inputRaw }) {
  let values = {};
  try {
    values = JSON.parse(inputRaw);
    if (typeof values !== 'object' || Array.isArray(values)) {
      values = {};
    }
  } catch (e) {
  }

  let baseClass = mapType;
  if (mapType === "Map") baseClass = "HashMap";

  let decl = `java.util.${mapType}<${keyType}, ${valueType}> ${paramName} = new java.util.${baseClass}<>();\n`;
  for (const [key, val] of Object.entries(values)) {
    // Some keys like numbers might come as strings from Object.entries. 
    // formatJavaValue takes the value. If keyType is Integer, we should parse it to a number first.
    let parsedKey = key;
    if (["Integer", "Long", "Float", "Double"].includes(keyType)) {
      parsedKey = Number(key);
    }
    const formattedKey = formatJavaValue(parsedKey, keyType);
    const formattedVal = formatJavaValue(val, valueType);
    decl += `    ${paramName}.put(${formattedKey}, ${formattedVal});\n`;
  }

  return { decl, arg: paramName, initialValue: values };
}

module.exports = {
  buildGenericCollection,
  buildGenericMap
};
