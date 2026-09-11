import Link from "next/link";
import { Avatar } from "@/components/shared/Avatar";
import { GameHeader } from "@/components/shared/GameHeader";
import { playerColorByIndex } from "@/lib/playerColors";
import type { WaitingRoomProps } from "./types";

const TILTS = ["-1.5deg", "1deg", "-.6deg", "1.4deg", "-1.2deg"];

const StatusSticker = () => (
  <span className="ab-sticker px-4 py-2 text-xs" style={{ background: "var(--ab-violet)", color: "white" }}>
    Все в сборе
  </span>
);

export const WaitingRoom = ({ players, ownUserId }: WaitingRoomProps) => {
  return (
    <div className="flex min-h-screen flex-col" style={{ background: "var(--ab-bg)" }}>
      <GameHeader center={<StatusSticker />} />

      <div className="ab-fade-in flex flex-1 flex-col items-center justify-center gap-7 px-4 py-8 md:gap-9 md:py-4">
        <h1 className="ab-display text-[26px] font-extrabold md:text-[34px]" style={{ color: "var(--ab-ink)" }}>
          Все в сборе!
        </h1>

        {/* Мобильный вертикальный список */}
        <div className="flex w-full max-w-[360px] flex-col gap-2.5 md:hidden">
          {players.map((p, i) => {
            const isOwn = p.id === ownUserId;
            const color = playerColorByIndex(i);
            return (
              <Link
                key={p.id}
                href={`/profile/${p.id}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 rounded-[20px] px-3.5 py-3"
                style={{ border: `2px solid ${color}` }}
              >
                <Avatar nickname={p.nickname} avatarUrl={p.avatarUrl} size={46} color={color} borderWidth={2} />
                <span className="flex-1 text-[15px] font-extrabold" style={{ color: "var(--ab-ink)" }}>
                  {p.nickname}
                </span>
                {isOwn && (
                  <span
                    className="rounded-[6px] px-1.5 py-[3px] text-[10px] font-extrabold uppercase"
                    style={{ background: "var(--ab-mint)", color: "var(--ab-mint-ink)" }}
                  >
                    Вы
                  </span>
                )}
              </Link>
            );
          })}
        </div>

        {/* Десктопные плитки */}
        <div className="hidden flex-wrap justify-center gap-4 md:flex">
          {players.map((p, i) => {
            const isOwn = p.id === ownUserId;
            const color = playerColorByIndex(i);
            return (
              <Link
                key={p.id}
                href={`/profile/${p.id}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex w-[158px] flex-col items-center justify-center gap-3 rounded-[22px] py-6"
                style={{
                  background: "var(--ab-surface)",
                  border: `2px solid ${color}`,
                  transform: `rotate(${TILTS[i % TILTS.length]})`,
                }}
              >
                <Avatar nickname={p.nickname} avatarUrl={p.avatarUrl} size={60} color={color} borderWidth={3} />
                <span className="text-base font-extrabold" style={{ color: "var(--ab-ink)" }}>
                  {p.nickname}
                </span>
                {isOwn && (
                  <span
                    className="rounded-[6px] px-1.5 py-[3px] text-[10px] font-extrabold uppercase"
                    style={{ background: "var(--ab-mint)", color: "var(--ab-mint-ink)" }}
                  >
                    Вы
                  </span>
                )}
              </Link>
            );
          })}
        </div>

        <span
          className="mx-4 rounded-[14px] px-[18px] py-[11px] text-center text-sm font-semibold"
          style={{
            background: "rgba(139,92,246,.16)",
            border: "2px solid rgba(139,92,246,.35)",
            color: "#C4B5FD",
          }}
        >
          Задание покажем всем одновременно
        </span>
      </div>
    </div>
  );
};
