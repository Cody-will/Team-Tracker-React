// CometWallpaper.tsx (JSX or TSX works as-is)
import { useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";

export default function CometWallpaper({
  starCount = 500,
  tailLength = 60, // how many positions to keep for the trail
  ease = 0.12, // how quickly the comet chases the mouse (lower = more lag)
  bg = "#0a0a0a",
  starColor = "rgba(200, 210, 240, 0.35)",
  cometHead = "rgba(56, 189, 248, 1)", // sky-400 style
  cometTail = "rgba(56, 189, 248, 0.08)", // faint, layered into long streak
}: {
  starCount?: number;
  tailLength?: number;
  ease?: number;
  bg?: string;
  starColor?: string;
  cometHead?: string;
  cometTail?: string;
}) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const rafRef = useRef<number | null>(null);

  // state held in refs to avoid re-renders
  const mouseRef = useRef({
    x: window.innerWidth / 2,
    y: window.innerHeight / 2,
  });
  const cometRef = useRef({
    x: mouseRef.current.x,
    y: mouseRef.current.y,
    vx: 0,
    vy: 0,
  });
  const historyRef = useRef<{ x: number; y: number }[]>([]);
  const starsRef = useRef<{ x: number; y: number; r: number }[]>([]);

  useEffect(() => {
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext("2d", { alpha: false })!;

    // ----- sizing -----
    function resize() {
      const { devicePixelRatio: dpr = 1 } = window as any;
      const w = window.innerWidth;
      const h = window.innerHeight;
      canvas.style.width = w + "px";
      canvas.style.height = h + "px";
      canvas.width = Math.floor(w * dpr);
      canvas.height = Math.floor(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      // re-seed stars to fill new size
      seedStars();
      // also reset trail so we don't smear on resize
      historyRef.current = [];
      cometRef.current.x = w / 2;
      cometRef.current.y = h / 2;
      mouseRef.current.x = w / 2;
      mouseRef.current.y = h / 2;
    }

    // ----- stars -----
    function seedStars() {
      const w = canvas.clientWidth;
      const h = canvas.clientHeight;
      const arr: { x: number; y: number; r: number }[] = [];
      for (let i = 0; i < starCount; i++) {
        arr.push({
          x: Math.random() * w,
          y: Math.random() * h,
          r: Math.random() * 1.5 + 0.2,
        });
      }
      starsRef.current = arr;
    }

    // ----- mouse tracking -----
    const onMove = (e: MouseEvent) => {
      mouseRef.current.x = e.clientX;
      mouseRef.current.y = e.clientY;
    };
    const onLeave = () => {
      // optionally drift to center when mouse leaves
      mouseRef.current.x = window.innerWidth / 2;
      mouseRef.current.y = window.innerHeight / 2;
    };

    // ----- draw helpers -----
    function drawStars() {
      const stars = starsRef.current;
      ctx.fillStyle = starColor;
      for (let i = 0; i < stars.length; i++) {
        const s = stars[i];
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    function drawComet() {
      // head follows mouse with easing → gives that "catch up" feel
      const target = mouseRef.current;
      const c = cometRef.current;
      const dx = target.x - c.x;
      const dy = target.y - c.y;

      c.vx = dx * ease;
      c.vy = dy * ease;
      c.x += c.vx;
      c.y += c.vy;

      // record history for the tail
      historyRef.current.push({ x: c.x, y: c.y });
      if (historyRef.current.length > tailLength) historyRef.current.shift();

      // draw tail (segments between history points)
      // draw widest/most opaque near the head, thinner + fainter farther back
      for (let i = historyRef.current.length - 1; i > 0; i--) {
        const p1 = historyRef.current[i];
        const p2 = historyRef.current[i - 1];
        const t = i / historyRef.current.length; // 0..1 from tail → head
        const width = 16 * (t * t); // non-linear thickness profile
        ctx.strokeStyle = cometTail;
        ctx.lineWidth = width;
        ctx.beginPath();
        ctx.moveTo(p1.x, p1.y);
        ctx.lineTo(p2.x, p2.y);
        ctx.stroke();
      }

      // head (small bright core + soft glow)
      const headRadius = 4;
      // glow
      const grad = ctx.createRadialGradient(c.x, c.y, 0, c.x, c.y, 28);
      grad.addColorStop(0, "rgba(56, 189, 248, 0.35)");
      grad.addColorStop(1, "rgba(56, 189, 248, 0.0)");
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(c.x, c.y, 28, 0, Math.PI * 2);
      ctx.fill();
      // core
      ctx.fillStyle = cometHead;
      ctx.beginPath();
      ctx.arc(c.x, c.y, headRadius, 0, Math.PI * 2);
      ctx.fill();
    }

    // ----- animation loop -----
    function loop() {
      // subtle motion blur by painting a translucent rect over previous frame
      ctx.fillStyle = bg; // solid fill first to ensure a clean base
      ctx.fillRect(0, 0, canvas.clientWidth, canvas.clientHeight);

      // add a faint veil to create persistent trails (uncomment for longer smears)
      // ctx.fillStyle = "rgba(10,10,10,0.12)";
      // ctx.fillRect(0, 0, canvas.clientWidth, canvas.clientHeight);

      drawStars();
      drawComet();
      rafRef.current = requestAnimationFrame(loop);
    }

    // init
    resize();
    window.addEventListener("resize", resize);
    window.addEventListener("mousemove", onMove, { passive: true });
    window.addEventListener("mouseleave", onLeave);

    rafRef.current = requestAnimationFrame(loop);

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      window.removeEventListener("resize", resize);
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseleave", onLeave);
    };
  }, [bg, starColor, cometHead, cometTail, starCount, tailLength, ease]);

  return (
    <motion.canvas
      initial={{ opacity: 0, scale: 0 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0 }}
      ref={canvasRef}
      className="fixed inset-0 w-screen h-screen -z-10 pointer-events-none select-none"
      aria-hidden="true"
    />
  );
}
