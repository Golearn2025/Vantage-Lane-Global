import { createClient } from "@/shared/lib/supabase/server";

export async function requirePartnerSession() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return { ok: false as const, status: 401, error: "Not authenticated" };
  }
  return { ok: true as const, supabase, user };
}
