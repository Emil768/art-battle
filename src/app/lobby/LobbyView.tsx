"use client";

import { GameHeader } from "@/components/shared/GameHeader";
import { MobileTabBar } from "@/components/shared/MobileTabBar";
import { Avatar } from "@/components/shared/Avatar";
import { playerColorByIndex } from "@/lib/playerColors";
import { pluralRu } from "@/lib/formatDuration";
import { useLobby } from "./hooks/useLobby";
import type { LobbyViewProps } from "./types";

const StatusSticker = () => (
  <span
    className="ab-sticker px-4 py-2 text-xs"
    style={{ background: "var(--ab-violet)", color: "white" }}
  >
    Собираем комнату
  </span>
);

export const LobbyView = ({ topPlayers, ownStats, ownUserId, roomSize }: LobbyViewProps) => {
  const {
    socket,
    inQueue,
    status,
    activeRoomId,
    handlePlay,
    handleLeave,
    handleReturnToRoom,
    handleLeaveActiveRoom,
  } = useLobby();

  const winRate =
    ownStats.matchesPlayed > 0 ? Math.round((ownStats.wins / ownStats.matchesPlayed) * 100) : 0;

  if (activeRoomId || inQueue) {
    const queued = status?.queued ?? 1;
    const needed = status?.needed ?? 5;
    const segments = Array.from({ length: needed });

    return (
      <main className="flex min-h-screen flex-col" style={{ background: "var(--ab-bg)" }}>
        <GameHeader center={<StatusSticker />} />
        <div className="flex flex-1 flex-col items-center justify-center gap-9 px-4">
          {activeRoomId ? (
            <>
              <h1
                className="ab-display text-center text-[26px] font-extrabold md:text-[34px]"
                style={{ color: "var(--ab-ink)" }}
              >
                Вы всё ещё в матче
              </h1>
              <div className="flex flex-wrap justify-center gap-3">
                <button onClick={handleReturnToRoom} className="ab-btn ab-btn-primary">
                  Вернуться в комнату
                </button>
                <button onClick={handleLeaveActiveRoom} className="ab-btn ab-btn-secondary">
                  Покинуть комнату
                </button>
              </div>
            </>
          ) : (
            <>
              <h1
                className="ab-display text-center text-[26px] font-extrabold md:text-[34px]"
                style={{ color: "var(--ab-ink)" }}
              >
                Ищем игроков
              </h1>
              <div className="flex items-center gap-2.5">
                {segments.map((_, i) => (
                  <span
                    key={i}
                    className="h-2 w-11 rounded-full"
                    style={{ background: i < queued ? "var(--ab-mint)" : "rgba(255,255,255,.14)" }}
                  />
                ))}
              </div>
              <p className="text-sm font-bold" style={{ color: "var(--ab-ink-45)" }}>
                {queued} из {needed} · обычно занимает меньше минуты
              </p>
              <button onClick={handleLeave} className="ab-btn ab-btn-secondary" disabled={!socket}>
                Отменить
              </button>
            </>
          )}
        </div>
      </main>
    );
  }

  return (
    <main className="flex min-h-screen flex-col pb-[76px] md:pb-0" style={{ background: "var(--ab-bg)" }}>
      <GameHeader />
      <MobileTabBar />

      <div className="grid flex-1 grid-cols-1 md:grid-cols-[1.15fr_1fr]">
        <div className="flex flex-col justify-center gap-5 px-6 py-8 md:gap-[26px] md:px-14 md:py-0">
          <span
            className="ab-sticker w-fit -rotate-2 px-3 py-1.5 text-xs text-white"
            style={{ background: "var(--ab-pink)" }}
          >
            Сезон 01 · идёт
          </span>
          <h1
            className="ab-display text-[28px] font-extrabold leading-[1.1] tracking-[-0.03em] md:text-[40px] md:leading-[1.08] md:tracking-[-0.03em]"
            style={{ color: "var(--ab-ink)" }}
          >
            Рисуй,
            <br />
            <span style={{ color: "var(--ab-mint)" }}>кайфуй!</span>
          </h1>
          <p
            className="max-w-[430px] text-sm leading-[1.55] font-medium md:text-[15px]"
            style={{ color: "var(--ab-ink-55)" }}
          >
            {roomSize} {pluralRu(roomSize, "человек", "человека", "человек")}, одна цель — стать
            лучшим.
          </p>
          <button
            onClick={handlePlay}
            disabled={!socket}
            className="ab-btn ab-btn-primary w-full max-w-[250px] md:w-[250px]"
          >
            Поехали
          </button>
        </div>

        <div className="flex flex-col border-t-2 md:border-l-2 md:border-t-0" style={{ borderColor: "var(--ab-line)" }}>
          <div
            className="flex items-center justify-between px-6 py-4 md:px-8 md:py-[22px]"
            style={{ borderBottom: "2px solid var(--ab-line)" }}
          >
            <span
              className="text-[13px] font-extrabold tracking-[0.1em]"
              style={{ color: "var(--ab-ink-55)" }}
            >
              ТОП НЕДЕЛИ
            </span>
            <span className="ab-mono text-xs" style={{ color: "var(--ab-mint)" }}>
              обновится через 2д
            </span>
          </div>

          <div className="flex flex-col gap-2 px-4 py-3 md:px-6 md:py-3.5">
            {topPlayers.map((p, i) => {
              const isOwn = p.id === ownUserId;
              const isFirst = i === 0;
              return (
                <div
                  key={p.id}
                  className={`flex items-center gap-3 rounded-[16px] px-3 py-2.5 md:gap-3.5 md:px-3.5 md:py-[11px] ${i >= 3 ? "hidden md:flex" : ""}`}
                  style={
                    isFirst
                      ? { background: "rgba(255,210,63,.1)", border: "2px solid rgba(255,210,63,.35)" }
                      : isOwn
                        ? { background: "rgba(255,255,255,.05)", border: "2px solid rgba(255,255,255,.12)" }
                        : undefined
                  }
                >
                  <span
                    className="ab-display w-[26px] text-center text-[15px] font-extrabold"
                    style={{ color: "var(--ab-ink)" }}
                  >
                    {i + 1}
                  </span>
                  <Avatar
                    nickname={p.nickname}
                    avatarUrl={p.avatar_url}
                    size={32}
                    color={playerColorByIndex(i)}
                  />
                  <span className="flex-1 truncate text-base font-bold" style={{ color: "var(--ab-ink)" }}>
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
                  <span
                    className="ab-mono text-[15px] font-extrabold"
                    style={{ color: isFirst ? "var(--ab-sun)" : "var(--ab-ink)" }}
                  >
                    {p.exp}
                  </span>
                </div>
              );
            })}
            {topPlayers.length === 0 && (
              <p className="px-3 py-6 text-center text-sm font-bold" style={{ color: "var(--ab-ink-30)" }}>
                Пока никто не играл
              </p>
            )}
          </div>

          <div className="mt-auto grid grid-cols-3 gap-2 px-4 pb-6 md:gap-2.5 md:px-6">
            <div className="rounded-[16px] px-3 py-3.5 md:px-3.5 md:py-4" style={{ background: "rgba(255,255,255,.05)" }}>
              <p className="ab-display text-xl font-extrabold md:text-2xl" style={{ color: "var(--ab-ink)" }}>
                {ownStats.matchesPlayed}
              </p>
              <p className="text-[10px] font-extrabold tracking-[0.12em]" style={{ color: "var(--ab-ink-45)" }}>
                МАТЧЕЙ
              </p>
            </div>
            <div className="rounded-[16px] px-3 py-3.5 md:px-3.5 md:py-4" style={{ background: "rgba(255,255,255,.05)" }}>
              <p className="ab-display text-xl font-extrabold md:text-2xl" style={{ color: "var(--ab-ink)" }}>
                {ownStats.wins}
              </p>
              <p className="text-[10px] font-extrabold tracking-[0.12em]" style={{ color: "var(--ab-ink-45)" }}>
                ПОБЕД
              </p>
            </div>
            <div className="rounded-[16px] px-3 py-3.5 md:px-3.5 md:py-4" style={{ background: "rgba(111,248,201,.12)" }}>
              <p className="ab-display text-xl font-extrabold md:text-2xl" style={{ color: "var(--ab-mint)" }}>
                {winRate}%
              </p>
              <p className="text-[10px] font-extrabold tracking-[0.12em]" style={{ color: "var(--ab-ink-45)" }}>
                ВИНРЕЙТ
              </p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
};
