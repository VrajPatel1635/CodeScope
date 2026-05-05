"use client";

const TYPE_STYLES = {
  pointer:     { badge: "bg-blue-100 text-blue-700 border-blue-300",     row: "border-l-2 border-blue-400" },
  accumulator: { badge: "bg-green-100 text-green-700 border-green-300",  row: "border-l-2 border-green-400" },
  result:      { badge: "bg-orange-100 text-orange-700 border-orange-300", row: "border-l-2 border-orange-400" },
  normal:      { badge: "bg-gray-100 text-gray-500 border-gray-300",     row: "" },
};

export default function VariablePanel({ state, changedVariables = [], classifiedVariables = {} }) {
  if (!state) return null;

  const { step, line, return: returnValue } = state;
  const entries = Object.entries(classifiedVariables);

  return (
    <div className="space-y-2">
      <div>
        <strong>Step:</strong> {step}
      </div>

      <div>
        <strong>Line:</strong> {line}
      </div>

      <div>
        <strong>Variables:</strong>
        <div className="ml-4 mt-2 space-y-1">
          {entries.map(([key, { value, type }]) => {
            const isChanged = changedVariables.includes(key);
            const { badge, row } = TYPE_STYLES[type] || TYPE_STYLES.normal;

            return (
              <div
                key={key}
                className={`flex items-center gap-2 px-2 py-1 rounded transition-all duration-300 ${row} ${
                  isChanged ? "bg-green-50 scale-105 shadow-sm" : "opacity-90"
                }`}
              >
                {/* Badge */}
                <span className={`text-xs font-semibold px-1.5 py-0.5 rounded border ${badge}`}>
                  {key}
                </span>
                {/* Value */}
                <span className={`font-mono text-sm ${isChanged ? "font-bold" : ""}`}>
                  = {String(value)}
                </span>
                {/* Type label */}
                {type !== "normal" && (
                  <span className={`text-xs px-1.5 py-0.5 rounded border ml-auto opacity-70 ${badge}`}>
                    {type}
                  </span>
                )}
              </div>
            );
          })}

          {/* Fallback if classifiedVariables is empty */}
          {entries.length === 0 && (
            <div className="text-sm opacity-50 italic">No variables</div>
          )}
        </div>
      </div>

      {returnValue !== undefined && (
        <div>
          <strong>Return:</strong>{" "}
          <span className="font-mono text-orange-600 font-bold">{String(returnValue)}</span>
        </div>
      )}
    </div>
  );
}