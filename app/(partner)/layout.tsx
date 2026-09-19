import { redirect } from "next/navigation";
import { createClient } from "@/shared/lib/supabase/server";
import { PartnerShell } from "@/modules/partner/components/partner-shell";

export default async function PartnerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?next=/partner");
  }

  const { data: isPlatform } = await supabase.rpc("is_platform_user");

  const { data: membership } = await supabase
    .from("organization_memberships")
    .select("id")
    .eq("user_id", user.id)
    .eq("status", "ACTIVE")
    .is("archived_at", null)
    .limit(1)
    .maybeSingle();

  if (!membership) {
    if (isPlatform) {
      redirect("/organizations");
    }
    redirect("/join/setup");
  }

  return <PartnerShell>{children}</PartnerShell>;
}
