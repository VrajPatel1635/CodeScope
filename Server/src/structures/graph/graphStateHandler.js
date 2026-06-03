"use strict";

function handleGraphTrace(event, ctx) {
    if (event.type === "GRAPH_EDGE" || event.type === "GRAPH_EDGE_ADD" || event.type === "GRAPH_EDGE_REMOVE") {
        return ctx.createStep(event.type, { graphEdgeEvent: event });
    }
    if (event.type === "GRAPH_VISIT" || event.type === "BFS_VISIT") {
        return ctx.createStep(event.type, { graphVisitEvent: event });
    }
    if (event.type === "VISITED_MARK" || event.type === "DISTANCE_MARK" || event.type === "PARENT_MARK") {
        return ctx.createStep(event.type, { [event.type]: event });
    }
    if (event.type === "QUEUE_ENQUEUE") {
        return ctx.createStep(event.type, { queueEnqueueEvent: event });
    }
    if (event.type === "QUEUE_DEQUEUE") {
        return ctx.createStep(event.type, { queueDequeueEvent: event });
    }
    if (event.type === "BFS_LEVEL_START") {
        return ctx.createStep(event.type, { bfsLevelStartEvent: event });
    }
    return null;
}

function applyGraphMutation(currentStep, ctx) {
    if (!ctx.currentGraphState) return;

    if (currentStep.graphEdgeEvent) {
        const { from, to, type } = currentStep.graphEdgeEvent;
        if (type === "GRAPH_EDGE" || type === "GRAPH_EDGE_ADD") {
            ctx.currentGraphState.nodes.add(from);
            ctx.currentGraphState.nodes.add(to);
            if (!ctx.currentGraphState.adjacency[from]) ctx.currentGraphState.adjacency[from] = [];
            ctx.currentGraphState.adjacency[from].push(to);
        } else if (type === "GRAPH_EDGE_REMOVE") {
            if (ctx.currentGraphState.adjacency[from]) {
                const index = ctx.currentGraphState.adjacency[from].indexOf(to);
                if (index !== -1) {
                    ctx.currentGraphState.adjacency[from].splice(index, 1);
                }
            }
        }
    }
    if (currentStep.VISITED_MARK) {
        const { node, value } = currentStep.VISITED_MARK;
        ctx.currentGraphState.visitedState[node] = (value === 'true');
    }
    if (currentStep.DISTANCE_MARK) {
        const { node, value } = currentStep.DISTANCE_MARK;
        ctx.currentGraphState.distanceState[node] = value; // keep as string/number
    }
    if (currentStep.PARENT_MARK) {
        const { node, value } = currentStep.PARENT_MARK;
        ctx.currentGraphState.parentState[node] = value;
    }
    if (currentStep.graphVisitEvent) {
        const { node } = currentStep.graphVisitEvent;
        ctx.currentGraphState.nodes.add(node);
        if (currentStep.type === "BFS_VISIT") {
            ctx.currentGraphState.traversalOwnership = "BFS";
        } else if (currentStep.type === "GRAPH_VISIT") {
            ctx.currentGraphState.traversalOwnership = "DFS";
        }
    }
    if (currentStep.queueEnqueueEvent) {
        const { node } = currentStep.queueEnqueueEvent;
        ctx.currentGraphState.queue.push(node);
        ctx.currentGraphState.frontier.add(node);
        ctx.currentGraphState.traversalOwnership = "BFS";
    }
    if (currentStep.queueDequeueEvent) {
        const { node } = currentStep.queueDequeueEvent;
        const index = ctx.currentGraphState.queue.indexOf(node);
        if (index > -1) {
            ctx.currentGraphState.queue.splice(index, 1);
        }
        ctx.currentGraphState.frontier.delete(node);
    }
    if (currentStep.bfsLevelStartEvent) {
        ctx.currentGraphState.level = currentStep.bfsLevelStartEvent.level;
    }
}

function attachGraphState(currentStep, ctx) {
    if (ctx.currentGraphState) {
        currentStep.graph = {
            nodes: Array.from(ctx.currentGraphState.nodes),
            adjacency: JSON.parse(JSON.stringify(ctx.currentGraphState.adjacency)),
            visitedState: { ...ctx.currentGraphState.visitedState },
            distanceState: { ...ctx.currentGraphState.distanceState },
            parentState: { ...ctx.currentGraphState.parentState },
            queue: [...ctx.currentGraphState.queue],
            frontier: Array.from(ctx.currentGraphState.frontier),
            level: ctx.currentGraphState.level,
            traversalOwnership: ctx.currentGraphState.traversalOwnership
        };
    }
}

module.exports = {
    handleGraphTrace,
    applyGraphMutation,
    attachGraphState
};
