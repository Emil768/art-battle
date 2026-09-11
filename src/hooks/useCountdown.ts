"use client";

import { useEffect, useState } from "react";

export const useCountdown = (endsAt: string, onExpire?: () => void) => {
  const [remainingMs, setRemainingMs] = useState(() => new Date(endsAt).getTime() - Date.now());

  useEffect(() => {
    const interval = setInterval(() => {
      const ms = new Date(endsAt).getTime() - Date.now();
      setRemainingMs(ms);
      if (ms <= 0) {
        clearInterval(interval);
        onExpire?.();
      }
    }, 250);
    return () => clearInterval(interval);
  }, [endsAt, onExpire]);

  const totalSeconds = Math.max(0, Math.ceil(remainingMs / 1000));
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;

  return { minutes, seconds, totalSeconds };
};
