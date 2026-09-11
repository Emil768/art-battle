import type { PlayerInfo } from "@/types";

export interface WaitingRoomProps {
  players: PlayerInfo[];
  ownUserId: string;
}
