# DSA Execution Visualization Infrastructure Notes

## 1. System Overview
* **Purpose of Execution Engine:** The engine exists to safely execute user-provided algorithmic code (Java) and accurately extract micro-step runtime traces, which are then used to rebuild deterministic visualization states in the frontend.
* **Why Sandboxing was Introduced:** Direct evaluation or raw `child_process` execution exposes the backend to infinite loops, excessive memory consumption, filesystem access, and potential remote code execution (RCE) from hostile or buggy algorithmic submissions.
* **Current Execution Philosophy:** The runtime is the indisputable source of truth. The backend only captures and reconstructs what actually occurs during the JVM execution. No frontend spoofing or simulated execution is allowed.

## 2. Execution Pipeline
* **Code Generation:** The user's snippet is wrapped in a structured `Main.java` template. `splitJavaPreamble` ensures imports and packages are preserved. Helper classes (`ListNode`, `TreeNode`) and `OutputSerializer` are automatically injected.
* **Control-Flow Pre-Processing (Phase B):** 
  - Converts braceless `if/for/while` statements into block structures to guarantee safe trace injection.
  - Normalizes terminal flows (`break`, `continue`) to ensure loop traces properly finalize.
  - Re-maps nested returns ensuring multi-return recursive unwinds do not collide.
* **Condition Normalization (Phase C):** `javaConditionNormalizer` safely isolates boolean expressions within branches (`if`, `while`, `for`) and wraps them in a `Main.__DSA_COND` interceptor to capture exactly-once truth evaluations while preserving short-circuiting natively.
* **Trace Instrumentation:** Injects `System.out.println("TRACE|...");` statements mapping to lines, variables, pointer mutations, condition evaluations, and calls/returns.
* **Execution Environment:** Code is typically executed within an ephemeral Docker container (`eclipse-temurin:17`). *Note: Native host execution fallback is supported when Docker IPC pipes are unreachable.*
* **Parser Stage:** The raw text `stdout` is parsed line-by-line into an array of structured JSON trace events.
* **State Reconstruction (`stateEngine.js`):** Chronologically applies trace events to build an immutable timeline. Enforces **frame-local ownership**, ensuring child frames do not corrupt parent variables, and perfectly maps recursive stack unwinding.
* **Frontend Visualization & Smart Synchronization:** The client consumes the timeline. The Source Timeline uses bounding-box intersection calculations to "smart scroll" the active code step only when it leaves the local visible viewport, ensuring stable UX.

## 3. Docker Sandbox Architecture
* **eclipse-temurin:17 Usage:** Provides a robust, standard JVM environment for compiling (`javac`) and executing (`java`) the algorithmic submissions.
* **Container Execution Flow:** `javac Main.java && java Main`. Both compilation and execution happen synchronously within the single short-lived container lifecycle.
* **Mounted Workspace Strategy:** Temporary directories (`exec_<timestamp>_<uuid>`) are created on the host and mounted into the container at `/app` via `-v ${dirPath}:/app`.
* **Temp Execution Directories:** Ensures absolute filesystem isolation between concurrent executions.
* **Container Naming Strategy:** Uses `crypto.randomUUID()` (`sandbox-<uuid>`) to guarantee cryptographically unique container identities, eliminating concurrent collision risks.
* **Stdout/Stderr Streaming:** Child process streams are read iteratively to allow real-time monitoring and enforced size limits before the execution fully finishes.
* **Cleanup Lifecycle:** Temporary directories are forcefully purged via `fs.rmSync(..., { force: true })` and containers killed via `docker rm -f` in a `finally` block or upon timeouts.

## 4. Runtime Protections
* **Execution Timeout Protection:** Forced termination via `setTimeout` (currently 30,000ms) to catch infinite loops and extreme compilation stalls.
* **TRACE Size Overflow Protection:** Prevents memory exhaustion from runaway loops writing millions of trace lines (`MAX_TRACE_SIZE = 5MB`).
* **Memory Limits:** Containers are hard-capped at 256MB (`--memory=256m`) to prevent heap floods from destroying the host OS.
* **Forced Container Cleanup:** Guaranteed container termination using specific UUID names to avoid orphaned docker processes (zombie containers).
* **Cleanup Delays for Windows:** `cleanupVerification.js` incorporates intentional filesystem poll delays because mounted Windows volumes via WSL2 often retain momentary I/O locks post-termination.
* **Concurrent Execution Handling:** Isolated file systems and container naming strictly segregate concurrent incoming requests.

## 5. Important Infrastructure Discoveries
* **TRACE Overflow Can Crash Backend:** Unbounded `stdout` accumulation in Node.js buffers from an infinite loop will trigger V8 OOM (Out of Memory) crashes. The 5MB streaming cutoff is mandatory.
* **Docker Startup Overhead Under Concurrency:** Simultaneous `docker run` invocations dramatically spike system I/O, delaying container startup times substantially.
* **Windows Docker Desktop Latency:** WSL2 virtualization and virtiofs 9P volume mounts introduce severe filesystem latency compared to native Linux, inflating trivial executions to 15-20 seconds under heavy load.
* **Filesystem Mount Overhead:** Host-to-container volume mounts are the primary bottleneck in the execution latency floor.
* **Hostile Execution Behavior:** Malicious inputs test not just loops, but filesystem boundary traversal and resource starvation. The sandbox must be paranoid by default.
* **Timeout vs TRACE Overflow Race Behavior:** Fast infinite loops usually trigger the 5MB TRACE overflow before the 30s timeout is reached, which is the intended safe failure mode.
* **Why Multiple Safety Layers Are Necessary:** A container might freeze without printing logs (needs timeout limit), or print logs too fast without freezing (needs TRACE limit). One protection is insufficient.

## 6. Structural & Stress Testing Results
* **stressTest.js:** Validates the orchestrator's ability to survive heavy concurrent hostile inputs without Node.js crashing or requests leaking into each other.
* **cleanupVerification.js:** Validates filesystem and Docker daemon hygiene to guarantee zero artifact leaks after severe stress conditions.
* **Regression Validation Suite (`regressionSuite.js`):** A high-stress architectural verifier that runs complex composite algorithms (e.g., DFS Backtracking, Recursive Linked List Reversal, Floyd's Cycle Detection) and runs invariants against the output.
  - *Trace Validator*: Ensures symmetric `CALL`/`RETURN` pairings perfectly balance to zero.
  - *State Validator*: Prevents future-state leakage and ensures `frameId` integrity is perfectly mapped.
  - *Source-Step Validator*: Enforces monotonically increasing temporal steps.
  - *Topology Validator*: Asserts pointer mutations (`NODE_MUTATE`) never produce orphaned topological branches.
* **Successful Validation Results:** Legitimate code perfectly maintains frame and loop ownership, while hostile infinite loops correctly trip the 30s timeout and 5MB TRACE overflow limits safely.

## 7. Current Supported Runtime Features
* **Arrays & Matrices:** Registry-based structural state model supporting dynamic variable discovery, live-sync state propagation, and full multi-variable `for` loop instrumentation.
* **Strings:** Comprehensive String data type support for tracking string allocations and operations.
* **Collections (Contract Layer):** Standardized, schema-defined visualizer-ready contracts for generic collections (Stack, Queue, Deque, HashSet, PriorityQueue, HashMap) via declared type-based resolution with real-time `COLLECTION_MUT` tracking.
* **Linked Lists:** Head pointer tracking, cyclic detection, `var = var.next` movements, and node structural mutations.
* **Recursion & Frame-Ownership:** Deep call stack tracing with flawless frame-local variable isolation and multi-return unwinding.
* **Control-Flow Stability:** Safe tracking of terminal paths (`break`, `continue`) and nested loop flow (`do-while`, `for`) without trace corruption.
* **Condition Introspection:** Runtime trace extraction of native boolean evaluations (`if`, `while`, `for`), respecting short-circuiting limits without throwing exceptions.
* **Topology Reconstruction:** Coordinate-based Node Registry decoupled from semantic overlays, enabling generic real-time JVM memory heap mapping.
* **Concurrent Sandbox Execution:** Safe orchestration of multi-tenant execution requests.

## 8. Architectural Principles
* **Backend is Source of Truth:** The execution engine dictates what happened.
* **Visualization Must Never Fake Runtime:** No CSS tricks or mock animations. If the pointer didn't move in Java, it doesn't move on the screen.
* **Semantics are Derived/Non-Authoritative:** Semantic analyzers run purely as a read-only pass over the immutable canonical state array.
* **Decoupled Visualization & Registry-Driven State:** Structural state resolves dynamically from a centralized runtime registry rather than hardcoded frontend whitelists, providing unified tracking for arrays, matrices, and collections.
* **State Remains Canonical Runtime Truth:** The `buildState` output is mathematically reproducible from the TRACE logs, leveraging standardized Visualization Contracts to normalize state.
* **Sandbox Must Survive Hostile Execution:** The backend architecture assumes every piece of user code is a denial-of-service attempt.

## 9. Known Limitations
* **Docker Desktop Startup Latency:** A cold `docker run` carries an unavoidable ~2 second floor.
* **Windows Filesystem Overhead:** Virtiofs file locking inside WSL2 creates intermittent execution drag.
* **Current Lack of Tree/Graph Support:** The parser and `OutputSerializer` do not yet handle `TreeNode` serialization or non-linear pointer topologies fully.
* **No Warm Containers Yet:** Every execution pays the full penalty of spinning up a fresh JVM layer.
* **No Execution Pooling:** Execution contexts cannot currently be leased/returned to a worker pool.
* **No JVM Reuse:** We pay the `javac` and JVM startup cost on every single execution.

## 10. Future Infrastructure Roadmap
* **Warm Container Pools:** Maintain standing Alpine/Java containers that listen on pipes/sockets for code injection to bypass `docker run` latency.
* **Execution Queueing:** Introduce Redis or an in-memory queue to prevent WSL2 I/O starvation during massive spikes.
* **Optimized TRACE Buffering:** Transition from raw `console.log` intercepting to a lightweight Java agent or NIO buffer to reduce stdout blocking overhead.
* **Tree Sandbox Validation:** Expanding the input builders and garbage collection lifecycle tracking for binary tree algorithms.
* **Graph DFS Scaling Concerns:** Tracking deeply cyclic graphs will require a cycle-aware memory representation layer to avoid JSON serialization blowouts in the execution output.
