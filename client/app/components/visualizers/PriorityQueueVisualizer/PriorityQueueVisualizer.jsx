import React from "react";
import styles from "./PriorityQueueVisualizer.module.css";
import PriorityQueueItem from "./PriorityQueueItem";

export default function PriorityQueueVisualizer({ contract }) {
  if (!contract) return null;

  const { name, values = [], operation } = contract;

  const getHighlightType = (itemValue, index) => {
    if (!operation || operation.value === undefined) return null;

    // For PriorityQueue, multiple identical values can exist.
    // Usually, the root is modified or inspected during peek/poll.
    // If the operation is poll or peek, we highlight the root.
    if ((operation.type === "poll" || operation.type === "peek") && index === 0) {
      if (String(itemValue) === String(operation.value)) {
        return operation.type;
      }
    }
    
    // For offer, we highlight the newly added item. Since ordering isn't guaranteed
    // outside of root, we loosely highlight a matching value.
    if (operation.type === "offer" && String(itemValue) === String(operation.value)) {
      return "offer";
    }

    return null;
  };

  const renderQueue = () => {
    if (values.length === 0) {
      return <div className={styles.emptyState}>PriorityQueue is empty</div>;
    }

    return (
      <div className={styles.queueWrapper}>
        {values.map((val, index) => (
          <PriorityQueueItem
            key={`pq-item-${index}`}
            value={val}
            isRoot={index === 0}
            highlightType={getHighlightType(val, index)}
          />
        ))}
      </div>
    );
  };

  return (
    <div className={styles.container}>
      <div className={styles.title}>{name}</div>
      {renderQueue()}
    </div>
  );
}
