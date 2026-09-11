"use client";

import { BrushIcon, PenIcon, EraserIcon, TrashIcon } from "@/components/icons";
import { COLORS } from "@/components/canvas/ColorPalette/constants";
import { THICKNESS_OPTIONS } from "@/components/canvas/ThicknessSlider/constants";
import { CursorStylePicker } from "@/components/shared/CursorStylePicker";
import type { DrawingToolbarMobileProps } from "./types";

const DARK_SWATCH = "#241a3d";

export const DrawingToolbarMobile = ({
  mode,
  onModeChange,
  color,
  onColorChange,
  lineWidth,
  onLineWidthChange,
  onClear,
  onSubmit,
  submitLabel,
  submitDisabled,
}: DrawingToolbarMobileProps) => {
  return (
    <div
      className="flex shrink-0 flex-col gap-2.5 px-4 pb-3 pt-2.5 md:hidden"
      style={{ borderTop: "2px solid var(--ab-line)", paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <button onClick={() => onModeChange("pencil")} data-active={mode === "pencil"} className="ab-btn-icon !h-[46px] !w-[46px]">
            <BrushIcon />
          </button>
          <button onClick={() => onModeChange("pen")} data-active={mode === "pen"} className="ab-btn-icon !h-[46px] !w-[46px]">
            <PenIcon />
          </button>
          <button onClick={() => onModeChange("eraser")} data-active={mode === "eraser"} className="ab-btn-icon !h-[46px] !w-[46px]">
            <EraserIcon />
          </button>
          <button onClick={onClear} data-danger="true" className="ab-btn-icon !h-[46px] !w-[46px]">
            <TrashIcon />
          </button>
        </div>

        <CursorStylePicker compact menuPlacement="top" buttonClassName="!h-[46px] !w-[46px]" />
      </div>

      <div className="flex items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-2">
          {COLORS.map((c) => {
            const active = color === c;
            return (
              <button
                key={c}
                aria-label={c}
                onClick={() => onColorChange(c)}
                className="h-[26px] w-[26px] shrink-0 rounded-full"
                style={{
                  backgroundColor: c,
                  outline: active
                    ? "3px solid var(--ab-ink)"
                    : c === DARK_SWATCH
                      ? "2px solid rgba(255,255,255,.16)"
                      : "none",
                  outlineOffset: active ? 3 : 0,
                }}
              />
            );
          })}
        </div>

        <div className="flex shrink-0 items-center gap-2">
          {THICKNESS_OPTIONS.map((size) => {
            const active = lineWidth === size;
            return (
              <button
                key={size}
                onClick={() => onLineWidthChange(size)}
                aria-label={`Толщина ${size}`}
                className="flex h-[26px] w-[26px] items-center justify-center"
              >
                <span
                  className="rounded-full"
                  style={{
                    width: Math.min(size, 18),
                    height: Math.min(size, 18),
                    background: active ? "var(--ab-ink)" : "rgba(255,246,238,.4)",
                    outline: active ? "2px solid var(--ab-mint)" : "none",
                    outlineOffset: 2,
                  }}
                />
              </button>
            );
          })}
        </div>
      </div>

      <button onClick={onSubmit} disabled={submitDisabled} className="ab-btn ab-btn-primary w-full">
        {submitLabel}
      </button>
    </div>
  );
};
