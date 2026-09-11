import type { StatusBannerProps } from "./types";

export const StatusBanner = ({ variant, message }: StatusBannerProps) => {
  const isError = variant === "error";
  const color = isError ? "var(--ab-pink)" : "var(--ab-mint)";

  return (
    <div
      className="ab-fade-in flex items-center gap-2.5 rounded-full px-4 py-2.5 text-sm font-bold"
      style={{ background: "var(--ab-bg)", border: `2px solid ${color}`, color }}
    >
      <span className="text-base leading-none">{isError ? "!" : "✓"}</span>
      {message}
    </div>
  );
};
