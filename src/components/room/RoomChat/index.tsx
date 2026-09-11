"use client";

import { CHAT_MESSAGE_MAX_LENGTH } from "@/lib/game/constants";
import { playerColorByIndex } from "@/lib/playerColors";
import { useRoomChat } from "./hooks/useRoomChat";
import type { RoomChatProps } from "./types";

export const RoomChat = (props: RoomChatProps) => {
  const { players } = props;
  const { messages, text, setText, send } = useRoomChat(props);
  const lastTwo = messages.slice(-2);
  const lastOne = messages.slice(-1);

  const colorFor = (userId: string) => {
    const index = players.findIndex((p) => p.id === userId);
    return playerColorByIndex(index === -1 ? 0 : index);
  };

  const renderBubble = (m: (typeof messages)[number]) => {
    const color = colorFor(m.userId);
    return (
      <div
        key={m.id}
        className="ab-fade-in rounded-[16px_16px_16px_4px] px-3 py-2 text-xs md:px-[15px] md:py-2.5 md:text-sm"
        style={{ background: "var(--ab-bg)", border: `2px solid ${color}` }}
      >
        <span className="font-extrabold" style={{ color }}>
          {m.nickname}
        </span>{" "}
        <span style={{ color: "var(--ab-ink)" }}>{m.text}</span>
      </div>
    );
  };

  return (
    <div className="absolute bottom-3 left-3 z-30 flex w-[200px] flex-col gap-2 md:bottom-6 md:left-6 md:w-[260px]">
      <div className="md:hidden">{lastOne.map(renderBubble)}</div>
      <div className="hidden md:flex md:flex-col md:gap-2">{lastTwo.map(renderBubble)}</div>

      <input
        value={text}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && send()}
        placeholder="Написать в чат…"
        maxLength={CHAT_MESSAGE_MAX_LENGTH}
        className="w-[180px] rounded-[16px] px-3 py-2 text-xs outline-none md:w-[240px] md:px-3.5 md:py-2.5 md:text-sm"
        style={{ border: "2px solid rgba(255,255,255,.14)", background: "transparent", color: "var(--ab-ink)" }}
      />
    </div>
  );
};
