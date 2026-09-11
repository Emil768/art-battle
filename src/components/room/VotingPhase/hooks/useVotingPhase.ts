"use client";

import { useEffect, useState } from "react";
import type { VotingPhaseProps } from "../types";

export const useVotingPhase = ({ socket, roomId, submissions }: VotingPhaseProps) => {
  const [votes, setVotes] = useState<Map<string, 1 | -1>>(new Map());
  const [done, setDone] = useState(false);

  const finish = () => {
    setDone(true);
    socket.emit("voting:done", { roomId });
  };

  useEffect(() => {
    // Оценивать некого (соло-тест или все остальные вышли) — незачем ждать
    // полный таймер голосования вхолостую, сразу переходим к результатам.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (submissions.length === 0) finish();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [submissions.length]);

  const vote = (targetUserId: string, value: 1 | -1) => {
    if (done || votes.get(targetUserId) === value) return;
    setVotes((prev) => new Map(prev).set(targetUserId, value));
    socket.emit("voting:vote", { roomId, targetUserId, value });
  };

  return { votes, done, vote, finish };
};
