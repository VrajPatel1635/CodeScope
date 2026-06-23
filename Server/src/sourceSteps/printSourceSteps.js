const logger = require("../utils/logger");

function printSourceSteps(sourceSteps) {
    for (const step of sourceSteps) {
        logger.debug("================================");
        logger.debug(`SOURCE STEP #${step.sourceStepId}`);
        logger.debug(`FRAME: ${step.frameId}`);
        logger.debug(`LINE: ${step.lineNumber}`);
        logger.debug(`FIRST MICRO: ${step.firstMicroStep}`);
        logger.debug(`LAST MICRO: ${step.lastMicroStep}`);
        logger.debug(`OWNED MICRO STEPS: [${step.microStepIds.join(",")}]`);
        logger.debug("================================");
    }
}

module.exports = { printSourceSteps };
