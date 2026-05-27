const { parseJsonLoose } = require("../../execution/runtime/inputUtils");

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

function toJavaIntArrayLiteral(values) {
  return `new int[]{${values.join(",")}}`;
}

function toJavaIntMatrixLiteral(matrix) {
  const rows = matrix.map((row) => `{${row.join(",")}}`).join(",");
  return `new int[][]{${rows}}`;
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

module.exports = {
  buildInt,
  buildIntArray,
  buildIntMatrix,
  parseIntArrayLoose // exported for LinkedList to reuse
};
