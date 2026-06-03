const { handleArrayTrace, applyArrayMutation, attachArrayState } = require("../structures/arrays/arrayStateHandler");
const { handleLinkedListTrace, applyLinkedListMutation, attachLinkedListState } = require("../structures/linkedlist/linkedListStateHandler");
const { handleTreeTrace, applyTreeMutation, attachTreeState } = require("../structures/tree/treeStateHandler");
const { handleGraphTrace, applyGraphMutation, attachGraphState } = require("../structures/graph/graphStateHandler");
const { handleCollectionTrace, applyCollectionMutation, attachCollectionState } = require("../structures/collections/collectionStateHandler");

function parseValue(value) {
    if (typeof value === "number") return value;
    if (value === "null") return null;
    if (value === "true") return true;
    if (value === "false") return false;
    if (typeof value === "string" && value.trim() !== "" && !isNaN(value)) {
        return Number(value);
    }
    return value;
}

function topVars(stack) {
    return stack.length > 0 ? { ...stack[stack.length - 1].variables } : {};
}

class StateEngineContext {
    constructor(initialArray) {
        this.states = [];
        this.step = 1;
        
        let isMatrix = Array.isArray(initialArray) && Array.isArray(initialArray[0]);
        this.currentArrayState = (!isMatrix && Array.isArray(initialArray)) ? [...initialArray] : null;
        this.currentMatrixState = isMatrix ? initialArray.map(row => [...row]) : null;
        this.currentLinkedListState = null;
        this.currentTreeState = null;

        if (initialArray && !Array.isArray(initialArray)) {
           if (initialArray.type === "LinkedList") {
               this.currentLinkedListState = {
                   head: initialArray.head,
                   nodes: JSON.parse(JSON.stringify(initialArray.nodes))
               };
           } else if (initialArray.type === "Tree") {
               this.currentTreeState = {
                   root: initialArray.root,
                   nodes: JSON.parse(JSON.stringify(initialArray.nodes))
               };
           } else if (initialArray.type === "Graph") {
               this.currentGraphState = {
                   nodes: new Set(),
                   adjacency: {},
                   visitedState: {},
                   distanceState: {},
                   parentState: {},
                   traversalOwnership: "DFS",
                   queue: [],
                   frontier: new Set(),
                   level: 0
               };
               this.currentCollectionsState = {};
           }
        }

        this.frameCounter = 0;
        this.stack = [{ function: "global", variables: {}, frameId: "F0", currentLine: null }];
        this.pendingExprByDepth = new Map();
        this.lastChildReturnValue = null;
        this.currentLoops = {};
    }

    topVars() {
        return topVars(this.stack);
    }

    cloneStack() {
        return this.stack.map(f => ({
            function:  f.function,
            variables: { ...f.variables },
            frameId: f.frameId,
            currentLine: f.currentLine,
            isReturning: f.isReturning || false,
            returnValue: f.returnValue !== undefined ? f.returnValue : null
        }));
    }

    createStep(type, overrides = {}) {
        return {
            stepId: this.step,
            type,
            frameId: this.stack[this.stack.length - 1].frameId,
            step: this.step++,
            line: this.stack[this.stack.length - 1].currentLine,
            ...overrides
        };
    }
}

function buildState(traceEvents, initialArray) {
    const ctx = new StateEngineContext(initialArray);

    for (const event of traceEvents) {
        let currentStep = null;

        if (event.type === "CALL") {
            ctx.stack.push({
                function: event.function,
                variables: {},
                frameId: `F${++ctx.frameCounter}`,
                currentLine: null,
            });

            currentStep = ctx.createStep(event.type, {
                callEvent: { type: "CALL", function: event.function },
            });
        } else if (event.type === "LINE") {
            ctx.stack[ctx.stack.length - 1].currentLine = event.line;
            currentStep = ctx.createStep(event.type);
        } else if (event.type === "VAR") {
            if (event.name === "__return__") continue;
            const parsedVal = parseValue(event.value);
            ctx.stack[ctx.stack.length - 1].variables[event.name] = parsedVal;
            currentStep = ctx.createStep(event.type, { name: event.name, value: parsedVal });
        } else if (event.type === "EXPR") {
            ctx.pendingExprByDepth.set(ctx.stack.length, {
                left:      event.left,
                operator:  event.operator,
                rightFn:   event.rightFn,
                leftValue: event.leftValue,
            });
        } else if (event.type === "COND") {
            ctx.stack[ctx.stack.length - 1].currentLine = event.line;
            currentStep = ctx.createStep(event.type, {
                line: event.line,
                traceEvent: event,
            });
        } else if (event.type === "RETURN") {
            const returnValue = parseValue(event.value);
            const returningFrame = ctx.stack.length > 0 ? ctx.stack[ctx.stack.length - 1] : null;
            const returningFunction = returningFrame ? returningFrame.function : "unknown";

            if (returningFrame) {
                returningFrame.isReturning = true;
                returningFrame.returnValue = returnValue;
            }

            currentStep = ctx.createStep(event.type, {
                frameId: returningFrame ? returningFrame.frameId : null,
                line: returningFrame ? returningFrame.currentLine : null,
                return: returnValue,
                callEvent: { type: "RETURN", value: returnValue },
            });

            const depth = ctx.stack.length;
            const pendingExpr = ctx.pendingExprByDepth.get(depth);
            if (pendingExpr) {
                const rightValue = ctx.lastChildReturnValue;
                currentStep.expressionEvaluation = {
                    left:       pendingExpr.left,
                    operator:   pendingExpr.operator,
                    rightFn:    pendingExpr.rightFn,
                    leftValue:  pendingExpr.leftValue,
                    rightValue: rightValue,
                    result:     returnValue,
                };
                ctx.pendingExprByDepth.delete(depth);
            }

            currentStep.shouldPopFrame = true;
            const parentFrame = ctx.stack.length > 1 ? ctx.stack[ctx.stack.length - 2] : ctx.stack[0];
            currentStep.returnFlow = {
                fromFunction: returningFunction,
                toFunction:   parentFrame.function,
                value:        returnValue,
            };

            ctx.lastChildReturnValue = returnValue;
        } else if (event.type === "LOOP") {
            ctx.currentLoops[event.loopId] = event.iteration;
            currentStep = ctx.createStep(event.type, {
                loopEvent: { loopId: event.loopId, iteration: event.iteration },
            });
        } else if (event.type === "LOOP_ITER") {
            ctx.currentLoops[event.loopId] = (ctx.currentLoops[event.loopId] || 0) + 1;
            currentStep = ctx.createStep(event.type, {
                loopEvent: { loopId: event.loopId, iteration: ctx.currentLoops[event.loopId] },
            });
        } else if (event.type === "LOOP_END") {
            delete ctx.currentLoops[event.loopId];
            currentStep = ctx.createStep(event.type, {
                loopEvent: { loopId: event.loopId },
            });
        } else {
            currentStep = handleArrayTrace(event, ctx) ||
            handleLinkedListTrace(event, ctx) ||
            handleTreeTrace(event, ctx) ||
            handleGraphTrace(event, ctx) ||
            handleCollectionTrace(event, ctx);
        }

        if (currentStep) {
            applyArrayMutation(currentStep, ctx);
            applyLinkedListMutation(currentStep, ctx);
            applyTreeMutation(currentStep, ctx);
            applyGraphMutation(currentStep, ctx);
            applyCollectionMutation(currentStep, ctx);

            attachArrayState(currentStep, ctx);
            attachLinkedListState(currentStep, ctx);
            attachTreeState(currentStep, ctx);
            attachGraphState(currentStep, ctx);
            attachCollectionState(currentStep, ctx);

            currentStep.currentFrameVariables = ctx.topVars();
            currentStep.stack = ctx.cloneStack();
            currentStep.loopContext = { ...ctx.currentLoops };

            ctx.states.push(currentStep);

            if (currentStep.shouldPopFrame) {
                ctx.stack.pop();
                if (ctx.stack.length === 0) {
                    ctx.stack.push({ function: "global", variables: {}, frameId: "F0", currentLine: null });
                }
                delete currentStep.shouldPopFrame;
            }
        }
    }

    return ctx.states;
}

module.exports = { buildState };
