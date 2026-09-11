"use client";

import { COLORS } from "./constants";
import type { ColorPaletteProps } from "./types";

const DARK_SWATCH = "#241a3d";

export const ColorPalette = ({ color, onChange }: ColorPaletteProps) => {
  return (
    <div className="grid grid-cols-2 gap-2">
      {COLORS.map((c) => {
        const active = color === c;
        return (
          <button
            key={c}
            aria-label={c}
            onClick={() => onChange(c)}
            className="h-5 w-5 rounded-full"
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
  );
};
