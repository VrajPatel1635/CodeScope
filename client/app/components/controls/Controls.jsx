"use client";

export default function Controls({
  currentStep,
  totalSteps,
  setCurrentStep,
  sourceStepIndex,
  totalSourceSteps,
  setSourceStepIndex,
  timelineMode,
  setTimelineMode,
  isPlaying,
  setIsPlaying,
  loopContext = {},
  loopMarkers = [],
}) {
  const isMicro = timelineMode === "micro";
  const activeStep = isMicro ? currentStep : sourceStepIndex;
  const activeTotal = isMicro ? totalSteps : totalSourceSteps;

  const next = () => {
    if (isMicro) {
      if (currentStep < totalSteps - 1) setCurrentStep(currentStep + 1);
    } else {
      if (sourceStepIndex < totalSourceSteps - 1) setSourceStepIndex(sourceStepIndex + 1);
    }
  };

  const prev = () => {
    if (isMicro) {
      if (currentStep > 0) setCurrentStep(currentStep - 1);
    } else {
      if (sourceStepIndex > 0) setSourceStepIndex(sourceStepIndex - 1);
    }
  };

  const togglePlay = () => {
    if (!isPlaying && activeStep >= activeTotal - 1) {
      if (isMicro) setCurrentStep(0);
      else setSourceStepIndex(0);
    }
    setIsPlaying((prev) => !prev);
  };

  const handleSliderChange = (e) => {
    // Pause auto-play whenever the user drags the slider
    if (isPlaying) setIsPlaying(false);
    const val = Number(e.target.value);
    if (isMicro) setCurrentStep(val);
    else setSourceStepIndex(val);
  };

  // Don't render the slider section at all if there are no steps
  const hasSteps = activeTotal > 0;
  const singleStep = activeTotal === 1;

  return (
    <div className="controls-wrapper">
      {/* ── Mode Toggle Row ── */}
      <div className="flex gap-2 justify-center mb-2">
        <button
          onClick={() => {
            setTimelineMode("micro");
            // Optionally, snap the micro index to the current source's resolved step, 
            // but for safety, we just keep currentStep where it was.
          }}
          className={`px-3 py-1 text-xs font-semibold rounded-full border transition-colors ${
            timelineMode === "micro"
              ? "bg-blue-100 text-blue-700 border-blue-300"
              : "bg-gray-50 text-gray-500 border-gray-200 hover:bg-gray-100"
          }`}
        >
          Micro Mode
        </button>
        <button
          onClick={() => setTimelineMode("source")}
          className={`px-3 py-1 text-xs font-semibold rounded-full border transition-colors ${
            timelineMode === "source"
              ? "bg-blue-100 text-blue-700 border-blue-300"
              : "bg-gray-50 text-gray-500 border-gray-200 hover:bg-gray-100"
          }`}
        >
          Source Mode
        </button>
      </div>

      {/* ── Playback buttons row ── */}
      <div className="controls-row">
        <button
          onClick={prev}
          disabled={activeStep === 0}
          className="ctrl-btn ctrl-btn--secondary"
        >
          ← Prev
        </button>

        <button
          onClick={togglePlay}
          className="ctrl-btn ctrl-btn--primary"
        >
          {isPlaying ? "⏸ Pause" : "▶ Play"}
        </button>

        <button
          onClick={next}
          disabled={activeStep === activeTotal - 1}
          className="ctrl-btn ctrl-btn--secondary"
        >
          Next →
        </button>

        <span className="step-counter flex items-center gap-3">
          <span>
            Step <strong>{activeStep + 1}</strong> / <strong>{activeTotal}</strong>
          </span>
        </span>
      </div>

      {/* ── Timeline / Seek Bar ── */}
      {hasSteps && (
        <div className="timeline-wrapper">
          <span className="timeline-label">Start</span>

          <div className="slider-track">
            {/* Filled progress behind the thumb */}
            <div
              className="slider-fill"
              style={{
                width:
                  activeTotal > 1
                    ? `${(activeStep / (activeTotal - 1)) * 100}%`
                    : "0%",
              }}
            />
            <input
              type="range"
              min={0}
              max={activeTotal - 1}
              value={activeStep}
              onChange={handleSliderChange}
              disabled={singleStep}
              className="timeline-slider"
              aria-label="Execution step timeline"
            />

            {/* Loop Markers (Only show in micro mode for accurate timeline matching, or map to source logic if needed) */}
            {isMicro && activeTotal > 1 &&
              loopMarkers.map((m) => {
                const leftPercent = (m.stepIndex / (activeTotal - 1)) * 100;
                return (
                  <div
                    key={m.stepIndex}
                    className="loop-marker"
                    style={{ left: `${leftPercent}%` }}
                    title={`Iteration ${m.iteration}`}
                  >
                    <div className="loop-marker-tick" />
                    <span className="loop-marker-label">Iter {m.iteration}</span>
                  </div>
                );
              })}
          </div>

          <span className="timeline-label">End ({activeTotal - 1})</span>
        </div>
      )}

      <style jsx>{`
        /* ── Wrapper ── */
        .controls-wrapper {
          display: flex;
          flex-direction: column;
          gap: 12px;
          width: 100%;
        }

        /* ── Buttons row ── */
        .controls-row {
          display: flex;
          align-items: center;
          gap: 10px;
          flex-wrap: wrap;
        }

        .ctrl-btn {
          padding: 6px 16px;
          border-radius: 6px;
          font-size: 0.875rem;
          font-weight: 500;
          cursor: pointer;
          border: none;
          transition: background 0.15s, opacity 0.15s, transform 0.1s;
        }
        .ctrl-btn:active {
          transform: scale(0.96);
        }
        .ctrl-btn:disabled {
          opacity: 0.35;
          cursor: not-allowed;
        }

        .ctrl-btn--secondary {
          background: #e5e7eb;
          color: #111827;
        }
        .ctrl-btn--secondary:hover:not(:disabled) {
          background: #d1d5db;
        }

        .ctrl-btn--primary {
          background: #3b82f6;
          color: #fff;
          min-width: 90px;
        }
        .ctrl-btn--primary:hover {
          background: #2563eb;
        }

        .step-counter {
          margin-left: auto;
          font-size: 0.875rem;
          color: #6b7280;
          white-space: nowrap;
        }
        .step-counter strong {
          color: #111827;
        }

        /* ── Timeline ── */
        .timeline-wrapper {
          display: flex;
          align-items: center;
          gap: 10px;
          width: 100%;
        }

        .timeline-label {
          font-size: 0.75rem;
          color: #9ca3af;
          white-space: nowrap;
          user-select: none;
        }

        /* Relative container so we can overlay fill + input */
        .slider-track {
          position: relative;
          flex: 1;
          height: 20px;
          display: flex;
          align-items: center;
        }

        /* Filled portion (visual progress) */
        .slider-fill {
          position: absolute;
          left: 0;
          top: 50%;
          transform: translateY(-50%);
          height: 6px;
          background: linear-gradient(90deg, #3b82f6, #60a5fa);
          border-radius: 9999px;
          pointer-events: none;
          transition: width 0.05s linear;
          z-index: 1;
        }

        /* Native range — reset + re-style */
        .timeline-slider {
          -webkit-appearance: none;
          appearance: none;
          width: 100%;
          height: 6px;
          background: #e5e7eb;
          border-radius: 9999px;
          outline: none;
          cursor: pointer;
          position: relative;
          z-index: 2;
          /* make the track transparent so the .slider-fill shows through */
          background: transparent;
        }
        .timeline-slider:disabled {
          cursor: not-allowed;
          opacity: 0.5;
        }

        /* Track — WebKit */
        .timeline-slider::-webkit-slider-runnable-track {
          height: 6px;
          border-radius: 9999px;
          background: #e5e7eb;
        }

        /* Thumb — WebKit */
        .timeline-slider::-webkit-slider-thumb {
          -webkit-appearance: none;
          width: 18px;
          height: 18px;
          border-radius: 50%;
          background: #fff;
          border: 3px solid #3b82f6;
          box-shadow: 0 1px 4px rgba(0, 0, 0, 0.18);
          cursor: grab;
          margin-top: -6px; /* vertically centre on track */
          transition: border-color 0.15s, transform 0.1s;
          position: relative;
          z-index: 3;
        }
        .timeline-slider::-webkit-slider-thumb:hover {
          border-color: #2563eb;
          transform: scale(1.15);
        }
        .timeline-slider::-webkit-slider-thumb:active {
          cursor: grabbing;
          transform: scale(1.05);
        }

        /* Track — Firefox */
        .timeline-slider::-moz-range-track {
          height: 6px;
          border-radius: 9999px;
          background: #e5e7eb;
        }

        /* Thumb — Firefox */
        .timeline-slider::-moz-range-thumb {
          width: 18px;
          height: 18px;
          border-radius: 50%;
          background: #fff;
          border: 3px solid #3b82f6;
          box-shadow: 0 1px 4px rgba(0, 0, 0, 0.18);
          cursor: grab;
        }
        .timeline-slider::-moz-range-thumb:hover {
          border-color: #2563eb;
          transform: scale(1.15);
        }

        /* ── Loop Markers ── */
        .loop-marker {
          position: absolute;
          top: -2px; /* Slight offset above track */
          transform: translateX(-50%);
          display: flex;
          flex-direction: column;
          align-items: center;
          pointer-events: none;
          z-index: 1; /* Below thumb, above track */
        }

        .loop-marker-tick {
          width: 2px;
          height: 10px;
          background-color: #f59e0b;
          border-radius: 1px;
        }

        .loop-marker-label {
          margin-top: 6px;
          font-size: 0.6rem;
          font-weight: 700;
          color: #d97706;
          white-space: nowrap;
        }
      `}</style>
    </div>
  );
}