"use client";

import { useQuery } from "@tanstack/react-query";
import { createClient } from "@/shared/lib/supabase/client";
import { identityKeys } from "@/shared/lib/query/keys";

export type SessionProfile = {
  id: string;
  email: string | null;
  displayName: string | null;
  isPlatformUser: boolean;
  canManageNetwork: boolean;
  canViewOpsDashboard: boolean;
};

export async function fetchSessionProfile(): Promise<SessionProfile | null> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: profile, error } = await supabase
    .from("profiles")
    .select("id, email, display_name, is_platform_user")
    .eq("id", user.id)
    .maybeSingle();
  if (error) throw error;

  const [{ data: canManageNetwork }, { data: canViewOpsDashboard }] =
    await Promise.all([
      supabase.rpc("has_platform_permission", {
        perm_code: "platform.network.manage",
      }),
      supabase.rpc("has_platform_permission", {
        perm_code: "platform.ops.dashboard",
      }),
    ]);

  return {
    id: user.id,
    email: profile?.email ?? user.email ?? null,
    displayName: profile?.display_name ?? null,
    isPlatformUser: Boolean(profile?.is_platform_user),
    canManageNetwork: Boolean(canManageNetwork),
    canViewOpsDashboard: Boolean(canViewOpsDashboard),
  };
}

export function useSessionProfile() {
  return useQuery({
    queryKey: identityKeys.me(),
    queryFn: fetchSessionProfile,
  });
}

export async function signInWithPassword(email: string, password: string) {
  const supabase = createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw error;
}

export async function signOut() {
  const supabase = createClient();
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}
