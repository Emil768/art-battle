import type { Server, Socket } from "socket.io";
import type {
  ClientToServerEvents,
  ServerToClientEvents,
  InterServerEvents,
  SocketData,
} from "@/lib/socket/events";
import type { ChatMessage, PlayerInfo, RoomResultEntry, RoomStateSnapshot } from "@/types";
import {
  ACTIVITY_TIMEOUT_MS,
  CHAT_MESSAGE_MAX_LENGTH,
  DRAWING_SECONDS,
  READY_DELAY_MS,
  VOTING_SECONDS,
} from "@/lib/game/constants";
import { computeResults } from "@/lib/game/scoring";
import {
  deleteRoomData,
  deleteSubmissionFiles,
  fetchRandomActivePrompt,
  fetchRecentChatMessages,
  fetchUsersByIds,
  insertChatMessage,
  insertRoom,
  insertRoomPlayers,
  insertSubmission,
  insertVote,
  recordMatchResultForUser,
  updateRoomStatus,
} from "@/lib/db/queries";
import { createSubmissionReadUrl } from "@/lib/supabase/storage";
import { generateCollage } from "@/lib/telegram/collage";
import { postCollageToTelegram } from "@/lib/telegram/postToTelegram";

export type AppServer = Server<
  ClientToServerEvents,
  ServerToClientEvents,
  InterServerEvents,
  SocketData
>;
export type AppSocket = Socket<
  ClientToServerEvents,
  ServerToClientEvents,
  InterServerEvents,
  SocketData
>;

interface SubmissionEntry {
  submissionId: string;
  imageUrl: string | null;
  isCanvas: boolean;
}

class Room {
  id: string;
  status: RoomStateSnapshot["status"] = "waiting";
  players: PlayerInfo[];
  promptText: string;
  drawingEndsAt: Date | null = null;
  votingEndsAt: Date | null = null;
  submissions = new Map<string, SubmissionEntry>();
  votesByVoter = new Map<string, Map<string, 1 | -1>>();
  completedVoters = new Set<string>();
  activeSocketId = new Map<string, string>();
  votingReadUrls = new Map<string, string | null>();
  lastResults: RoomResultEntry[] | null = null;
  activityTimers = new Map<string, NodeJS.Timeout>();
  private timer: NodeJS.Timeout | null = null;

  clearActivityTimers() {
    for (const timer of this.activityTimers.values()) clearTimeout(timer);
    this.activityTimers.clear();
  }

  constructor(id: string, players: PlayerInfo[], promptText: string) {
    this.id = id;
    this.players = players;
    this.promptText = promptText;
  }

  get playerIds() {
    return this.players.map((p) => p.id);
  }

  clearTimer() {
    if (this.timer) {
      clearTimeout(this.timer);
      this.timer = null;
    }
  }

  setTimer(fn: () => void, ms: number) {
    this.clearTimer();
    this.timer = setTimeout(fn, ms);
  }

  snapshot(): RoomStateSnapshot {
    return {
      roomId: this.id,
      status: this.status,
      players: this.players,
      promptText: this.promptText,
      drawingEndsAt: this.drawingEndsAt ? this.drawingEndsAt.toISOString() : null,
      votingEndsAt: this.votingEndsAt ? this.votingEndsAt.toISOString() : null,
    };
  }
}

// Next.js в dev-режиме компилирует API-роуты через свой бандлер, а server.ts
// импортирует этот файл напрямую через tsx — это два разных загрузчика
// модулей с двумя разными кэшами, так что обычные module-level переменные
// дают ДВЕ независимые Map (сокеты видят комнату, роут /api/uploads/sign —
// нет). Держим карты на globalThis, чтобы оба загрузчика делили один объект.
const globalForRooms = globalThis as unknown as {
  __abRooms?: Map<string, Room>;
  __abUserRoom?: Map<string, string>;
};
const rooms = globalForRooms.__abRooms ?? (globalForRooms.__abRooms = new Map<string, Room>());
const userRoom =
  globalForRooms.__abUserRoom ?? (globalForRooms.__abUserRoom = new Map<string, string>());

function getSocketByUserId(io: AppServer, room: Room, userId: string): AppSocket | undefined {
  const socketId = room.activeSocketId.get(userId);
  if (!socketId) return undefined;
  return io.sockets.sockets.get(socketId) as AppSocket | undefined;
}

function attachSocketToRoom(socket: AppSocket, room: Room) {
  socket.join(room.id);
  room.activeSocketId.set(socket.data.userId, socket.id);
  // "Активная комната" в лобби — только для незавершённого матча. Комната
  // ещё лежит в памяти ~60с после финиша (см. finishVotingPhase), и если не
  // проверять статус, повторный room:join (переподключение, обновление
  // страницы результатов) снова помечал бы для игрока уже сыгранный матч
  // как «активный», и кнопка «Вернуться в комнату» в лобби не пропадала бы.
  if (room.status !== "finished") {
    userRoom.set(socket.data.userId, room.id);
  }
}

export async function createRoom(
  io: AppServer,
  matchedPlayers: { userId: string; socketId: string }[],
) {
  const prompt = await fetchRandomActivePrompt();
  const userRows = await fetchUsersByIds(matchedPlayers.map((p) => p.userId));
  const players: PlayerInfo[] = matchedPlayers.map(({ userId }) => {
    const row = userRows.find((u) => u.id === userId);
    return {
      id: userId,
      nickname: row?.nickname ?? "Игрок",
      avatarUrl: row?.avatar_url ?? null,
    };
  });

  const roomId = await insertRoom(prompt.id);
  await insertRoomPlayers(
    roomId,
    players.map((p) => p.id),
  );

  const room = new Room(roomId, players, prompt.text);
  rooms.set(roomId, room);

  for (const { socketId } of matchedPlayers) {
    const socket = io.sockets.sockets.get(socketId) as AppSocket | undefined;
    if (socket) attachSocketToRoom(socket, room);
  }

  io.to(roomId).emit("room:matched", { roomId });
  io.to(roomId).emit("room:state", room.snapshot());

  room.setTimer(() => startDrawingPhase(io, roomId), READY_DELAY_MS);
}

function startDrawingPhase(io: AppServer, roomId: string) {
  const room = rooms.get(roomId);
  if (!room) return;

  room.status = "drawing";
  room.drawingEndsAt = new Date(Date.now() + DRAWING_SECONDS * 1000);

  updateRoomStatus(roomId, "drawing", {
    started_at: new Date().toISOString(),
    drawing_ends_at: room.drawingEndsAt.toISOString(),
  }).catch((err) => console.error("[room] failed to persist drawing phase", err));

  io.to(roomId).emit("phase:drawing", { drawingEndsAt: room.drawingEndsAt.toISOString() });
  io.to(roomId).emit("room:state", room.snapshot());

  room.setTimer(() => finishDrawingPhase(io, roomId), DRAWING_SECONDS * 1000);
}

export async function handleSubmit(
  io: AppServer,
  socket: AppSocket,
  roomId: string,
  imageUrl: string,
  isCanvas: boolean,
) {
  const room = rooms.get(roomId);
  const userId = socket.data.userId;
  if (!room || room.status !== "drawing" || !room.playerIds.includes(userId)) return;
  if (room.submissions.has(userId)) return;

  try {
    const submissionId = await insertSubmission(roomId, userId, imageUrl, isCanvas);
    room.submissions.set(userId, { submissionId, imageUrl, isCanvas });
  } catch (err) {
    console.error("[room] failed to persist submission", err);
    socket.emit("error", { code: "submit_failed", message: "Не удалось сохранить рисунок" });
    return;
  }

  io.to(roomId).emit("player:submitted", {
    userId,
    submittedCount: room.submissions.size,
    totalCount: room.playerIds.length,
  });

  if (room.submissions.size === room.playerIds.length) {
    finishDrawingPhase(io, roomId);
  }
}

export function handleDrawingActivity(io: AppServer, socket: AppSocket, roomId: string) {
  const room = rooms.get(roomId);
  const userId = socket.data.userId;
  if (!room || room.status !== "drawing" || !room.playerIds.includes(userId)) return;

  const existing = room.activityTimers.get(userId);
  if (existing) {
    clearTimeout(existing);
  } else {
    io.to(roomId).emit("player:activity", { userId, active: true });
  }

  room.activityTimers.set(
    userId,
    setTimeout(() => {
      room.activityTimers.delete(userId);
      io.to(roomId).emit("player:activity", { userId, active: false });
    }, ACTIVITY_TIMEOUT_MS),
  );
}

function finishDrawingPhase(io: AppServer, roomId: string) {
  const room = rooms.get(roomId);
  if (!room || room.status !== "drawing") return;
  room.clearTimer();
  room.clearActivityTimers();

  const missing = room.playerIds.filter((id) => !room.submissions.has(id));
  const persistMissing = Promise.all(
    missing.map(async (userId) => {
      try {
        const submissionId = await insertSubmission(roomId, userId, null, false);
        room.submissions.set(userId, { submissionId, imageUrl: null, isCanvas: false });
      } catch (err) {
        console.error("[room] failed to persist auto-submission", err);
      }
    }),
  );

  persistMissing
    .then(() => startVotingPhase(io, roomId))
    .catch((err) => console.error("[room] failed transitioning to voting", err));
}

async function startVotingPhase(io: AppServer, roomId: string) {
  const room = rooms.get(roomId);
  if (!room) return;

  room.status = "voting";
  room.votingEndsAt = new Date(Date.now() + VOTING_SECONDS * 1000);

  updateRoomStatus(roomId, "voting", {
    voting_ends_at: room.votingEndsAt.toISOString(),
  }).catch((err) => console.error("[room] failed to persist voting phase", err));

  const readUrls = new Map<string, string | null>();
  for (const [userId, entry] of room.submissions) {
    if (!entry.imageUrl) {
      readUrls.set(userId, null);
      continue;
    }
    try {
      readUrls.set(userId, await createSubmissionReadUrl(entry.imageUrl));
    } catch (err) {
      console.error("[room] failed to sign submission url", err);
      readUrls.set(userId, null);
    }
  }
  room.votingReadUrls = readUrls;

  io.to(roomId).emit("room:state", room.snapshot());

  console.log("[room] voting phase started", {
    roomId,
    playerIds: room.playerIds,
    submissionIds: Array.from(room.submissions.keys()),
  });

  for (const player of room.players) {
    const socket = getSocketByUserId(io, room, player.id);
    if (!socket) continue;
    const submissions = room.players
      .filter((p) => p.id !== player.id)
      .map((p) => ({
        userId: p.id,
        nickname: p.nickname,
        avatarUrl: p.avatarUrl,
        imageUrl: readUrls.get(p.id) ?? null,
      }));
    socket.emit("phase:voting", {
      votingEndsAt: room.votingEndsAt!.toISOString(),
      submissions,
    });
  }

  room.setTimer(() => finishVotingPhase(io, roomId), VOTING_SECONDS * 1000);
}

export async function handleVote(
  io: AppServer,
  socket: AppSocket,
  roomId: string,
  targetUserId: string,
  value: 1 | -1,
) {
  const room = rooms.get(roomId);
  const voterId = socket.data.userId;
  if (!room || room.status !== "voting" || !room.playerIds.includes(voterId)) return;
  if (voterId === targetUserId) {
    socket.emit("error", { code: "self_vote", message: "Нельзя голосовать за свою работу" });
    return;
  }
  const target = room.submissions.get(targetUserId);
  if (!target) return;

  if (!room.votesByVoter.has(voterId)) room.votesByVoter.set(voterId, new Map());
  const voterMap = room.votesByVoter.get(voterId)!;
  voterMap.set(targetUserId, value);

  try {
    await insertVote(roomId, voterId, target.submissionId, value);
  } catch (err) {
    console.error("[room] failed to persist vote", err);
  }

  markVoterProgress(io, room, voterId);
}

export function handleVotingDone(io: AppServer, socket: AppSocket, roomId: string) {
  const room = rooms.get(roomId);
  const userId = socket.data.userId;
  if (!room || room.status !== "voting" || !room.playerIds.includes(userId)) return;
  markVoterProgress(io, room, userId, true);
}

function markVoterProgress(io: AppServer, room: Room, voterId: string, forceDone = false) {
  const voterMap = room.votesByVoter.get(voterId);
  const targetCount = room.playerIds.length - 1;
  const isDone = forceDone || (voterMap?.size ?? 0) >= targetCount;
  if (isDone) room.completedVoters.add(voterId);

  console.log("[room] voter progress", {
    roomId: room.id,
    voterId,
    forceDone,
    voterVotes: voterMap?.size ?? 0,
    targetCount,
    completedVoters: Array.from(room.completedVoters),
    playerIds: room.playerIds,
  });

  io.to(room.id).emit("player:voted", {
    voterId,
    votedCount: room.completedVoters.size,
    totalCount: room.playerIds.length,
  });

  if (room.completedVoters.size === room.playerIds.length) {
    finishVotingPhase(io, room.id);
  }
}

async function finishVotingPhase(io: AppServer, roomId: string) {
  const room = rooms.get(roomId);
  if (!room || room.status !== "voting") return;
  room.clearTimer();
  room.status = "finished";

  const votesByTarget = new Map<string, number[]>();
  for (const voterMap of room.votesByVoter.values()) {
    for (const [targetUserId, value] of voterMap) {
      if (!votesByTarget.has(targetUserId)) votesByTarget.set(targetUserId, []);
      votesByTarget.get(targetUserId)!.push(value);
    }
  }

  const { scores, winnerIds, expAwarded } = computeResults(room.playerIds, votesByTarget);

  await Promise.all(
    room.playerIds.map(async (userId) => {
      try {
        const dislikesReceived = Math.abs(Math.min(0, scores.get(userId) ?? 0));
        await recordMatchResultForUser(
          userId,
          expAwarded[userId] ?? 0,
          winnerIds.includes(userId),
          dislikesReceived,
        );
      } catch (err) {
        console.error("[room] failed to award exp", err);
      }
    }),
  );

  try {
    await updateRoomStatus(roomId, "finished");
  } catch (err) {
    console.error("[room] failed to persist finished status", err);
  }

  const results: RoomResultEntry[] = room.players.map((player) => ({
    userId: player.id,
    nickname: player.nickname,
    avatarUrl: player.avatarUrl,
    imageUrl: room.votingReadUrls.get(player.id) ?? null,
    score: scores.get(player.id) ?? 0,
    expAwarded: expAwarded[player.id] ?? 0,
    isWinner: winnerIds.includes(player.id),
  }));
  room.lastResults = results;

  io.to(roomId).emit("phase:finished", { results, collagePosted: false });
  io.to(roomId).emit("room:state", room.snapshot());

  finalizeRoom(roomId, room, results).catch((err) =>
    console.error("[room] finalize failed", err),
  );

  for (const userId of room.playerIds) userRoom.delete(userId);
  setTimeout(() => rooms.delete(roomId), 60_000);
}

// Постинг в Telegram отключён на этой итерации (договорились сделать его
// отдельным шагом позже) — результаты игроки и так видят на экране.
const TELEGRAM_POSTING_ENABLED = false;

/**
 * Постит коллаж в Telegram (если включено) и затем, независимо от результата
 * поста, чистит за собой базу и файлы раунда — картинки уже сохранены в самом
 * посте, держать их в Storage/БД дальше незачем.
 */
async function finalizeRoom(roomId: string, room: Room, results: RoomResultEntry[]) {
  try {
    if (TELEGRAM_POSTING_ENABLED) {
      const collageBuffer = await generateCollage({
        promptText: room.promptText,
        entries: results.map((r) => ({
          nickname: r.nickname,
          score: r.score,
          submissionStoragePath: room.submissions.get(r.userId)?.imageUrl ?? null,
        })),
      });
      await postCollageToTelegram(collageBuffer, "Art Battle — раунд завершён");
    }
  } catch (err) {
    console.error("[room] telegram post failed", err);
  } finally {
    const paths = Array.from(room.submissions.values())
      .map((s) => s.imageUrl)
      .filter((url): url is string => !!url);
    await deleteSubmissionFiles(paths).catch((err) =>
      console.error("[room] failed to delete submission files", err),
    );
    await deleteRoomData(roomId).catch((err) =>
      console.error("[room] failed to delete room data", err),
    );
  }
}

export async function handleRoomJoin(io: AppServer, socket: AppSocket, roomId: string) {
  const room = rooms.get(roomId);
  const userId = socket.data.userId;
  if (!room || !room.playerIds.includes(userId)) {
    socket.emit("error", { code: "room_not_found", message: "Комната не найдена" });
    return;
  }

  attachSocketToRoom(socket, room);
  socket.emit("room:state", room.snapshot());

  try {
    const history = await fetchRecentChatMessages(roomId);
    for (const row of history) {
      const author = room.players.find((p) => p.id === row.user_id);
      socket.emit("chat:message", {
        id: row.id,
        roomId,
        userId: row.user_id,
        nickname: author?.nickname ?? "Игрок",
        text: row.text,
        ts: row.created_at,
      });
    }
  } catch (err) {
    console.error("[room] failed to load chat history", err);
  }

  if (room.status === "voting") {
    const submissions = room.players
      .filter((p) => p.id !== userId)
      .map((p) => ({
        userId: p.id,
        nickname: p.nickname,
        avatarUrl: p.avatarUrl,
        imageUrl: room.votingReadUrls.get(p.id) ?? null,
      }));
    socket.emit("phase:voting", {
      votingEndsAt: room.votingEndsAt!.toISOString(),
      submissions,
    });
  } else if (room.status === "finished" && room.lastResults) {
    socket.emit("phase:finished", { results: room.lastResults, collagePosted: true });
  }
}

export async function handleChatSend(
  io: AppServer,
  socket: AppSocket,
  roomId: string,
  text: string,
) {
  const room = rooms.get(roomId);
  const userId = socket.data.userId;
  if (!room || !room.playerIds.includes(userId)) return;

  const trimmed = text.trim().slice(0, CHAT_MESSAGE_MAX_LENGTH);
  if (!trimmed) return;

  const player = room.players.find((p) => p.id === userId);
  const message: ChatMessage = {
    id: `${Date.now()}-${userId}`,
    roomId,
    userId,
    nickname: player?.nickname ?? "Игрок",
    text: trimmed,
    ts: new Date().toISOString(),
  };

  io.to(roomId).emit("chat:message", message);

  try {
    const row = await insertChatMessage(roomId, userId, trimmed);
    message.id = row.id;
  } catch (err) {
    console.error("[room] failed to persist chat message", err);
  }
}

export function handleDisconnect(socket: AppSocket) {
  const userId = socket.data.userId;
  const roomId = userRoom.get(userId);
  if (!roomId) return;
  const room = rooms.get(roomId);
  if (room && room.activeSocketId.get(userId) === socket.id) {
    room.activeSocketId.delete(userId);
  }
}

export function getRoomForUser(userId: string): string | undefined {
  return userRoom.get(userId);
}

export function handleCheckActiveRoom(socket: AppSocket) {
  const userId = socket.data.userId;
  const roomId = getRoomForUser(userId);
  // userRoom может указывать на комнату, которой уже нет в памяти (например,
  // после рестарта процесса) — в этом случае не показываем «вернуться»,
  // а сразу забываем эту привязку.
  if (roomId && !rooms.has(roomId)) {
    userRoom.delete(userId);
    socket.emit("lobby:active_room", { roomId: null });
    return;
  }
  socket.emit("lobby:active_room", { roomId: roomId ?? null });
}

/**
 * Игрок добровольно уходит из активной комнаты (кнопка «Покинуть» в лобби).
 * Не трогаем room.players/playerIds — остальным всё считается как обычно
 * (не сдавший работу к таймауту получит null-сабмишн), просто перестаём
 * считать этого игрока «в активной комнате» и отключаем его сокет от неё.
 */
export function handleLeaveRoom(socket: AppSocket, roomId: string) {
  const userId = socket.data.userId;
  if (userRoom.get(userId) !== roomId) return;
  userRoom.delete(userId);
  const room = rooms.get(roomId);
  if (room?.activeSocketId.get(userId) === socket.id) {
    room.activeSocketId.delete(userId);
  }
  socket.leave(roomId);
}

export function canUploadSubmission(
  userId: string,
  roomId: string,
): { ok: true } | { ok: false; reason: string } {
  const room = rooms.get(roomId);
  if (!room) return { ok: false, reason: "room_not_in_memory" };
  if (room.status !== "drawing") return { ok: false, reason: `room_status_${room.status}` };
  if (!room.playerIds.includes(userId)) return { ok: false, reason: "user_not_in_room" };
  return { ok: true };
}
