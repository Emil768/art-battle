"use client";

import { THICKNESS_OPTIONS } from "./constants";
import type { ThicknessSliderProps } from "./types";

export const ThicknessSlider = ({ lineWidth, onChange }: ThicknessSliderProps) => {
  return (
    <div className="flex flex-col items-center gap-2.5">
      {THICKNESS_OPTIONS.map((size) => {
        const active = lineWidth === size;
        return (
          <button
            key={size}
            onClick={() => onChange(size)}
            aria-label={`Толщина ${size}`}
            className="flex h-[22px] w-[22px] items-center justify-center"
          >
            <span
              className="rounded-full"
              style={{
                width: size,
                height: size,
                background: active ? "var(--ab-ink)" : "rgba(255,246,238,.4)",
                outline: active ? "2px solid var(--ab-mint)" : "none",
                outlineOffset: 3,
              }}
            />
          </button>
        );
      })}
    </div>
  );
};
