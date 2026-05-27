function deriveSourceSteps(microSteps) {
    const sourceSteps = [];
    let sourceStepIdCounter = 1;
    const activeSourceStepsByFrame = new Map();

    for (const microStep of microSteps) {
        const { stepId, type, line, frameId } = microStep;

        if (type === "LINE") {
            // Close active step for this frame BEFORE starting a new one
            if (activeSourceStepsByFrame.has(frameId)) {
                const activeStep = activeSourceStepsByFrame.get(frameId);
                sourceSteps.push(activeStep);
                activeSourceStepsByFrame.delete(frameId);
            }

            // Start new step
            activeSourceStepsByFrame.set(frameId, {
                sourceStepId: sourceStepIdCounter++,
                sourceStepType: "LINE",
                frameId: frameId,
                lineNumber: line,
                firstMicroStep: stepId,
                lastMicroStep: stepId,
                microStepIds: [stepId]
            });
        } else if (type === "RETURN") {
            // Append RETURN to active step, then close it because the frame is exiting
            if (activeSourceStepsByFrame.has(frameId)) {
                const activeStep = activeSourceStepsByFrame.get(frameId);
                activeStep.microStepIds.push(stepId);
                activeStep.lastMicroStep = stepId;
                
                sourceSteps.push(activeStep);
                activeSourceStepsByFrame.delete(frameId);
            }
        } else {
            // Append to active step for this frame
            if (activeSourceStepsByFrame.has(frameId)) {
                const activeStep = activeSourceStepsByFrame.get(frameId);
                activeStep.microStepIds.push(stepId);
                activeStep.lastMicroStep = stepId;
            } else {
                // Collect events BEFORE first LINE into PREP source-step
                activeSourceStepsByFrame.set(frameId, {
                    sourceStepId: sourceStepIdCounter++,
                    sourceStepType: "PREP",
                    frameId: frameId,
                    firstMicroStep: stepId,
                    lastMicroStep: stepId,
                    microStepIds: [stepId]
                });
            }
        }
    }

    // Push any remaining active steps
    for (const activeStep of activeSourceStepsByFrame.values()) {
        sourceSteps.push(activeStep);
    }

    // Sort by sourceStepId to maintain chronological start order
    sourceSteps.sort((a, b) => a.sourceStepId - b.sourceStepId);

    return sourceSteps;
}

module.exports = { deriveSourceSteps };
