import type {
  ChatMessage,
  RoomStateSnapshot,
  RoomResultEntry,
  RoomSubmissionPublic,
} from "@/types";

export type SubmitAck = { ok: true } | { ok: false; reason: string };

/** Client -> server events. */
export interface ClientToServerEvents {
  "queue:join": () => void;
  "queue:leave": () => void;
  "room:join": (payload: { roomId: string }) => void;
  "drawing:submit": (
    payload: { roomId: string; imageUrl: string; isCanvas: boolean },
    ack?: (result: SubmitAck) => void,
  ) => void;
  "voting:vote": (payload: {
    roomId: string;
    targetUserId: string;
    value: 1 | -1;
  }) => void;
  "voting:done": (payload: { roomId: string }) => void;
  "chat:send": (payload: { roomId: string; text: string }) => void;
  "drawing:activity": (payload: { roomId: string }) => void;
  "lobby:check_active_room": () => void;
  "room:leave": (payload: { roomId: string }) => void;
}

/** Server -> client events. */
export interface ServerToClientEvents {
  "queue:status": (payload: { queued: number; needed: number }) => void;
  "room:matched": (payload: { roomId: string }) => void;
  "room:state": (payload: RoomStateSnapshot) => void;
  "phase:drawing": (payload: { drawingEndsAt: string }) => void;
  "player:submitted": (payload: {
    userId: string;
    submittedCount: number;
    totalCount: number;
  }) => void;
  "phase:voting": (payload: {
    votingEndsAt: string;
    submissions: RoomSubmissionPublic[];
  }) => void;
  "player:voted": (payload: {
    voterId: string;
    votedCount: number;
    totalCount: number;
  }) => void;
  "phase:finished": (payload: {
    results: RoomResultEntry[];
    collagePosted: boolean;
  }) => void;
  "chat:message": (payload: ChatMessage) => void;
  "player:activity": (payload: { userId: string; active: boolean }) => void;
  "lobby:active_room": (payload: { roomId: string | null }) => void;
  error: (payload: { code: string; message: string }) => void;
}

// Not used in v1 (single-process design, no server-to-server events).
export type InterServerEvents = Record<string, never>;

export interface SocketData {
  userId: string;
}
