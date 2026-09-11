"use client";

import { CURSOR_STYLES } from "@/lib/cursorStyle";
import { useCursorStylePicker } from "./hooks/useCursorStylePicker";

interface CursorStylePickerProps {
  compact?: boolean;
  menuPlacement?: "right" | "top";
  buttonClassName?: string;
}

const MENU_PLACEMENT_CLASS: Record<"right" | "top", string> = {
  right: "bottom-0 left-[52px]",
  top: "bottom-[52px] right-0",
};

export const CursorStylePicker = ({
  compact = false,
  menuPlacement = "right",
  buttonClassName = "",
}: CursorStylePickerProps) => {
  const { style, open, setOpen, selectStyle } = useCursorStylePicker();
  const current = CURSOR_STYLES.find((s) => s.id === style) ?? CURSOR_STYLES[0];

  if (compact) {
    return (
      <div className="relative">
        <button
          onClick={() => setOpen((v) => !v)}
          aria-label="Стиль курсора"
          data-active={open}
          className={`ab-btn-icon text-lg ${buttonClassName}`}
        >
          {current.emoji}
        </button>

        {open && (
          <div
            className={`absolute z-30 flex w-[150px] flex-col gap-1 rounded-[16px] p-2 ${MENU_PLACEMENT_CLASS[menuPlacement]}`}
            style={{ background: "var(--ab-surface-solid)", border: "2px solid var(--ab-line-soft)" }}
          >
            {CURSOR_STYLES.map((s) => {
              const active = s.id === style;
              return (
                <button
                  key={s.id}
                  onClick={() => selectStyle(s.id)}
                  className="flex w-full items-center gap-2 rounded-[12px] px-2.5 py-2 text-left text-sm font-bold"
                  style={
                    active
                      ? { background: "var(--ab-mint)", color: "var(--ab-mint-ink)" }
                      : { color: "var(--ab-ink)" }
                  }
                >
                  <span className="text-lg">{s.emoji}</span>
                  <span>{s.label}</span>
                </button>
              );
            })}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-center gap-1.5 rounded-[14px] px-3 py-2.5 text-xs font-bold"
        style={{ border: "2px solid rgba(255,255,255,.12)", color: "var(--ab-ink-55)" }}
      >
        <span className="text-base">{current.emoji}</span>
        <span>Стиль курсора</span>
      </button>

      {open && (
        <div
          className="absolute left-0 top-12 z-30 flex w-full flex-col gap-1 rounded-[16px] p-2"
          style={{ background: "var(--ab-surface-solid)", border: "2px solid var(--ab-line-soft)" }}
        >
          {CURSOR_STYLES.map((s) => {
            const active = s.id === style;
            return (
              <button
                key={s.id}
                onClick={() => selectStyle(s.id)}
                className="flex w-full items-center gap-2 rounded-[12px] px-2.5 py-2 text-left text-sm font-bold"
                style={
                  active
                    ? { background: "var(--ab-mint)", color: "var(--ab-mint-ink)" }
                    : { color: "var(--ab-ink)" }
                }
              >
                <span className="text-lg">{s.emoji}</span>
                <span>{s.label}</span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};
