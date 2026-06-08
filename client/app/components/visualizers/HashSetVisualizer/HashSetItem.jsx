import React from "react";
import styles from "./HashSetVisualizer.module.css";

export default function HashSetItem({ value, highlightType }) {
  // Map highlight types to specific CSS classes
  const getHighlightClass = () => {
    if (highlightType === "add") return styles.itemAdd;
    if (highlightType === "remove") return styles.itemRemove;
    if (highlightType === "contains") return styles.itemContains;
    return "";
  };

  return (
    <div className={`${styles.item} ${getHighlightClass()}`}>
      {String(value)}
    </div>
  );
}
