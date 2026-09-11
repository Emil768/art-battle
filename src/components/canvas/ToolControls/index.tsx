"use client";

import { BrushIcon, PenIcon, EraserIcon, TrashIcon } from "@/components/icons";
import type { ToolControlsProps } from "./types";

export const ToolControls = ({ mode, onModeChange, onClear }: ToolControlsProps) => {
  return (
    <div className="flex flex-col gap-2.5">
      <button
        onClick={() => onModeChange("pencil")}
        data-active={mode === "pencil"}
        title="Кисть"
        className="ab-btn-icon"
      >
        <BrushIcon />
      </button>
      <button
        onClick={() => onModeChange("pen")}
        data-active={mode === "pen"}
        title="Маркер"
        className="ab-btn-icon"
      >
        <PenIcon />
      </button>
      <button
        onClick={() => onModeChange("eraser")}
        data-active={mode === "eraser"}
        title="Ластик"
        className="ab-btn-icon"
      >
        <EraserIcon />
      </button>
      <button onClick={onClear} title="Очистить" className="ab-btn-icon" data-danger="true">
        <TrashIcon />
      </button>
    </div>
  );
};
