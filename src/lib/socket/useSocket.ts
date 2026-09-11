"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { getSocket, type AppClientSocket } from "@/lib/socket/client";

export const useAppSocket = () => {
  const [socket, setSocket] = useState<AppClientSocket | null>(null);

  useEffect(() => {
    let cancelled = false;
    const supabase = createClient();

    supabase.auth.getSession().then(({ data }) => {
      const token = data.session?.access_token;
      if (!token || cancelled) return;
      setSocket(getSocket(token));
    });

    return () => {
      cancelled = true;
    };
  }, []);

  return socket;
};
