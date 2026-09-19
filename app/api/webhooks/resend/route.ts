import { NextResponse } from "next/server";
import { createAdminClient } from "@/shared/lib/supabase/admin";
import { looseDb } from "@/shared/lib/supabase/loose";

type ResendWebhookEvent = {
  type?: string;
  data?: {
    email_id?: string;
    created_at?: string;
  };
};

type InvitationTrackRow = {
  id: string;
  organization_id: string;
};

/**
 * Resend webhook: email.delivered | email.opened | email.clicked | email.bounced
 * Configure endpoint in Resend dashboard → Webhooks.
 */
export async function POST(request: Request) {
  let event: ResendWebhookEvent;
  try {
    event = (await request.json()) as ResendWebhookEvent;
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const type = event.type ?? "";
  const emailId = event.data?.email_id;
  if (!emailId) {
    return NextResponse.json({ ok: true, skipped: true });
  }

  const statusMap: Record<string, string> = {
    "email.sent": "sent",
    "email.delivered": "delivered",
    "email.opened": "opened",
    "email.clicked": "clicked",
    "email.bounced": "bounced",
    "email.complained": "complained",
  };
  const status = statusMap[type];
  if (!status) {
    return NextResponse.json({ ok: true, ignored: type });
  }

  let admin;
  try {
    admin = createAdminClient();
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Admin client missing" },
      { status: 500 },
    );
  }

  const patch: Record<string, unknown> = { last_email_status: status };
  if (status === "opened") patch.opened_at = new Date().toISOString();
  if (status === "clicked") patch.clicked_at = new Date().toISOString();

  const db = looseDb(admin);
  const { data: inv, error } = await db
    .from<InvitationTrackRow>("organization_invitations")
    .update(patch)
    .eq("resend_message_id", emailId)
    .select("id, organization_id")
    .maybeSingle();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  if (inv?.organization_id && (status === "opened" || status === "clicked")) {
    await admin.from("activities").insert({
      organization_id: inv.organization_id,
      activity_type: status === "opened" ? "INVITE_OPENED" : "INVITE_CLICKED",
      summary: status === "opened" ? "Invite email opened" : "Invite email clicked",
      visibility: "VL_ONLY",
    });
  }

  return NextResponse.json({ ok: true, invitationId: inv?.id ?? null, status });
}
