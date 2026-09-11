"use client";

import { ColorPalette } from "@/components/canvas/ColorPalette";
import { ToolControls } from "@/components/canvas/ToolControls";
import { ThicknessSlider } from "@/components/canvas/ThicknessSlider";
import { CursorStylePicker } from "@/components/shared/CursorStylePicker";
import type { DrawingToolbarProps } from "./types";

const Divider = () => (
  <span className="my-2 h-[2px] w-[30px] rounded-full" style={{ background: "rgba(255,255,255,.12)" }} />
);

export const DrawingToolbar = (props: DrawingToolbarProps) => {
  const { mode, onModeChange, color, onColorChange, lineWidth, onLineWidthChange, onClear } = props;

  return (
    <aside
      className="hidden w-[76px] shrink-0 flex-col items-center gap-2.5 py-5 md:flex"
      style={{ borderRight: "2px solid var(--ab-line)" }}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/logo-mark.png" alt="" className="mb-1 h-7 w-7" />

      <ToolControls mode={mode} onModeChange={onModeChange} onClear={onClear} />
      <Divider />
      <ColorPalette color={color} onChange={onColorChange} />
      <Divider />
      <ThicknessSlider lineWidth={lineWidth} onChange={onLineWidthChange} />
      <Divider />
      <CursorStylePicker compact />
    </aside>
  );
};
