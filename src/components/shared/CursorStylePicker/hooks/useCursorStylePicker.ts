"use client";

import { useEffect, useState } from "react";
import {
  DEFAULT_CURSOR_STYLE,
  loadStoredCursorStyle,
  storeCursorStyle,
  type CursorStyleId,
} from "@/lib/cursorStyle";

export const useCursorStylePicker = () => {
  const [style, setStyleState] = useState<CursorStyleId>(DEFAULT_CURSOR_STYLE);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    // One-time sync from localStorage (a browser-only external system) on mount.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setStyleState(loadStoredCursorStyle());
  }, []);

  const selectStyle = (id: CursorStyleId) => {
    setStyleState(id);
    storeCursorStyle(id);
    setOpen(false);
  };

  return { style, open, setOpen, selectStyle };
};
