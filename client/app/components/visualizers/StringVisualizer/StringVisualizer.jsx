import React from "react";
import styles from "./StringVisualizer.module.css";
import StringCell from "./StringCell";

export default function StringVisualizer({ contract }) {
  if (!contract) return null;

  const { name, characters, length, pointers = [], window, comparison, substring } = contract;

  const maxPointerIndex = pointers.length > 0 
      ? Math.max(...pointers.map(p => p.index))
      : -1;
  const maxIndexToRender = Math.max(length - 1, maxPointerIndex);
  
  const renderIndices = [];
  for (let i = 0; i <= maxIndexToRender; i++) {
      renderIndices.push(i);
  }

  return (
    <div className={styles.wrapper}>
      <div className={styles.header}>
        <div className={styles.title}>
          {length === 1 ? "Char" : "String"} <code>{name}</code>
        </div>
        <div className={styles.metadata}>
          Length: {length}
        </div>
      </div>

      <div className={styles.stringContainer}>
        {renderIndices.length === 0 ? (
          <div className={styles.emptyState}>String is empty</div>
        ) : (
          renderIndices.map((index) => {
            const char = characters[index] || ""; // Handle phantom cells
            const cellPointers = pointers.filter(p => p.index === index).map(p => p.name);
            const isWindow = window && index >= window.start && index <= window.end;
            const isWindowStart = window && index === window.start;
            const isWindowEnd = window && index === window.end;
            
            let isComparisonTarget = false;
            let comparisonSide = null;
            if (comparison) {
               if (index === comparison.leftIndex) {
                   isComparisonTarget = true;
                   comparisonSide = "left";
               } else if (index === comparison.rightIndex) {
                   isComparisonTarget = true;
                   comparisonSide = "right";
               }
            }

            const isSubstring = substring && index >= substring.start && index < substring.end;
            const isSubstringStart = substring && index === substring.start;
            const isSubstringEnd = substring && index === substring.end - 1;

            return (
              <StringCell 
                key={`${name}-${index}`} 
                value={char} 
                index={index}
                variableName={name}
                isHighlighted={false} // Pointers/highlights are to be added in future iterations
                pointerLabels={cellPointers}
                isWindow={isWindow}
                isWindowStart={isWindowStart}
                isWindowEnd={isWindowEnd}
                isComparisonTarget={isComparisonTarget}
                comparisonSide={comparisonSide}
                isSubstring={isSubstring}
                isSubstringStart={isSubstringStart}
                isSubstringEnd={isSubstringEnd}
              />
            );
          })
        )}
      </div>

      {comparison && (
        <div className={styles.comparisonPanel}>
          <div className={styles.comparisonHeader}>Comparing</div>
          <div className={styles.comparisonExpr}>
            <span>{comparison.leftChar === " " ? "␣" : comparison.leftChar}</span>
            <span className={styles.comparisonOp}>{comparison.operator}</span>
            <span>{comparison.rightChar === " " ? "␣" : comparison.rightChar}</span>
          </div>
          <div className={styles.comparisonResult}>
            Result:
            {comparison.result ? (
              <span className={styles.resultTrue}>TRUE</span>
            ) : (
              <span className={styles.resultFalse}>FALSE</span>
            )}
          </div>
        </div>
      )}

      {substring && (
        <div className={styles.substringPanel}>
          <div className={styles.substringHeader}>Substring</div>
          <div className={styles.substringBounds}>
            [{substring.start}, {substring.end})
          </div>
          <div className={styles.substringValue}>
            "{substring.value}"
          </div>
        </div>
      )}
    </div>
  );
}
