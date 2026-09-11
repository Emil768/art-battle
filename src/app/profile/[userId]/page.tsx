import Link from "next/link";
import { GameHeader } from "@/components/shared/GameHeader";
import { fetchUserProfileById } from "@/lib/db/queries";
import { createClient } from "@/lib/supabase/server";
import { ProfileView } from "../ProfileView";
import type { ProfileData } from "../types";

interface ProfileByIdPageProps {
  params: Promise<{ userId: string }>;
}

const ProfileByIdPage = async ({ params }: ProfileByIdPageProps) => {
  const { userId } = await params;
  const row = await fetchUserProfileById(userId);

  if (!row) {
    return (
      <main className="flex min-h-screen flex-col" style={{ background: "var(--ab-bg)" }}>
        <GameHeader />
        <div className="flex flex-1 flex-col items-center justify-center gap-6">
          <p className="font-bold" style={{ color: "var(--ab-ink-45)" }}>
            Игрок не найден.
          </p>
          <Link href="/lobby" className="ab-btn ab-btn-primary">
            Вернуться в лобби
          </Link>
        </div>
      </main>
    );
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const profile: ProfileData = {
    nickname: row.nickname ?? "Игрок",
    avatarUrl: row.avatar_url ?? null,
    exp: row.exp ?? 0,
    level: row.level ?? 1,
    matchesPlayed: row.matches_played ?? 0,
    wins: row.wins ?? 0,
    dislikesReceived: row.dislikes_received ?? 0,
    joinedAt: row.created_at ?? new Date().toISOString(),
  };

  return <ProfileView profile={profile} userId={userId} isOwnProfile={user?.id === userId} />;
};

export default ProfileByIdPage;
