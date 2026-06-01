"use client";

import { useEffect, useRef } from "react";
import styles from "./SourceTimelinePanel.module.css";

/**
 * SourceTimelinePanel
 *
 * Renders the full derived source-step list as a vertical debugger timeline.
 * Clicking a step updates sourceStepIndex, which then drives:
 *   - resolvedMicroStepId -> activeMicroStepIndex
 *   - Monaco highlight
 *   - all visualizer components
 *
 * Auto-scrolls the active item into view during recursive descent/unwind.
 */
export default function SourceTimelinePanel({
  sourceSteps = [],
  sourceStepIndex,
  setSourceStepIndex,
  setTimelineMode,
}) {
  const activeRef = useRef(null);

  // Auto-scroll active item into view whenever it changes
  useEffect(() => {
    if (activeRef.current) {
      const el = activeRef.current;
      const container = el.parentElement;
      
      if (container) {
        const elRect = el.getBoundingClientRect();
        const containerRect = container.getBoundingClientRect();

        const isVisible = (elRect.top >= containerRect.top) &&
                          (elRect.bottom <= containerRect.bottom);

        if (!isVisible) {
          const scrollOffset = elRect.top - containerRect.top + container.scrollTop;
          container.scrollTo({
            top: scrollOffset - (containerRect.height / 2) + (elRect.height / 2),
            behavior: "smooth"
          });
        }
      }
    }
  }, [sourceStepIndex]);

  if (!sourceSteps || sourceSteps.length === 0) return null;

  return (
    <div className={styles.wrapper}>
      <div className={styles.header}>Source Timeline</div>
      <div className={styles.list} role="listbox" aria-label="Source step timeline">
        {sourceSteps.map((step, idx) => {
          const isActive = idx === sourceStepIndex;
          const isPREP = step.sourceStepType === "PREP";
          const frameLabel = step.frameId ?? "?";
          const lineLabel = isPREP ? "PREP" : `LINE ${step.lineNumber}`;

          const itemClass = [
            styles.item,
            isActive ? styles.itemActive : "",
            isPREP   ? styles.itemPrep  : "",
          ].filter(Boolean).join(" ");

          const lineLabelClass = [
            styles.lineLabel,
            isPREP ? styles.lineLabelPrep : "",
          ].filter(Boolean).join(" ");

          return (
            <div
              key={step.sourceStepId}
              ref={isActive ? activeRef : null}
              role="option"
              aria-selected={isActive}
              className={itemClass}
              onClick={() => {
                setTimelineMode("source");
                setSourceStepIndex(idx);
              }}
              title={
                isPREP
                  ? `Init step for ${frameLabel}`
                  : `Line ${step.lineNumber} · ${frameLabel}`
              }
            >
              <span className={styles.badge}>#{step.sourceStepId}</span>
              <span className={styles.frame}>{frameLabel}</span>
              <span className={lineLabelClass}>{lineLabel}</span>
              {isActive && <span className={styles.activeDot} aria-hidden="true" />}
            </div>
          );
        })}
      </div>
    </div>
  );
}
