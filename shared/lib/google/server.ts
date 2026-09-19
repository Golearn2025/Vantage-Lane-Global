import { createClient } from "@/shared/lib/supabase/server";

export function getGoogleMapsServerKey() {
  return (
    process.env.GOOGLE_MAPS_API_KEY ||
    process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY ||
    ""
  );
}

export async function requirePlatformSession() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return { ok: false as const, status: 401, error: "Not authenticated" };
  }
  const { data: isPlatform } = await supabase.rpc("is_platform_user");
  if (!isPlatform) {
    return { ok: false as const, status: 403, error: "Platform access required" };
  }
  return { ok: true as const, supabase, user };
}
