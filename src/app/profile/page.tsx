import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

const ProfileRedirectPage = async () => {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");
  redirect(`/profile/${user.id}`);
};

export default ProfileRedirectPage;
