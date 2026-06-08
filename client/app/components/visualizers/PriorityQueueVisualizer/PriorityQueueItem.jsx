import React from "react";
import styles from "./PriorityQueueVisualizer.module.css";

export default function PriorityQueueItem({ value, isRoot, highlightType }) {
  const getHighlightClass = () => {
    if (highlightType === "offer") return styles.itemOffer;
    if (highlightType === "poll") return styles.itemPoll;
    if (highlightType === "peek") return styles.itemPeek;
    return "";
  };

  return (
    <div className={styles.itemWrapper}>
      <div className={styles.badgeContainer}>
        {isRoot && <div className={styles.badge}>ROOT</div>}
      </div>
      <div className={`${styles.item} ${getHighlightClass()}`}>
        {String(value)}
      </div>
    </div>
  );
}
