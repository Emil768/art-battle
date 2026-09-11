import type { AppClientSocket } from "@/lib/socket/client";
import type { PlayerInfo, RoomSubmissionPublic } from "@/types";

export interface VotingPhaseProps {
  socket: AppClientSocket;
  roomId: string;
  promptText: string;
  players: PlayerInfo[];
  votingEndsAt: string;
  submissions: RoomSubmissionPublic[];
  votedCount: number;
  totalCount: number;
}
