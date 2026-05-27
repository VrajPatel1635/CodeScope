function handleLinkedListTrace(event, ctx) {
    if (event.type === "NODE_LINK") {
        return ctx.createStep(event.type, {
            nodeLinkEvent: { from: event.from, to: event.to }
        });
    } else if (event.type === "PTR_MOVE") {
        const nodeId = event.nodeId === "null" ? null : event.nodeId;
        const announceStep = ctx.createStep(event.type, {
            ptrMoveEvent: { variable: event.variable, nodeId },
            currentFrameVariables: ctx.topVars(),
            stack: ctx.cloneStack(),
            loopContext: { ...ctx.currentLoops },
        });
        if (ctx.currentLinkedListState) {
            announceStep.linkedList = {
                head: ctx.currentLinkedListState.head,
                nodes: JSON.parse(JSON.stringify(ctx.currentLinkedListState.nodes)),
            };
        }
        ctx.states.push(announceStep);

        ctx.stack[ctx.stack.length - 1].variables[event.variable] = nodeId;

        return ctx.createStep(event.type + "_APPLIED");
    } else if (event.type === "NODE_MUTATE") {
        const fromNodeId = event.fromNodeId === "null" ? null : event.fromNodeId;
        const toNodeId = event.toNodeId === "null" ? null : event.toNodeId;

        const announceStep = ctx.createStep(event.type, {
            nodeMutateEvent: { fromNodeId, toNodeId },
            currentFrameVariables: ctx.topVars(),
            stack: ctx.cloneStack(),
            loopContext: { ...ctx.currentLoops },
        });
        if (ctx.currentLinkedListState) {
            announceStep.linkedList = {
                head: ctx.currentLinkedListState.head,
                nodes: JSON.parse(JSON.stringify(ctx.currentLinkedListState.nodes)),
            };
        }
        if (ctx.currentArrayState) announceStep.array = [...ctx.currentArrayState];
        if (ctx.currentMatrixState) announceStep.matrix = ctx.currentMatrixState.map(r => [...r]);
        ctx.states.push(announceStep);

        if (ctx.currentLinkedListState && ctx.currentLinkedListState.nodes[fromNodeId]) {
            ctx.currentLinkedListState.nodes[fromNodeId].next = toNodeId;
        }

        return ctx.createStep(event.type + "_APPLIED");
    }
    return null;
}

function applyLinkedListMutation(currentStep, ctx) {
    if (currentStep.nodeLinkEvent && ctx.currentLinkedListState) {
        const { from, to } = currentStep.nodeLinkEvent;
        if (ctx.currentLinkedListState.nodes[from]) {
            ctx.currentLinkedListState.nodes[from].next = to;
        }
    }
}

function attachLinkedListState(currentStep, ctx) {
    if (ctx.currentLinkedListState) {
        currentStep.linkedList = {
            head: ctx.currentLinkedListState.head,
            nodes: JSON.parse(JSON.stringify(ctx.currentLinkedListState.nodes))
        };
    }
}

module.exports = {
    handleLinkedListTrace,
    applyLinkedListMutation,
    attachLinkedListState
};
