"use client";

import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { useEffect, useState, useRef, useMemo } from "react";

const EASE_CINEMATIC = [0.76, 0, 0.24, 1];
const EASE_DECEL = [0.16, 1, 0.3, 1];
const EASE_TENSION = [0.85, 0, 0.15, 1];

const FINAL_TEXT = "CODESCOPE";
const CIPHER_POOL = "ΞΔΛΨΩΣΠΦΘ";
const ACCENT_RGB = [211, 123, 80];

function GridCanvas() {
  const canvasRef = useRef(null);
  const animRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const dpr = window.devicePixelRatio || 1;

    const w = window.innerWidth;
    const h = window.innerHeight;
    canvas.width = w * dpr;
    canvas.height = h * dpr;
    canvas.style.width = w + "px";
    canvas.style.height = h + "px";
    ctx.scale(dpr, dpr);

    const cx = w / 2;
    const cy = h / 2;
    const gridSize = 60;
    const maxDist = Math.hypot(cx, cy);

    let frame = 0;
    let revealRadius = 0;

    const draw = () => {
      ctx.clearRect(0, 0, w, h);
      revealRadius = Math.min(maxDist, frame * 12);

      for (let x = gridSize; x < w; x += gridSize) {
        const dx = Math.abs(x - cx);
        if (dx > revealRadius) continue;
        const a = 0.035 * (1 - dx / maxDist);
        ctx.strokeStyle = `rgba(${ACCENT_RGB}, ${a})`;
        ctx.lineWidth = 0.5;
        ctx.beginPath();
        ctx.moveTo(x, Math.max(0, cy - revealRadius));
        ctx.lineTo(x, Math.min(h, cy + revealRadius));
        ctx.stroke();
      }

      for (let y = gridSize; y < h; y += gridSize) {
        const dy = Math.abs(y - cy);
        if (dy > revealRadius) continue;
        const a = 0.035 * (1 - dy / maxDist);
        ctx.strokeStyle = `rgba(${ACCENT_RGB}, ${a})`;
        ctx.lineWidth = 0.5;
        ctx.beginPath();
        ctx.moveTo(Math.max(0, cx - revealRadius), y);
        ctx.lineTo(Math.min(w, cx + revealRadius), y);
        ctx.stroke();
      }

      for (let x = gridSize; x < w; x += gridSize) {
        for (let y = gridSize; y < h; y += gridSize) {
          const dist = Math.hypot(x - cx, y - cy);
          if (dist > revealRadius) continue;
          const wave = Math.max(0, Math.sin((dist / 90) - frame * 0.06) * 0.5 + 0.5);
          const falloff = 1 - dist / maxDist;
          const alpha = (0.06 + wave * 0.18) * falloff;
          const r = 1.2 + wave * 0.8;
          ctx.fillStyle = `rgba(${ACCENT_RGB}, ${alpha})`;
          ctx.beginPath();
          ctx.arc(x, y, r, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      frame++;
      animRef.current = requestAnimationFrame(draw);
    };

    animRef.current = requestAnimationFrame(draw);
    return () => { if (animRef.current) cancelAnimationFrame(animRef.current); };
  }, []);

  return <canvas ref={canvasRef} className="absolute inset-0" style={{ opacity: 0.7 }} />;
}

function ReticleSVG({ locked }) {
  const ticks = useMemo(() =>
    Array.from({ length: 72 }, (_, i) => {
      const deg = i * 5;
      const rad = (deg * Math.PI) / 180;
      const major = deg % 30 === 0;
      const minor = deg % 15 === 0;
      const r1 = major ? 126 : minor ? 130 : 133;
      return { rad, r1, r2: 140, major, delay: 0.6 + i * 0.006 };
    }), []);

  const cardinals = [
    { deg: -90, label: "000" }, { deg: 0, label: "090" },
    { deg: 90, label: "180" }, { deg: 180, label: "270" },
  ];

  return (
    <motion.svg
      viewBox="-200 -200 400 400"
      className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[420px] h-[420px] md:w-[520px] md:h-[520px]"
      initial={{ opacity: 0, rotate: -15 }}
      animate={{ opacity: 1, rotate: 0, transition: { delay: 0.15, duration: 1.2, ease: EASE_DECEL } }}
      exit={{ opacity: 0, scale: 4, transition: { duration: 0.7, ease: EASE_CINEMATIC } }}
    >
      <motion.circle
        cx="0" cy="0" r="140" fill="none"
        stroke="var(--accent-primary)" strokeWidth="0.6"
        initial={{ pathLength: 0, opacity: 0 }}
        animate={{ pathLength: 1, opacity: locked ? 0.8 : 0.4,
          transition: { pathLength: { delay: 0.2, duration: 1.2, ease: EASE_DECEL }, opacity: { delay: 0.2, duration: 0.5 } } }}
      />
      <motion.circle
        cx="0" cy="0" r="100" fill="none"
        stroke="var(--accent-primary)" strokeWidth="0.35"
        initial={{ pathLength: 0, opacity: 0 }}
        animate={{ pathLength: 1, opacity: locked ? 0.5 : 0.2,
          transition: { pathLength: { delay: 0.4, duration: 0.9, ease: EASE_DECEL }, opacity: { delay: 0.4, duration: 0.4 } } }}
      />
      <motion.circle
        cx="0" cy="0" r="60" fill="none"
        stroke="var(--accent-primary)" strokeWidth="0.25" strokeDasharray="3 6"
        initial={{ opacity: 0 }}
        animate={{ opacity: locked ? 0.35 : 0.12, transition: { delay: 0.7, duration: 0.5 } }}
      />

      {[
        { x1: -140, y1: 0, x2: -32, y2: 0, d: 0.5 },
        { x1: 32, y1: 0, x2: 140, y2: 0, d: 0.55 },
        { x1: 0, y1: -140, x2: 0, y2: -22, d: 0.6 },
        { x1: 0, y1: 22, x2: 0, y2: 140, d: 0.65 },
      ].map((l, i) => (
        <motion.line key={i}
          x1={l.x1} y1={l.y1} x2={l.x2} y2={l.y2}
          stroke="var(--accent-primary)" strokeWidth="0.5"
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: 1, opacity: locked ? 0.6 : 0.35,
            transition: { pathLength: { delay: l.d, duration: 0.4, ease: EASE_DECEL }, opacity: { delay: l.d, duration: 0.3 } } }}
        />
      ))}

      {ticks.map((t, i) => (
        <motion.line key={i}
          x1={Math.cos(t.rad) * t.r1} y1={Math.sin(t.rad) * t.r1}
          x2={Math.cos(t.rad) * t.r2} y2={Math.sin(t.rad) * t.r2}
          stroke="var(--accent-primary)" strokeWidth={t.major ? "0.8" : "0.3"}
          initial={{ opacity: 0 }}
          animate={{ opacity: t.major ? 0.5 : 0.15, transition: { delay: t.delay, duration: 0.15 } }}
        />
      ))}

      {cardinals.map((c, i) => {
        const rad = (c.deg * Math.PI) / 180;
        return (
          <motion.text key={i}
            x={Math.cos(rad) * 158} y={Math.sin(rad) * 158 + 3}
            textAnchor="middle" fill="var(--text-muted)"
            fontSize="7" fontFamily="var(--font-code)" letterSpacing="0.12em"
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.45, transition: { delay: 0.9 + i * 0.08, duration: 0.3 } }}
          >{c.label}</motion.text>
        );
      })}

      <motion.circle
        cx="0" cy="0" r="140" fill="none"
        stroke="var(--accent-primary)" strokeWidth="1.5"
        strokeLinecap="round"
        style={{ rotate: "-90deg", transformOrigin: "center" }}
        initial={{ pathLength: 0, opacity: 0 }}
        animate={{ pathLength: locked ? 1 : 0.65, opacity: 0.7,
          transition: { pathLength: { delay: 0.8, duration: 1.8, ease: EASE_TENSION }, opacity: { delay: 0.8, duration: 0.4 } } }}
      />

      {locked && (
        <motion.circle
          cx="0" cy="0" r="170" fill="none"
          stroke="var(--accent-primary)" strokeWidth="0.3"
          initial={{ pathLength: 0, opacity: 0, scale: 0.8 }}
          animate={{ pathLength: 1, opacity: [0, 0.4, 0], scale: 1,
            transition: { duration: 0.8, ease: EASE_DECEL } }}
        />
      )}
    </motion.svg>
  );
}

function CipherDisplay({ onLocked }) {
  const [letters, setLetters] = useState(() =>
    FINAL_TEXT.split("").map(() => ({
      char: CIPHER_POOL[Math.floor(Math.random() * CIPHER_POOL.length)],
      locked: false,
      justLocked: false,
    }))
  );

  useEffect(() => {
    let iteration = 0;
    let prevLocked = 0;
    const interval = setInterval(() => {
      const lockedCount = Math.floor(iteration);
      setLetters(
        FINAL_TEXT.split("").map((finalChar, i) => {
          if (i < lockedCount) return { char: finalChar, locked: true, justLocked: i >= prevLocked && i < lockedCount };
          return { char: CIPHER_POOL[Math.floor(Math.random() * CIPHER_POOL.length)], locked: false, justLocked: false };
        })
      );
      prevLocked = lockedCount;
      if (iteration >= FINAL_TEXT.length) {
        clearInterval(interval);
        onLocked?.();
      }
      iteration += 0.3;
    }, 45);
    return () => clearInterval(interval);
  }, [onLocked]);

  return (
    <div className="flex items-center">
      {letters.map((l, i) => (
        <motion.span key={i}
          className="inline-block w-6 md:w-8 text-center text-lg md:text-2xl uppercase font-medium"
          style={{ fontFamily: "var(--font-code)", letterSpacing: "0.15em" }}
          animate={{
            color: l.locked ? "var(--text-primary)" : "var(--text-muted)",
            textShadow: l.justLocked
              ? "0 0 24px rgba(211,123,80,0.9), 0 0 48px rgba(211,123,80,0.4)"
              : l.locked
                ? "0 0 8px rgba(211,123,80,0.15)"
                : "none",
          }}
          transition={{ duration: l.justLocked ? 0.1 : 0.4 }}
        >{l.char}</motion.span>
      ))}
    </div>
  );
}

function HUDCorner({ position, children, delay }) {
  const posClass = {
    tl: "top-5 left-7",
    tr: "top-5 right-7",
    bl: "bottom-5 left-7",
    br: "bottom-5 right-7",
  }[position];

  return (
    <motion.div
      className={`absolute ${posClass}`}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1, transition: { delay, duration: 0.5 } }}
      exit={{ opacity: 0, transition: { duration: 0.12 } }}
    >
      {children}
    </motion.div>
  );
}

function CoordReadout({ delay }) {
  const [vals, setVals] = useState({ x: 0, y: 0, z: 0 });
  const raf = useRef(null);

  useEffect(() => {
    let f = 0;
    const tick = () => {
      const d = Math.exp(-f * 0.035);
      setVals({
        x: Math.round(Math.sin(f * 0.13) * 512 * d),
        y: Math.round(Math.cos(f * 0.1) * 288 * d),
        z: Math.round(Math.sin(f * 0.08 + 1) * 128 * d),
      });
      f++;
      if (f < 100) raf.current = requestAnimationFrame(tick);
    };
    const t = setTimeout(() => { raf.current = requestAnimationFrame(tick); }, delay * 1000);
    return () => { clearTimeout(t); if (raf.current) cancelAnimationFrame(raf.current); };
  }, [delay]);

  const mono = { fontFamily: "var(--font-code)", color: "var(--text-muted)" };
  return (
    <div className="flex flex-col gap-1">
      {["X", "Y", "Z"].map((axis) => (
        <span key={axis} className="text-[9px] tracking-[0.25em] uppercase tabular-nums" style={mono}>
          {axis}:{String(vals[axis.toLowerCase()]).padStart(5, "\u2007")}
        </span>
      ))}
    </div>
  );
}

function HexStream({ delay }) {
  const [hex, setHex] = useState("0x00000000");
  useEffect(() => {
    const chars = "0123456789ABCDEF";
    let f = 0;
    const iv = setInterval(() => {
      const h = Array.from({ length: 8 }, () => chars[Math.floor(Math.random() * 16)]).join("");
      setHex("0x" + h);
      f++;
      if (f > 60) clearInterval(iv);
    }, 50);
    const t = setTimeout(() => {}, delay * 1000);
    return () => { clearInterval(iv); clearTimeout(t); };
  }, [delay]);

  return (
    <div className="flex flex-col items-end gap-1">
      <span className="text-[8px] tracking-[0.3em] uppercase" style={{ fontFamily: "var(--font-code)", color: "var(--accent-primary)", opacity: 0.5 }}>
        MEM ADDR
      </span>
      <span className="text-[10px] tracking-[0.2em] tabular-nums" style={{ fontFamily: "var(--font-code)", color: "var(--text-muted)" }}>
        {hex}
      </span>
    </div>
  );
}

function StatusSequence({ locked }) {
  const [phase, setPhase] = useState(0);
  const labels = ["INITIALIZING", "CALIBRATING", "MAPPING", "SYNCHRONIZED"];

  useEffect(() => {
    if (locked) { setPhase(3); return; }
    const iv = setInterval(() => setPhase((p) => Math.min(p + 1, 2)), 700);
    return () => clearInterval(iv);
  }, [locked]);

  return (
    <div className="flex items-center gap-2">
      <motion.span
        className="block w-1.5 h-1.5 rounded-full"
        style={{ backgroundColor: phase === 3 ? "var(--accent-primary)" : "var(--text-muted)" }}
        animate={{ opacity: phase === 3 ? 1 : [0.3, 0.8, 0.3], scale: phase === 3 ? 1 : [0.7, 1, 0.7] }}
        transition={{ duration: 1.2, repeat: phase === 3 ? 0 : Infinity }}
      />
      <span className="text-[9px] tracking-[0.35em] uppercase"
        style={{ fontFamily: "var(--font-code)", color: phase === 3 ? "var(--accent-primary)" : "var(--text-muted)", transition: "color 0.3s ease" }}>
        {labels[phase]}
      </span>
    </div>
  );
}

export default function PageLoader({ isVisible }) {
  const shouldReduceMotion = useReducedMotion();
  const [locked, setLocked] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  if (shouldReduceMotion) {
    return (
      <AnimatePresence>
        {isVisible && (
          <motion.div className="fixed inset-0 z-100 flex items-center justify-center"
            style={{ backgroundColor: "var(--bg-primary)" }}
            initial={{ opacity: 1 }} exit={{ opacity: 0, transition: { duration: 0.3 } }}>
            <span className="text-xl tracking-[0.5em] uppercase"
              style={{ fontFamily: "var(--font-code)", color: "var(--text-primary)" }}>{FINAL_TEXT}</span>
          </motion.div>
        )}
      </AnimatePresence>
    );
  }

  return (
    <AnimatePresence>
      {isVisible && (
        <div className="fixed inset-0 z-100 pointer-events-none overflow-hidden">

          {[
            { clip: 'inset(0% 49.7% 49.7% 0%)',  exit: { x: '-100%', y: '-100%' }, delay: 0.12 },
            { clip: 'inset(0% 0% 49.7% 49.7%)',   exit: { x: '100%',  y: '-100%' }, delay: 0.08 },
            { clip: 'inset(49.7% 49.7% 0% 0%)',   exit: { x: '-100%', y: '100%'  }, delay: 0.08 },
            { clip: 'inset(49.7% 0% 0% 49.7%)',   exit: { x: '100%',  y: '100%'  }, delay: 0.12 },
          ].map((q, i) => (
            <motion.div key={`quad-${i}`}
              className="absolute inset-0"
              style={{ backgroundColor: 'var(--bg-primary)', clipPath: q.clip }}
              exit={{ x: q.exit.x, y: q.exit.y, transition: { duration: 0.85, ease: EASE_CINEMATIC, delay: q.delay } }}
            />
          ))}

          <motion.div className="absolute inset-0"
            exit={{ opacity: 0, transition: { duration: 0.3 } }}>
            <GridCanvas />
          </motion.div>

          <motion.div className="absolute left-0 right-0 top-1/2 -translate-y-1/2 h-px"
            style={{ background: "linear-gradient(90deg, transparent 5%, var(--accent-primary) 30%, var(--accent-primary) 70%, transparent 95%)", opacity: 0.15 }}
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1, transition: { delay: 0.1, duration: 0.8, ease: EASE_DECEL } }}
            exit={{ opacity: 0, transition: { duration: 0.1 } }} />

          <motion.div className="absolute top-0 bottom-0 left-1/2 -translate-x-1/2 w-px"
            style={{ background: "linear-gradient(180deg, transparent 5%, var(--accent-primary) 30%, var(--accent-primary) 70%, transparent 95%)", opacity: 0.15 }}
            initial={{ scaleY: 0 }}
            animate={{ scaleY: 1, transition: { delay: 0.15, duration: 0.8, ease: EASE_DECEL } }}
            exit={{ opacity: 0, transition: { duration: 0.1 } }} />

          <motion.div className="absolute left-0 right-0 h-px"
            style={{ top: "50%", background: "linear-gradient(90deg, transparent, var(--accent-primary), transparent)" }}
            initial={{ opacity: 0, scaleX: 0 }}
            animate={{ opacity: [0, 0.7, 0.7, 0], scaleX: [0, 1, 1, 1], y: [0, 0, 0, 0],
              transition: { delay: 0.5, duration: 1.4, times: [0, 0.25, 0.65, 1], ease: EASE_DECEL } }}
            exit={{ opacity: 0, transition: { duration: 0.05 } }} />

          <motion.div className="absolute top-0 bottom-0 w-px"
            style={{ left: "50%", background: "linear-gradient(180deg, transparent, var(--accent-primary), transparent)" }}
            initial={{ opacity: 0, scaleY: 0 }}
            animate={{ opacity: [0, 0.7, 0.7, 0], scaleY: [0, 1, 1, 1], x: [0, 0, 0, 0],
              transition: { delay: 0.55, duration: 1.4, times: [0, 0.25, 0.65, 1], ease: EASE_DECEL } }}
            exit={{ opacity: 0, transition: { duration: 0.05 } }} />

          <ReticleSVG locked={locked} />

          <div className="absolute inset-0 flex items-center justify-center">
            <motion.div className="flex flex-col items-center gap-5"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1, transition: { delay: 0.35, duration: 0.5 } }}
              exit={{ opacity: 0, scale: 0.7, transition: { duration: 0.25, ease: EASE_CINEMATIC } }}>
              <CipherDisplay onLocked={() => setLocked(true)} />
              <StatusSequence locked={locked} />
            </motion.div>
          </div>

          <HUDCorner position="tl" delay={0.4}>
            <CoordReadout delay={0.4} />
          </HUDCorner>

          <HUDCorner position="tr" delay={0.55}>
            <HexStream delay={0.55} />
          </HUDCorner>

          <HUDCorner position="bl" delay={0.6}>
            <div className="flex flex-col gap-1">
              <span className="text-[8px] tracking-[0.3em] uppercase" style={{ fontFamily: "var(--font-code)", color: "var(--accent-primary)", opacity: 0.5 }}>
                RUNTIME
              </span>
              <span className="text-[10px] tracking-[0.15em]" style={{ fontFamily: "var(--font-code)", color: "var(--text-muted)" }}>
                Diagnostic Engine v2.1
              </span>
            </div>
          </HUDCorner>

          <HUDCorner position="br" delay={0.7}>
            <div className="flex flex-col items-end gap-1">
              <span className="text-[8px] tracking-[0.3em] uppercase" style={{ fontFamily: "var(--font-code)", color: "var(--accent-primary)", opacity: 0.5 }}>
                BUILD
              </span>
              <span className="text-[10px] tracking-[0.15em]" style={{ fontFamily: "var(--font-code)", color: "var(--text-muted)" }}>
                2026.06.22 — Stable
              </span>
            </div>
          </HUDCorner>

          <motion.div className="absolute bottom-14 left-7 right-7 h-px overflow-hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1, transition: { delay: 0.75, duration: 0.2 } }}
            exit={{ opacity: 0, transition: { duration: 0.1 } }}>
            <div className="w-full h-full" style={{ backgroundColor: "var(--border-color)" }} />
            <motion.div className="absolute top-0 left-0 h-full"
              style={{ backgroundColor: "var(--accent-primary)" }}
              initial={{ width: "0%" }}
              animate={{ width: "100%", transition: { delay: 0.8, duration: 2.0, ease: EASE_TENSION } }} />
          </motion.div>

          <motion.div
            className="absolute inset-0 pointer-events-none"
            style={{ background: "radial-gradient(ellipse at center, rgba(211,123,80,0.08) 0%, transparent 60%)" }}
            animate={{ opacity: locked ? [0.5, 1, 0.6] : 0.3 }}
            transition={{ duration: locked ? 0.6 : 0 }}
            exit={{ opacity: 0, transition: { duration: 0.2 } }} />
        </div>
      )}
    </AnimatePresence>
  );
}
