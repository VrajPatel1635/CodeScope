const { executeJavaCode } = require('./services/executionService');

// Test: multi-statement on one line: head = head.next; return 0;
// Previously caused unreachable statement error
const code = `
class Solution {
    public int deleteMiddle(ListNode head) {
        head = head.next; return 0;
    }
}
`;

console.log("=== Testing multi-statement normalization ===\n");

executeJavaCode(code, '1->2->3').then(result => {
    if (!result.success) {
        // Check: if it's just the input parse error, Java compiled fine
        if (result.error && result.error.includes('Invalid number')) {
            console.log("✅ Java compiled OK — input format issue only (expected for ListNode test)");
        } else {
            console.log("❌ FAILED:");
            console.log(result.error);
        }
    } else {
        console.log("✅ SUCCESS!");
        result.states.forEach(s => {
            const desc = s.callEvent ? `[${s.callEvent.type}]` :
                         s.ptrMoveEvent ? `[PTR_MOVE ${s.ptrMoveEvent.variable}->${s.ptrMoveEvent.nodeId}]` :
                         `[line ${s.line}]`;
            console.log(`  step ${s.step}: ${desc}`);
        });
    }
}).catch(e => console.error("❌ Exception:", e.message));
