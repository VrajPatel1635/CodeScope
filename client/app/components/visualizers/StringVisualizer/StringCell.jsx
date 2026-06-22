import React from "react";
import styles from "./StringVisualizer.module.css";
import { useNodeRegistry } from "@/app/components/shared/NodeRegistryContext";

export default function StringCell({
  value,
  index,
  isHighlighted,
  variableName,
  pointerLabels = [],
  isWindow = false,
  isWindowStart = false,
  isWindowEnd = false,
  isComparisonTarget = false,
  comparisonSide = null,
  isSubstring = false,
  isSubstringStart = false,
  isSubstringEnd = false
}) {
  const { registerNode } = useNodeRegistry();
  const nodeId = `string-cell-${variableName}-${index}`;

  const isWhitespace = value === " " || value === "\\n" || value === "\\t";
  const displayValue = value === " " ? "␣" : value;

  const highlightedClass = isHighlighted ? styles.highlighted : "";
  const whitespaceClass = isWhitespace ? styles.whitespaceChar : "";
  const comparisonClass = isComparisonTarget ? styles.comparing : "";
  const substringClass = isSubstring ? styles.substringRange : "";

  return (
    <div className={styles.cellWrapper}>
      <div className={styles.indexLabel}>{index}</div>

      <div className={styles.cellMain}>
        <div
          ref={(el) => registerNode(nodeId, el)}
          className={`${styles.cellBox} ${highlightedClass} ${whitespaceClass} ${comparisonClass} ${substringClass}`}
        >
          {displayValue}
        </div>

        {isWindow && (
          <div className={`${styles.windowLine} ${isWindowStart ? styles.windowStart : ""} ${isWindowEnd ? styles.windowEnd : ""}`} />
        )}

        {isSubstring && (
          <div className={`${styles.substringLine} ${isSubstringStart ? styles.substringStart : ""} ${isSubstringEnd ? styles.substringEnd : ""}`} />
        )}
      </div>

      {pointerLabels.length > 0 && (
        <div className={styles.pointerContainer}>
          <div className={styles.pointerArrow}>↑</div>
          <div className={styles.pointerNames}>
            {pointerLabels.map(l => <div key={l} className={styles.pointerLabel}>{l}</div>)}
          </div>
        </div>
      )}
    </div>
  );
}
