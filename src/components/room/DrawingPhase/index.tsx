"use client";

import { DrawingCanvas } from "@/components/canvas/DrawingCanvas";
import { TimerBadge } from "@/components/shared/TimerBadge";
import { StatusBanner } from "@/components/shared/StatusBanner";
import { PlayerActivityRow } from "@/components/room/PlayerActivityRow";
import { DrawingToolbar } from "@/components/room/DrawingToolbar";
import { DrawingToolbarMobile } from "@/components/room/DrawingToolbarMobile";
import { RoomChat } from "@/components/room/RoomChat";
import { useDrawingPhase } from "./hooks/useDrawingPhase";
import type { DrawingPhaseProps } from "./types";

export const DrawingPhase = (props: DrawingPhaseProps) => {
  const { promptText, drawingEndsAt, players, submittedPlayerIds, socket, roomId } = props;
  const {
    mode,
    setMode,
    color,
    setColor,
    lineWidth,
    setLineWidth,
    canvasRef,
    canSubmit,
    submitting,
    submitted,
    statusMessage,
    setCanvasDirty,
    handleSubmit,
    handleStroke,
    elapsedRatio,
    low,
  } = useDrawingPhase(props);

  return (
    <div className="flex h-dvh flex-col overflow-hidden md:flex-row-reverse" style={{ background: "var(--ab-bg)" }}>
      <div className="flex min-w-0 flex-1 flex-col">
        <div
          className="flex shrink-0 flex-col gap-2 px-4 py-2.5 md:h-[72px] md:flex-row md:items-center md:justify-between md:px-8 md:py-0"
          style={{ borderBottom: "2px solid var(--ab-line)" }}
        >
          <div className="flex items-center justify-between gap-3 md:justify-start">
            <span
              className="ab-sticker px-3 py-1.5 text-xs text-white"
              style={{ background: "var(--ab-violet)" }}
            >
              Задание
            </span>
            <div className="flex items-center gap-2.5 md:hidden">
              <PlayerActivityRow players={players} submittedPlayerIds={submittedPlayerIds} />
              <TimerBadge endsAt={drawingEndsAt} />
            </div>
          </div>
          <p
            className="ab-display text-base font-extrabold leading-[1.15] tracking-[-0.02em] md:text-xl"
            style={{ color: "var(--ab-ink)" }}
          >
            {promptText}
          </p>
          <div className="hidden items-center gap-3.5 md:flex">
            <PlayerActivityRow players={players} submittedPlayerIds={submittedPlayerIds} />
            <TimerBadge endsAt={drawingEndsAt} />
          </div>
        </div>

        <div className="h-1 shrink-0" style={{ background: "rgba(255,255,255,.08)" }}>
          <div
            className="h-full transition-[width]"
            style={{
              width: `${Math.min(100, Math.max(0, elapsedRatio * 100))}%`,
              background: low ? "var(--ab-pink)" : "var(--ab-mint)",
            }}
          />
        </div>

        <div className="relative min-h-0 flex-1">
          <DrawingCanvas
            ref={canvasRef}
            mode={mode}
            color={color}
            lineWidth={lineWidth}
            onDirtyChange={setCanvasDirty}
            onStroke={handleStroke}
          />

          <RoomChat socket={socket} roomId={roomId} players={players} />

          {statusMessage && (
            <div className="absolute right-3 top-3 z-40 md:right-5 md:top-5">
              <StatusBanner variant={statusMessage.variant} message={statusMessage.text} />
            </div>
          )}

          <button
            onClick={handleSubmit}
            disabled={!canSubmit || submitting || submitted}
            className="ab-btn ab-btn-primary absolute bottom-4 right-4 z-40 hidden md:flex md:bottom-6 md:right-6"
          >
            {submitted ? "Отправлено" : submitting ? "Отправка..." : "Я закончил"}
          </button>
        </div>
      </div>

      <DrawingToolbar
        mode={mode}
        onModeChange={setMode}
        color={color}
        onColorChange={setColor}
        lineWidth={lineWidth}
        onLineWidthChange={setLineWidth}
        onClear={() => canvasRef.current?.clear()}
      />

      <DrawingToolbarMobile
        mode={mode}
        onModeChange={setMode}
        color={color}
        onColorChange={setColor}
        lineWidth={lineWidth}
        onLineWidthChange={setLineWidth}
        onClear={() => canvasRef.current?.clear()}
        onSubmit={handleSubmit}
        submitLabel={submitted ? "Отправлено" : submitting ? "Отправка..." : "Я закончил"}
        submitDisabled={!canSubmit || submitting || submitted}
      />
    </div>
  );
};
