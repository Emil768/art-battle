import { fetchLeaderboard } from "@/lib/db/queries";
import { createClient } from "@/lib/supabase/server";
import { LeaderboardView } from "./LeaderboardView";

const LeaderboardPage = async () => {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const players = await fetchLeaderboard(50);

  return <LeaderboardView players={players} ownUserId={user?.id ?? null} />;
};

export default LeaderboardPage;
