"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAppSocket } from "@/lib/socket/useSocket";
import type { QueueStatus } from "../types";

export const useLobby = () => {
  const socket = useAppSocket();
  const router = useRouter();
  const [inQueue, setInQueue] = useState(false);
  const [status, setStatus] = useState<QueueStatus | null>(null);
  const [activeRoomId, setActiveRoomId] = useState<string | null>(null);

  useEffect(() => {
    if (!socket) return;

    const onQueueStatus = (s: QueueStatus) => setStatus(s);
    const onMatched = ({ roomId }: { roomId: string }) => {
      router.push(`/room/${roomId}`);
    };
    const onActiveRoom = ({ roomId }: { roomId: string | null }) => setActiveRoomId(roomId);

    socket.on("queue:status", onQueueStatus);
    socket.on("room:matched", onMatched);
    socket.on("lobby:active_room", onActiveRoom);
    socket.emit("lobby:check_active_room");

    return () => {
      socket.off("queue:status", onQueueStatus);
      socket.off("room:matched", onMatched);
      socket.off("lobby:active_room", onActiveRoom);
    };
  }, [socket, router]);

  const handlePlay = () => {
    if (!socket || inQueue) return;
    socket.emit("queue:join");
    setInQueue(true);
  };

  const handleLeave = () => {
    if (!socket) return;
    socket.emit("queue:leave");
    setInQueue(false);
    setStatus(null);
  };

  const handleReturnToRoom = () => {
    if (activeRoomId) router.push(`/room/${activeRoomId}`);
  };

  const handleLeaveActiveRoom = () => {
    if (!socket || !activeRoomId) return;
    socket.emit("room:leave", { roomId: activeRoomId });
    setActiveRoomId(null);
  };

  return {
    socket,
    inQueue,
    status,
    activeRoomId,
    handlePlay,
    handleLeave,
    handleReturnToRoom,
    handleLeaveActiveRoom,
  };
};
