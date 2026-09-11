import { io, Socket } from "socket.io-client";
import type { ClientToServerEvents, ServerToClientEvents } from "@/lib/socket/events";

export type AppClientSocket = Socket<ServerToClientEvents, ClientToServerEvents>;

let socket: AppClientSocket | null = null;

export function getSocket(accessToken: string): AppClientSocket {
  if (socket && socket.connected) return socket;
  if (socket) socket.disconnect();
  socket = io({ auth: { accessToken } });
  return socket;
}

export function disconnectSocket() {
  socket?.disconnect();
  socket = null;
}
