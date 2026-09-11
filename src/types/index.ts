export type RoomStatus = "waiting" | "drawing" | "voting" | "finished";

export interface PlayerInfo {
  id: string;
  nickname: string;
  avatarUrl: string | null;
}

export interface RoomSubmissionPublic {
  userId: string;
  nickname: string;
  avatarUrl: string | null;
  imageUrl: string | null;
}

export interface RoomResultEntry {
  userId: string;
  nickname: string;
  avatarUrl: string | null;
  imageUrl: string | null;
  score: number;
  expAwarded: number;
  isWinner: boolean;
}

export interface RoomStateSnapshot {
  roomId: string;
  status: RoomStatus;
  players: PlayerInfo[];
  promptText: string | null;
  drawingEndsAt: string | null;
  votingEndsAt: string | null;
}

export interface ChatMessage {
  id: string;
  roomId: string;
  userId: string;
  nickname: string;
  text: string;
  ts: string;
}
