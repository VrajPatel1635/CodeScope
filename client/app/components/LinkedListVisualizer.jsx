"use client";
import { motion, AnimatePresence } from "framer-motion";

// ── Traverse from a given root ────────────────────────────────────────────────
// Respects the global `visited` set so nodes are never duplicated across components.
function traverseFrom(startId, nodes, visited) {
  const sequence = [];
  let hasCycle = false;
  let cycleStartId = null;
  const localVisited = new Set();

  let currId = startId;
  while (currId && nodes[currId]) {
    if (visited.has(currId)) break;
    if (localVisited.has(currId)) {
      hasCycle = true;
      cycleStartId = currId;
      break;
    }
    localVisited.add(currId);
    visited.add(currId);
    sequence.push({ ...nodes[currId], id: currId });
    currId = nodes[currId].next;
  }

  return { sequence, hasCycle, cycleStartId };
}

// ── Detect whether we are in "reverse-list algorithm mode" ────────────────────
// Heuristic: `prev` AND `curr` both hold node_* values at the same time.
// This is robust and doesn't touch any code parsing.
function detectReverseMode(vars, nodes) {
  const prevId = typeof vars.prev === "string" && vars.prev.startsWith("node_") ? vars.prev : null;
  const currId = typeof vars.curr === "string" && vars.curr.startsWith("node_") ? vars.curr : null;
  if (!prevId || !currId) return null;

  // The remaining chain is what `next` points to, or null.
  const nextId = typeof vars.next === "string" && vars.next.startsWith("node_") ? vars.next : null;

  return { prevId, currId, nextId };
}

// ── Detect whether we are in "fast/slow pointer mode" ────────────────────────
// Heuristic: `slow` AND `fast` both hold node_* values simultaneously.
// Covers: middle-of-list, Floyd cycle detection, palindrome check, etc.
function detectFastSlowMode(vars, nodes) {
  const slowId = typeof vars.slow === "string" && vars.slow.startsWith("node_") ? vars.slow : null;
  const fastId = typeof vars.fast === "string" && vars.fast.startsWith("node_") ? vars.fast : null;
  if (!slowId || !fastId) return null;
  return { slowId, fastId };
}
// ── Semantic Overlay Panel ───────────────────────────────────────────────────
// Renders non-authoritative semantic annotations as subtle chips.
// currentSemantics: array of { type, pointers?, nodeId?, leader?, follower? }
const SEMANTIC_CONFIG = {
  TRANSIENT_OVERLAP: { label: "transient overlap",   color: "text-gray-500 bg-gray-50 border-gray-200",     icon: "~"  },
  STABLE_MEET:       { label: "stable meet",          color: "text-purple-700 bg-purple-50 border-purple-200", icon: "⚡" },
  CONVERGING:        { label: "converging",           color: "text-emerald-700 bg-emerald-50 border-emerald-200", icon: "▸" },
  DIVERGING:         { label: "diverging",            color: "text-orange-600 bg-orange-50 border-orange-200",  icon: "◂" },
  FOLLOWING:         { label: "following",            color: "text-blue-600 bg-blue-50 border-blue-200",      icon: "⇢" },
};

function SemanticOverlay({ semantics }) {
  if (!semantics || semantics.length === 0) return null;
  // Deduplicate by type so we don’t show the same chip twice in one frame
  const seen = new Set();
  const unique = semantics.filter(s => {
    if (seen.has(s.type)) return false;
    seen.add(s.type);
    return true;
  });

  return (
    <div className="flex flex-wrap gap-1.5 mt-2">
      {unique.map(s => {
        const cfg = SEMANTIC_CONFIG[s.type];
        if (!cfg) return null;
        const label = s.pointers
          ? `${s.pointers.join(" → ")}: ${cfg.label}`
          : s.leader
          ? `${cfg.icon} ${s.follower} follows ${s.leader}`
          : `${cfg.icon} ${cfg.label}`;
        return (
          <motion.span
            key={s.type}
            initial={{ opacity: 0, scale: 0.85 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className={`inline-flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wide px-1.5 py-0.5 rounded border ${cfg.color}`}
            title={`Semantic: ${s.type}`}
          >
            <span>{cfg.icon}</span> {label}
          </motion.span>
        );
      })}
    </div>
  );
}

function NodeBox({ node, pointers, mutatedNodeId, fastSlowRole, meetKind }) {
  const isMutated = node.id === mutatedNodeId;
  const activePointers = pointers.filter(p => p.target === node.id);

  // fast/slow styling overrides
  const isSlow  = fastSlowRole === "slow" || fastSlowRole === "both";
  const isFast  = fastSlowRole === "fast" || fastSlowRole === "both";
  const isBoth  = fastSlowRole === "both";

  let boxClass = "bg-white text-black border-gray-400";
  if (isBoth)       boxClass = "bg-purple-100 border-purple-500 text-purple-900 shadow-inner ring-4 ring-purple-300";
  else if (isSlow)  boxClass = "bg-teal-50 border-teal-500 text-teal-900 shadow-inner ring-2 ring-teal-300";
  else if (isFast)  boxClass = "bg-amber-50 border-amber-500 text-amber-900 shadow-inner ring-2 ring-amber-300";
  else if (activePointers.length > 0) boxClass = "bg-blue-100 border-blue-500 text-blue-900 shadow-inner ring-2 ring-blue-300";

  return (
    <div className="flex flex-col items-center">
      {/* Pointer emoji badges ABOVE the node (fast/slow only) */}
      <div className="flex gap-1 h-5 mb-0.5 items-center justify-center">
        {isBoth  && <motion.span key={`badge-both-${node.id}`} initial={{ scale: 0 }} animate={{ scale: 1 }} className="text-base leading-none">🐢🐇</motion.span>}
        {isSlow && !isBoth && <motion.span key={`badge-slow-${node.id}`} initial={{ scale: 0 }} animate={{ scale: 1 }} className="text-base leading-none">🐢</motion.span>}
        {isFast && !isBoth && <motion.span key={`badge-fast-${node.id}`} initial={{ scale: 0 }} animate={{ scale: 1 }} className="text-base leading-none">🐇</motion.span>}
      </div>

      {isMutated ? (
        <motion.div
          key={`mutate-${node.id}`}
          animate={{ scale: [1, 1.2, 1], backgroundColor: ["#f87171", "#4ade80"] }}
          transition={{ duration: 0.5 }}
          className="w-12 h-12 flex items-center justify-center border-2 font-bold rounded-lg shadow-md text-gray-900 border-green-600 bg-white"
        >
          {node.val}
        </motion.div>
      ) : (
        <div className={`w-12 h-12 flex items-center justify-center border-2 rounded-lg transition-all duration-300 font-bold shadow-sm ${boxClass}`}>
          {node.val}
        </div>
      )}

      {/* MEET badge — only for semantically stable convergence, NOT transient overlap */}
      {isBoth && meetKind === "stable" && (
        <motion.div
          key={`meet-${node.id}`}
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-1 px-1.5 py-0.5 bg-purple-600 text-white text-[10px] font-black uppercase rounded tracking-wider animate-pulse"
        >
          MEET
        </motion.div>
      )}
      {/* Transient overlap — subtle dot only, no MEET text */}
      {isBoth && meetKind === "transient" && (
        <div className="mt-1 w-1.5 h-1.5 rounded-full bg-purple-400 opacity-60" title="Transient overlap" />
      )}

      {/* Pointer labels beneath (existing layoutId slide system) */}
      <div className={`flex flex-row gap-1 mt-1 min-h-10 justify-center transition-opacity duration-300 ${activePointers.length > 0 ? "opacity-100" : "opacity-0"}`}>
        {activePointers.map(p => (
          <motion.div
            key={`ptr-${p.name}`}
            layoutId={`ptr-${p.name}`}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className={`flex flex-col items-center ${
              p.name === "slow" ? "text-teal-600" :
              p.name === "fast" ? "text-amber-600" :
              p.isMoving ? "text-green-500" : "text-blue-600"
            }`}
          >
            <div className="font-extrabold text-lg -mb-1">↑</div>
            <div className="font-extrabold text-xs whitespace-nowrap">{p.name}</div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

// ── Arrow ────────────────────────────────────────────────────────────────────
function Arrow({ isMutated, isMutatingToNull, stepKey, nodeId }) {
  if (isMutated) {
    return (
      <motion.div
        key={`mut-arrow-${stepKey}-${nodeId}`}
        initial={{ opacity: 1 }}
        animate={
          isMutatingToNull
            ? { opacity: 0, y: 15, rotate: 45, color: "#ef4444" }
            : { scale: [1, 1.8, 1], color: ["#9ca3af", "#f59e0b", "#9ca3af"] }
        }
        transition={{ duration: 0.5 }}
        className="text-gray-400 font-bold text-xl pb-6 flex items-center justify-center min-w-5"
      >
        →
      </motion.div>
    );
  }
  return <span className="text-gray-400 font-bold text-xl pb-6 flex items-center min-w-5">→</span>;
}

// ── Generic chain row (reused in both modes) ─────────────────────────────────
function ChainRow({ sequence, hasCycle, cycleStartId, pointers, mutatedNodeId, isMutatingToNull, stepKey, componentKey, fastSlowMap, meetKind }) {
  if (!sequence || sequence.length === 0) {
    return <span className="text-gray-400 italic text-sm self-center pb-6">null</span>;
  }

  const lastNode = sequence[sequence.length - 1];
  const lastNodeMutating = lastNode?.id === mutatedNodeId;

  return (
    <div className="flex flex-row items-center gap-2 flex-wrap">
      {sequence.map((node, idx) => {
        const isMutated = node.id === mutatedNodeId;
        return (
          <div key={`${componentKey}-${node.id}-${idx}`} className="flex flex-row items-center gap-2">
            <NodeBox
              node={node}
              pointers={pointers}
              mutatedNodeId={mutatedNodeId}
              fastSlowRole={fastSlowMap ? fastSlowMap[node.id] : undefined}
              meetKind={meetKind}
            />
            {idx < sequence.length - 1 && (
              <Arrow isMutated={isMutated} isMutatingToNull={isMutatingToNull} stepKey={stepKey} nodeId={node.id} />
            )}
          </div>
        );
      })}

      {/* Cycle or null terminator */}
      {hasCycle ? (
        <div className="flex items-center gap-2 pb-6">
          {lastNodeMutating ? (
            <motion.div
              key={`mut-cycle-${stepKey}`}
              animate={
                isMutatingToNull
                  ? { opacity: 0, y: 15, rotate: 45, color: "#ef4444" }
                  : { scale: [1, 1.8, 1], color: ["#ef4444", "#f59e0b", "#ef4444"] }
              }
              transition={{ duration: 0.5 }}
              className="text-red-500 font-bold text-xl"
            >→</motion.div>
          ) : (
            <span className="text-red-500 font-bold text-xl">→</span>
          )}
          <div className="px-3 py-1 bg-red-100 border border-red-400 text-red-700 text-xs font-bold rounded-full whitespace-nowrap animate-pulse">
            Loops to {cycleStartId} ↺
          </div>
        </div>
      ) : (
        <div className="flex items-center gap-2 pb-6">
          {lastNodeMutating ? (
            <motion.div
              key={`mut-null-${stepKey}`}
              animate={
                isMutatingToNull
                  ? { opacity: 0, y: 15, rotate: 45, color: "#ef4444" }
                  : { scale: [1, 1.8, 1], color: ["#9ca3af", "#f59e0b", "#9ca3af"] }
              }
              transition={{ duration: 0.5 }}
              className="text-gray-400 font-bold text-xl"
            >→</motion.div>
          ) : (
            <span className="text-gray-400 font-bold text-xl">→</span>
          )}
          <span className="text-gray-500 font-semibold text-sm italic">null</span>
        </div>
      )}
    </div>
  );
}

// ── Region label ─────────────────────────────────────────────────────────────
function RegionLabel({ color, icon, label }) {
  const colorMap = {
    green:  "text-emerald-700 bg-emerald-50 border-emerald-200",
    blue:   "text-blue-700 bg-blue-50 border-blue-200",
    orange: "text-orange-700 bg-orange-50 border-orange-200",
  };
  return (
    <div className={`inline-flex items-center gap-1 text-xs font-bold uppercase tracking-wide px-2 py-0.5 rounded border mb-1 ${colorMap[color]}`}>
      <span>{icon}</span> {label}
    </div>
  );
}

// ── REVERSE LIST MODE VIEW ────────────────────────────────────────────────────
function ReverseListView({ reverseInfo, nodes, pointers, mutatedNodeId, isMutatingToNull, stepKey }) {
  const { prevId, currId, nextId } = reverseInfo;
  const visited = new Set();

  // Reversed portion — chain from prev
  const { sequence: reversedSeq } = traverseFrom(prevId, nodes, visited);

  // Remaining — chain from next var (MUST be traversed BEFORE adding currId to visited).
  // When `curr = next` executes, both vars.curr and vars.next temporarily point to the same
  // node. Adding currId first would block traverseFrom(nextId) and make remaining disappear.
  const { sequence: remainingSeq } = nextId ? traverseFrom(nextId, nodes, visited) : { sequence: [] };

  // Current node — added to visited AFTER remaining traversal to avoid blocking it.
  const currNode = nodes[currId] ? [{ ...nodes[currId], id: currId }] : [];
  visited.add(currId);

  return (
    <div className="space-y-4 pt-2">
      {/* Reversed portion */}
      <div>
        <RegionLabel color="green" icon="✓" label="Reversed" />
        <motion.div layout className="flex flex-row items-center gap-2 flex-wrap">
          <ChainRow
            sequence={reversedSeq}
            hasCycle={false}
            pointers={pointers}
            mutatedNodeId={mutatedNodeId}
            isMutatingToNull={isMutatingToNull}
            stepKey={stepKey}
            componentKey="rev"
          />
        </motion.div>
      </div>

      {/* Current node */}
      <div>
        <RegionLabel color="blue" icon="►" label="Current" />
        <div className="flex flex-row items-center gap-2">
          {currNode.map(node => (
            <NodeBox key={node.id} node={node} pointers={pointers} mutatedNodeId={mutatedNodeId} />
          ))}
          {currNode.length === 0 && <span className="text-gray-400 italic text-sm self-center">—</span>}
        </div>
      </div>

      {/* Remaining portion */}
      <div>
        <RegionLabel color="orange" icon="…" label="Remaining" />
        <motion.div layout className="flex flex-row items-center gap-2 flex-wrap">
          <ChainRow
            sequence={remainingSeq}
            hasCycle={false}
            pointers={pointers}
            mutatedNodeId={mutatedNodeId}
            isMutatingToNull={isMutatingToNull}
            stepKey={stepKey}
            componentKey="rem"
          />
        </motion.div>
      </div>
    </div>
  );
}

// ── FAST / SLOW POINTER MODE VIEW ────────────────────────────────────────────
function FastSlowView({ fastSlowInfo, linkedList, nodes, pointers, mutatedNodeId, isMutatingToNull, stepKey, ptrMoveEvent, loopContext }) {
  const { slowId, fastId } = fastSlowInfo;
  const isMeeting = slowId === fastId;

  // ── Classify the meet semantically ──────────────────────────────────────
  // A "stable" meet is meaningful convergence: pointers are equal, no pointer
  // is mid-flight (ptrMoveEvent), AND we are actively inside a loop.
  // A "transient" overlap is two pointers temporarily on the same node while
  // one is being advanced — this is a real micro-step but NOT a semantic meet.
  let meetKind = null;
  if (isMeeting) {
    const isPointerMidFlight = !!ptrMoveEvent;
    const insideActiveLoop = Object.keys(loopContext || {}).length > 0;
    meetKind = (!isPointerMidFlight && insideActiveLoop) ? "stable" : "transient";
  }

  // Full list traversal from head (single track — both pointers ride the same rail)
  const visited = new Set();
  const { sequence, hasCycle, cycleStartId } = traverseFrom(linkedList.head || slowId, nodes, visited);

  // Build a role map: node id → "slow" | "fast" | "both"
  const fastSlowMap = {};
  if (slowId) fastSlowMap[slowId] = "slow";
  if (fastId) {
    fastSlowMap[fastId] = fastSlowMap[fastId] === "slow" ? "both" : "fast";
  }

  return (
    <div className="space-y-3 pt-2">
      {/* Legend strip */}
      <div className="flex items-center gap-4 text-xs font-semibold flex-wrap">
        <span className="flex items-center gap-1 text-teal-700 bg-teal-50 border border-teal-200 px-2 py-0.5 rounded">
          🐢 slow — 1 step / iter
        </span>
        <span className="flex items-center gap-1 text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded">
          🐇 fast — 2 steps / iter
        </span>
        {meetKind === "stable" && (
          <motion.span
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex items-center gap-1 text-purple-700 bg-purple-50 border border-purple-300 px-2 py-0.5 rounded animate-pulse font-black"
          >
            ⚡ Pointers met!
          </motion.span>
        )}
        {meetKind === "transient" && (
          <span className="flex items-center gap-1 text-gray-500 bg-gray-50 border border-gray-200 px-2 py-0.5 rounded italic" title="Pointers share a node during this micro-step but have not converged">
            ~ transient overlap
          </span>
        )}
      </div>

      {/* Single linear track */}
      <ChainRow
        sequence={sequence}
        hasCycle={hasCycle}
        cycleStartId={cycleStartId}
        pointers={pointers}
        mutatedNodeId={mutatedNodeId}
        isMutatingToNull={isMutatingToNull}
        stepKey={stepKey}
        componentKey="fs-main"
        fastSlowMap={fastSlowMap}
        meetKind={meetKind}
      />
    </div>
  );
}

// ── MAIN COMPONENT ────────────────────────────────────────────────────────────
export default function LinkedListVisualizer({ currentStep, pointers, currentSemantics = [], loopSemantics = [] }) {
  const linkedList = currentStep?.linkedList;
  if (!linkedList) return null;

  const nodes = linkedList.nodes || {};
  const vars = currentStep?.currentFrameVariables || {};

  const mutatedNodeId = currentStep.nodeMutateEvent?.fromNodeId ?? null;
  const isMutatingToNull = currentStep.nodeMutateEvent?.toNodeId === null;
  const stepKey = currentStep?.step ?? 0;

  // ── Try fast/slow pointer mode first ────────────────────────────────────
  const fastSlowInfo = detectFastSlowMode(vars, nodes);
  if (fastSlowInfo) {
    return (
      <div className="space-y-2 pt-4 pb-8 overflow-x-auto">
        <div className="font-semibold text-lg flex items-center gap-2">
          Linked List
          <span className="text-xs font-normal text-teal-700 bg-teal-50 border border-teal-200 px-2 py-0.5 rounded">
            Fast / Slow Mode
          </span>
        </div>
        <FastSlowView
          fastSlowInfo={fastSlowInfo}
          linkedList={linkedList}
          nodes={nodes}
          pointers={pointers}
          mutatedNodeId={mutatedNodeId}
          isMutatingToNull={isMutatingToNull}
          stepKey={stepKey}
          ptrMoveEvent={currentStep?.ptrMoveEvent ?? null}
          loopContext={currentStep?.loopContext ?? {}}
        />
        <SemanticOverlay semantics={currentSemantics} />
      </div>
    );
  }

  // ── Try reverse-list mode ────────────────────────────────────────────────
  const reverseInfo = detectReverseMode(vars, nodes);
  if (reverseInfo) {
    return (
      <div className="space-y-2 pt-4 pb-8 overflow-x-auto">
        <div className="font-semibold text-lg flex items-center gap-2">
          Linked List
          <span className="text-xs font-normal text-purple-600 bg-purple-50 border border-purple-200 px-2 py-0.5 rounded">
            Reverse Mode
          </span>
        </div>
        <ReverseListView
          reverseInfo={reverseInfo}
          nodes={nodes}
          pointers={pointers}
          mutatedNodeId={mutatedNodeId}
          isMutatingToNull={isMutatingToNull}
          stepKey={stepKey}
        />
        <SemanticOverlay semantics={currentSemantics} />
      </div>
    );
  }

  // ── Fall back to generic multi-component renderer ─────────────────────
  const roots = [];
  if (linkedList.head && nodes[linkedList.head]) {
    roots.push({ id: linkedList.head, label: "head" });
  }
  for (const [varName, value] of Object.entries(vars)) {
    if (typeof value === "string" && value.startsWith("node_") && nodes[value]) {
      if (!roots.some(r => r.id === value)) {
        roots.push({ id: value, label: varName });
      }
    }
  }
  if (roots.length === 0) return null;

  // Recompute topology independently for every candidate root.
  // This ensures that when paths merge (Y-shapes), we don't artificially
  // truncate transient/dynamic structures (like `newHead -> ...`) just
  // because another pointer (like `head`) also reached the same tail.
  const allPaths = roots.map(root => {
    const { sequence, hasCycle, cycleStartId } = traverseFrom(root.id, nodes, new Set());
    return { root, sequence, hasCycle, cycleStartId };
  });

  // Sort paths by length so we prefer longer standalone components
  allPaths.sort((a, b) => b.sequence.length - a.sequence.length);

  const components = [];
  for (const path of allPaths) {
    if (path.sequence.length === 0) continue;
    
    const startId = path.root.id;
    // We only drop a component if its START node is already fully embedded inside
    // another component's chain. This removes redundant subchains (e.g. `curr` pointer
    // sitting in the middle of `head`'s list) but keeps independent entry points.
    const isContained = components.some(kept => 
      kept.sequence.some(n => n.id === startId)
    );
    
    if (!isContained) {
      components.push(path);
    }
  }

  if (components.length === 0) return null;

  return (
    <div className="space-y-5 pt-4 pb-8 overflow-x-auto">
      <div className="font-semibold text-lg">Linked List:</div>

      {components.map((comp, compIdx) => (
        <div key={`component-${compIdx}-${comp.root.id}`} className="space-y-1">
          {compIdx > 0 && (
            <div className="text-xs font-semibold text-purple-600 uppercase tracking-wide flex items-center gap-1">
              <span className="inline-block w-2 h-2 rounded-full bg-purple-400" />
              Detached — {comp.root.label}
            </div>
          )}z
          <ChainRow
            sequence={comp.sequence}
            hasCycle={comp.hasCycle}
            cycleStartId={comp.cycleStartId}
            pointers={pointers}
            mutatedNodeId={mutatedNodeId}
            isMutatingToNull={isMutatingToNull}
            stepKey={stepKey}
            componentKey={`comp-${compIdx}`}
            loopSemantics={loopSemantics}
          />
        </div>
      ))}
      <SemanticOverlay semantics={currentSemantics} />
    </div>
  );
}
