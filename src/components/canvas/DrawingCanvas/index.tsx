"use client";

import { forwardRef } from "react";
import { useDrawingCanvas } from "./hooks/useDrawingCanvas";
import type { DrawingCanvasHandle, DrawingCanvasProps } from "./types";

export type { DrawingCanvasHandle } from "./types";

export const DrawingCanvas = forwardRef<DrawingCanvasHandle, DrawingCanvasProps>((props, ref) => {
  const { canvasRef, cursorContainerRef, handlePointerDown, handlePointerMove, handlePointerUp } =
    useDrawingCanvas(props, ref);

  return (
    <div ref={cursorContainerRef} className="absolute inset-0 h-full w-full">
      <canvas
        ref={canvasRef}
        className="block h-full w-full touch-none bg-white"
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerLeave={handlePointerUp}
      />
    </div>
  );
});

DrawingCanvas.displayName = "DrawingCanvas";
