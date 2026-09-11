import { createServiceClient } from "@/lib/supabase/service";
import { SUBMISSION_SIGNED_URL_TTL_SECONDS } from "@/lib/game/constants";

export const SUBMISSIONS_BUCKET = "submissions";

export function submissionPath(roomId: string, userId: string) {
  return `${roomId}/${userId}.png`;
}

export async function createSubmissionUploadUrl(roomId: string, userId: string) {
  const supabase = createServiceClient();
  const path = submissionPath(roomId, userId);
  const { data, error } = await supabase.storage
    .from(SUBMISSIONS_BUCKET)
    .createSignedUploadUrl(path, { upsert: true });
  if (error) throw error;
  return { path, signedUrl: data.signedUrl, token: data.token };
}

export async function createSubmissionReadUrl(path: string) {
  const supabase = createServiceClient();
  const { data, error } = await supabase.storage
    .from(SUBMISSIONS_BUCKET)
    .createSignedUrl(path, SUBMISSION_SIGNED_URL_TTL_SECONDS);
  if (error) throw error;
  return data.signedUrl;
}

export async function downloadSubmissionBuffer(path: string): Promise<Buffer | null> {
  const supabase = createServiceClient();
  const { data, error } = await supabase.storage.from(SUBMISSIONS_BUCKET).download(path);
  if (error || !data) return null;
  const arrayBuffer = await data.arrayBuffer();
  return Buffer.from(arrayBuffer);
}
