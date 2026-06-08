import React from "react";
import styles from "./HashSetVisualizer.module.css";
import HashSetItem from "./HashSetItem";

export default function HashSetVisualizer({ contract }) {
  if (!contract) return null;

  const { name, values = [], operation } = contract;

  // Determine if a specific value is affected by the current operation
  const getHighlightType = (itemValue) => {
    if (!operation || operation.value === undefined) return null;
    
    // We coerce to string for loose comparison (e.g. 1 === "1")
    if (String(itemValue) === String(operation.value)) {
      if (operation.type === "add") return "add";
      if (operation.type === "remove") return "remove";
      if (operation.type === "contains") return "contains";
    }
    return null;
  };

  // If there's an active "remove" or "contains" or "add" operation on a value
  // that isn't currently in the "values" array (e.g., just removed, or checking non-existent),
  // we might want to temporarily display it to show the operation happening.
  // However, for HashSet, standard practice in V1 is to just show the highlight on existing nodes.
  // If a node was just removed, its contract generation should ideally leave it in the values list
  // for the active step if we want it highlighted, but if it's strictly absent, it won't render.
  
  // We'll trust the contract's values array to contain what should be rendered.
  // We will map over the values and assign highlights.

  const renderItems = () => {
    if (values.length === 0) {
      return <div className={styles.emptyState}>HashSet is empty</div>;
    }

    return (
      <div className={styles.setGrid}>
        {values.map((val, index) => (
          <HashSetItem
            key={`hashset-item-${index}`}
            value={val}
            highlightType={getHighlightType(val)}
          />
        ))}
      </div>
    );
  };

  return (
    <div className={styles.container}>
      <div className={styles.title}>{name}</div>
      {renderItems()}
    </div>
  );
}
