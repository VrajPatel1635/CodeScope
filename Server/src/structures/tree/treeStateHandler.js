function handleTreeTrace(event, ctx) {
    if (event.type === "TREE_LINK") {
        return ctx.createStep(event.type, {
            treeLinkEvent: { parent: event.parent, dir: event.dir, child: event.child }
        });
    }
    if (event.type === "TREE_VISIT") {
        return ctx.createStep(event.type, {
            treeVisitEvent: { node: event.node, phase: event.phase }
        });
    }
    if (event.type === "TREE_MUTATE") {
        return ctx.createStep(event.type, {
            treeMutateEvent: { node: event.node, field: event.field, to: event.to }
        });
    }
    return null;
}

function applyTreeMutation(currentStep, ctx) {
    if (currentStep.treeLinkEvent && ctx.currentTreeState) {
        const { parent, dir, child } = currentStep.treeLinkEvent;
        if (ctx.currentTreeState.nodes[parent]) {
            ctx.currentTreeState.nodes[parent][dir] = child;
        }
    }
    if (currentStep.treeMutateEvent && ctx.currentTreeState) {
        const { node, field, to } = currentStep.treeMutateEvent;
        if (ctx.currentTreeState.nodes[node]) {
            ctx.currentTreeState.nodes[node][field] = (to === "null" ? null : to);
        }
    }
}

function attachTreeState(currentStep, ctx) {
    if (ctx.currentTreeState) {
        currentStep.tree = {
            root: ctx.currentTreeState.root,
            nodes: JSON.parse(JSON.stringify(ctx.currentTreeState.nodes))
        };
    }
}

module.exports = {
    handleTreeTrace,
    applyTreeMutation,
    attachTreeState
};
