"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { PlayIcon, TrophyIcon, UserIcon } from "@/components/icons";

const TABS = [
  { href: "/lobby", label: "Играть", Icon: PlayIcon },
  { href: "/leaderboard", label: "Рейтинг", Icon: TrophyIcon },
  { href: "/profile", label: "Профиль", Icon: UserIcon },
] as const;

export const MobileTabBar = () => {
  const pathname = usePathname();

  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-30 grid grid-cols-3 pt-2.5 md:hidden"
      style={{
        height: 76,
        borderTop: "2px solid rgba(255,255,255,.1)",
        background: "var(--ab-bg)",
        paddingBottom: "env(safe-area-inset-bottom)",
      }}
    >
      {TABS.map(({ href, label, Icon }) => {
        const active = pathname === href || pathname.startsWith(`${href}/`);
        const color = active ? "var(--ab-mint)" : "rgba(255,246,238,.58)";
        return (
          <Link key={href} href={href} className="flex flex-col items-center gap-1.5" style={{ color }}>
            <Icon width={22} height={22} />
            <span className="text-[10px] font-extrabold tracking-[0.06em]">{label}</span>
          </Link>
        );
      })}
    </nav>
  );
};
