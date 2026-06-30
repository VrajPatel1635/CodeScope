const STRING_POINTER_NAMES = [
  "i", "j", "k",
  "left", "right",
  "start", "end",
  "low", "high",
  "mid",
  "lo", "hi",
  "l", "r",
];

function generateStringContracts(ctx, currentStep) {
    const contracts = {};
    if (!currentStep.currentFrameVariables) return contracts;

    const vars = currentStep.currentFrameVariables;
    
    // Find all valid pointers
    const allPointers = [];
    for (const [name, descriptor] of Object.entries(vars)) {
        const value = descriptor.value;
        if (typeof value === "number" && STRING_POINTER_NAMES.includes(name)) {
            allPointers.push({ name, value });
        }
    }

    for (const [name, descriptor] of Object.entries(vars)) {
        const value = descriptor.value;
        if (typeof value === "string") {
            // Ignore node ids
            if (value.startsWith("node_") || value.startsWith("treeNode_") || value.startsWith("graphNode_")) continue;
            
            // Check if explicitly declared as String (to distinguish from stringified arrays if variable names overlap)
            const isExplicitString = ctx.declaredCollectionTypes && ctx.declaredCollectionTypes[name] === "String";
            
            // Unless explicitly known as a String, exclude serialized arrays and objects 
            if (!isExplicitString) {
                if (value.startsWith("[") && value.endsWith("]")) continue;
                if (value.startsWith("{") && value.endsWith("}")) continue;
            }

            // Collect pointers for THIS string
            const stringPointers = [];
            for (const p of allPointers) {
                // Must be within bounds of THIS string
                if (p.value >= 0 && p.value <= value.length) {
                    stringPointers.push({ name: p.name, index: p.value });
                }
            }
            
            // Generate window
            let windowOverlay = null;
            if (stringPointers.length >= 2) {
                const indices = stringPointers.map(p => p.index);
                windowOverlay = {
                    start: Math.min(...indices),
                    end: Math.max(...indices)
                };
            }

            // Extract Comparison Data
            let comparisonObj = null;
            if (currentStep.type === "COND" && currentStep.traceEvent && currentStep.traceEvent.expr) {
                const expr = currentStep.traceEvent.expr;
                // Match: s.charAt(left) == s.charAt(right)
                const match = expr.match(/(\w+)\.charAt\(([^)]+)\)\s*(==|!=|<|>|<=|>=)\s*(\w+)\.charAt\(([^)]+)\)/);
                if (match) {
                    const leftStr = match[1];
                    const leftPtr = match[2];
                    const op = match[3];
                    const rightStr = match[4];
                    const rightPtr = match[5];

                    if (leftStr === name && rightStr === name) {
                        const lIdx = vars[leftPtr]?.value;
                        const rIdx = vars[rightPtr]?.value;
                        
                        if (typeof lIdx === "number" && typeof rIdx === "number" && lIdx >= 0 && lIdx < value.length && rIdx >= 0 && rIdx < value.length) {
                            comparisonObj = {
                                leftIndex: lIdx,
                                rightIndex: rIdx,
                                leftChar: value.charAt(lIdx),
                                rightChar: value.charAt(rIdx),
                                operator: op,
                                result: currentStep.traceEvent.value === "true" || currentStep.traceEvent.value === true
                            };
                        }
                    }
                }
            }
            // Extract Substring Data
            let substringObj = null;

            // 1. Detect from VAR (Assignment)
            if (currentStep.type === "VAR" && typeof currentStep.value === "string") {
                const subStr = currentStep.value;
                const varName = currentStep.name;
                
                if (varName !== name && subStr.length > 0 && subStr.length < value.length) {
                    const idx = value.indexOf(subStr);
                    if (idx !== -1) {
                        const endIdx = idx + subStr.length;
                        const hasStartPtr = stringPointers.some(p => p.index === idx);
                        const hasEndPtr = stringPointers.some(p => p.index === endIdx) || endIdx === value.length;
                        
                        if (hasStartPtr || hasEndPtr || subStr.length > 1) {
                            substringObj = {
                                start: idx,
                                end: endIdx,
                                value: subStr
                            };
                        }
                    }
                }
            }

            // 2. Detect from COND (if statements)
            if (currentStep.type === "COND" && currentStep.traceEvent && currentStep.traceEvent.expr) {
                const expr = currentStep.traceEvent.expr;
                const match = expr.match(new RegExp(`\\b${name}\\.substring\\(([^)]+)\\)`));
                if (match) {
                    const args = match[1].split(",").map(a => a.trim());
                    let startIdx = 0;
                    let endIdx = value.length;
                    
                    if (args.length >= 1) {
                        const startVal = Number.isNaN(Number(args[0])) ? vars[args[0]]?.value : Number(args[0]);
                        if (typeof startVal === 'number') startIdx = startVal;
                    }
                    if (args.length === 2) {
                        const endVal = Number.isNaN(Number(args[1])) ? vars[args[1]]?.value : Number(args[1]);
                        if (typeof endVal === 'number') endIdx = endVal;
                    }
                    
                    if (startIdx >= 0 && endIdx <= value.length && startIdx <= endIdx) {
                        substringObj = {
                            start: startIdx,
                            end: endIdx,
                            value: value.substring(startIdx, endIdx)
                        };
                    }
                }
            }

            contracts[name] = {
                visualizationType: "string",
                name: name,
                value: value,
                characters: value.split(""),
                length: value.length,
                pointers: stringPointers,
                window: windowOverlay,
                comparison: comparisonObj,
                substring: substringObj
            };
        }
    }
    return contracts;
}

module.exports = {
    generateStringContracts
};
