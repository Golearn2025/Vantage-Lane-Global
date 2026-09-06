import { redirect } from "next/navigation";
import { createClient } from "@/shared/lib/supabase/server";
import { PlatformShell } from "@/modules/shell/platform-shell";

export default async function PlatformLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: isPlatform } = await supabase.rpc("is_platform_user");
  if (!isPlatform) {
    redirect("/unauthorized");
  }

  return <PlatformShell>{children}</PlatformShell>;
}
