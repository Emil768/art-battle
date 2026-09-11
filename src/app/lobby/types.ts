export interface QueueStatus {
  queued: number;
  needed: number;
}

export interface LeaderboardRow {
  id: string;
  nickname: string;
  avatar_url: string | null;
  exp: number;
  level: number;
  matches_played: number;
  wins: number;
}

export interface OwnStats {
  matchesPlayed: number;
  wins: number;
}

export interface LobbyViewProps {
  topPlayers: LeaderboardRow[];
  ownStats: OwnStats;
  ownUserId: string | null;
  roomSize: number;
}
