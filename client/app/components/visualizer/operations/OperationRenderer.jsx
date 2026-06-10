import React from "react";
import AssignmentOperation from "./OperationTypes/AssignmentOperation";
import ArithmeticOperation from "./OperationTypes/ArithmeticOperation";
import ComparisonOperation from "./OperationTypes/ComparisonOperation";
import BooleanOperation from "./OperationTypes/BooleanOperation";
import { categorizeOperation, evaluateExpression } from "./operationUtils";

export default function OperationRenderer({ traceEvent, variables, collections, array }) {
  if (!traceEvent) return null;

  const category = categorizeOperation(traceEvent);
  if (!category) return null;

  if (category === "ASSIGNMENT") {
    // Only pass the new value
    return (
      <AssignmentOperation
        varName={traceEvent.name}
        newValue={traceEvent.value}
      />
    );
  }

  if (category === "ARITHMETIC") {
    let exprToEvaluate = "";
    if (traceEvent.op === "++") exprToEvaluate = `${traceEvent.name} + 1`;
    else if (traceEvent.op === "--") exprToEvaluate = `${traceEvent.name} - 1`;
    else if (traceEvent.op !== "=") {
      // e.g. +=, -= 
      const rawOp = traceEvent.op.replace("=", "");
      exprToEvaluate = `${traceEvent.name} ${rawOp} ${traceEvent.rhs}`;
    } else {
      exprToEvaluate = traceEvent.rhs;
    }

    const evaluated = evaluateExpression(exprToEvaluate, variables, collections, array);

    return (
      <ArithmeticOperation
        evaluatedExpr={evaluated}
        result={traceEvent.value}
      />
    );
  }

  if (category === "COMPARISON") {
    const evaluated = evaluateExpression(traceEvent.expr, variables, collections, array);
    return (
      <ComparisonOperation
        evaluatedExpr={evaluated}
        result={traceEvent.value}
      />
    );
  }

  if (category === "BOOLEAN") {
    const evaluated = evaluateExpression(traceEvent.expr, variables, collections, array);
    return (
      <BooleanOperation
        evaluatedExpr={evaluated}
        result={traceEvent.value}
      />
    );
  }

  return null;
}
