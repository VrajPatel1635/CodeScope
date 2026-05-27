function printSourceSteps(sourceSteps) {
    for (const step of sourceSteps) {
        console.log("================================");
        console.log(`SOURCE STEP #${step.sourceStepId}`);
        console.log(`FRAME: ${step.frameId}`);
        console.log(`LINE: ${step.lineNumber}`);
        console.log(`FIRST MICRO: ${step.firstMicroStep}`);
        console.log(`LAST MICRO: ${step.lastMicroStep}`);
        console.log(`OWNED MICRO STEPS: [${step.microStepIds.join(",")}]`);
        console.log("================================");
    }
}

module.exports = { printSourceSteps };
