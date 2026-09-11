import { createServiceClient } from "@/lib/supabase/service";
import type { RoomStatusDb } from "@/lib/db/types";
import { levelForExp } from "@/lib/game/constants";

export async function fetchRandomActivePrompt() {
  const supabase = createServiceClient();
  const { data, error } = await supabase
    .from("drawing_prompts")
    .select("id, text")
    .eq("is_active", true);
  if (error) throw error;
  if (!data || data.length === 0) {
    throw new Error("No active drawing prompts configured");
  }
  return data[Math.floor(Math.random() * data.length)];
}

export async function insertRoom(promptId: string) {
  const supabase = createServiceClient();
  const { data, error } = await supabase
    .from("rooms")
    .insert({ status: "waiting", prompt_id: promptId })
    .select("id")
    .single();
  if (error) throw error;
  return data.id as string;
}

export async function insertRoomPlayers(roomId: string, userIds: string[]) {
  const supabase = createServiceClient();
  const { error } = await supabase
    .from("room_players")
    .insert(userIds.map((user_id) => ({ room_id: roomId, user_id })));
  if (error) throw error;
}

export async function updateRoomStatus(
  roomId: string,
  status: RoomStatusDb,
  extra: Record<string, string | null> = {},
) {
  const supabase = createServiceClient();
  const { error } = await supabase
    .from("rooms")
    .update({ status, ...extra })
    .eq("id", roomId);
  if (error) throw error;
}

export async function insertSubmission(
  roomId: string,
  userId: string,
  imageUrl: string | null,
  isCanvas: boolean,
) {
  const supabase = createServiceClient();
  const { data, error } = await supabase
    .from("submissions")
    .upsert(
      { room_id: roomId, user_id: userId, image_url: imageUrl, is_canvas: isCanvas },
      { onConflict: "room_id,user_id" },
    )
    .select("id")
    .single();
  if (error) throw error;
  return data.id as string;
}

export async function insertVote(
  roomId: string,
  voterId: string,
  targetSubmissionId: string,
  value: 1 | -1,
) {
  const supabase = createServiceClient();
  const { error } = await supabase.from("votes").upsert(
    { room_id: roomId, voter_id: voterId, target_submission_id: targetSubmissionId, value },
    { onConflict: "room_id,voter_id,target_submission_id" },
  );
  if (error) throw error;
}

export async function recordMatchResultForUser(
  userId: string,
  expDelta: number,
  isWinner: boolean,
  dislikesReceived: number,
) {
  const supabase = createServiceClient();
  const { data, error } = await supabase
    .from("users")
    .select("exp, matches_played, wins, dislikes_received")
    .eq("id", userId)
    .single();
  if (error) throw error;
  const nextExp = (data?.exp ?? 0) + expDelta;
  const { error: updateError } = await supabase
    .from("users")
    .update({
      exp: nextExp,
      level: levelForExp(nextExp),
      matches_played: (data?.matches_played ?? 0) + 1,
      wins: (data?.wins ?? 0) + (isWinner ? 1 : 0),
      dislikes_received: (data?.dislikes_received ?? 0) + dislikesReceived,
    })
    .eq("id", userId);
  if (updateError) throw updateError;
  return nextExp;
}

export async function insertChatMessage(roomId: string, userId: string, text: string) {
  const supabase = createServiceClient();
  const { data, error } = await supabase
    .from("chat_messages")
    .insert({ room_id: roomId, user_id: userId, text })
    .select("id, created_at")
    .single();
  if (error) throw error;
  return data;
}

export async function fetchRecentChatMessages(roomId: string, limit = 50) {
  const supabase = createServiceClient();
  const { data, error } = await supabase
    .from("chat_messages")
    .select("id, room_id, user_id, text, created_at")
    .eq("room_id", roomId)
    .order("created_at", { ascending: true })
    .limit(limit);
  if (error) throw error;
  return data ?? [];
}

/**
 * Комната закончила жизненный цикл (результат опубликован в Telegram, картинки
 * там уже сохранены) — вычищаем всё сопутствующее, чтобы не копить в базе.
 * Порядок важен из-за внешних ключей: votes -> submissions -> room_players ->
 * match_results -> rooms. Пользователей (users) не трогаем.
 */
export async function deleteRoomData(roomId: string) {
  const supabase = createServiceClient();
  await supabase.from("votes").delete().eq("room_id", roomId);
  await supabase.from("chat_messages").delete().eq("room_id", roomId);
  await supabase.from("submissions").delete().eq("room_id", roomId);
  await supabase.from("room_players").delete().eq("room_id", roomId);
  await supabase.from("match_results").delete().eq("room_id", roomId);
  await supabase.from("rooms").delete().eq("id", roomId);
}

export async function deleteSubmissionFiles(paths: string[]) {
  if (paths.length === 0) return;
  const supabase = createServiceClient();
  await supabase.storage.from("submissions").remove(paths);
}

export async function fetchUsersByIds(userIds: string[]) {
  const supabase = createServiceClient();
  const { data, error } = await supabase
    .from("users")
    .select("id, nickname, avatar_url")
    .in("id", userIds);
  if (error) throw error;
  return data ?? [];
}

export async function fetchUserProfileById(userId: string) {
  const supabase = createServiceClient();
  const { data, error } = await supabase
    .from("users")
    .select("id, nickname, avatar_url, exp, level, matches_played, wins, dislikes_received, created_at")
    .eq("id", userId)
    .single();
  if (error) {
    console.error("fetchUserProfileById failed", error);
    return null;
  }
  return data;
}

export async function fetchLeaderboard(limit = 50) {
  const supabase = createServiceClient();
  const { data, error } = await supabase
    .from("users")
    .select("id, nickname, avatar_url, exp, level, matches_played, wins")
    .order("exp", { ascending: false })
    .limit(limit);
  if (error) throw error;
  return data ?? [];
}
