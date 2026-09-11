"use client";

import { useState } from "react";
import Link from "next/link";
import { GameHeader } from "@/components/shared/GameHeader";
import { MobileTabBar } from "@/components/shared/MobileTabBar";
import { Avatar } from "@/components/shared/Avatar";
import { playerColorByIndex } from "@/lib/playerColors";
import type { LeaderboardViewProps, Period } from "./types";

const PERIODS: { id: Period; label: string; short: string }[] = [
  { id: "week", label: "За неделю", short: "Неделя" },
  { id: "month", label: "За месяц", short: "Месяц" },
  { id: "all", label: "За всё время", short: "Всё время" },
];

const PODIUM_HEIGHT: Record<number, { base: number; md: number }> = {
  0: { base: 84, md: 180 },
  1: { base: 114, md: 132 },
  2: { base: 68, md: 104 },
};
const PODIUM_AVATAR: Record<number, { base: number; md: number }> = {
  0: { base: 54, md: 68 },
  1: { base: 44, md: 56 },
  2: { base: 44, md: 56 },
};
const PODIUM_ORDER = [1, 0, 2];
const PODIUM_TONE: Record<number, { bg: string; color: string }> = {
  0: { bg: "rgba(255,210,63,.16)", color: "var(--ab-sun)" },
  1: { bg: "rgba(255,47,126,.14)", color: "var(--ab-pink)" },
  2: { bg: "rgba(111,248,201,.14)", color: "var(--ab-mint)" },
};

export const LeaderboardView = ({ players, ownUserId }: LeaderboardViewProps) => {
  const [period, setPeriod] = useState<Period>("week");
  const podium = players.slice(0, 3);
  const list = players.slice(2);

  return (
    <main className="flex min-h-screen flex-col pb-[76px] md:pb-0" style={{ background: "var(--ab-bg)" }}>
      <GameHeader center={<h1 className="ab-display text-[17px] font-extrabold tracking-[-0.02em] md:hidden" style={{ color: "var(--ab-ink)" }}>Лучшие бойцы</h1>} />
      <MobileTabBar />

      <div className="flex flex-col items-start gap-3 px-6 pt-5 md:flex-row md:items-center md:justify-between md:px-10 md:pt-7">
        <h1 className="ab-display hidden text-[34px] font-extrabold md:block" style={{ color: "var(--ab-ink)" }}>
          Лучшие бойцы
        </h1>
        <div className="flex items-center gap-2">
          {PERIODS.map((p) => {
            const active = p.id === period;
            return (
              <button
                key={p.id}
                onClick={() => setPeriod(p.id)}
                className="rounded-full px-3.5 py-2 text-xs font-extrabold md:px-4 md:py-[9px]"
                style={
                  active
                    ? { background: "var(--ab-ink)", color: "var(--ab-bg)" }
                    : { border: "2px solid rgba(255,255,255,.14)", color: "var(--ab-ink-55)" }
                }
              >
                <span className="md:hidden">{p.short}</span>
                <span className="hidden md:inline">{p.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-7 px-6 py-6 md:grid-cols-[1fr_1.25fr] md:px-10 md:py-8">
        <div className="flex items-end justify-center gap-2 md:gap-3">
          {PODIUM_ORDER.map((rank) => {
            const p = podium[rank];
            if (!p) return null;
            const tone = PODIUM_TONE[rank];
            return (
              <div key={p.id} className="flex flex-col items-center gap-2 md:gap-3">
                {rank === 0 && (
                  <span
                    className="ab-sticker -rotate-3 px-3 py-1.5 text-[11px]"
                    style={{ background: "var(--ab-sun)", color: "var(--ab-sun-ink)" }}
                  >
                    Чемпион
                  </span>
                )}
                <Avatar
                  nickname={p.nickname}
                  avatarUrl={p.avatar_url}
                  size={PODIUM_AVATAR[rank].base}
                  color={playerColorByIndex(rank)}
                  borderWidth={3}
                />
                <span className="text-sm font-bold md:text-base" style={{ color: "var(--ab-ink)" }}>
                  {p.nickname}
                </span>
                <div
                  className="flex w-[86px] flex-col items-center justify-start gap-1 pt-3 md:w-[110px] md:pt-4"
                  style={{
                    height: PODIUM_HEIGHT[rank].base,
                    borderRadius: "18px 18px 0 0",
                    border: `2px solid ${tone.color}`,
                    borderBottom: "none",
                    background: tone.bg,
                  }}
                >
                  <span
                    className="ab-display font-extrabold"
                    style={{ fontSize: rank === 0 ? 30 : 22, color: tone.color }}
                  >
                    {rank + 1}
                  </span>
                  <span className="ab-mono text-xs font-extrabold md:text-sm" style={{ color: tone.color }}>
                    {p.exp}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        <div className="flex flex-col gap-2">
          {list.map((p, i) => {
            const rank = i + 3;
            const isOwn = p.id === ownUserId;
            const winPercent = p.matches_played > 0 ? Math.round((p.wins / p.matches_played) * 100) : 0;
            return (
              <div
                key={p.id}
                className="flex items-center gap-3 rounded-[18px] px-3.5 py-2.5 md:gap-3.5 md:px-4 md:py-3"
                style={
                  isOwn
                    ? { background: "rgba(111,248,201,.1)", border: "2px solid rgba(111,248,201,.3)" }
                    : { border: "2px solid rgba(255,255,255,.1)" }
                }
              >
                <span className="ab-display w-4 text-[16px] font-extrabold" style={{ color: "var(--ab-ink)" }}>
                  {rank}
                </span>
                <Avatar nickname={p.nickname} avatarUrl={p.avatar_url} size={38} color={playerColorByIndex(rank - 1)} />
                <div className="min-w-0 flex-1">
                  <p className="flex items-center gap-1.5 truncate text-base font-extrabold" style={{ color: "var(--ab-ink)" }}>
                    {p.nickname}
                    {isOwn && (
                      <span
                        className="rounded-[6px] px-1.5 py-[3px] text-[10px] font-extrabold uppercase"
                        style={{ background: "var(--ab-mint)", color: "var(--ab-mint-ink)" }}
                      >
                        Вы
                      </span>
                    )}
                  </p>
                  <p className="text-xs font-semibold" style={{ color: "var(--ab-ink-45)" }}>
                    ур. {p.level} · {p.matches_played} матча · {winPercent}%
                  </p>
                </div>
                <span
                  className="ab-mono text-[17px] font-extrabold"
                  style={{ color: isOwn ? "var(--ab-mint)" : "var(--ab-ink)" }}
                >
                  {p.exp}
                </span>
              </div>
            );
          })}
          {list.length === 0 && (
            <p className="py-6 text-center font-bold" style={{ color: "var(--ab-ink-30)" }}>
              Пока никто не играл
            </p>
          )}
        </div>
      </div>

      <div className="hidden justify-center pb-8 md:flex">
        <Link href="/lobby" className="ab-btn ab-btn-secondary">
          Вернуться в лобби
        </Link>
      </div>
    </main>
  );
};
