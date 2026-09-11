"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { NAV_ITEMS } from "./constants";

export const HeaderNav = () => {
  const pathname = usePathname();

  return (
    <nav className="hidden items-center gap-2 md:flex">
      {NAV_ITEMS.map((item) => {
        const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
        return (
          <Link
            key={item.href}
            href={item.href}
            className="ab-sticker px-[18px] py-[9px] text-xs"
            style={
              active
                ? { background: "var(--ab-mint)", color: "var(--ab-mint-ink)" }
                : { border: "2px solid var(--ab-line-soft)", color: "var(--ab-ink-55)" }
            }
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
};
