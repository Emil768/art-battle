export interface ProfileData {
  nickname: string;
  avatarUrl: string | null;
  exp: number;
  level: number;
  matchesPlayed: number;
  wins: number;
  dislikesReceived: number;
  joinedAt: string;
}

export interface Achievement {
  id: string;
  icon: "brush" | "trophy" | "arrow";
  label: string;
  description: string;
  unlocked: boolean;
}
