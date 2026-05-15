# DSA Execution Visualization Infrastructure Notes

## 1. System Overview
* **Purpose of Execution Engine:** The engine exists to safely execute user-provided algorithmic code (Java) and accurately extract micro-step runtime traces, which are then used to rebuild deterministic visualization states in the frontend.
* **Why Sandboxing was Introduced:** Direct evaluation or raw `child_process` execution exposes the backend to infinite loops, excessive memory consumption, filesystem access, and potential remote code execution (RCE) from hostile or buggy algorithmic submissions.
* **Current Execution Philosophy:** The runtime is the indisputable source of truth. The backend only captures and reconstructs what actually occurs during the JVM execution. No frontend spoofing or simulated execution is allowed.

## 2. Execution Pipeline
* **Code Generation:** The user's snippet is wrapped in a structured `Main.java` template. `splitJavaPreamble` ensures imports and packages are preserved. Helper classes (`ListNode`, `TreeNode`) and `OutputSerializer` are automatically injected.
* **Instrumentation:** The AST/Regex instrumenter injects `System.out.println("TRACE|...");` statements at every critical execution step (lines, variables, array updates, loops, returns) to capture state transitions.
* **Docker Sandbox Execution:** The code is executed within an ephemeral, strictly limited Docker container running `eclipse-temurin:17` on Alpine/sh.
* **TRACE Collection:** Standard output from the container is streamed back to the Node.js orchestrator in real-time.
* **Parser Stage:** The raw text `stdout` is parsed line-by-line (`TRACE|VAR|...`) into an array of structured JSON trace events.
* **State Reconstruction:** The `buildState` engine chronologically applies the trace events to a base initial state, creating an immutable timeline of memory states.
* **Semantic Layering:** Additional read-only semantic passes (`analyzePointerSemantics`, `analyzeLoopSemantics`) infer higher-level intent (e.g., fast/slow pointer convergence) strictly derived from the base states.
* **Frontend Visualization:** The client consumes the timeline to visually render data structures, pointers, and memory updates frame-by-frame.

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

## 6. Stress Testing Results
* **stressTest.js Purpose:** Validates the orchestrator's ability to survive heavy concurrent hostile inputs without Node.js crashing or requests leaking into each other.
* **cleanupVerification.js Purpose:** Validates filesystem and Docker daemon hygiene to guarantee zero artifact leaks after severe stress conditions.
* **Concurrency Behavior:** Verified that the system safely processes parallel executions with linear scaling of WSL2 latency, handled smoothly by the 30s timeout window.
* **Successful Validation Results:** Legitimate code correctly runs, while infinite loops and TRACE floods accurately trip the safety constraints.
* **Cleanup Verification Success:** Passed cleanly. 0 leaked directories, 0 leaked containers after intense concurrent loads.

## 7. Current Supported Runtime Features
* **Arrays:** 1D and 2D integer array mutations and access tracing.
* **Linked Lists:** Head pointer tracking, cyclic detection, `var = var.next` movements, and node structural mutations.
* **Recursion:** Deep call stack tracing and frame-specific variable scoping.
* **Topology Reconstruction:** Real-time JVM memory heap mapping to frontend graph representations.
* **Semantic Overlays:** Identification of logical phases (e.g., Two-Pointer Meets, Loop Iterations) without hardcoded hints.
* **Concurrent Sandbox Execution:** Safe orchestration of multi-tenant execution requests.

## 8. Architectural Principles
* **Backend is Source of Truth:** The execution engine dictates what happened.
* **Visualization Must Never Fake Runtime:** No CSS tricks or mock animations. If the pointer didn't move in Java, it doesn't move on the screen.
* **Semantics are Derived/Non-Authoritative:** Semantic analyzers run purely as a read-only pass over the immutable canonical state array.
* **State Remains Canonical Runtime Truth:** The `buildState` output is mathematically reproducible from the TRACE logs.
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
