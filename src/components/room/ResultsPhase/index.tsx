import Link from "next/link";
import { Avatar } from "@/components/shared/Avatar";
import { GameHeader } from "@/components/shared/GameHeader";
import { playerColorByIndex } from "@/lib/playerColors";
import type { ResultsPhaseProps } from "./types";

const StatusSticker = () => (
  <span className="ab-sticker px-4 py-2 text-xs" style={{ background: "var(--ab-sun)", color: "var(--ab-sun-ink)" }}>
    Итоги раунда
  </span>
);

export const ResultsPhase = ({ results, ownUserId }: ResultsPhaseProps) => {
  const colorFor = (userId: string) => playerColorByIndex(results.findIndex((r) => r.userId === userId));
  const sorted = [...results].sort((a, b) => b.score - a.score);
  const winner = sorted[0];

  return (
    <div className="flex min-h-screen flex-col" style={{ background: "var(--ab-bg)" }}>
      <GameHeader center={<StatusSticker />} />

      <div className="ab-fade-in grid flex-1 grid-cols-1 md:grid-cols-2">
        {winner && (
          <div className="flex flex-col gap-4 p-6 md:min-h-0 md:p-9">
            <span
              className="ab-sticker w-fit -rotate-2 px-3 py-1.5 text-xs"
              style={{ background: "var(--ab-sun)", color: "var(--ab-sun-ink)" }}
            >
              👑 Победитель
            </span>
            {winner.imageUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={winner.imageUrl}
                alt="Рисунок победителя"
                className="h-[280px] rounded-[24px] object-cover md:h-auto md:min-h-0 md:flex-1"
                style={{ background: "var(--ab-canvas)", border: "4px solid var(--ab-sun)" }}
              />
            ) : (
              <div
                className="flex h-[280px] items-center justify-center rounded-[24px] md:h-auto md:min-h-0 md:flex-1"
                style={{ background: "var(--ab-canvas)", border: "4px solid var(--ab-sun)" }}
              >
                <span className="text-sm font-bold text-black/30">Нет работы</span>
              </div>
            )}
          </div>
        )}

        <div
          className="flex flex-col gap-2 border-t-2 p-6 md:gap-2.5 md:border-l-2 md:border-t-0 md:p-8 md:pt-8"
          style={{ borderColor: "var(--ab-line)" }}
        >
          {sorted.map((r, i) => {
            const isOwn = r.userId === ownUserId;
            const isTop = i === 0;
            return (
              <Link
                key={r.userId}
                href={`/profile/${r.userId}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2.5 rounded-[18px] px-3 py-2.5 md:gap-3.5 md:px-3.5 md:py-3"
                style={
                  isTop
                    ? { background: "rgba(255,210,63,.12)", border: "2px solid rgba(255,210,63,.4)" }
                    : isOwn
                      ? { background: "rgba(111,248,201,.1)", border: "2px solid rgba(111,248,201,.3)" }
                      : { opacity: r.imageUrl ? 1 : 0.55 }
                }
              >
                <span className="ab-display w-6 shrink-0 text-[18px] font-extrabold" style={{ color: "var(--ab-ink)" }}>
                  {isTop ? "👑" : i + 1}
                </span>
                <Avatar nickname={r.nickname} avatarUrl={r.avatarUrl} size={28} color={colorFor(r.userId)} />
                <span className="min-w-0 flex-1 truncate text-base font-bold" style={{ color: "var(--ab-ink)" }}>
                  {r.nickname}
                </span>
                {isOwn && (
                  <span
                    className="shrink-0 whitespace-nowrap rounded-[6px] px-1.5 py-[3px] text-[10px] font-extrabold uppercase"
                    style={{ background: "var(--ab-mint)", color: "var(--ab-mint-ink)" }}
                  >
                    Вы
                  </span>
                )}
                {r.imageUrl ? (
                  <span
                    className="shrink-0 whitespace-nowrap text-sm font-bold"
                    style={{ color: "var(--ab-ink-45)" }}
                  >
                    👍 {r.likes} 👎 {r.dislikes}
                  </span>
                ) : (
                  <span className="shrink-0 whitespace-nowrap text-sm font-bold" style={{ color: "var(--ab-ink-45)" }}>
                    не успела
                  </span>
                )}
                <span
                  className="ab-mono w-11 shrink-0 whitespace-nowrap text-right text-[15px] font-extrabold"
                  style={{ color: isTop ? "var(--ab-sun)" : isOwn ? "var(--ab-mint)" : "var(--ab-ink)" }}
                >
                  +{r.expAwarded}
                </span>
              </Link>
            );
          })}
        </div>
      </div>

      <div className="flex gap-3 px-6 pb-6 md:justify-center md:px-0 md:pb-8">
        <Link href="/lobby" className="ab-btn ab-btn-primary flex-1 md:flex-none">
          Ещё раунд
        </Link>
        <Link href="/lobby" className="ab-btn ab-btn-secondary">
          В лобби
        </Link>
      </div>
    </div>
  );
};
