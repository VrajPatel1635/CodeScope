const registry = require("../../registry/index");

function dispatchState(ctx, targetName, targetClass, parsedState) {
    // 1. Unified Variable Snapshot
    if (ctx.stack && ctx.stack.length > 0) {
        ctx.stack[ctx.stack.length - 1].variables[targetName] = parsedState;
    }

    // 2. Metadata-Driven Runtime Type Resolution
    const category = registry.getStructuralCategory(targetClass);

    // 3. Structural Dispatch
    switch (category) {
        case "Array":
            ctx.currentArrayState = parsedState;
            break;
        case "Matrix":
            ctx.currentMatrixState = parsedState;
            break;
        case "Collection":
            if (!ctx.currentCollectionsState) {
                ctx.currentCollectionsState = {};
            }
            if (!ctx.previousCollectionsState) {
                ctx.previousCollectionsState = {};
            }
            ctx.previousCollectionsState[targetName] = ctx.currentCollectionsState[targetName];
            ctx.currentCollectionsState[targetName] = parsedState;
            break;
        case "Tree":
            // Tree state is structurally managed via TREE_MUTATE currently
            break;
        case "Graph":
            // Graph state is structurally managed via GRAPH_EDGE_ADD currently
            break;
        case "LinkedList":
            // LinkedList state is structurally managed via NODE_LINK currently
            break;
        default:
            // Unrecognized structure, defaults to scalar variable tracking only
            break;
    }
}

module.exports = { dispatchState };
