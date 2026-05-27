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

/**
 * Helper: return a shallow copy of the variables from the top stack frame,
 * or an empty object if the stack is empty.
 */
function topVars(stack) {
    return stack.length > 0 ? { ...stack[stack.length - 1].variables } : {};
}

function buildState(traceEvents, initialArray) {
    const states = [];
    let step = 1;
    
    // Evaluate if input is 1D or 2D Array
    let isMatrix = Array.isArray(initialArray) && Array.isArray(initialArray[0]);
    let currentArrayState = (!isMatrix && Array.isArray(initialArray)) ? [...initialArray] : null;
    let currentMatrixState = isMatrix ? initialArray.map(row => [...row]) : null;
    let currentLinkedListState = null;

    if (initialArray && !Array.isArray(initialArray) && initialArray.type === "LinkedList") {
       currentLinkedListState = {
           head: initialArray.head,
           nodes: JSON.parse(JSON.stringify(initialArray.nodes))
       };
    }

    let frameCounter = 0;
    // ── Stack-based scoping ──────────────────────────────────────────
    // Each entry: { function: "<name>", variables: { ... } }
    // Initialised with a "global" frame so the stack is never empty.
    let stack = [{ function: "global", variables: {}, frameId: "F0", currentLine: null }];

    // ── Expression tracking ──────────────────────────────────────────
    // EXPR events fire BEFORE `var trace_return = n * solve(n-1)`.
    // The recursive call inside that expression generates its own
    // CALL/VAR/RETURN/EXPR events in between, so a single buffer would
    // be clobbered before the outer RETURN fires.
    //
    // Fix: key each pending expression by the STACK DEPTH at which it
    // was emitted. The RETURN at that same depth consumes and removes it.
    const pendingExprByDepth = new Map(); // depth → expr metadata

    // Tracks the most-recent child RETURN value. Because recursion is
    // depth-first, the last RETURN before a parent fires its own RETURN
    // is always that parent's direct child. Used to populate rightValue.
    let lastChildReturnValue = null;

    // Tracks loops we are currently in
    let currentLoops = {};

    for (const event of traceEvents) {
        let currentStep = null;

        // ── CALL ─────────────────────────────────────────────────────
        if (event.type === "CALL") {
            stack.push({
                function: event.function,
                variables: {},
                frameId: `F${++frameCounter}`,
                currentLine: null,
            });

            currentStep = {
                stepId: step,
                type: event.type,
                frameId: stack[stack.length - 1].frameId,
                step: step++,
                line: stack[stack.length - 1].currentLine,
                callEvent: { type: "CALL", function: event.function },
            };

        // ── LINE ─────────────────────────────────────────────────────
        } else if (event.type === "LINE") {
            stack[stack.length - 1].currentLine = event.line;
            currentStep = {
                stepId: step,
                type: event.type,
                frameId: stack[stack.length - 1].frameId,
                step: step++,
                line: stack[stack.length - 1].currentLine,
            };

        // ── VAR ──────────────────────────────────────────────────────
        } else if (event.type === "VAR") {
            // __return__ is an injected marker only; skip it.
            if (event.name === "__return__") {
                continue;
            }
            stack[stack.length - 1].variables[event.name] = parseValue(event.value);
            currentStep = {
                stepId: step,
                type: event.type,
                frameId: stack[stack.length - 1].frameId,
                step: step++,
                line: stack[stack.length - 1].currentLine,
            };

        // ── EXPR ──────────────────────────────────────────────────────
        } else if (event.type === "EXPR") {
            // Store expr info at current depth. The RETURN at this depth
            // will read and remove it.
            pendingExprByDepth.set(stack.length, {
                left:      event.left,
                operator:  event.operator,
                rightFn:   event.rightFn,
                leftValue: event.leftValue,
            });
            // No step emitted — this is metadata only.

        // ── COND ─────────────────────────────────────────────────────
        } else if (event.type === "COND") {
            stack[stack.length - 1].currentLine = event.line;
            currentStep = {
                stepId: step,
                type: event.type,
                frameId: stack[stack.length - 1].frameId,
                step: step++,
                line: event.line,
                traceEvent: event,
            };

        // ── RETURN ───────────────────────────────────────────────────
        } else if (event.type === "RETURN") {
            const returnValue = parseValue(event.value);

            // Capture returning frame name BEFORE popping.
            const returningFrame = stack.length > 0 ? stack[stack.length - 1] : null;
            const returningFunction = returningFrame ? returningFrame.function : "unknown";

            // Establish frame-local return ownership
            if (returningFrame) {
                returningFrame.isReturning = true;
                returningFrame.returnValue = returnValue;
            }

            currentStep = {
                stepId: step,
                type: event.type,
                frameId: returningFrame ? returningFrame.frameId : null,
                step: step++,
                line: returningFrame ? returningFrame.currentLine : null,
                return: returnValue,
                callEvent: { type: "RETURN", value: returnValue },
            };

            // Consume the EXPR entry stored at THIS depth (if any).
            const depth = stack.length;
            const pendingExpr = pendingExprByDepth.get(depth);
            if (pendingExpr) {
                // rightValue = what the child call returned (last RETURN seen)
                // result     = final value this frame computes (leftValue OP rightValue)
                const rightValue = lastChildReturnValue;
                currentStep.expressionEvaluation = {
                    left:       pendingExpr.left,
                    operator:   pendingExpr.operator,
                    rightFn:    pendingExpr.rightFn,
                    leftValue:  pendingExpr.leftValue,
                    rightValue: rightValue,
                    result:     returnValue,
                };
                pendingExprByDepth.delete(depth);
            }

            // DO NOT OVERWRITE PARENT'S STATE WITH CHILD'S RETURN.
            // Pop the completely finished frame LATER at the very end of this iteration
            // so that it survives long enough to be snapshot recursively as "currently returning".
            currentStep.shouldPopFrame = true;

            // returnFlow: who returned, to whom, with what value.
            const parentFrame = stack.length > 1 ? stack[stack.length - 2] : stack[0];
            currentStep.returnFlow = {
                fromFunction: returningFunction,
                toFunction:   parentFrame.function,
                value:        returnValue,
            };

            // Record this RETURN's value so the parent frame can use it
            // as the rightValue of its own expressionEvaluation.
            lastChildReturnValue = returnValue;

        // ── ARRAY ─────────────────────────────────────────────────────
        } else if (event.type === "ARRAY") {
            currentStep = {
                stepId: step,
                type: event.type,
                frameId: stack[stack.length - 1].frameId,
                step: step++,
                line: stack[stack.length - 1].currentLine,
                arrayEvent: {
                    name:  event.name,
                    index: event.index,
                    value: event.value,
                },
            };

        // ── LOOP ──────────────────────────────────────────────────────
        } else if (event.type === "LOOP") {
            currentLoops[event.loopId] = event.iteration;
            currentStep = {
                stepId: step,
                type: event.type,
                frameId: stack[stack.length - 1].frameId,
                step: step++,
                line: stack[stack.length - 1].currentLine,
                loopEvent: {
                    loopId: event.loopId,
                    iteration: event.iteration,
                },
            };

        // ── LOOP_ITER & LOOP_END ──────────────────────────────────────
        } else if (event.type === "LOOP_ITER") {
            currentLoops[event.loopId] = (currentLoops[event.loopId] || 0) + 1;
            currentStep = {
                stepId: step,
                type: event.type,
                frameId: stack[stack.length - 1].frameId,
                step: step++,
                line: stack[stack.length - 1].currentLine,
                loopEvent: {
                    loopId: event.loopId,
                    iteration: currentLoops[event.loopId],
                },
            };
        } else if (event.type === "LOOP_END") {
            delete currentLoops[event.loopId];
            // Don't emit a separate step just for loop cleanup unless needed,
            // but we can just update the context silently for the next step.

        // ── NODE LINK ─────────────────────────────────────────────────
        } else if (event.type === "NODE_LINK") {
            currentStep = {
                stepId: step,
                type: event.type,
                frameId: stack[stack.length - 1].frameId,
                step: step++,
                line: stack[stack.length - 1].currentLine,
                nodeLinkEvent: {
                    from: event.from,
                    to: event.to
                }
            };

        // ── PTR MOVE ──────────────────────────────────────────────────
        } else if (event.type === "PTR_MOVE") {
            const nodeId = event.nodeId === "null" ? null : event.nodeId;

            // ── Step N: announce event with OLD (pre-mutation) state ──
            // Push manually so the bottom state-attachment block does NOT
            // run for this step (it only runs for whatever currentStep is
            // at the end of this if-else chain).
            const announceStep = {
                stepId: step,
                type: event.type,
                frameId: stack[stack.length - 1].frameId,
                step: step++,
                line: stack[stack.length - 1].currentLine,
                ptrMoveEvent: { variable: event.variable, nodeId: nodeId },
                // Snapshot OLD variables (pointer not yet moved)
                currentFrameVariables: topVars(stack),
                stack: stack.map(f => ({
                    function:  f.function,
                    variables: { ...f.variables },
                    frameId: f.frameId,
                    currentLine: f.currentLine,
                    isReturning: f.isReturning || false,
                    returnValue: f.returnValue !== undefined ? f.returnValue : null
                })),
                loopContext: { ...currentLoops },
            };
            // Attach linked-list snapshot with OLD pointer positions
            if (currentLinkedListState) {
                announceStep.linkedList = {
                    head: currentLinkedListState.head,
                    nodes: JSON.parse(JSON.stringify(currentLinkedListState.nodes)),
                };
            }
            states.push(announceStep);

            // ── Apply mutation ────────────────────────────────────────
            stack[stack.length - 1].variables[event.variable] = nodeId;

            // ── Step N+1: plain step — bottom block attaches NEW state ─
            currentStep = {
                stepId: step,
                type: event.type + "_APPLIED",
                frameId: stack[stack.length - 1].frameId,
                step: step++,
                line: stack[stack.length - 1].currentLine,
            };

        // ── NODE MUTATE ───────────────────────────────────────────────
        } else if (event.type === "NODE_MUTATE") {
            const fromNodeId = event.fromNodeId === "null" ? null : event.fromNodeId;
            const toNodeId = event.toNodeId === "null" ? null : event.toNodeId;

            // ── Step N: announce event with OLD (pre-mutation) state ──
            const announceStep = {
                stepId: step,
                type: event.type,
                frameId: stack[stack.length - 1].frameId,
                step: step++,
                line: stack[stack.length - 1].currentLine,
                nodeMutateEvent: { fromNodeId, toNodeId },
                currentFrameVariables: topVars(stack),
                stack: stack.map(f => ({
                    function:  f.function,
                    variables: { ...f.variables },
                    frameId: f.frameId,
                    currentLine: f.currentLine,
                    isReturning: f.isReturning || false,
                    returnValue: f.returnValue !== undefined ? f.returnValue : null
                })),
                loopContext: { ...currentLoops },
            };
            if (currentLinkedListState) {
                announceStep.linkedList = {
                    head: currentLinkedListState.head,
                    nodes: JSON.parse(JSON.stringify(currentLinkedListState.nodes)),
                };
            }
            if (currentArrayState) announceStep.array = [...currentArrayState];
            if (currentMatrixState) announceStep.matrix = currentMatrixState.map(r => [...r]);
            states.push(announceStep);

            // ── Apply mutation ────────────────────────────────────────
            if (currentLinkedListState && currentLinkedListState.nodes[fromNodeId]) {
                currentLinkedListState.nodes[fromNodeId].next = toNodeId;
            }

            // ── Step N+1: plain step — bottom block attaches NEW state ─
            currentStep = {
                stepId: step,
                type: event.type + "_APPLIED",
                frameId: stack[stack.length - 1].frameId,
                step: step++,
                line: stack[stack.length - 1].currentLine,
            };
        }

        if (currentStep) {
            // Array/List tracking updates
            if (currentStep.arrayEvent && currentArrayState) {
                const index = parseInt(currentStep.arrayEvent.index);
                const value = parseInt(currentStep.arrayEvent.value);
                currentArrayState[index] = value;
            } else if (currentStep.nodeLinkEvent && currentLinkedListState) {
                const { from, to } = currentStep.nodeLinkEvent;
                if (currentLinkedListState.nodes[from]) {
                    currentLinkedListState.nodes[from].next = to;
                }
            }

            // Attach array/matrix/linked list tracker dynamically
            if (currentArrayState) {
                currentStep.array = [...currentArrayState];
            } else if (currentMatrixState) {
                currentStep.matrix = currentMatrixState.map(r => [...r]);
            } else if (currentLinkedListState) {
                currentStep.linkedList = {
                    head: currentLinkedListState.head,
                    nodes: JSON.parse(JSON.stringify(currentLinkedListState.nodes))
                };
            }

            // Top-frame variables — single source of truth
            currentStep.currentFrameVariables = topVars(stack);

            // Full stack snapshot (each frame with its own variables)
            currentStep.stack = stack.map((f) => ({
                function:  f.function,
                variables: { ...f.variables },
                frameId: f.frameId,
                currentLine: f.currentLine,
                isReturning: f.isReturning || false,
                returnValue: f.returnValue !== undefined ? f.returnValue : null
            }));

            // Attach loop context
            currentStep.loopContext = { ...currentLoops };

            states.push(currentStep);

            // NOW pop the frame if it completed, ensuring properties were snapshotted locally
            if (currentStep.shouldPopFrame) {
                stack.pop();
                if (stack.length === 0) {
                    stack.push({ function: "global", variables: {}, frameId: "F0", currentLine: null });
                }
                delete currentStep.shouldPopFrame;
            }
        }
    }

    return states;
}

module.exports = { buildState };
