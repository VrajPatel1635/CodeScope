// Test PTR_MOVE step ordering with corrected trace stream:
// No TRACE|VAR fires before PTR_MOVE for pointer variables (suppressed in executionService)
// So the stream is: LINE → PTR_MOVE (announces) → state-update step

const { buildState } = require('./utils/stateEngine');

const initialList = {
    type: "LinkedList",
    head: "node_1",
    nodes: {
        node_1: { id: "node_1", val: 1, next: "node_2" },
        node_2: { id: "node_2", val: 2, next: null },
    }
};

// Corrected trace stream: VAR for head is suppressed when PTR_MOVE follows
const traceEvents = [
    { type: "CALL",     function: "deleteMiddle" },
    { type: "VAR",      name: "head", value: "node_1" },   // initial param log
    { type: "LINE",     line: 2 },
    // NO VAR here — suppressed because next line is PTR_MOVE
    { type: "PTR_MOVE", variable: "head", nodeId: "node_2" },
    { type: "LINE",     line: 3 },
    { type: "RETURN",   value: 0 },
];

const states = buildState(traceEvents, initialList);

console.log("=== PTR_MOVE step ordering test (corrected stream) ===\n");

states.forEach(s => {
    const tag = s.ptrMoveEvent
        ? `[PTR_MOVE: ${s.ptrMoveEvent.variable} → ${s.ptrMoveEvent.nodeId}]`
        : s.callEvent
        ? `[${s.callEvent.type}]`
        : `[step]`;

    const headVar = s.currentFrameVariables ? s.currentFrameVariables.head : "(none)";
    console.log(`Step ${s.step}: ${tag}  |  head = "${headVar}"`);
});

// Find and validate the two PTR_MOVE related steps
const ptrStep   = states.find(s => s.ptrMoveEvent);
const afterStep = ptrStep ? states.find(s => s.step === ptrStep.step + 1) : null;

console.log("\n=== Summary ===");
if (ptrStep && afterStep) {
    const oldHead = ptrStep.currentFrameVariables.head;
    const newHead = afterStep.currentFrameVariables.head;
    console.log(`Step ${ptrStep.step}  [PTR_MOVE]    head = "${oldHead}" (expected: node_1 OLD)`);
    console.log(`Step ${afterStep.step} [state update] head = "${newHead}" (expected: node_2 NEW)`);
    const ok = oldHead === "node_1" && newHead === "node_2";
    console.log(ok ? "\n✅ ORDERING CORRECT" : "\n❌ ORDERING WRONG");
} else {
    console.log("❌ Could not find PTR_MOVE step or its successor");
}
