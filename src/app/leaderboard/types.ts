export interface LeaderboardRow {
  id: string;
  nickname: string;
  avatar_url: string | null;
  exp: number;
  level: number;
  matches_played: number;
  wins: number;
}

export interface LeaderboardViewProps {
  players: LeaderboardRow[];
  ownUserId: string | null;
}

export type Period = "week" | "month" | "all";
