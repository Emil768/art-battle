import type { AppClientSocket } from "@/lib/socket/client";
import type { PlayerInfo } from "@/types";

export interface RoomChatProps {
  socket: AppClientSocket;
  roomId: string;
  players: PlayerInfo[];
}
