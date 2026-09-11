import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/service";

export const GET = async (request: Request) => {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");

  // За reverse-proxy (Timeweb и т.п.) request.url отражает внутренний адрес
  // контейнера (localhost:PORT), а не публичный домен — берём origin из
  // X-Forwarded-* заголовков, которые прокси передаёт специально для этого.
  const forwardedHost = request.headers.get("x-forwarded-host");
  const forwardedProto = request.headers.get("x-forwarded-proto") ?? url.protocol.replace(":", "");
  const origin = forwardedHost ? `${forwardedProto}://${forwardedHost}` : url.origin;

  if (code) {
    const supabase = await createClient();
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error && data.user) {
      // На identities[].identity_data не всегда можно положиться сразу после
      // exchangeCodeForSession — используем ещё и user_metadata (там же данные
      // Google, но всегда заполнены), и учитываем, что Google отдаёт фото
      // как "picture", а не "avatar_url".
      const identity = data.user.identities?.find((i) => i.provider === "google");
      const idData = identity?.identity_data as Record<string, unknown> | undefined;
      const meta = data.user.user_metadata as Record<string, unknown> | undefined;
      const nickname =
        (idData?.full_name as string | undefined) ??
        (idData?.name as string | undefined) ??
        (meta?.full_name as string | undefined) ??
        (meta?.name as string | undefined) ??
        data.user.email?.split("@")[0] ??
        "Игрок";
      const avatarUrl =
        (idData?.avatar_url as string | undefined) ??
        (idData?.picture as string | undefined) ??
        (meta?.avatar_url as string | undefined) ??
        (meta?.picture as string | undefined);

      const service = createServiceClient();
      await service.from("users").upsert(
        {
          id: data.user.id,
          google_id: identity?.id ?? null,
          nickname,
          avatar_url: avatarUrl ?? null,
        },
        { onConflict: "id" },
      );

      return NextResponse.redirect(`${origin}/lobby`);
    }
  }

  return NextResponse.redirect(`${origin}/login`);
};
