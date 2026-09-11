export const ROOM_SIZE = Number(process.env.ROOM_SIZE ?? 5);
export const DRAWING_SECONDS = Number(process.env.DRAWING_SECONDS ?? 600);
export const VOTING_SECONDS = Number(process.env.VOTING_SECONDS ?? 120);
export const WIN_XP_POOL = Number(process.env.WIN_XP_POOL ?? 100);
export const PARTICIPATION_XP = Number(process.env.PARTICIPATION_XP ?? 10);

export const READY_DELAY_MS = 3000;
export const CHAT_MESSAGE_MAX_LENGTH = 300;
export const SUBMISSION_SIGNED_URL_TTL_SECONDS = 60 * 30;
export const ACTIVITY_TIMEOUT_MS = 2000;

export function levelForExp(exp: number): number {
  return Math.floor(exp / 100) + 1;
}
