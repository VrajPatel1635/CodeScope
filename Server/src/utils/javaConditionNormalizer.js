"use strict";

/**
 * Phase C.1 — Condition Evaluation Runtime Tracing
 *
 * Normalizes condition expressions in if, while, do-while, and for loops
 * so they are evaluated exactly once via Main.__DSA_COND().
 * This preserves short-circuit logic, side-effects, and frame ownership
 * while capturing the true runtime boolean result.
 */

function escapeString(str) {
    return str.replace(/\\/g, '\\\\').replace(/"/g, '\\"').replace(/\n/g, '\\n').replace(/\r/g, '\\r');
}

function extractParenContents(str, startIdx) {
    let depth = 0;
    let inString = false;
    let inChar = false;
    let escape = false;
    let parenStart = -1;

    for (let i = startIdx; i < str.length; i++) {
        const c = str[i];
        
        if (escape) {
            escape = false;
            continue;
        }
        if (c === '\\') {
            escape = true;
            continue;
        }
        if (c === '"' && !inChar) {
            inString = !inString;
            continue;
        }
        if (c === "'" && !inString) {
            inChar = !inChar;
            continue;
        }
        if (inString || inChar) continue;

        if (c === '(') {
            if (depth === 0) parenStart = i;
            depth++;
        } else if (c === ')') {
            depth--;
            if (depth === 0 && parenStart !== -1) {
                return {
                    start: parenStart,
                    end: i,
                    content: str.substring(parenStart + 1, i)
                };
            }
        }
    }
    return null;
}

function splitForCondition(content) {
    const parts = [];
    let current = "";
    let depth = 0;
    let inString = false;
    let inChar = false;
    let escape = false;

    for (let i = 0; i < content.length; i++) {
        const c = content[i];
        
        if (escape) {
            escape = false;
            current += c;
            continue;
        }
        if (c === '\\') {
            escape = true;
            current += c;
            continue;
        }
        if (c === '"' && !inChar) {
            inString = !inString;
            current += c;
            continue;
        }
        if (c === "'" && !inString) {
            inChar = !inChar;
            current += c;
            continue;
        }
        if (c === '(') depth++;
        if (c === ')') depth--;

        if (c === ';' && depth === 0 && !inString && !inChar) {
            parts.push(current);
            current = "";
        } else {
            current += c;
        }
    }
    parts.push(current);
    return parts;
}

function normalizeConditions(mappedLines) {
    const out = [];

    for (const lineObj of mappedLines || []) {
        let text = String(lineObj?.text ?? "");
        const trimmed = text.trim();
        const lineNum = lineObj.line;

        // 1. if / else if
        if (/(?:^\s*\}\s*)?(?:else\s+)?if\s*\(/.test(trimmed)) {
            const match = text.match(/\bif\s*\(/);
            if (match) {
                const idx = match.index + match[0].length - 1; // index of '('
                const parens = extractParenContents(text, idx);
                if (parens && parens.content.trim()) {
                    const cond = parens.content;
                    const escaped = escapeString(cond.trim());
                    text = text.substring(0, parens.start + 1) +
                           `Main.__DSA_COND(${cond}, ${lineNum}, "${escaped}")` +
                           text.substring(parens.end);
                }
            }
        }
        // 2. while
        else if (/^while\s*\(/.test(trimmed)) {
            const match = text.match(/\bwhile\s*\(/);
            if (match) {
                const idx = match.index + match[0].length - 1;
                const parens = extractParenContents(text, idx);
                if (parens && parens.content.trim()) {
                    const cond = parens.content;
                    const escaped = escapeString(cond.trim());
                    text = text.substring(0, parens.start + 1) +
                           `Main.__DSA_COND(${cond}, ${lineNum}, "${escaped}")` +
                           text.substring(parens.end);
                }
            }
        }
        // 3. do-while
        else if (/^\}\s*while\s*\(/.test(trimmed)) {
            const match = text.match(/\bwhile\s*\(/);
            if (match) {
                const idx = match.index + match[0].length - 1;
                const parens = extractParenContents(text, idx);
                if (parens && parens.content.trim()) {
                    const cond = parens.content;
                    const escaped = escapeString(cond.trim());
                    text = text.substring(0, parens.start + 1) +
                           `Main.__DSA_COND(${cond}, ${lineNum}, "${escaped}")` +
                           text.substring(parens.end);
                }
            }
        }
        // 4. for
        else if (/^for\s*\(/.test(trimmed)) {
            const match = text.match(/\bfor\s*\(/);
            if (match) {
                const idx = match.index + match[0].length - 1;
                const parens = extractParenContents(text, idx);
                if (parens) {
                    const parts = splitForCondition(parens.content);
                    if (parts.length === 3) {
                        const init = parts[0];
                        const cond = parts[1];
                        const update = parts[2];
                        if (cond.trim()) {
                            const escaped = escapeString(cond.trim());
                            const newCond = ` Main.__DSA_COND(${cond.trim()}, ${lineNum}, "${escaped}") `;
                            const newContent = init + ";" + newCond + ";" + update;
                            text = text.substring(0, parens.start + 1) +
                                   newContent +
                                   text.substring(parens.end);
                        }
                    }
                }
            }
        }

        out.push({ text, line: lineObj.line });
    }

    return out;
}

module.exports = {
    normalizeConditions
};
