"use client";

import { useEffect, useRef, useState } from "react";
import { createFireCursor } from "@/lib/fireCursor";
import {
  DEFAULT_CURSOR_STYLE,
  loadStoredCursorStyle,
  subscribeCursorStyle,
  type CursorStyleId,
} from "@/lib/cursorStyle";

/**
 * Монтирует визуальный эффект курсора (сейчас — только "fire") на переданный
 * контейнер и реагирует на смену стиля через CursorStylePicker в шапке —
 * даже если пикер находится в другом компоненте на той же странице.
 */
export const useCursorEffect = <T extends HTMLElement>() => {
  const containerRef = useRef<T>(null);
  const [style, setStyle] = useState<CursorStyleId>(DEFAULT_CURSOR_STYLE);

  useEffect(() => {
    // Синхронизация со значением из localStorage при монтировании (внешний источник).
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setStyle(loadStoredCursorStyle());
    return subscribeCursorStyle(setStyle);
  }, []);

  useEffect(() => {
    const container = containerRef.current;
    if (style !== "fire" || !container) return;
    const cursor = createFireCursor(container);
    return () => cursor.destroy();
  }, [style]);

  return { containerRef, style };
};
