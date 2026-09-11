"use client";

import { useState } from "react";
import type { AvatarProps } from "./types";

export const Avatar = ({
  nickname,
  avatarUrl,
  size = 40,
  color = "var(--ab-mint)",
  borderWidth = 2,
}: AvatarProps) => {
  // Храним, какой именно url не загрузился — если avatarUrl сменится (другой
  // игрок, перезаход), сравнение само даст false без лишнего эффекта.
  const [failedUrl, setFailedUrl] = useState<string | null>(null);
  const failed = failedUrl !== null && failedUrl === avatarUrl;

  const style = {
    width: size,
    height: size,
    border: `${borderWidth}px solid ${color}`,
  };

  if (avatarUrl && !failed) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={avatarUrl}
        alt={nickname}
        width={size}
        height={size}
        className="rounded-full object-cover"
        style={style}
        onError={() => setFailedUrl(avatarUrl)}
      />
    );
  }

  return (
    <div
      className="flex shrink-0 items-center justify-center rounded-full font-extrabold"
      style={{
        ...style,
        background: "var(--ab-surface-solid)",
        color: "var(--ab-ink)",
        fontFamily: "var(--font-sans)",
        fontSize: size * 0.4,
      }}
    >
      {nickname.slice(0, 1).toUpperCase()}
    </div>
  );
};
