import { PARTICIPATION_XP, WIN_XP_POOL } from "@/lib/game/constants";

export interface ScoredPlayer {
  userId: string;
  score: number;
}

export interface ScoringResult {
  scores: Map<string, number>;
  winnerIds: string[];
  expAwarded: Record<string, number>;
}

/**
 * votesByTarget: userId (submission owner) -> array of vote values (1 | -1)
 * playerIds: every player who was in the room, including non-submitters (score 0)
 */
export function computeResults(
  playerIds: string[],
  votesByTarget: Map<string, number[]>,
): ScoringResult {
  const scores = new Map<string, number>();
  for (const userId of playerIds) {
    const votes = votesByTarget.get(userId) ?? [];
    scores.set(
      userId,
      votes.reduce((sum, v) => sum + v, 0),
    );
  }

  const maxScore = Math.max(...Array.from(scores.values()));
  const winnerIds = playerIds.filter((id) => scores.get(id) === maxScore);

  const expAwarded: Record<string, number> = {};
  const winnerShare = Math.floor(WIN_XP_POOL / winnerIds.length);
  for (const userId of playerIds) {
    expAwarded[userId] = winnerIds.includes(userId) ? winnerShare : PARTICIPATION_XP;
  }

  return { scores, winnerIds, expAwarded };
}
