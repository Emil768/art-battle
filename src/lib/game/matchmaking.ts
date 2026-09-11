import { ROOM_SIZE } from "@/lib/game/constants";

interface QueuedPlayer {
  userId: string;
  socketId: string;
}

const queue: QueuedPlayer[] = [];

export function joinQueue(userId: string, socketId: string): QueuedPlayer[] | null {
  if (queue.some((p) => p.userId === userId)) return null;
  queue.push({ userId, socketId });
  if (queue.length >= ROOM_SIZE) {
    return queue.splice(0, ROOM_SIZE);
  }
  return null;
}

export function leaveQueue(userId: string) {
  const idx = queue.findIndex((p) => p.userId === userId);
  if (idx !== -1) queue.splice(idx, 1);
}

export function leaveQueueBySocket(socketId: string) {
  const idx = queue.findIndex((p) => p.socketId === socketId);
  if (idx !== -1) queue.splice(idx, 1);
}

export function queueStatus() {
  return { queued: queue.length, needed: ROOM_SIZE };
}

export function currentQueueSocketIds(): string[] {
  return queue.map((p) => p.socketId);
}
