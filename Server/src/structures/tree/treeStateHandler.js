function handleTreeTrace(event, ctx) {
    if (event.type === "TREE_LINK") {
        return ctx.createStep(event.type, {
            treeLinkEvent: { parent: event.parent, dir: event.dir, child: event.child }
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
