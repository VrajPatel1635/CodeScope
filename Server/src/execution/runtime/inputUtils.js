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

module.exports = {
  normalizeType,
  parseJsonLoose
};
