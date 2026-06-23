const logger = require("../utils/logger");

function resolveSourceStepStates(sourceSteps, microStates) {
    // Source timeline is ordered by when a line is first hit (deriveSourceSteps sorts by
    // sourceStepId, which increments when the step is created). If we resolve a LINE source-step
    // to a later micro-step (e.g., RETURN appended when the frame exits), selecting/playing the
    // source timeline will "time travel" forward and leak return semantics onto earlier steps.
    //
    // Resolution rules:
    // - LINE: resolve to the FIRST owned micro-step (the LINE event itself)
    // - PREP (and everything else): resolve to the LAST owned micro-step
    const resolvedSourceSteps = sourceSteps.map((step) => {
        let resolvedMicroStepId = null;

        if (step.microStepIds && step.microStepIds.length > 0) {
            if (step.sourceStepType === "LINE") {
                resolvedMicroStepId = step.microStepIds[0];
            } else {
                resolvedMicroStepId = step.microStepIds[step.microStepIds.length - 1];
            }
        }

        return { ...step, resolvedMicroStepId };
    });

    return resolvedSourceSteps;
}

function printResolvedSourceSteps(sourceSteps) {
    for (const step of sourceSteps) {
        logger.debug("================================");
        logger.debug(`SOURCE STEP #${step.sourceStepId}`);
        logger.debug(`TYPE: ${step.sourceStepType}`);
        logger.debug(`FRAME: ${step.frameId}`);
        if (step.sourceStepType === "LINE") {
            logger.debug(`LINE: ${step.lineNumber}`);
        }
        logger.debug("");
        logger.debug(`OWNED MICRO STEPS:`);
        logger.debug(`[${step.microStepIds.join(",")}]`);
        logger.debug("");
        logger.debug(`RESOLVED MICRO STEP:`);
        logger.debug(`${step.resolvedMicroStepId}`);
        logger.debug("==");
    }
}

module.exports = {
    resolveSourceStepStates,
    printResolvedSourceSteps
};
