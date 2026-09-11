"use client";

import Link from "next/link";
import { Avatar } from "@/components/shared/Avatar";
import { GameHeader } from "@/components/shared/GameHeader";
import { TimerBadge } from "@/components/shared/TimerBadge";
import { playerColorByIndex } from "@/lib/playerColors";
import { useVotingPhase } from "./hooks/useVotingPhase";
import type { VotingPhaseProps } from "./types";

const TILTS = ["-1.2deg", "1deg", "-.6deg", "1.4deg"];

const StatusSticker = ({ votedCount, totalCount }: { votedCount: number; totalCount: number }) => (
  <span className="ab-sticker px-4 py-2 text-xs text-white" style={{ background: "var(--ab-pink)" }}>
    Голосование · {votedCount} из {totalCount}
  </span>
);

export const VotingPhase = (props: VotingPhaseProps) => {
  const { promptText, players, votingEndsAt, submissions, votedCount, totalCount } = props;
  const { votes, done, vote, finish } = useVotingPhase(props);

  const colorFor = (userId: string) => {
    const index = players.findIndex((p) => p.id === userId);
    return playerColorByIndex(index === -1 ? 0 : index);
  };

  return (
    <div className="flex min-h-screen flex-col" style={{ background: "var(--ab-bg)" }}>
      <GameHeader
        center={<StatusSticker votedCount={votedCount} totalCount={totalCount} />}
        right={<TimerBadge endsAt={votingEndsAt} tone="pink" />}
      />

      <div className="ab-fade-in flex flex-col gap-3 px-6 pt-5 md:flex-row md:items-end md:justify-between md:gap-6 md:px-10 md:pt-[30px]">
        <div>
          <h1
            className="ab-display text-2xl font-extrabold leading-[1.05] tracking-[-0.02em] md:text-[34px] md:tracking-[-0.03em]"
            style={{ color: "var(--ab-ink)" }}
          >
            Кто не справился?
          </h1>
          <p className="mt-1 text-sm font-medium md:text-[15px]" style={{ color: "var(--ab-ink-55)" }}>
            👍 тем, кто справился, 👎 тем, кто совсем мимо. Свою работу пропускаем.
          </p>
        </div>
        <span
          className="w-fit shrink-0 rounded-[14px] px-4 py-[9px] text-sm font-semibold"
          style={{ background: "rgba(139,92,246,.16)", border: "2px solid rgba(139,92,246,.4)", color: "#C4B5FD" }}
        >
          Задание: {promptText}
        </span>
      </div>

      {submissions.length === 0 && (
        <p className="mt-10 text-center font-bold" style={{ color: "var(--ab-ink-45)" }}>
          Оценивать некого — переходим к результатам...
        </p>
      )}

      <div
        className="grid flex-1 grid-cols-2 gap-3.5 px-6 pt-5 md:grid-cols-[repeat(var(--cols),1fr)] md:gap-[22px] md:px-10 md:pt-[26px]"
        style={{ ["--cols" as string]: Math.max(submissions.length, 1), minHeight: 0 }}
      >
        {submissions.map((s, i) => {
          const color = colorFor(s.userId);
          const myVote = votes.get(s.userId);
          const isDisliked = myVote === -1;
          const isLiked = myVote === 1;
          return (
            <div
              key={s.userId}
              className="flex min-h-0 flex-col gap-3"
              style={{ transform: `rotate(${TILTS[i % TILTS.length]})` }}
            >
              <div className="relative h-[150px] md:h-auto md:min-h-0 md:flex-1">
                {s.imageUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={s.imageUrl}
                    alt={`Рисунок ${s.nickname}`}
                    className="h-full w-full rounded-[20px] object-cover"
                    style={{ background: "var(--ab-canvas)", border: `3px solid ${color}`, opacity: isDisliked ? 0.6 : 1 }}
                  />
                ) : (
                  <div
                    className="flex h-full w-full flex-col items-center justify-center gap-1 rounded-[20px]"
                    style={{ border: "3px dashed rgba(255,255,255,.18)" }}
                  >
                    <span className="text-[13px] font-extrabold tracking-[0.1em]" style={{ color: "var(--ab-ink-30)" }}>
                      НЕ УСПЕЛА
                    </span>
                    <span className="text-sm font-medium" style={{ color: "var(--ab-ink-30)" }}>
                      бывает
                    </span>
                  </div>
                )}

                {isDisliked && (
                  <span
                    className="ab-sticker absolute left-4 top-4 -rotate-[4deg] px-3 py-1.5 text-[11px] text-white"
                    style={{ background: "var(--ab-pink)" }}
                  >
                    👎 Минус
                  </span>
                )}
                {isLiked && (
                  <span
                    className="ab-sticker absolute left-4 top-4 -rotate-[4deg] px-3 py-1.5 text-[11px] text-white"
                    style={{ background: "var(--ab-mint)", color: "var(--ab-mint-ink)" }}
                  >
                    👍 Плюс
                  </span>
                )}
              </div>

              <div className="flex items-center gap-2.5">
                <Link
                  href={`/profile/${s.userId}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex min-w-0 flex-1 items-center gap-2.5"
                >
                  <Avatar nickname={s.nickname} avatarUrl={s.avatarUrl} size={30} color={color} />
                  <span className="truncate text-[15px] font-bold" style={{ color: "var(--ab-ink)" }}>
                    {s.nickname}
                  </span>
                </Link>
                <div className="flex shrink-0 items-center gap-1.5">
                  <button
                    onClick={() => vote(s.userId, 1)}
                    disabled={done}
                    aria-label="Лайк"
                    className="ab-btn flex h-11 w-11 items-center justify-center rounded-[14px] text-lg md:h-[38px] md:w-[38px] md:rounded-[12px]"
                    style={
                      isLiked
                        ? { background: "var(--ab-mint)" }
                        : { border: "2px solid rgba(255,255,255,.18)" }
                    }
                  >
                    👍
                  </button>
                  <button
                    onClick={() => vote(s.userId, -1)}
                    disabled={done}
                    aria-label="Дизлайк"
                    className="ab-btn flex h-11 w-11 items-center justify-center rounded-[14px] text-lg md:h-[38px] md:w-[38px] md:rounded-[12px]"
                    style={
                      isDisliked
                        ? { background: "var(--ab-pink)" }
                        : { border: "2px solid rgba(255,255,255,.18)" }
                    }
                  >
                    👎
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="flex flex-col items-center gap-3 px-6 py-5 md:flex-row md:items-center md:justify-between md:px-10 md:py-7">
        <p className="text-[13px] font-bold" style={{ color: "var(--ab-ink-45)" }}>
          Оценено {votes.size} · передумать можно до конца таймера
        </p>
        <button onClick={finish} disabled={done} className="ab-btn ab-btn-primary w-full md:w-auto">
          Готово
        </button>
      </div>
    </div>
  );
};
