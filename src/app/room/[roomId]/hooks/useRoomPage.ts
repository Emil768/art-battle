"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAppSocket } from "@/lib/socket/useSocket";
import { createClient } from "@/lib/supabase/client";
import type { RoomResultEntry, RoomStateSnapshot } from "@/types";
import type { VoteProgress, VotingPayload } from "../types";

export const useRoomPage = (roomId: string) => {
  const socket = useAppSocket();
  const router = useRouter();
  const [userId, setUserId] = useState<string | null>(null);
  const [roomState, setRoomState] = useState<RoomStateSnapshot | null>(null);
  const [voteProgress, setVoteProgress] = useState<VoteProgress>({
    votedCount: 0,
    totalCount: 0,
  });
  const [votingPayload, setVotingPayload] = useState<VotingPayload | null>(null);
  const [results, setResults] = useState<RoomResultEntry[] | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [submittedPlayerIds, setSubmittedPlayerIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    createClient()
      .auth.getUser()
      .then(({ data }) => setUserId(data.user?.id ?? null));
  }, []);

  useEffect(() => {
    if (!socket) return;
    socket.emit("room:join", { roomId });

    // Сокет переподключается автоматически (обрыв сети, рестарт сервера), но
    // это тот же объект — эффект повторно не запускается. Без повторного
    // room:join клиент не узнает, что комната пропала, пока не попробует
    // что-то отправить.
    const onConnect = () => socket.emit("room:join", { roomId });
    socket.on("connect", onConnect);

    const onRoomState = (s: RoomStateSnapshot) => {
      setRoomState(s);
      setVoteProgress((p) => ({ ...p, totalCount: s.players.length }));
    };
    const onPhaseDrawing = (p: { drawingEndsAt: string }) => {
      setRoomState((prev) =>
        prev ? { ...prev, status: "drawing", drawingEndsAt: p.drawingEndsAt } : prev,
      );
    };
    const onPlayerSubmitted = (p: { userId: string }) => {
      setSubmittedPlayerIds((prev) => new Set(prev).add(p.userId));
    };
    const onPhaseVoting = (p: VotingPayload) => {
      setVotingPayload(p);
      setRoomState((prev) =>
        prev ? { ...prev, status: "voting", votingEndsAt: p.votingEndsAt } : prev,
      );
    };
    const onPlayerVoted = (p: VoteProgress) => setVoteProgress(p);
    const onPhaseFinished = (p: { results: RoomResultEntry[] }) => {
      setResults(p.results);
      setRoomState((prev) => (prev ? { ...prev, status: "finished" } : prev));
    };
    const onError = (p: { code: string; message: string }) => {
      setErrorMsg(p.message);
      // Комнаты больше нет (уже завершилась и была вычищена, или ссылка старая) —
      // раньше это оставляло экран на бесконечной "Загрузка...", теперь уходим в лобби.
      if (p.code === "room_not_found") router.push("/lobby");
    };

    socket.on("room:state", onRoomState);
    socket.on("phase:drawing", onPhaseDrawing);
    socket.on("player:submitted", onPlayerSubmitted);
    socket.on("phase:voting", onPhaseVoting);
    socket.on("player:voted", onPlayerVoted);
    socket.on("phase:finished", onPhaseFinished);
    socket.on("error", onError);

    return () => {
      socket.off("connect", onConnect);
      socket.off("room:state", onRoomState);
      socket.off("phase:drawing", onPhaseDrawing);
      socket.off("player:submitted", onPlayerSubmitted);
      socket.off("phase:voting", onPhaseVoting);
      socket.off("player:voted", onPlayerVoted);
      socket.off("phase:finished", onPhaseFinished);
      socket.off("error", onError);
    };
  }, [socket, roomId, router]);

  return {
    socket,
    userId,
    roomState,
    voteProgress,
    votingPayload,
    results,
    errorMsg,
    submittedPlayerIds,
  };
};
