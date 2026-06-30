const registry = require("../../registry");

function buildDescriptor(name, rawValue, targetClass, scope = "local") {
    // 1. Resolve Runtime Type
    let runtimeType = targetClass;
    if (!runtimeType) {
        if (typeof rawValue === "number") runtimeType = "number";
        else if (typeof rawValue === "boolean") runtimeType = "boolean";
        else if (typeof rawValue === "string") {
            if (rawValue.startsWith("node_") || rawValue.startsWith("treeNode_") || rawValue.startsWith("graphNode_")) {
                runtimeType = "pointer";
            } else {
                runtimeType = "String";
            }
        } else {
            runtimeType = "UNKNOWN";
        }
    }

    // 2. Resolve Semantic Category
    let category = "UNKNOWN";
    if (runtimeType === "number" || runtimeType === "boolean" || runtimeType === "String") {
        category = "scalar";
    } else if (runtimeType === "pointer") {
        category = "pointer";
    } else {
        const structCat = registry.getStructuralCategory(runtimeType);
        if (structCat && structCat !== "UNKNOWN") {
            category = structCat; // e.g. "Array", "Collection", "Tree", etc.
        } else {
            // Fallback for objects that might not be matched by registry
            category = "object";
        }
    }

    return {
        value: rawValue,
        runtimeType,
        category,
        scope
    };
}

module.exports = {
    buildDescriptor
};
