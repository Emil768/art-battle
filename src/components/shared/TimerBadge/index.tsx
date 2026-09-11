"use client";

import { useCountdown } from "@/hooks/useCountdown";
import type { TimerBadgeProps } from "./types";

export const TimerBadge = ({ endsAt, onExpire, tone = "auto" }: TimerBadgeProps) => {
  const { minutes, seconds, totalSeconds } = useCountdown(endsAt, onExpire);
  const low = tone === "pink" || totalSeconds <= 10;

  return (
    <span
      className="ab-mono shrink-0 rounded-full px-4 py-[9px] text-xl font-extrabold"
      style={{
        background: low ? "rgba(255,47,126,.16)" : "rgba(111,248,201,.14)",
        color: low ? "var(--ab-pink)" : "var(--ab-mint)",
      }}
    >
      {minutes}:{seconds.toString().padStart(2, "0")}
    </span>
  );
};
