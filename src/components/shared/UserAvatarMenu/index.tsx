"use client";

import Link from "next/link";
import { Avatar } from "@/components/shared/Avatar";
import { playerColorForId } from "@/lib/playerColors";
import { useUserAvatarMenu } from "./hooks/useUserAvatarMenu";

export const UserAvatarMenu = () => {
  const { user, open, setOpen, handleLogout } = useUserAvatarMenu();

  if (!user) return null;
  const color = playerColorForId(user.id);

  return (
    <div className="flex items-center gap-2.5">
      <span
        className="ab-mono rounded-full px-3 py-[7px] text-xs font-bold"
        style={{ background: "rgba(255,210,63,.16)", color: "var(--ab-sun)" }}
      >
        {user.exp} XP
      </span>

      <div className="relative">
        <button onClick={() => setOpen((v) => !v)} title={user.nickname} className="block">
          <Avatar nickname={user.nickname} avatarUrl={user.avatarUrl} size={34} color={color} />
        </button>

        {open && (
          <div
            className="absolute right-0 top-11 z-30 flex w-52 flex-col gap-1 rounded-[16px] p-2"
            style={{ background: "var(--ab-surface-solid)", border: "2px solid var(--ab-line-soft)" }}
          >
            <div className="flex items-center gap-2 px-2 py-1.5">
              <Avatar nickname={user.nickname} avatarUrl={user.avatarUrl} size={32} color={color} />
              <span className="truncate text-sm font-extrabold" style={{ color: "var(--ab-ink)" }}>
                {user.nickname}
              </span>
            </div>
            <Link
              href={`/profile/${user.id}`}
              onClick={() => setOpen(false)}
              className="ab-row-hover rounded-[12px] px-3 py-2 text-sm font-bold"
              style={{ color: "var(--ab-ink)" }}
            >
              Профиль
            </Link>
            <button
              onClick={handleLogout}
              className="ab-row-hover rounded-[12px] px-3 py-2 text-left text-sm font-bold"
              style={{ color: "var(--ab-ink)" }}
            >
              Выйти
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
