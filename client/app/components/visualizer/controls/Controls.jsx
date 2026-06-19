"use client";

import { motion } from "framer-motion";

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
    if (isPlaying) setIsPlaying(false);
    const val = Number(e.target.value);
    if (isMicro) setCurrentStep(val);
    else setSourceStepIndex(val);
  };

  const hasSteps = activeTotal > 0;
  const singleStep = activeTotal === 1;

  return (
    <div className="flex items-center gap-6 w-full select-none">
        {/* Playback Buttons */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={prev}
            disabled={activeStep === 0}
            className="w-10 h-10 rounded border flex items-center justify-center transition-all duration-300 disabled:opacity-30 disabled:cursor-not-allowed group hover:bg-white/5 active:scale-95"
            style={{ borderColor: 'var(--border-color)', color: 'var(--text-primary)', backgroundColor: 'var(--bg-primary)' }}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform">
              <path d="M19 12H5M12 19l-7-7 7-7" />
            </svg>
          </button>

          <button
            onClick={togglePlay}
            className="w-12 h-12 rounded border flex items-center justify-center transition-all duration-300 active:scale-90 shadow-lg relative overflow-hidden"
            style={{ 
              borderColor: 'var(--accent-primary)', 
              color: 'var(--bg-primary)', 
              backgroundColor: 'var(--accent-primary)' 
            }}
          >
            {/* Cinematic sweep effect on hover */}
            <div className="absolute inset-0 bg-white/20 translate-y-full hover:translate-y-0 transition-transform duration-500 ease-out" />
            <div className="relative z-10 flex items-center justify-center w-full h-full">
              {isPlaying ? (
                <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
                  <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" />
                </svg>
              ) : (
                <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 ml-0.5">
                  <path d="M8 5v14l11-7z" />
                </svg>
              )}
            </div>
          </button>

          <button
            onClick={next}
            disabled={activeStep === activeTotal - 1}
            className="w-10 h-10 rounded border flex items-center justify-center transition-all duration-300 disabled:opacity-30 disabled:cursor-not-allowed group hover:bg-white/5 active:scale-95"
            style={{ borderColor: 'var(--border-color)', color: 'var(--text-primary)', backgroundColor: 'var(--bg-primary)' }}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4 group-hover:translate-x-0.5 transition-transform">
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </button>
        </div>

        {/* Timeline Slider */}
        {hasSteps && (
          <div className="flex-1 relative flex items-center h-10 group cursor-pointer">
            {/* Background Track Line */}
            <div className="absolute left-0 right-0 h-px" style={{ backgroundColor: 'var(--border-color)' }} />
            
            {/* Hash Marks for precision aesthetic */}
            <div className="absolute left-0 right-0 h-2 flex justify-between px-px opacity-20 pointer-events-none">
              {Array.from({ length: 10 }).map((_, i) => (
                <div key={i} className="w-px h-full bg-current" style={{ color: 'var(--text-secondary)' }} />
              ))}
            </div>

            {/* Fill Track */}
            <div 
              className="absolute left-0 h-[2px] transition-all duration-100 ease-linear" 
              style={{ 
                backgroundColor: 'var(--accent-primary)', 
                width: activeTotal > 1 ? `${(activeStep / (activeTotal - 1)) * 100}%` : '0%',
                boxShadow: '0 0 8px rgba(211, 123, 80, 0.4)'
              }} 
            />

            {/* Loop Markers */}
            {isMicro && activeTotal > 1 && loopMarkers.map((m) => {
              const leftPercent = (m.stepIndex / (activeTotal - 1)) * 100;
              return (
                <div
                  key={m.stepIndex}
                  className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 flex flex-col items-center pointer-events-none"
                  style={{ left: `${leftPercent}%` }}
                >
                  <div className="w-[3px] h-[7px] rounded-[1px]" style={{ backgroundColor: 'var(--accent-secondary)' }} />
                  <span className="absolute top-[8px] text-[8px] font-mono tracking-widest uppercase opacity-0 group-hover:opacity-100 transition-opacity" style={{ color: 'var(--accent-secondary)' }}>
                    I-{m.iteration}
                  </span>
                </div>
              );
            })}

            {/* Native Slider Overlay */}
            <input
              type="range"
              min={0}
              max={activeTotal - 1}
              value={activeStep}
              onChange={handleSliderChange}
              disabled={singleStep}
              className="w-full h-full absolute inset-0 opacity-0 cursor-ew-resize disabled:cursor-not-allowed z-20 m-0"
            />
            
            {/* Custom Thumb */}
            <motion.div
              className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-1.5 h-5 rounded-full pointer-events-none z-10 shadow-md"
              style={{ backgroundColor: 'var(--accent-primary)' }}
              animate={{ left: activeTotal > 1 ? `${(activeStep / (activeTotal - 1)) * 100}%` : '0%' }}
              transition={{ type: "tween", duration: 0.1, ease: "linear" }}
            />
          </div>
        )}

        {/* Step Counter & Mode Toggle */}
        <div className="flex items-center gap-6 shrink-0 pl-4 border-l" style={{ borderColor: 'var(--border-color)' }}>
          {/* Step Counter */}
          <div className="text-[11px] font-mono uppercase tracking-widest flex items-center gap-3" style={{ color: 'var(--text-secondary)' }}>
            <div className="flex items-center gap-2">
              <span 
                className={`w-2 h-2 rounded-sm transition-all duration-300 ${isPlaying ? 'animate-pulse' : ''}`} 
                style={{ 
                  backgroundColor: isPlaying ? 'var(--accent-primary)' : 'transparent', 
                  border: isPlaying ? 'none' : '1px solid var(--border-color)' 
                }} 
              />
              <span className="hidden xl:inline">STATE</span>
            </div>
            <span style={{ color: 'var(--text-primary)' }}>{String(activeStep + 1).padStart(2, '0')}</span>
            <span className="opacity-50">/</span>
            <span>{String(activeTotal).padStart(2, '0')}</span>
          </div>

          {/* Mode Toggle */}
          <div className="flex items-center rounded-md p-1 border shadow-sm" style={{ backgroundColor: 'var(--bg-primary)', borderColor: 'var(--border-color)' }}>
            {["micro", "source"].map((mode) => {
              const isActive = timelineMode === mode;
              return (
                <button
                  key={mode}
                  onClick={() => setTimelineMode(mode)}
                  className="relative px-3 py-1.5 text-[10px] font-mono uppercase tracking-[0.2em] outline-none z-10 transition-colors"
                  style={{ color: isActive ? 'var(--bg-primary)' : 'var(--text-secondary)' }}
                >
                  {isActive && (
                    <motion.div
                      layoutId="mode-indicator"
                      className="absolute inset-0 rounded-sm shadow-sm"
                      style={{ backgroundColor: 'var(--text-primary)' }}
                      transition={{ type: "spring", bounce: 0.15, duration: 0.5 }}
                    />
                  )}
                  <span className="relative z-20">{mode}</span>
                </button>
              );
            })}
          </div>
        </div>
    </div>
  );
}