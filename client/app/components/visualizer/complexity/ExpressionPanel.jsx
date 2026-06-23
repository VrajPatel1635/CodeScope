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
        border: "1.5px solid var(--border-color)",
        background: "var(--bg-surface)",
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
            color: "var(--text-secondary)",
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
            borderTop: "1.5px dashed var(--border-color)",
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
              color: "var(--text-primary)",
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
              color: "var(--text-muted)",
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
              color: "var(--text-primary)",
            }}
          >
            {rightValue}
          </span>
          <span
            style={{
              fontFamily: "monospace",
              fontSize: "1.1rem",
              fontWeight: 700,
              color: "var(--text-muted)",
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
              background: "var(--accent-primary)",
              color: "var(--bg-primary)",
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
    blue:   { bg: "color-mix(in srgb, var(--exec-active) 15%, transparent)", border: "color-mix(in srgb, var(--exec-active) 30%, transparent)", text: "var(--exec-active)" },
    purple: { bg: "color-mix(in srgb, var(--exec-frontier) 15%, transparent)", border: "color-mix(in srgb, var(--exec-frontier) 30%, transparent)", text: "var(--exec-frontier)" },
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
    blue:   { bg: "var(--exec-active)", text: "var(--bg-primary)" },
    purple: { bg: "var(--exec-frontier)", text: "var(--bg-primary)" },
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
  color: "var(--text-secondary)",
  fontWeight: 500,
};
