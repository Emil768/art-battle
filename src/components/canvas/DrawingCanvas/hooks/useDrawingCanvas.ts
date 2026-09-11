"use client";

import { useEffect, useImperativeHandle, useRef, type Ref } from "react";
import { useCursorEffect } from "@/hooks/useCursorEffect";
import type { DrawingCanvasHandle, DrawingCanvasProps } from "../types";

export const useDrawingCanvas = (
  { mode, color, lineWidth, onDirtyChange, onStroke }: DrawingCanvasProps,
  ref: Ref<DrawingCanvasHandle>,
) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { containerRef: cursorContainerRef } = useCursorEffect<HTMLDivElement>();
  const drawingRef = useRef(false);
  const dirtyRef = useRef(false);
  const lastPointRef = useRef<{ x: number; y: number } | null>(null);

  const resizeCanvasPreserving = (nextWidth: number, nextHeight: number) => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;
    if (canvas.width === nextWidth && canvas.height === nextHeight) return;

    let snapshot: HTMLCanvasElement | null = null;
    if (canvas.width > 0 && canvas.height > 0) {
      const tmp = document.createElement("canvas");
      tmp.width = canvas.width;
      tmp.height = canvas.height;
      tmp.getContext("2d")?.drawImage(canvas, 0, 0);
      snapshot = tmp;
    }

    canvas.width = nextWidth;
    canvas.height = nextHeight;
    ctx.fillStyle = "white";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    if (snapshot) ctx.drawImage(snapshot, 0, 0);
  };

  useEffect(() => {
    const container = cursorContainerRef.current;
    const canvas = canvasRef.current;
    if (!container || !canvas) return;

    resizeCanvasPreserving(
      Math.max(1, Math.round(container.clientWidth)),
      Math.max(1, Math.round(container.clientHeight)),
    );

    const ro = new ResizeObserver(() => {
      resizeCanvasPreserving(
        Math.max(1, Math.round(container.clientWidth)),
        Math.max(1, Math.round(container.clientHeight)),
      );
    });
    ro.observe(container);
    return () => ro.disconnect();
  }, [cursorContainerRef]);

  useImperativeHandle(ref, () => ({
    exportBlob: () =>
      new Promise((resolve) => {
        const canvas = canvasRef.current;
        if (!canvas) return resolve(null);
        canvas.toBlob((blob) => resolve(blob), "image/png");
      }),
    clear: () => {
      const canvas = canvasRef.current;
      const ctx = canvas?.getContext("2d");
      if (!canvas || !ctx) return;
      ctx.fillStyle = "white";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      dirtyRef.current = false;
      onDirtyChange?.(false);
    },
    isDirty: () => dirtyRef.current,
  }));

  const getPoint = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current!;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    return {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY,
    };
  };

  const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    drawingRef.current = true;
    lastPointRef.current = getPoint(e);
    canvasRef.current?.setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!drawingRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx || !lastPointRef.current) return;

    const point = getPoint(e);
    ctx.globalCompositeOperation = mode === "eraser" ? "destination-out" : "source-over";
    // Карандаш рисует мягче (лёгкая прозрачность, как графит), ручка — сплошной чёткой линией.
    ctx.globalAlpha = mode === "pencil" ? 0.82 : 1;
    ctx.strokeStyle = color;
    ctx.lineWidth = lineWidth;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.beginPath();
    ctx.moveTo(lastPointRef.current.x, lastPointRef.current.y);
    ctx.lineTo(point.x, point.y);
    ctx.stroke();

    lastPointRef.current = point;
    if (!dirtyRef.current) {
      dirtyRef.current = true;
      onDirtyChange?.(true);
    }
    onStroke?.();
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLCanvasElement>) => {
    drawingRef.current = false;
    lastPointRef.current = null;
    canvasRef.current?.releasePointerCapture(e.pointerId);
  };

  return {
    canvasRef,
    cursorContainerRef,
    handlePointerDown,
    handlePointerMove,
    handlePointerUp,
  };
};
