import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { canUploadSubmission } from "@/lib/game/roomState";
import { createSubmissionUploadUrl } from "@/lib/supabase/storage";

export const POST = async (request: Request) => {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const roomId = body?.roomId as string | undefined;
  if (!roomId) {
    return NextResponse.json({ error: "roomId required" }, { status: 400 });
  }

  const check = canUploadSubmission(user.id, roomId);
  if (!check.ok) {
    console.error("[uploads/sign] rejected", { userId: user.id, roomId, reason: check.reason });
    return NextResponse.json({ error: "not allowed", reason: check.reason }, { status: 403 });
  }

  const { path, signedUrl, token } = await createSubmissionUploadUrl(roomId, user.id);
  return NextResponse.json({ path, signedUrl, token });
};
