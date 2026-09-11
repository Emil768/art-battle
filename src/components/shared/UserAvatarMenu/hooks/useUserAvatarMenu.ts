"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import type { CurrentUserInfo } from "../types";

export const useUserAvatarMenu = () => {
  const router = useRouter();
  const [user, setUser] = useState<CurrentUserInfo | null>(null);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(async ({ data }) => {
      if (!data.user) return;
      const { data: row, error } = await supabase
        .from("users")
        .select("id, nickname, avatar_url, exp")
        .eq("id", data.user.id)
        .single();
      if (error) console.error("useUserAvatarMenu: failed to load user row", error);
      setUser({
        id: data.user.id,
        nickname: row?.nickname ?? "Игрок",
        avatarUrl: row?.avatar_url ?? null,
        exp: row?.exp ?? 0,
      });
    });
  }, []);

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
  };

  return { user, open, setOpen, handleLogout };
};
