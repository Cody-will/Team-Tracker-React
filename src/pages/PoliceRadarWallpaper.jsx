import React, { useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence, useReducedMotion } from "motion/react";

/**
 * PoliceRadarWallpaper
 * - Fullscreen animated radar: rotating sweep, auto pings, optional click-to-ping.
 * - Law-enforcement vibe: dark navy grid, cyan/blue sweep and pings.
 *
 * Props:
 *  - interactive?: boolean   (default: true)  // click to add pings
 *  - autoPings?: boolean     (default: true)  // random pings over time
 *  - sweepDuration?: number  (default: 8)     // seconds per revolution
 *  - pingDuration?: number   (default: 2.2)   // seconds per ping ripple
 *  - maxPings?: number       (default: 12)    // cap to avoid buildup
 *  - color?: string          (default: "#22d3ee") // cyan-400-ish
 *  - sweepColor?: string     (default: "rgba(14,165,233,0.22)") // sky-500 @ ~22% alpha
 *  - gridColor?: string      (default: "rgba(148,163,184,0.08)") // slate-400@8%
 *  - background?: string     (default: "#020617") // slate-950
 */
export default function PoliceRadarWallpaper({
  interactive = true,
  autoPings = true,
  sweepDuration = 8,
  pingDuration = 2.2,
  maxPings = 12,
  color = "#22d3ee",
  sweepColor = "rgba(14,165,233,0.22)",
  gridColor = "rgba(148,163,184,0.08)",
  background = "#020617",
}) {
  const prefersReduced = useReducedMotion();
  const [pings, setPings] = useState([]);
  const svgRef = useRef(null);

  // generate a unique id for masks/gradients to avoid collisions if mounted multiple times
  const ids = useMemo(() => {
    const suffix = Math.random().toString(36).slice(2, 8);
    return {
      radialId: `radial-${suffix}`,
      sweepMaskId: `mask-${suffix}`,
      sweepGradId: `sweep-${suffix}`,
    };
  }, []);

  // random auto pings
  useEffect(() => {
    if (prefersReduced || !autoPings) return;
    const addRandomPing = () => {
      setPings((prev) => {
        const w = window.innerWidth;
        const h = window.innerHeight;
        const x = Math.random() * w;
        const y = Math.random() * h;
        const id = `${Date.now()}-${Math.random()}`;
        const next = [...prev, { id, x, y }];
        return next.length > maxPings
          ? next.slice(next.length - maxPings)
          : next;
      });
    };
    const interval = setInterval(addRandomPing, 1200);
    return () => clearInterval(interval);
  }, [autoPings, maxPings, prefersReduced]);

  // user click → ping at cursor
  const handlePointerDown = (e) => {
    if (!interactive) return;
    // if click lands on overlaying UI, bail
    if (e.defaultPrevented) return;
    const rect = svgRef.current?.getBoundingClientRect();
    const x = (e.clientX ?? 0) - (rect?.left ?? 0);
    const y = (e.clientY ?? 0) - (rect?.top ?? 0);
    setPings((prev) => {
      const id = `${Date.now()}-${Math.random()}`;
      const next = [...prev, { id, x, y }];
      return next.length > maxPings ? next.slice(next.length - maxPings) : next;
    });
  };

  // helper to remove ping after animation
  const handlePingComplete = (id) => {
    setPings((prev) => prev.filter((p) => p.id !== id));
  };

  // center + radius for wedge/sweep
  const [vw, vh] = [
    typeof window !== "undefined" ? window.innerWidth : 1920,
    typeof window !== "undefined" ? window.innerHeight : 1080,
  ];
  const cx = vw / 2;
  const cy = vh / 2;
  const r = Math.hypot(cx, cy) + 20; // big enough to cover corners

  // make a wedge path (sector) that will rotate
  const wedgePath = useMemo(() => {
    const startAngle = -8; // degrees
    const endAngle = 8;
    const toRad = (deg) => (deg * Math.PI) / 180;
    const a1 = toRad(startAngle);
    const a2 = toRad(endAngle);
    const x1 = cx + r * Math.cos(a1);
    const y1 = cy + r * Math.sin(a1);
    const x2 = cx + r * Math.cos(a2);
    const y2 = cy + r * Math.sin(a2);
    // path from center -> arc wedge -> back to center
    // large-arc-flag = 0, sweep-flag = 1
    return `M ${cx} ${cy} L ${x1} ${y1} A ${r} ${r} 0 0 1 ${x2} ${y2} Z`;
  }, [cx, cy, r]);

  return (
    <div
      onPointerDown={handlePointerDown}
      // place behind your app; allow clicks to pass through unless interactive
      className="pointer-events-auto"
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 0,
        background,
      }}
    >
      {/* subtle grid using CSS gradients */}
      <div
        aria-hidden
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage: `
            linear-gradient(${gridColor} 1px, transparent 1px),
            linear-gradient(90deg, ${gridColor} 1px, transparent 1px)
          `,
          backgroundSize: "64px 64px, 64px 64px",
          maskImage:
            "radial-gradient(ellipse at center, rgba(0,0,0,0.9), rgba(0,0,0,0.2) 60%, transparent 90%)",
        }}
      />

      {/* main SVG stage */}
      <svg
        ref={svgRef}
        width="100%"
        height="100%"
        viewBox={`0 0 ${vw} ${vh}`}
        style={{ position: "absolute", inset: 0 }}
      >
        <defs>
          {/* soft radial glow */}
          <radialGradient id={ids.radialId} cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor={color} stopOpacity="0.15" />
            <stop offset="60%" stopColor={color} stopOpacity="0.06" />
            <stop offset="100%" stopColor={color} stopOpacity="0" />
          </radialGradient>

          {/* sweep mask: a wedge-shaped mask that reveals the sweep fill */}
          <mask id={ids.sweepMaskId}>
            <rect x="0" y="0" width={vw} height={vh} fill="black" />
            <motion.path
              d={wedgePath}
              fill="white"
              style={{ transformOrigin: `${cx}px ${cy}px` }}
              animate={prefersReduced ? undefined : { rotate: 360 }}
              transition={{
                repeat: Infinity,
                ease: "linear",
                duration: sweepDuration,
              }}
            />
          </mask>

          {/* sweep fill gradient (brighter at the leading edge) */}
          <linearGradient
            id={ids.sweepGradId}
            x1="0%"
            y1="50%"
            x2="100%"
            y2="50%"
          >
            <stop offset="0%" stopColor={sweepColor} stopOpacity="0" />
            <stop offset="70%" stopColor={sweepColor} stopOpacity="0.7" />
            <stop offset="100%" stopColor={sweepColor} stopOpacity="0" />
          </linearGradient>
        </defs>

        {/* center glow */}
        <circle
          cx={cx}
          cy={cy}
          r={Math.min(cx, cy) * 0.9}
          fill={`url(#${ids.radialId})`}
        />

        {/* rotating sweep, masked to the wedge */}
        {!prefersReduced && (
          <g mask={`url(#${ids.sweepMaskId})`}>
            <rect
              x="0"
              y="0"
              width={vw}
              height={vh}
              fill={`url(#${ids.sweepGradId})`}
            />
          </g>
        )}

        {/* pings */}
        <AnimatePresence>
          {pings.map((p) => (
            <Ping
              key={p.id}
              x={p.x}
              y={p.y}
              color={color}
              duration={pingDuration}
              onComplete={() => handlePingComplete(p.id)}
              reduced={prefersReduced}
            />
          ))}
        </AnimatePresence>

        {/* center dot & fine rings for style */}
        <circle cx={cx} cy={cy} r="2" fill={color} opacity="0.8" />
        <circle
          cx={cx}
          cy={cy}
          r={Math.min(cx, cy) * 0.33}
          stroke={gridColor}
          fill="none"
        />
        <circle
          cx={cx}
          cy={cy}
          r={Math.min(cx, cy) * 0.66}
          stroke={gridColor}
          fill="none"
        />
      </svg>
    </div>
  );
}

function Ping({ x, y, color, duration, onComplete, reduced }) {
  const ring = {
    initial: { r: 0, opacity: 0.9 },
    animate: { r: 120, opacity: 0 },
  };
  const dot = {
    initial: { scale: 0.6, opacity: 0.0 },
    animate: { scale: 1, opacity: 1 },
    exit: { opacity: 0 },
  };

  return (
    <g>
      {!reduced && (
        <motion.circle
          cx={x}
          cy={y}
          stroke={color}
          strokeWidth="2"
          fill="none"
          variants={ring}
          initial="initial"
          animate="animate"
          transition={{ duration, ease: "easeOut" }}
          onAnimationComplete={onComplete}
        />
      )}
      <motion.circle
        cx={x}
        cy={y}
        r="3"
        fill={color}
        variants={dot}
        initial="initial"
        animate="animate"
        exit="exit"
        transition={{ duration: 0.25 }}
      />
    </g>
  );
}
