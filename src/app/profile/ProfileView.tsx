import Link from "next/link";
import { GameHeader } from "@/components/shared/GameHeader";
import { MobileTabBar } from "@/components/shared/MobileTabBar";
import { Avatar } from "@/components/shared/Avatar";
import { CursorStylePicker } from "@/components/shared/CursorStylePicker";
import { VersionBadge } from "@/components/shared/VersionBadge";
import { BrushIcon, TrophyIcon, ArrowUpIcon } from "@/components/icons";
import { playerColorForId } from "@/lib/playerColors";
import { buildAchievements, FEATURED_ACHIEVEMENT_IDS } from "./achievements";
import { CopyLinkButton } from "./CopyLinkButton";
import type { Achievement, ProfileData } from "./types";

const formatJoinDate = (iso: string) =>
  new Intl.DateTimeFormat("ru-RU", { month: "long", year: "numeric" }).format(new Date(iso));

const ICONS = { brush: BrushIcon, trophy: TrophyIcon, arrow: ArrowUpIcon };
const ICON_TONE: Record<Achievement["icon"], { bg: string; color: string }> = {
  brush: { bg: "var(--ab-mint)", color: "var(--ab-mint-ink)" },
  trophy: { bg: "var(--ab-sun)", color: "var(--ab-sun-ink)" },
  arrow: { bg: "var(--ab-violet)", color: "white" },
};

interface ProfileViewProps {
  profile: ProfileData;
  userId: string;
  isOwnProfile: boolean;
}

export const ProfileView = ({ profile, userId, isOwnProfile }: ProfileViewProps) => {
  const achievements = buildAchievements(profile);
  const unlockedCount = achievements.filter((a) => a.unlocked).length;
  const featured = FEATURED_ACHIEVEMENT_IDS.map((id) => achievements.find((a) => a.id === id)).filter(
    (a): a is Achievement => !!a,
  );
  const lockedRestCount = achievements.length - featured.length - featured.filter((a) => !a.unlocked).length;

  const progressInLevel = profile.exp % 100;
  const nextLevelTarget = (Math.floor(profile.exp / 100) + 1) * 100;
  const winPercent =
    profile.matchesPlayed > 0 ? Math.round((profile.wins / profile.matchesPlayed) * 100) : 0;
  const color = playerColorForId(userId);

  return (
    <main className="min-h-screen pb-[76px] md:pb-0" style={{ background: "var(--ab-bg)" }}>
      <GameHeader />
      <MobileTabBar />

      <div className="grid grid-cols-1 gap-6 px-6 py-6 md:grid-cols-[340px_1fr] md:gap-[26px] md:px-10 md:py-8">
        <div className="flex flex-col gap-4">
          <div
            className="flex flex-col gap-4 rounded-[22px] p-5 md:items-center md:p-6"
            style={{ background: "var(--ab-surface)", border: "2px solid rgba(255,255,255,.12)" }}
          >
            <div className="flex flex-row items-center gap-4 md:flex-col md:text-center">
              <div className="relative shrink-0">
                <Avatar nickname={profile.nickname} avatarUrl={profile.avatarUrl} size={76} color={color} borderWidth={3} />
                <span
                  className="ab-sticker absolute -bottom-2 left-1/2 -translate-x-1/2 -rotate-3 px-2.5 py-1 text-[10px]"
                  style={{ background: "var(--ab-sun)", color: "var(--ab-sun-ink)" }}
                >
                  Ур. {profile.level}
                </span>
              </div>
              <div className="min-w-0 flex-1 md:flex-none md:mt-4">
                <h1 className="ab-display truncate text-xl font-extrabold md:text-2xl" style={{ color: "var(--ab-ink)" }}>
                  {profile.nickname}
                </h1>
                <p className="mt-1 text-xs font-medium md:text-sm" style={{ color: "var(--ab-ink-45)" }}>
                  в игре с {formatJoinDate(profile.joinedAt)}
                </p>
              </div>
            </div>

            <div className="w-full">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold" style={{ color: "var(--ab-ink-45)" }}>
                  до {profile.level + 1} уровня
                </span>
                <span className="ab-mono text-xs font-extrabold" style={{ color: "var(--ab-mint)" }}>
                  {profile.exp} / {nextLevelTarget}
                </span>
              </div>
              <div className="mt-2 h-2.5 w-full overflow-hidden rounded-full" style={{ background: "rgba(255,255,255,.1)" }}>
                <div
                  className="h-full rounded-full"
                  style={{ width: `${progressInLevel}%`, background: "var(--ab-mint)" }}
                />
              </div>
            </div>

            {isOwnProfile ? (
              <div className="w-full">
                <CopyLinkButton userId={userId} />
              </div>
            ) : (
              <Link href="/lobby" className="ab-btn ab-btn-secondary w-full">
                Вернуться в лобби
              </Link>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-[18px] px-[18px] py-4" style={{ background: "rgba(255,255,255,.05)" }}>
              <p className="ab-display text-2xl font-extrabold" style={{ color: "var(--ab-ink)" }}>
                {profile.matchesPlayed}
              </p>
              <p className="text-[10px] font-extrabold tracking-[0.12em]" style={{ color: "var(--ab-ink-45)" }}>
                МАТЧЕЙ
              </p>
            </div>
            <div className="rounded-[18px] px-[18px] py-4" style={{ background: "rgba(255,210,63,.12)" }}>
              <p className="ab-display text-2xl font-extrabold" style={{ color: "var(--ab-sun)" }}>
                {profile.wins}
              </p>
              <p className="text-[10px] font-extrabold tracking-[0.12em]" style={{ color: "var(--ab-ink-45)" }}>
                ПОБЕД
              </p>
            </div>
            <div className="rounded-[18px] px-[18px] py-4" style={{ background: "rgba(111,248,201,.12)" }}>
              <p className="ab-display text-2xl font-extrabold" style={{ color: "var(--ab-mint)" }}>
                {winPercent}%
              </p>
              <p className="text-[10px] font-extrabold tracking-[0.12em]" style={{ color: "var(--ab-ink-45)" }}>
                ВИНРЕЙТ
              </p>
            </div>
            <div className="rounded-[18px] px-[18px] py-4" style={{ background: "rgba(255,47,126,.12)" }}>
              <p className="ab-display text-2xl font-extrabold" style={{ color: "var(--ab-pink)" }}>
                {profile.dislikesReceived}
              </p>
              <p className="text-[10px] font-extrabold tracking-[0.12em]" style={{ color: "var(--ab-ink-45)" }}>
                МИНУСОВ
              </p>
            </div>
          </div>

          {isOwnProfile && (
            <div className="flex flex-col gap-2">
              <CursorStylePicker />
              <div className="flex justify-center">
                <VersionBadge />
              </div>
            </div>
          )}
        </div>

        <div className="flex flex-col gap-5">
          <div>
            <div className="flex items-center justify-between">
              <h2 className="ab-display text-[19px] font-extrabold" style={{ color: "var(--ab-ink)" }}>
                Последние работы
              </h2>
              <span className="text-sm font-semibold" style={{ color: "var(--ab-ink-45)" }}>
                0 всего
              </span>
            </div>
            <div className="mt-3.5 grid grid-cols-3 gap-3 md:grid-cols-4 md:gap-3.5">
              {Array.from({ length: 4 }).map((_, i) => (
                <div
                  key={i}
                  className={`flex h-24 items-center justify-center rounded-[18px] md:aspect-square md:h-auto ${i === 3 ? "hidden md:flex" : ""}`}
                  style={{ border: "2px dashed var(--ab-line-dashed)" }}
                >
                  {i === 0 && (
                    <span
                      className="px-2 text-center text-[11px] font-bold uppercase tracking-[0.08em]"
                      style={{ color: "var(--ab-ink-30)" }}
                    >
                      Работ пока нет
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between">
              <h2 className="ab-display text-[19px] font-extrabold" style={{ color: "var(--ab-ink)" }}>
                Достижения
              </h2>
              <span className="text-sm font-semibold" style={{ color: "var(--ab-mint)" }}>
                {unlockedCount} из {achievements.length} открыто
              </span>
            </div>
            <div className="mt-3.5 grid grid-cols-2 gap-3 md:grid-cols-4">
              {featured.map((a) => {
                const Icon = ICONS[a.icon];
                const tone = a.unlocked ? ICON_TONE[a.icon] : { bg: "rgba(255,255,255,.08)", color: "var(--ab-ink-30)" };
                return (
                  <div
                    key={a.id}
                    title={a.description}
                    className="flex items-center gap-2.5 rounded-[16px] px-3.5 py-3"
                    style={
                      a.unlocked
                        ? { background: `${tone.bg}22`, border: `2px solid ${tone.bg}` }
                        : { background: "rgba(255,255,255,.03)", border: "2px solid rgba(255,255,255,.08)" }
                    }
                  >
                    <div
                      className="flex h-[34px] w-[34px] shrink-0 items-center justify-center rounded-[12px]"
                      style={{ background: tone.bg, color: tone.color }}
                    >
                      <Icon width={16} height={16} />
                    </div>
                    <span className="text-xs font-extrabold leading-[1.25]" style={{ color: "var(--ab-ink)" }}>
                      {a.label}
                    </span>
                  </div>
                );
              })}
              <div
                className="flex flex-col items-center justify-center gap-1.5 rounded-[16px] px-3.5 py-3"
                style={{ border: "2px dashed var(--ab-line-dashed)" }}
              >
                <div className="h-[34px] w-[34px] rounded-[12px]" style={{ border: "2px dashed var(--ab-line-dashed)" }} />
                <span className="text-center text-xs font-bold" style={{ color: "var(--ab-ink-30)" }}>
                  Ещё {lockedRestCount} закрыто
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
};
