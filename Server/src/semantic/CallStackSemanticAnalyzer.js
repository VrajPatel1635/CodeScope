const analyzeCallStackSemantics = (states) => {
    const semanticFrames = new Map();

    const addSemantics = (step, semantics) => {
        if (!semanticFrames.has(step)) {
            semanticFrames.set(step, []);
        }
        semanticFrames.get(step).push(...semantics);
    };

    let previousStack = [];
    let previousEvent = null;
    let consecutiveReturns = 0;

    for (let i = 0; i < states.length; i++) {
        const state = states[i];
        const currentStack = state.callStack || [];
        const currentEvent = state.event;
        const currentStep = state.step;

        const depthDiff = currentStack.length - previousStack.length;

        // Derived semantics
        if (depthDiff > 0 && currentEvent === 'CALL') {
            const newFrame = currentStack[currentStack.length - 1]; // stateEngine push() to stack, so top is last!
            const parentFrame = currentStack[currentStack.length - 2];

            addSemantics(currentStep, [{ type: "RECURSIVE_DESCENT", frameId: newFrame?.function, depth: currentStack.length - 1 }]);
            if (parentFrame) {
                addSemantics(currentStep, [{ type: "FRAME_SUSPENSION", frameId: parentFrame?.function, depth: currentStack.length - 2 }]);
            }
            consecutiveReturns = 0;
        } 
        else if (currentEvent === 'RETURN' || currentEvent === 'LINE') {
            const currentFrame = currentStack[currentStack.length - 1];

            // Check for Base case (if call is immediately followed by return within the same frame logic)
            if (previousEvent === 'CALL' && currentEvent === 'RETURN') {
                addSemantics(currentStep, [{ type: "BASE_CASE_REACHED", frameId: currentFrame?.function, depth: currentStack.length - 1 }]);
            }
            
            if (currentEvent === 'RETURN' && depthDiff < 0) {
                const returnedFrame = previousStack[previousStack.length - 1];
                const resumingFrame = currentStack[currentStack.length - 1];

                addSemantics(currentStep, [{ type: "RETURN_PROPAGATION", frameId: returnedFrame?.function, depth: previousStack.length - 1 }]);
                if (resumingFrame) {
                    addSemantics(currentStep, [{ type: "FRAME_RESUMPTION", frameId: resumingFrame?.function, depth: currentStack.length - 1 }]);
                }

                consecutiveReturns++;
                if (consecutiveReturns >= 2) {
                    addSemantics(currentStep, [{ type: "UNWIND_PHASE", frameId: resumingFrame?.function, depth: currentStack.length - 1 }]);
                }
            } else if (currentEvent === 'LINE') {
                consecutiveReturns = 0;
            }
        }

        previousStack = [...currentStack];
        previousEvent = currentEvent;
    }

    return semanticFrames;
};

module.exports = {
    analyzeCallStackSemantics
};
