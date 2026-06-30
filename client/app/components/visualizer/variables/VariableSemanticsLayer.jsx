import React from "react";
import styles from "@/app/styles/variable-semantics.module.css";
import StateVariableCard from "./StateVariableCard";
import AccumulatorCard from "./AccumulatorCard";
import TemporaryVariableCard from "./TemporaryVariableCard";
import { AnimatePresence } from "framer-motion";

export default function VariableSemanticsLayer({ stateVars = [], accumulators = [], tempVars = [] }) {
  const hasAnyVars = stateVars.length > 0 || accumulators.length > 0 || tempVars.length > 0;

  if (!hasAnyVars) return null;

  return (
    <div className={styles.variablesContainer}>
      <AnimatePresence>
        {stateVars.map((v) => (
          <StateVariableCard 
            key={`state-${v.name}`} 
            name={v.name} 
            value={v.value} 
            runtimeType={v.runtimeType} 
            category={v.category} 
          />
        ))}
        {accumulators.map((v) => (
          <AccumulatorCard key={`acc-${v.name}`} name={v.name} value={v.value} prevValue={v.prevValue} />
        ))}
        {tempVars.map((v) => (
          <TemporaryVariableCard key={`temp-${v.name}`} name={v.name} value={v.value} isActive={v.isActive} />
        ))}
      </AnimatePresence>
    </div>
  );
}

