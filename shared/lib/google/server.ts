import { createClient } from "@/shared/lib/supabase/server";

export function getGoogleMapsServerKey() {
  return (
    process.env.GOOGLE_MAPS_API_KEY ||
    process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY ||
    ""
  );
}

/** Any logged-in user (platform staff or partner). */
export async function requireAuthenticatedSession() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return { ok: false as const, status: 401, error: "Not authenticated" };
  }
  return { ok: true as const, supabase, user };
}

/** Platform staff only (CRM / admin APIs). */
export async function requirePlatformSession() {
  const auth = await requireAuthenticatedSession();
  if (!auth.ok) return auth;

  const { data: isPlatform } = await auth.supabase.rpc("is_platform_user");
  if (!isPlatform) {
    return { ok: false as const, status: 403, error: "Platform access required" };
  }
  return { ok: true as const, supabase: auth.supabase, user: auth.user };
}
