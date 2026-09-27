import { NextResponse } from "next/server";
import { createClient } from "@/shared/lib/supabase/server";

// Behind the Render proxy request.url resolves to the internal http://localhost:10000.
function publicOrigin(request: Request) {
  const configured = process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "");
  if (configured) return configured;
  const host = request.headers.get("x-forwarded-host") ?? request.headers.get("host");
  if (host && !host.startsWith("localhost")) {
    const proto = request.headers.get("x-forwarded-proto") ?? "https";
    return `${proto}://${host}`;
  }
  return new URL(request.url).origin;
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const origin = publicOrigin(request);
  const code = searchParams.get("code");
  const rawNext = searchParams.get("next") ?? "/auth/confirmed";
  const next = rawNext.startsWith("/") && !rawNext.startsWith("//") ? rawNext : "/auth/confirmed";

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  return NextResponse.redirect(`${origin}/join?error=confirm`);
}
