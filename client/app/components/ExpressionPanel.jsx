"use client";

// ─────────────────────────────────────────────────────────────────────────────
// ExpressionPanel
//
// Renders a visual breakdown of how a return expression was evaluated.
//
// Props:
//   expressionEvaluation – {
//     left:       string   (variable name, e.g. "n")
//     operator:   string   (e.g. "*")
//     rightFn:    string   (called function, e.g. "solve")
//     leftValue:  number   (value of `left` in this frame)
//     rightValue: number   (value returned by the recursive call)
//     result:     number   (final computed value)
//   } | null
// ─────────────────────────────────────────────────────────────────────────────

const OP_LABEL = {
  "*": "×",
  "+": "+",
  "-": "−",
  "/": "÷",
};

export default function ExpressionPanel({ expressionEvaluation }) {
  if (!expressionEvaluation) return null;

  const { left, operator, rightFn, leftValue, rightValue, result } =
    expressionEvaluation;

  const opLabel = OP_LABEL[operator] ?? operator;

  return (
    <div
      style={{
        borderRadius: "10px",
        border: "1.5px solid #fde68a",
        background: "linear-gradient(135deg, #fffbeb 0%, #fef3c7 100%)",
        padding: "14px 16px",
        boxShadow: "0 2px 8px rgba(251,191,36,0.15)",
      }}
    >
      {/* ── Header ── */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "8px",
          marginBottom: "12px",
        }}
      >
        <span style={{ fontSize: "1rem" }}>🔍</span>
        <h3
          style={{
            margin: 0,
            fontSize: "0.7rem",
            fontWeight: 700,
            color: "#92400e",
            textTransform: "uppercase",
            letterSpacing: "0.08em",
          }}
        >
          Expression Evaluation
        </h3>
      </div>

      {/* ── Step-by-step breakdown ── */}
      <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>

        {/* Row 1: left variable */}
        <div style={rowStyle}>
          <Token label={left} color="blue" />
          <span style={equalsStyle}>=</span>
          <Value value={leftValue} color="blue" />
        </div>

        {/* Row 2: right (returned value) */}
        <div style={rowStyle}>
          <Token label={`${rightFn}(...)`} color="purple" />
          <span style={equalsStyle}>returned</span>
          <Value value={rightValue} color="purple" />
        </div>

        {/* Divider */}
        <div
          style={{
            borderTop: "1.5px dashed #fcd34d",
            margin: "2px 0",
          }}
        />

        {/* Row 3: full expression = result */}
        <div style={{ ...rowStyle, alignItems: "center" }}>
          <span
            style={{
              fontFamily: "monospace",
              fontSize: "1.05rem",
              fontWeight: 700,
              color: "#78350f",
              letterSpacing: "0.04em",
            }}
          >
            {leftValue}
          </span>
          <span
            style={{
              fontFamily: "monospace",
              fontSize: "1.1rem",
              fontWeight: 700,
              color: "#d97706",
              padding: "0 4px",
            }}
          >
            {opLabel}
          </span>
          <span
            style={{
              fontFamily: "monospace",
              fontSize: "1.05rem",
              fontWeight: 700,
              color: "#78350f",
            }}
          >
            {rightValue}
          </span>
          <span
            style={{
              fontFamily: "monospace",
              fontSize: "1.1rem",
              fontWeight: 700,
              color: "#d97706",
              padding: "0 6px",
            }}
          >
            =
          </span>

          {/* Result pill */}
          <span
            style={{
              fontFamily: "monospace",
              fontWeight: 800,
              fontSize: "1.05rem",
              background: "#f97316",
              color: "#fff",
              padding: "2px 12px",
              borderRadius: "9999px",
              boxShadow: "0 1px 4px rgba(249,115,22,0.35)",
              letterSpacing: "0.02em",
            }}
          >
            {result}
          </span>
        </div>
      </div>
    </div>
  );
}

// ── Internal sub-components ──────────────────────────────────────────────────

function Token({ label, color }) {
  const colors = {
    blue:   { bg: "#dbeafe", border: "#bfdbfe", text: "#1e40af" },
    purple: { bg: "#ede9fe", border: "#ddd6fe", text: "#6d28d9" },
  };
  const c = colors[color] ?? colors.blue;
  return (
    <span
      style={{
        fontFamily: "monospace",
        fontWeight: 600,
        fontSize: "0.8rem",
        background: c.bg,
        border: `1px solid ${c.border}`,
        color: c.text,
        padding: "1px 7px",
        borderRadius: "5px",
        whiteSpace: "nowrap",
      }}
    >
      {label}
    </span>
  );
}

function Value({ value, color }) {
  const colors = {
    blue:   { bg: "#1e40af", text: "#fff" },
    purple: { bg: "#6d28d9", text: "#fff" },
  };
  const c = colors[color] ?? colors.blue;
  return (
    <span
      style={{
        fontFamily: "monospace",
        fontWeight: 700,
        fontSize: "0.9rem",
        background: c.bg,
        color: c.text,
        padding: "1px 9px",
        borderRadius: "5px",
        minWidth: "28px",
        textAlign: "center",
      }}
    >
      {value}
    </span>
  );
}

// ── Shared styles ────────────────────────────────────────────────────────────
const rowStyle = {
  display: "flex",
  alignItems: "center",
  gap: "8px",
};

const equalsStyle = {
  fontSize: "0.75rem",
  color: "#92400e",
  fontWeight: 500,
};
