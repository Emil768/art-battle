export interface UserRow {
  id: string;
  google_id: string | null;
  nickname: string;
  avatar_url: string | null;
  exp: number;
  level: number;
  matches_played: number;
  wins: number;
  created_at: string;
}

export interface DrawingPromptRow {
  id: string;
  text: string;
  is_active: boolean;
}

export type RoomStatusDb = "waiting" | "drawing" | "voting" | "finished";

export interface RoomRow {
  id: string;
  status: RoomStatusDb;
  prompt_id: string | null;
  started_at: string | null;
  drawing_ends_at: string | null;
  voting_ends_at: string | null;
  created_at: string;
}

export interface RoomPlayerRow {
  room_id: string;
  user_id: string;
  joined_at: string;
}

export interface SubmissionRow {
  id: string;
  room_id: string;
  user_id: string;
  image_url: string | null;
  is_canvas: boolean;
  submitted_at: string;
}

export interface VoteRow {
  id: string;
  room_id: string;
  voter_id: string;
  target_submission_id: string;
  value: 1 | -1;
  created_at: string;
}

export interface MatchResultRow {
  id: string;
  room_id: string;
  winner_ids: string[];
  exp_awarded: Record<string, number>;
  posted_to_tg: boolean;
  created_at: string;
}

export interface ChatMessageRow {
  id: string;
  room_id: string;
  user_id: string;
  text: string;
  created_at: string;
}

export interface Database {
  public: {
    Tables: {
      users: { Row: UserRow; Insert: Partial<UserRow> & { id: string }; Update: Partial<UserRow> };
      drawing_prompts: {
        Row: DrawingPromptRow;
        Insert: Partial<DrawingPromptRow>;
        Update: Partial<DrawingPromptRow>;
      };
      rooms: { Row: RoomRow; Insert: Partial<RoomRow>; Update: Partial<RoomRow> };
      room_players: {
        Row: RoomPlayerRow;
        Insert: Partial<RoomPlayerRow> & { room_id: string; user_id: string };
        Update: Partial<RoomPlayerRow>;
      };
      submissions: {
        Row: SubmissionRow;
        Insert: Partial<SubmissionRow> & { room_id: string; user_id: string };
        Update: Partial<SubmissionRow>;
      };
      votes: {
        Row: VoteRow;
        Insert: Partial<VoteRow> & {
          room_id: string;
          voter_id: string;
          target_submission_id: string;
          value: 1 | -1;
        };
        Update: Partial<VoteRow>;
      };
      match_results: {
        Row: MatchResultRow;
        Insert: Partial<MatchResultRow> & { room_id: string };
        Update: Partial<MatchResultRow>;
      };
      chat_messages: {
        Row: ChatMessageRow;
        Insert: Partial<ChatMessageRow> & { room_id: string; user_id: string; text: string };
        Update: Partial<ChatMessageRow>;
      };
    };
  };
}
