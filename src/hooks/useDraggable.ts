"use client";

import { useEffect, useRef, useState } from "react";

export interface Position {
  x: number;
  y: number;
}

const clamp = (v: number, min: number, max: number) => Math.min(Math.max(v, min), max);

/**
 * Позиция задаётся через CSS left/top в пикселях от переданной начальной точки.
 * size — реальные габариты перетаскиваемой панели, чтобы граница не давала ей
 * вылезти за экран (по умолчанию — как для маленькой квадратной кнопки).
 */
export const useDraggable = (initial: Position, size: Position = { x: 40, y: 40 }) => {
  const [position, setPosition] = useState<Position>(initial);
  const draggingRef = useRef(false);
  const grabOffsetRef = useRef<Position>({ x: 0, y: 0 });

  useEffect(() => {
    // Подгоняем стартовую позицию под реальный размер окна (например, большой
    // initial.x — способ поставить панель "у правого края" независимо от ширины экрана).
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setPosition((prev) => ({
      x: clamp(prev.x, 0, window.innerWidth - size.x),
      y: clamp(prev.y, 0, window.innerHeight - size.y),
    }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onPointerDown = (e: React.PointerEvent) => {
    draggingRef.current = true;
    grabOffsetRef.current = { x: e.clientX - position.x, y: e.clientY - position.y };
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
  };

  const onPointerMove = (e: React.PointerEvent) => {
    if (!draggingRef.current) return;
    const nextX = e.clientX - grabOffsetRef.current.x;
    const nextY = e.clientY - grabOffsetRef.current.y;
    setPosition({
      x: clamp(nextX, 0, window.innerWidth - size.x),
      y: clamp(nextY, 0, window.innerHeight - size.y),
    });
  };

  const onPointerUp = () => {
    draggingRef.current = false;
  };

  return { position, onPointerDown, onPointerMove, onPointerUp };
};
