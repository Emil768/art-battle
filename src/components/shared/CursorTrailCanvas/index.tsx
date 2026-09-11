"use client";

import { forwardRef } from "react";

/**
 * Чисто презентационный канвас для затухающего следа курсора.
 * Логика — в hooks/useCursorTrailCanvas; сам canvasRef создаётся там
 * и передаётся сюда вызывающей страницей, т.к. ей же нужен containerRef
 * для оборачивающего элемента (см. src/app/login/hooks/useLogin.ts).
 */
export const CursorTrailCanvas = forwardRef<HTMLCanvasElement>((_, ref) => (
  <canvas ref={ref} className="pointer-events-none absolute inset-0 z-0 h-full w-full" />
));

CursorTrailCanvas.displayName = "CursorTrailCanvas";
