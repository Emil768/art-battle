import { fetchLeaderboard, fetchUserProfileById } from "@/lib/db/queries";
import { createClient } from "@/lib/supabase/server";
import { ROOM_SIZE } from "@/lib/game/constants";
import { LobbyView } from "./LobbyView";

const LobbyPage = async () => {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const [topPlayers, ownProfile] = await Promise.all([
    fetchLeaderboard(5),
    user ? fetchUserProfileById(user.id) : Promise.resolve(null),
  ]);

  return (
    <LobbyView
      topPlayers={topPlayers}
      ownStats={
        ownProfile
          ? { matchesPlayed: ownProfile.matches_played, wins: ownProfile.wins }
          : { matchesPlayed: 0, wins: 0 }
      }
      ownUserId={user?.id ?? null}
      roomSize={ROOM_SIZE}
    />
  );
};

export default LobbyPage;
