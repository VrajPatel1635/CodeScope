const { parseJsonLoose } = require("../../execution/runtime/inputUtils");

function parseNumericLoose(inputRaw) {
  const text = String(inputRaw ?? "").trim();
  if (!text) return 0;
  const n = Number(text);
  if (Number.isFinite(n)) return n;
  throw new Error(`Invalid numeric input: ${text}`);
}

function parseNumericArrayLoose(inputRaw) {
  const parsed = parseJsonLoose(inputRaw);
  if (Array.isArray(parsed)) {
    return parsed.map((x) => {
      if (x == null) throw new Error("Array cannot contain null");
      const n = Number(x);
      if (!Number.isFinite(n)) throw new Error(`Invalid number in array: ${x}`);
      return n;
    });
  }

  // Fallback: allow "1.5, 2.5" or "[1.5, 2.5]"-ish
  const text = String(inputRaw ?? "").trim();
  const cleaned = text.replace(/[\[\]\s]/g, "");
  if (!cleaned) return [];
  return cleaned.split(",").filter(Boolean).map((part) => {
    const n = Number(part);
    if (!Number.isFinite(n)) throw new Error(`Invalid number in array: ${part}`);
    return n;
  });
}

function parseNumericMatrixLoose(inputRaw) {
  const parsed = parseJsonLoose(inputRaw);
  if (Array.isArray(parsed)) {
    return parsed.map((row) => {
      if (!Array.isArray(row)) throw new Error("Matrix must be an array of arrays");
      return row.map((x) => {
        if (x == null) throw new Error("Matrix cannot contain null");
        const n = Number(x);
        if (!Number.isFinite(n)) throw new Error(`Invalid number in matrix: ${x}`);
        return n;
      });
    });
  }

  const text = String(inputRaw ?? "").trim();
  if (!text) return [];
  throw new Error("Invalid matrix input. Use JSON like [[1.5,2.5],[3.5,4.5]]");
}

function parseStringArrayLoose(inputRaw) {
  const parsed = parseJsonLoose(inputRaw);
  if (Array.isArray(parsed)) {
    return parsed.map(x => String(x ?? ""));
  }
  
  const text = String(inputRaw ?? "").trim();
  const cleaned = text.replace(/^[\[\]]+|[\[\]]+$/g, ""); // strip outer brackets
  if (!cleaned) return [];
  return cleaned.split(",").map(part => {
    let s = part.trim();
    if (s.startsWith('"') && s.endsWith('"')) {
      s = s.slice(1, -1);
    }
    return s;
  });
}

function parseStringMatrixLoose(inputRaw) {
  const parsed = parseJsonLoose(inputRaw);
  if (Array.isArray(parsed)) {
    return parsed.map((row) => {
      if (!Array.isArray(row)) throw new Error("Matrix must be an array of arrays");
      return row.map(x => String(x ?? ""));
    });
  }
  const text = String(inputRaw ?? "").trim();
  if (!text) return [];
  throw new Error('Invalid String[][] input. Use JSON like [["A","B"],["C","D"]]');
}

function parseBooleanLoose(raw) {
  if (typeof raw === "boolean") return raw;
  const s = String(raw ?? "").trim().toLowerCase();
  if (s === "true") return true;
  if (s === "false") return false;
  throw new Error(`Invalid boolean input: ${raw}`);
}

function parseBooleanArrayLoose(inputRaw) {
  const parsed = parseJsonLoose(inputRaw);
  if (Array.isArray(parsed)) {
    return parsed.map(parseBooleanLoose);
  }
  const text = String(inputRaw ?? "").trim();
  const cleaned = text.replace(/^[\[\]]+|[\[\]]+$/g, "");
  if (!cleaned) return [];
  return cleaned.split(",").map(parseBooleanLoose);
}

function parseBooleanMatrixLoose(inputRaw) {
  const parsed = parseJsonLoose(inputRaw);
  if (Array.isArray(parsed)) {
    return parsed.map((row) => {
      if (!Array.isArray(row)) throw new Error("Matrix must be an array of arrays");
      return row.map(parseBooleanLoose);
    });
  }
  const text = String(inputRaw ?? "").trim();
  if (!text) return [];
  throw new Error('Invalid boolean[][] input. Use JSON like [[true,false],[false,true]]');
}

function parseCharLoose(raw) {
  if (typeof raw === "string" && raw.length === 1) return raw;
  const s = String(raw ?? "").trim();
  const cleaned = s.replace(/^['"]+|['"]+$/g, ""); // strip quotes
  if (cleaned.length === 0) throw new Error("Empty char input");
  if (cleaned.length > 1) throw new Error(`Invalid char input (too long): ${raw}`);
  return cleaned[0];
}

function parseCharArrayLoose(inputRaw) {
  let toParse = String(inputRaw ?? "");
  toParse = toParse.replace(/'/g, '"');
  const parsed = parseJsonLoose(toParse);
  if (Array.isArray(parsed)) {
    return parsed.map(parseCharLoose);
  }
  const text = toParse.trim();
  const cleaned = text.replace(/^[\[\]]+|[\[\]]+$/g, "");
  if (!cleaned) return [];
  return cleaned.split(",").map(parseCharLoose);
}

function parseCharMatrixLoose(inputRaw) {
  let toParse = String(inputRaw ?? "");
  toParse = toParse.replace(/'/g, '"');
  const parsed = parseJsonLoose(toParse);
  if (Array.isArray(parsed)) {
    return parsed.map((row) => {
      if (!Array.isArray(row)) throw new Error("Matrix must be an array of arrays");
      return row.map(parseCharLoose);
    });
  }
  const text = toParse.trim();
  if (!text) return [];
  throw new Error("Invalid char[][] input");
}

function formatJavaNumber(val, type) {
  if (type === "long") return `${val}L`;
  if (type === "float") return `${val}f`;
  return String(val);
}

function toJavaNumericArrayLiteral(values, type) {
  const formatted = values.map(v => formatJavaNumber(v, type));
  return `new ${type}[]{${formatted.join(",")}}`;
}

function toJavaNumericMatrixLiteral(matrix, type) {
  const rows = matrix.map((row) => {
    const formatted = row.map(v => formatJavaNumber(v, type));
    return `{${formatted.join(",")}}`;
  }).join(",");
  return `new ${type}[][]{${rows}}`;
}

function escapeJavaString(str) {
  return str.replace(/\\/g, "\\\\").replace(/"/g, '\\"').replace(/\n/g, "\\n").replace(/\r/g, "\\r");
}

function toJavaStringArrayLiteral(values) {
  const formatted = values.map(v => `"${escapeJavaString(v)}"`);
  return `new String[]{${formatted.join(",")}}`;
}

function toJavaStringMatrixLiteral(matrix) {
  const rows = matrix.map((row) => {
    const formatted = row.map(v => `"${escapeJavaString(v)}"`);
    return `{${formatted.join(",")}}`;
  }).join(",");
  return `new String[][]{${rows}}`;
}

function toJavaBooleanArrayLiteral(values) {
  return `new boolean[]{${values.join(",")}}`;
}

function toJavaBooleanMatrixLiteral(matrix) {
  const rows = matrix.map((row) => `{${row.join(",")}}`).join(",");
  return `new boolean[][]{${rows}}`;
}

function escapeJavaChar(charStr) {
  if (charStr === "'") return "\\'";
  if (charStr === "\\") return "\\\\";
  if (charStr === "\n") return "\\n";
  if (charStr === "\r") return "\\r";
  if (charStr === "\t") return "\\t";
  return charStr;
}

function toJavaCharArrayLiteral(values) {
  const formatted = values.map(v => `'${escapeJavaChar(v)}'`);
  return `new char[]{${formatted.join(",")}}`;
}

function toJavaCharMatrixLiteral(matrix) {
  const rows = matrix.map((row) => {
    const formatted = row.map(v => `'${escapeJavaChar(v)}'`);
    return `{${formatted.join(",")}}`;
  }).join(",");
  return `new char[][]{${rows}}`;
}

function buildGenericNumericArray(type) {
  return function ({ paramName, inputRaw }) {
    const values = parseNumericArrayLoose(inputRaw);
    return { decl: `${type}[] ${paramName} = ${toJavaNumericArrayLiteral(values, type)};`, arg: paramName, initialValue: values };
  };
}

function buildGenericNumericMatrix(type) {
  return function ({ paramName, inputRaw }) {
    const values = parseNumericMatrixLoose(inputRaw);
    return { decl: `${type}[][] ${paramName} = ${toJavaNumericMatrixLiteral(values, type)};`, arg: paramName, initialValue: values };
  };
}

function buildInt({ paramName, inputRaw }) {
  const value = Math.trunc(parseNumericLoose(inputRaw));
  return { decl: `int ${paramName} = ${value};`, arg: paramName, initialValue: value };
}

// Keeping old names for existing references (like LinkedLists)
const buildIntArray = buildGenericNumericArray("int");
const buildIntMatrix = buildGenericNumericMatrix("int");

function buildStringArray({ paramName, inputRaw }) {
  const values = parseStringArrayLoose(inputRaw);
  return { decl: `String[] ${paramName} = ${toJavaStringArrayLiteral(values)};`, arg: paramName, initialValue: values };
}

function buildStringMatrix({ paramName, inputRaw }) {
  const values = parseStringMatrixLoose(inputRaw);
  return { decl: `String[][] ${paramName} = ${toJavaStringMatrixLiteral(values)};`, arg: paramName, initialValue: values };
}

function buildBooleanArray({ paramName, inputRaw }) {
  const values = parseBooleanArrayLoose(inputRaw);
  return { decl: `boolean[] ${paramName} = ${toJavaBooleanArrayLiteral(values)};`, arg: paramName, initialValue: values };
}

function buildBooleanMatrix({ paramName, inputRaw }) {
  const values = parseBooleanMatrixLoose(inputRaw);
  return { decl: `boolean[][] ${paramName} = ${toJavaBooleanMatrixLiteral(values)};`, arg: paramName, initialValue: values };
}

function buildCharArray({ paramName, inputRaw }) {
  const values = parseCharArrayLoose(inputRaw);
  return { decl: `char[] ${paramName} = ${toJavaCharArrayLiteral(values)};`, arg: paramName, initialValue: values };
}

function buildCharMatrix({ paramName, inputRaw }) {
  const values = parseCharMatrixLoose(inputRaw);
  return { decl: `char[][] ${paramName} = ${toJavaCharMatrixLiteral(values)};`, arg: paramName, initialValue: values };
}

function buildString({ paramName, inputRaw }) {
  let value = String(inputRaw ?? "").trim();
  if (value.startsWith('"') && value.endsWith('"')) value = value.slice(1, -1);
  return { decl: `String ${paramName} = "${escapeJavaString(value)}";`, arg: paramName, initialValue: value };
}

function buildChar({ paramName, inputRaw }) {
  let value = parseCharLoose(inputRaw);
  return { decl: `char ${paramName} = '${escapeJavaChar(value)}';`, arg: paramName, initialValue: value };
}

module.exports = {
  buildInt,
  buildString,
  buildChar,
  buildIntArray,
  buildIntMatrix,
  buildGenericNumericArray,
  buildGenericNumericMatrix,
  buildStringArray,
  buildStringMatrix,
  buildBooleanArray,
  buildBooleanMatrix,
  buildCharArray,
  buildCharMatrix,
  parseIntArrayLoose: parseNumericArrayLoose, // Export under old name so LinkedLists/Collections don't break
  parseNumericArrayLoose,
  parseStringArrayLoose,
  parseBooleanArrayLoose,
  parseCharArrayLoose
};
