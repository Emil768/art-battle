import type { PlayerInfo } from "@/types";

export interface PlayerActivityRowProps {
  players: PlayerInfo[];
  submittedPlayerIds?: Set<string>;
}
