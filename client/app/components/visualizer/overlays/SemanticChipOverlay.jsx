"use client";

import styles from "@/app/styles/semantic-chip.module.css";

/**
 * Semantic Chip Overlay
 * Renders semantic annotations as subtle, design-system-styled chips.
 * Extracted from the old LinkedListVisualizer's SemanticOverlay.
 *
 * This is a shared overlay, not specific to linked lists.
 *
 * Props:
 *   semantics — array of { type, pointers?, nodeId?, leader?, follower? }
 */

const SEMANTIC_CONFIG = {
  TRANSIENT_OVERLAP: { label: "transient overlap", icon: "~",  chipClass: "chipTransientOverlap" },
  STABLE_MEET:       { label: "stable meet",       icon: "⚡", chipClass: "chipStableMeet" },
  CONVERGING:        { label: "converging",         icon: "▸",  chipClass: "chipConverging" },
  DIVERGING:         { label: "diverging",          icon: "◂",  chipClass: "chipDiverging" },
  FOLLOWING:         { label: "following",          icon: "⇢",  chipClass: "chipFollowing" },
};

export default function SemanticChipOverlay({ semantics = [] }) {
  if (!semantics || semantics.length === 0) return null;

  // Deduplicate by type
  const seen = new Set();
  const unique = semantics.filter(s => {
    if (seen.has(s.type)) return false;
    seen.add(s.type);
    return true;
  });

  return (
    <div className={styles.chipContainer}>
      {unique.map(s => {
        const cfg = SEMANTIC_CONFIG[s.type];
        if (!cfg) return null;

        const label = s.pointers
          ? `${s.pointers.join(" → ")}: ${cfg.label}`
          : s.leader
          ? `${s.follower} follows ${s.leader}`
          : cfg.label;

        return (
          <span
            key={s.type}
            className={`${styles.chip} ${styles[cfg.chipClass]}`}
            title={`Semantic: ${s.type}`}
          >
            <span className={styles.chipIcon}>{cfg.icon}</span>
            {label}
          </span>
        );
      })}
    </div>
  );
}
