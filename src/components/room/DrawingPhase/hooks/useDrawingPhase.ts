"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { useCountdown } from "@/hooks/useCountdown";
import type { DrawingCanvasHandle } from "@/components/canvas/DrawingCanvas";
import {
  ACTIVITY_PING_THROTTLE_MS,
  DEFAULT_COLOR,
  DEFAULT_LINE_WIDTH,
  LINE_WIDTH_BY_MODE,
  STATUS_MESSAGE_DURATION_MS,
} from "../constants";
import type { DrawingMode, DrawingPhaseProps, StatusMessage } from "../types";

export const useDrawingPhase = ({ socket, roomId, drawingEndsAt }: DrawingPhaseProps) => {
  const router = useRouter();
  const { totalSeconds } = useCountdown(drawingEndsAt);
  const [initialTotal] = useState(totalSeconds);
  const elapsedRatio = initialTotal > 0 ? 1 - totalSeconds / initialTotal : 0;
  const low = totalSeconds <= 10;
  const [mode, setModeState] = useState<DrawingMode>("pencil");
  const [color, setColor] = useState(DEFAULT_COLOR);
  const [lineWidth, setLineWidth] = useState(DEFAULT_LINE_WIDTH);
  const [canvasDirty, setCanvasDirty] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [statusMessage, setStatusMessage] = useState<StatusMessage | null>(null);
  const canvasRef = useRef<DrawingCanvasHandle>(null);
  const lastActivityPingRef = useRef(0);
  const statusTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const showStatus = (variant: StatusMessage["variant"], text: string) => {
    if (statusTimerRef.current) clearTimeout(statusTimerRef.current);
    setStatusMessage({ variant, text });
    statusTimerRef.current = setTimeout(() => setStatusMessage(null), STATUS_MESSAGE_DURATION_MS);
  };

  const setMode = (next: DrawingMode) => {
    setModeState(next);
    if (next === "pencil" || next === "pen") setLineWidth(LINE_WIDTH_BY_MODE[next]);
  };

  const handleStroke = () => {
    const now = Date.now();
    if (now - lastActivityPingRef.current < ACTIVITY_PING_THROTTLE_MS) return;
    lastActivityPingRef.current = now;
    socket.emit("drawing:activity", { roomId });
  };

  const handleSubmit = async () => {
    if (submitted || submitting || !canvasDirty) return;
    setSubmitting(true);
    try {
      const blob = (await canvasRef.current?.exportBlob()) ?? null;
      if (!blob) {
        showStatus("error", "Не получилось подготовить изображение. Попробуйте ещё раз.");
        return;
      }

      const supabase = createClient();
      const res = await fetch("/api/uploads/sign", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ roomId }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => null);
        const reason = body?.reason as string | undefined;
        // Комната пропала на сервере (обычно — рестарт процесса во время
        // раунда) — повторная попытка отправки никогда не сработает, дальше
        // держать пользователя тут смысла нет.
        if (reason === "room_not_in_memory" || reason?.startsWith("room_status_")) {
          showStatus("error", "Комната больше не активна. Возвращаемся в лобби...");
          setTimeout(() => router.push("/lobby"), 2000);
          return;
        }
        throw new Error(`sign failed: ${res.status} ${reason ?? ""}`);
      }
      const { path, token } = await res.json();

      const { error } = await supabase.storage
        .from("submissions")
        .uploadToSignedUrl(path, token, blob, { upsert: true, contentType: "image/png" });
      if (error) throw error;

      socket.emit("drawing:submit", { roomId, imageUrl: path, isCanvas: true });
      setSubmitted(true);
      showStatus("success", "Работа отправлена!");
    } catch (err) {
      console.error("submit failed", err);
      showStatus("error", "Не получилось отправить работу. Проверьте связь и попробуйте ещё раз.");
    } finally {
      setSubmitting(false);
    }
  };

  return {
    mode,
    setMode,
    color,
    setColor,
    lineWidth,
    setLineWidth,
    canvasRef,
    canSubmit: canvasDirty,
    submitting,
    submitted,
    statusMessage,
    setCanvasDirty,
    handleSubmit,
    handleStroke,
    elapsedRatio,
    low,
  };
};
