"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

export const useLogin = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);

  const handleGoogleLogin = async () => {
    setLoading(true);
    setError(false);
    const supabase = createClient();
    const { error: authError } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    });
    if (authError) {
      setError(true);
      setLoading(false);
    }
  };

  return { handleGoogleLogin, loading, error };
};
