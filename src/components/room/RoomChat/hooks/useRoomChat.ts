"use client";

import { useEffect, useState } from "react";
import type { ChatMessage } from "@/types";
import type { RoomChatProps } from "../types";

export const useRoomChat = ({ socket, roomId }: RoomChatProps) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [text, setText] = useState("");

  useEffect(() => {
    const onMessage = (msg: ChatMessage) => {
      if (msg.roomId !== roomId) return;
      setMessages((prev) => [...prev, msg]);
    };
    socket.on("chat:message", onMessage);
    return () => {
      socket.off("chat:message", onMessage);
    };
  }, [socket, roomId]);

  const send = () => {
    const trimmed = text.trim();
    if (!trimmed) return;
    socket.emit("chat:send", { roomId, text: trimmed });
    setText("");
  };

  return { messages, text, setText, send };
};
