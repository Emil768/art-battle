import Link from "next/link";
import { HeaderNav } from "@/components/shared/HeaderNav";
import { UserAvatarMenu } from "@/components/shared/UserAvatarMenu";
import type { GameHeaderProps } from "./types";

export const GameHeader = ({ center, right }: GameHeaderProps) => {
  return (
    <header
      className="sticky top-0 z-20 flex h-14 shrink-0 items-center justify-between px-[18px] md:h-[72px] md:px-8"
      style={{
        borderBottom: "2px solid var(--ab-line)",
        background: "var(--ab-bg)",
        paddingTop: "env(safe-area-inset-top)",
      }}
    >
      <Link href="/lobby" className="flex shrink-0 items-center gap-2 md:gap-2.5">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/logo-mark.png" alt="" className="h-[26px] w-[26px] md:h-[30px] md:w-[30px]" />
        <span
          className="ab-display text-[13px] font-extrabold tracking-[-0.01em] md:text-[15px]"
          style={{ color: "var(--ab-ink)" }}
        >
          ART BATTLE
        </span>
      </Link>

      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
        {center ?? <HeaderNav />}
      </div>

      <div className="flex shrink-0 items-center gap-3">{right ?? <UserAvatarMenu />}</div>
    </header>
  );
};
