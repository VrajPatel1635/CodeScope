const JavaKnowledgeRegistry = require("../../registry/index");

function injectRegistryTraces(line, formatter) {
    let out = "";
    
    // We only care about mutatesTarget === true
    for (const fqn of JavaKnowledgeRegistry.listAllLibraries()) {
        const mod = JavaKnowledgeRegistry.lookupByFqn(fqn);
        if (!mod) continue;

        const resolvedMethods = JavaKnowledgeRegistry._getResolvedMethods(mod);

        for (const [methodName, metadata] of Object.entries(resolvedMethods)) {
            if (!metadata.mutatesTarget) continue;

            // Pattern 1: Static Utility (e.g., Arrays.sort(arr), Collections.reverse(list))
            const staticRegex = new RegExp(`\\b${mod.className}\\.${methodName}\\s*\\(\\s*([a-zA-Z_]\\w*)`);
            const staticMatch = line.match(staticRegex);
            if (staticMatch) {
                const varName = staticMatch[1];
                out += `System.out.println("TRACE|STATE_OP|targetName=${varName}|operation=${metadata.operation}|serializedState=" + ${formatter}(${varName}));\n`;
                return out; 
            }

            // Pattern 2: Instance Method (e.g., list.add(val), queue.poll())
            if (mod.className !== "Arrays" && mod.className !== "Collections" && mod.className !== "Math") {
                const instanceRegex = new RegExp(`\\b([a-zA-Z_]\\w*)\\.${methodName}\\s*\\(`);
                const instanceMatch = line.match(instanceRegex);
                if (instanceMatch) {
                    const varName = instanceMatch[1];
                    // Skip common class names to avoid false positives
                    if (!["Arrays", "Collections", "Math", "System", "String", "Integer", "Double"].includes(varName)) {
                        out += `System.out.println("TRACE|STATE_OP|targetName=${varName}|operation=${metadata.operation}|serializedState=" + ${formatter}(${varName}));\n`;
                        return out;
                    }
                }
            }
        }
    }

    return out;
}

module.exports = { injectRegistryTraces };
