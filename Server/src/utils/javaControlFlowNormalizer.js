"use strict";

/**
 * Phase B.1 — Control-flow structural normalization
 *
 * Supported structures ONLY:
 * - if / else / else-if
 * - for
 * - while
 * - do-while
 *
 * Goal:
 * - Convert single-statement bodies into explicit brace blocks
 * - Preserve else binding + do-while pairing + statement order
 * - Provide a line map so trace injection can keep editor line numbers
 *
 * This is intentionally NOT a full Java AST parser.
 */

function buildLineStarts(src) {
  const starts = [0];
  for (let i = 0; i < src.length; i++) {
    if (src[i] === "\n") starts.push(i + 1);
  }
  return starts;
}

function lineOfPos(lineStarts, pos) {
  // 0-based line index
  let lo = 0;
  let hi = lineStarts.length - 1;
  while (lo <= hi) {
    const mid = (lo + hi) >> 1;
    const start = lineStarts[mid];
    const nextStart = mid + 1 < lineStarts.length ? lineStarts[mid + 1] : Number.POSITIVE_INFINITY;
    if (pos < start) hi = mid - 1;
    else if (pos >= nextStart) lo = mid + 1;
    else return mid;
  }
  return lineStarts.length - 1;
}

function isIdentChar(ch) {
  return /[A-Za-z0-9_$]/.test(ch);
}

function isIdentStart(ch) {
  return /[A-Za-z_$]/.test(ch);
}

function tokenizeJava(src, baseLineOffset = 0) {
  const tokens = [];
  const lineStarts = buildLineStarts(src);

  let i = 0;
  while (i < src.length) {
    const ch = src[i];

    // Whitespace
    if (ch === " " || ch === "\t" || ch === "\r" || ch === "\n" || ch === "\f") {
      i++;
      continue;
    }

    // Line comment
    if (ch === "/" && src[i + 1] === "/") {
      i += 2;
      while (i < src.length && src[i] !== "\n") i++;
      continue;
    }

    // Block comment
    if (ch === "/" && src[i + 1] === "*") {
      i += 2;
      while (i < src.length) {
        if (src[i] === "*" && src[i + 1] === "/") {
          i += 2;
          break;
        }
        i++;
      }
      continue;
    }

    const start = i;
    const startLine = baseLineOffset + lineOfPos(lineStarts, start) + 1; // 1-based

    // String literal
    if (ch === '"') {
      i++;
      // Handle Java text blocks """ ... """ in the simplest safe way.
      // If we see three quotes, consume until the next triple quote.
      if (src[i] === '"' && src[i + 1] === '"') {
        i += 2;
        while (i < src.length) {
          if (src[i] === '"' && src[i + 1] === '"' && src[i + 2] === '"') {
            i += 3;
            break;
          }
          i++;
        }
      } else {
        while (i < src.length) {
          if (src[i] === "\\") {
            i += 2;
            continue;
          }
          if (src[i] === '"') {
            i++;
            break;
          }
          i++;
        }
      }
      tokens.push({ type: "literal", value: src.slice(start, i), start, end: i, line: startLine });
      continue;
    }

    // Char literal
    if (ch === "'") {
      i++;
      while (i < src.length) {
        if (src[i] === "\\") {
          i += 2;
          continue;
        }
        if (src[i] === "'") {
          i++;
          break;
        }
        i++;
      }
      tokens.push({ type: "literal", value: src.slice(start, i), start, end: i, line: startLine });
      continue;
    }

    // Identifier / keyword
    if (isIdentStart(ch)) {
      i++;
      while (i < src.length && isIdentChar(src[i])) i++;
      const value = src.slice(start, i);
      tokens.push({ type: "identifier", value, start, end: i, line: startLine });
      continue;
    }

    // Number (best-effort; not used for structure)
    if (/[0-9]/.test(ch)) {
      i++;
      while (i < src.length && /[0-9A-Fa-fxX_\.]/.test(src[i])) i++;
      tokens.push({ type: "literal", value: src.slice(start, i), start, end: i, line: startLine });
      continue;
    }

    // Symbols (single char is enough for our structural parsing)
    i++;
    tokens.push({ type: "symbol", value: ch, start, end: i, line: startLine });
  }

  return { tokens, lineStarts };
}

function normalizeWhitespaceForSingleLine(text) {
  // This pass is not “formatting” for humans; it stabilizes statements so the
  // downstream trace injector can operate statement-by-statement.
  //
  // Preserve content but remove raw newlines/tabs that would split a statement.
  return String(text)
    .replace(/\r\n/g, "\n")
    .replace(/[\t\f\r\n]+/g, " ")
    .replace(/\s{2,}/g, " ")
    .trim();
}

function createParser(src, baseLineOffset = 0) {
  const { tokens } = tokenizeJava(src, baseLineOffset);

  function at(idx) {
    return idx >= 0 && idx < tokens.length ? tokens[idx] : null;
  }

  function isValue(idx, type, value) {
    const t = at(idx);
    return !!t && t.type === type && t.value === value;
  }

  function isIdent(idx, value) {
    const t = at(idx);
    return !!t && t.type === "identifier" && t.value === value;
  }

  function consumeBalanced(idx, openSym, closeSym) {
    // idx points at openSym
    if (!isValue(idx, "symbol", openSym)) {
      throw new Error(`Expected '${openSym}' at token ${idx}`);
    }
    let depth = 1;
    let i = idx + 1;
    while (i < tokens.length && depth > 0) {
      const t = tokens[i];
      if (t.type === "symbol" && t.value === openSym) depth++;
      else if (t.type === "symbol" && t.value === closeSym) depth--;
      i++;
    }
    return i; // first token after the balanced close
  }

  function parseBlock(startIdx) {
    // startIdx at '{'
    const openTok = at(startIdx);
    let i = startIdx + 1;
    let depth = 1;
    while (i < tokens.length && depth > 0) {
      const t = tokens[i];
      if (t.type === "symbol" && t.value === "{") depth++;
      else if (t.type === "symbol" && t.value === "}") depth--;
      i++;
    }
    const closeTok = at(i - 1);
    return {
      kind: "block",
      startTok: startIdx,
      endTok: i,
      startPos: openTok.start,
      endPos: closeTok ? closeTok.end : openTok.end,
    };
  }

  function parseSimpleStatement(startIdx) {
    const startTok = at(startIdx);
    if (!startTok) {
      return { kind: "simple", startTok: startIdx, endTok: startIdx, startPos: 0, endPos: 0 };
    }

    // Empty statement
    if (startTok.type === "symbol" && startTok.value === ";") {
      return {
        kind: "simple",
        startTok: startIdx,
        endTok: startIdx + 1,
        startPos: startTok.start,
        endPos: startTok.end,
      };
    }

    let paren = 0;
    let bracket = 0;
    let brace = 0;

    let i = startIdx;
    while (i < tokens.length) {
      const t = tokens[i];
      if (t.type === "symbol") {
        if (t.value === "(") paren++;
        else if (t.value === ")") paren = Math.max(0, paren - 1);
        else if (t.value === "[") bracket++;
        else if (t.value === "]") bracket = Math.max(0, bracket - 1);
        else if (t.value === "{") brace++;
        else if (t.value === "}") {
          if (brace > 0) brace--;
          else break; // end of current block/statement list
        } else if (t.value === ";" && paren === 0 && bracket === 0 && brace === 0) {
          const endTok = i + 1;
          const endPos = t.end;
          return {
            kind: "simple",
            startTok: startIdx,
            endTok,
            startPos: startTok.start,
            endPos,
          };
        }
      }
      i++;
    }

    // Unterminated (invalid Java), best-effort consume to end.
    const last = at(tokens.length - 1);
    return {
      kind: "simple",
      startTok: startIdx,
      endTok: tokens.length,
      startPos: startTok.start,
      endPos: last ? last.end : startTok.end,
    };
  }

  function parseIf(startIdx) {
    const ifTok = at(startIdx);
    const parenIdx = startIdx + 1;
    if (!isValue(parenIdx, "symbol", "(")) {
      // Not a valid if; treat as simple.
      return parseSimpleStatement(startIdx);
    }

    const afterCond = consumeBalanced(parenIdx, "(", ")");

    const thenStart = afterCond;
    const thenNode = parseStatement(thenStart);

    let endTok = thenNode.endTok;
    let elseNode = null;

    if (isIdent(endTok, "else")) {
      const elseStart = endTok + 1;
      elseNode = parseStatement(elseStart);
      endTok = elseNode.endTok;
    }

    const condEndTok = at(afterCond - 1);

    return {
      kind: "if",
      startTok: startIdx,
      endTok,
      startPos: ifTok.start,
      endPos: at(endTok - 1)?.end ?? ifTok.end,
      headerStartPos: ifTok.start,
      headerEndPos: condEndTok ? condEndTok.end : ifTok.end,
      thenNode,
      elseNode,
    };
  }

  function parseForWhile(kind, startIdx) {
    const kwTok = at(startIdx);
    const parenIdx = startIdx + 1;
    if (!isValue(parenIdx, "symbol", "(")) {
      return parseSimpleStatement(startIdx);
    }

    const afterHeader = consumeBalanced(parenIdx, "(", ")");
    const bodyStart = afterHeader;
    const bodyNode = parseStatement(bodyStart);

    const headerEndTok = at(afterHeader - 1);

    return {
      kind,
      startTok: startIdx,
      endTok: bodyNode.endTok,
      startPos: kwTok.start,
      endPos: at(bodyNode.endTok - 1)?.end ?? kwTok.end,
      headerStartPos: kwTok.start,
      headerEndPos: headerEndTok ? headerEndTok.end : kwTok.end,
      bodyNode,
    };
  }

  function parseDo(startIdx) {
    const doTok = at(startIdx);
    const bodyStart = startIdx + 1;
    const bodyNode = parseStatement(bodyStart);

    let i = bodyNode.endTok;
    if (!isIdent(i, "while")) {
      // Invalid do-while; treat as simple.
      return parseSimpleStatement(startIdx);
    }

    const parenIdx = i + 1;
    if (!isValue(parenIdx, "symbol", "(")) {
      return parseSimpleStatement(startIdx);
    }

    const afterCond = consumeBalanced(parenIdx, "(", ")");
    const semiIdx = afterCond;
    if (!isValue(semiIdx, "symbol", ";")) {
      return parseSimpleStatement(startIdx);
    }

    return {
      kind: "do",
      startTok: startIdx,
      endTok: semiIdx + 1,
      startPos: doTok.start,
      endPos: at(semiIdx)?.end ?? doTok.end,
      bodyNode,
      whileStartPos: at(i).start,
      whileEndPos: at(semiIdx).end,
    };
  }

  function parseStatement(startIdx) {
    const t = at(startIdx);
    if (!t) {
      return { kind: "eof", startTok: startIdx, endTok: startIdx, startPos: src.length, endPos: src.length };
    }

    if (t.type === "symbol" && t.value === "{") return parseBlock(startIdx);
    if (t.type === "identifier") {
      if (t.value === "if") return parseIf(startIdx);
      if (t.value === "for") return parseForWhile("for", startIdx);
      if (t.value === "while") return parseForWhile("while", startIdx);
      if (t.value === "do") return parseDo(startIdx);
    }

    return parseSimpleStatement(startIdx);
  }

  return { tokens, parseStatement };
}

function normalizeJavaControlFlow(source, baseLineOffset = 0) {
  const src = String(source ?? "");
  const { tokens, parseStatement } = createParser(src, baseLineOffset);

  function startLineOfPos(pos) {
    // Tokens already contain the correct line for their start.
    // We use the token line for node starts.
    // (pos should correspond to some token start; fallback to baseLineOffset+1)
    for (let i = 0; i < tokens.length; i++) {
      if (tokens[i].start === pos) return tokens[i].line;
      if (tokens[i].start > pos) break;
    }
    return baseLineOffset + 1;
  }

  function slice(startPos, endPos) {
    return src.slice(startPos, endPos);
  }

  function normalizeNode(node) {
    switch (node.kind) {
      case "block": {
        // Standalone blocks are preserved, and their contents are normalized.
        const lines = [];
        const openLine = startLineOfPos(node.startPos);
        lines.push({ text: "{", line: openLine });
        lines.push(...normalizeRange(node.startTok + 1, node.endTok - 1));
        lines.push({ text: "}", line: openLine });
        return lines;
      }

      case "if": {
        const header = normalizeWhitespaceForSingleLine(slice(node.headerStartPos, node.headerEndPos));
        const headerLine = startLineOfPos(node.startPos);

        const lines = [];
        // then
        lines.push({ text: `${header} {`, line: headerLine });

        if (node.thenNode.kind === "block") {
          lines.push(...normalizeRange(node.thenNode.startTok + 1, node.thenNode.endTok - 1));
        } else {
          lines.push(...normalizeNode(node.thenNode));
        }

        if (!node.elseNode) {
          lines.push({ text: "}", line: headerLine });
          return lines;
        }

        // else-if chain preservation: keep `} else if (...) {` on one structural line.
        if (node.elseNode.kind === "if") {
          const elseIfLines = normalizeNode(node.elseNode);
          if (elseIfLines.length > 0) {
            const first = elseIfLines[0];
            lines.push({ text: `} else ${first.text}`, line: first.line });
            for (let i = 1; i < elseIfLines.length; i++) lines.push(elseIfLines[i]);
            return lines;
          }
        }

        // regular else
        lines.push({ text: "} else {", line: headerLine });
        if (node.elseNode.kind === "block") {
          lines.push(...normalizeRange(node.elseNode.startTok + 1, node.elseNode.endTok - 1));
        } else {
          lines.push(...normalizeNode(node.elseNode));
        }
        lines.push({ text: "}", line: headerLine });
        return lines;
      }

      case "for":
      case "while": {
        const header = normalizeWhitespaceForSingleLine(slice(node.headerStartPos, node.headerEndPos));
        const headerLine = startLineOfPos(node.startPos);
        const lines = [];
        lines.push({ text: `${header} {`, line: headerLine });
        if (node.bodyNode.kind === "block") {
          lines.push(...normalizeRange(node.bodyNode.startTok + 1, node.bodyNode.endTok - 1));
        } else {
          lines.push(...normalizeNode(node.bodyNode));
        }
        lines.push({ text: "}", line: headerLine });
        return lines;
      }

      case "do": {
        const headerLine = startLineOfPos(node.startPos);
        const whileText = normalizeWhitespaceForSingleLine(slice(node.whileStartPos, node.whileEndPos));

        const lines = [];
        lines.push({ text: "do {", line: headerLine });
        if (node.bodyNode.kind === "block") {
          lines.push(...normalizeRange(node.bodyNode.startTok + 1, node.bodyNode.endTok - 1));
        } else {
          lines.push(...normalizeNode(node.bodyNode));
        }
        // Keep pairing: `} while(cond);` MUST be a single structural line.
        lines.push({ text: `} ${whileText}`, line: headerLine });
        return lines;
      }

      case "simple": {
        const startTok = tokens[node.startTok];
        const line = startTok ? startTok.line : baseLineOffset + 1;
        const text = normalizeWhitespaceForSingleLine(slice(node.startPos, node.endPos));
        if (!text) return [];
        return [{ text, line }];
      }

      default:
        return [];
    }
  }

  function normalizeRange(startTok, endTokExclusive) {
    const lines = [];
    let i = startTok;
    while (i < endTokExclusive) {
      const node = parseStatement(i);
      if (!node || node.kind === "eof" || node.endTok <= i) break;

      // Stop at a block end when normalizing inside a block.
      const t = tokens[i];
      if (t && t.type === "symbol" && t.value === "}") break;

      lines.push(...normalizeNode(node));
      i = node.endTok;
    }
    return lines;
  }

  const mappedLines = normalizeRange(0, tokens.length);
  const normalizedSource = mappedLines.map((l) => l.text).join("\n");

  return { mappedLines, normalizedSource };
}

module.exports = {
  normalizeJavaControlFlow,
};
