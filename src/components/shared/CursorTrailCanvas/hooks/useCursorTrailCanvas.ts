"use client";

import { useEffect, useRef } from "react";
import { useCursorEffect } from "@/hooks/useCursorEffect";
import { TRAIL_COLOR_BY_STYLE, TRAIL_LIFETIME_MS, TRAIL_LINE_WIDTH } from "../constants";
import type { TrailPoint } from "../types";

/**
 * Рисует затухающий след за курсором на отдельном канвасе поверх контейнера:
 * первую половину жизни линия держит цвет, вторую — темнеет и растворяется
 * (стирается) — эффект "почувствуй рисование" на логине.
 */
export const useCursorTrailCanvas = () => {
  const { containerRef, style } = useCursorEffect<HTMLElement>();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const pointsRef = useRef<TrailPoint[]>([]);

  useEffect(() => {
    const container = containerRef.current;
    const canvas = canvasRef.current;
    if (!container || !canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const resize = () => {
      canvas.width = container.clientWidth;
      canvas.height = container.clientHeight;
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(container);

    const onMove = (e: PointerEvent) => {
      const rect = container.getBoundingClientRect();
      pointsRef.current.push({ x: e.clientX - rect.left, y: e.clientY - rect.top, t: performance.now() });
    };
    container.addEventListener("pointermove", onMove);

    let raf = 0;
    const [r, g, b] = TRAIL_COLOR_BY_STYLE[style] ?? TRAIL_COLOR_BY_STYLE.default;

    const render = () => {
      const now = performance.now();
      pointsRef.current = pointsRef.current.filter((p) => now - p.t < TRAIL_LIFETIME_MS);
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const points = pointsRef.current;
      for (let i = 1; i < points.length; i++) {
        const from = points[i - 1];
        const to = points[i];
        const age = now - to.t;
        const life = 1 - age / TRAIL_LIFETIME_MS;
        if (life <= 0) continue;

        // Вторая половина жизни — линия темнеет к чёрному, затем стирается (alpha -> 0).
        const darken = life < 0.5 ? 1 - life * 2 : 0;
        const cr = Math.round(r * (1 - darken));
        const cg = Math.round(g * (1 - darken));
        const cb = Math.round(b * (1 - darken));

        ctx.strokeStyle = `rgba(${cr}, ${cg}, ${cb}, ${life})`;
        ctx.lineWidth = TRAIL_LINE_WIDTH;
        ctx.lineCap = "round";
        ctx.lineJoin = "round";
        ctx.beginPath();
        ctx.moveTo(from.x, from.y);
        ctx.lineTo(to.x, to.y);
        ctx.stroke();
      }

      raf = requestAnimationFrame(render);
    };
    raf = requestAnimationFrame(render);

    return () => {
      container.removeEventListener("pointermove", onMove);
      ro.disconnect();
      cancelAnimationFrame(raf);
    };
  }, [containerRef, style]);

  return { containerRef, canvasRef };
};
