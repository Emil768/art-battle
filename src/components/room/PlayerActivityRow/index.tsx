import Link from "next/link";
import { Avatar } from "@/components/shared/Avatar";
import { CheckIcon } from "@/components/icons";
import { playerColorByIndex } from "@/lib/playerColors";
import type { PlayerActivityRowProps } from "./types";

export const PlayerActivityRow = ({ players, submittedPlayerIds }: PlayerActivityRowProps) => {
  return (
    <div className="flex items-center gap-1.5">
      {players.map((p, i) => {
        const done = submittedPlayerIds?.has(p.id);
        return (
          <Link
            key={p.id}
            href={`/profile/${p.id}`}
            target="_blank"
            rel="noopener noreferrer"
            title={p.nickname}
            className="relative rounded-full"
          >
            <Avatar nickname={p.nickname} avatarUrl={p.avatarUrl} size={30} color={playerColorByIndex(i)} />
            {done && (
              <span
                className="absolute -bottom-0.5 -right-0.5 flex h-3.5 w-3.5 items-center justify-center rounded-full"
                style={{ background: "var(--ab-mint)", border: "2px solid var(--ab-bg)" }}
              >
                <CheckIcon width={9} height={9} stroke="var(--ab-mint-ink)" strokeWidth={3} />
              </span>
            )}
          </Link>
        );
      })}
    </div>
  );
};
