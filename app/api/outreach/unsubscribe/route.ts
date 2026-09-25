import { NextResponse } from "next/server";
import { createClient } from "@/shared/lib/supabase/server";

async function unsubscribe(token: string | null) {
  const t = token?.trim() ?? "";
  if (t.length < 16) {
    return { ok: false as const, status: 400 };
  }
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("rpc_outreach_unsubscribe", {
    p_token: t,
  });
  if (error || !(data as { ok?: boolean } | null)?.ok) {
    return { ok: false as const, status: 404 };
  }
  return { ok: true as const, status: 200 };
}

/** One-click List-Unsubscribe (RFC 8058) + mailto-style GET. */
export async function POST(request: Request) {
  const url = new URL(request.url);
  const token = url.searchParams.get("invite");
  const result = await unsubscribe(token);
  return new NextResponse(result.ok ? "OK" : "Failed", { status: result.status });
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const token = url.searchParams.get("invite");
  const origin =
    process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "") || url.origin;
  if (!token || token.trim().length < 16) {
    return NextResponse.redirect(`${origin}/unsubscribe`);
  }
  const result = await unsubscribe(token);
  if (result.ok) {
    return NextResponse.redirect(`${origin}/unsubscribe?invite=${token}&done=1`);
  }
  return NextResponse.redirect(`${origin}/unsubscribe?invite=${token}`);
}
