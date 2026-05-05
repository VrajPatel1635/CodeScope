"use client";

export default function Controls({
  currentStep,
  totalSteps,
  setCurrentStep,
  isPlaying,
  setIsPlaying,
  loopContext = {},
  loopMarkers = [],
}) {
  const next = () => {
    if (currentStep < totalSteps - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prev = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const togglePlay = () => {
    if (!isPlaying && currentStep >= totalSteps - 1) {
      setCurrentStep(0);
    }
    setIsPlaying((prev) => !prev);
  };

  const handleSliderChange = (e) => {
    // Pause auto-play whenever the user drags the slider
    if (isPlaying) setIsPlaying(false);
    setCurrentStep(Number(e.target.value));
  };

  // Don't render the slider section at all if there are no steps
  const hasSteps = totalSteps > 0;
  const singleStep = totalSteps === 1;

  return (
    <div className="controls-wrapper">
      {/* ── Playback buttons row ── */}
      <div className="controls-row">
        <button
          onClick={prev}
          disabled={currentStep === 0}
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
          disabled={currentStep === totalSteps - 1}
          className="ctrl-btn ctrl-btn--secondary"
        >
          Next →
        </button>

        <span className="step-counter flex items-center gap-3">
          {Object.entries(loopContext).length > 0 && (
            <span style={{ color: "#d97706", fontWeight: 600, fontSize: "0.8rem", background: "#fef3c7", padding: "2px 8px", borderRadius: "12px", border: "1px solid #fde68a" }}>
              {Object.entries(loopContext).map(([id, iter], idx) => (
                <span key={id}>
                  {idx > 0 && " | "}
                  Loop {idx} — Iteration {iter}
                </span>
              ))}
            </span>
          )}
          <span>
            Step <strong>{currentStep + 1}</strong> / <strong>{totalSteps}</strong>
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
                  totalSteps > 1
                    ? `${(currentStep / (totalSteps - 1)) * 100}%`
                    : "0%",
              }}
            />
            <input
              type="range"
              min={0}
              max={totalSteps - 1}
              value={currentStep}
              onChange={handleSliderChange}
              disabled={singleStep}
              className="timeline-slider"
              aria-label="Execution step timeline"
            />

            {/* Loop Markers */}
            {totalSteps > 1 &&
              loopMarkers.map((m) => {
                const leftPercent = (m.stepIndex / (totalSteps - 1)) * 100;
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

          <span className="timeline-label">End ({totalSteps - 1})</span>
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