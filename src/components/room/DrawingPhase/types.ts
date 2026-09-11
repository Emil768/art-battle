import type { AppClientSocket } from "@/lib/socket/client";
import type { PlayerInfo } from "@/types";

export interface DrawingPhaseProps {
  socket: AppClientSocket;
  roomId: string;
  promptText: string;
  drawingEndsAt: string;
  players: PlayerInfo[];
  submittedPlayerIds: Set<string>;
}

export type { ToolMode as DrawingMode } from "@/components/canvas/ToolControls/types";

export interface StatusMessage {
  variant: "error" | "success";
  text: string;
}
