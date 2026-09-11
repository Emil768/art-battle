import type { RoomSubmissionPublic } from "@/types";

export interface VotingPayload {
  votingEndsAt: string;
  submissions: RoomSubmissionPublic[];
}

export interface VoteProgress {
  votedCount: number;
  totalCount: number;
}
