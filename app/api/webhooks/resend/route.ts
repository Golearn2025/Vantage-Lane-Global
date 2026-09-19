import { NextResponse } from "next/server";
import { createAdminClient } from "@/shared/lib/supabase/admin";
import { looseDb } from "@/shared/lib/supabase/loose";

type ResendWebhookEvent = {
  type?: string;
  data?: {
    email_id?: string;
    id?: string;
    created_at?: string;
    tags?: Record<string, string> | Array<{ name: string; value: string }>;
  };
};

type InvitationTrackRow = {
  id: string;
  organization_id: string;
};

function tagValue(
  tags: ResendWebhookEvent["data"] extends { tags?: infer T } ? T : unknown,
  name: string,
): string | null {
  if (!tags) return null;
  if (Array.isArray(tags)) {
    const hit = tags.find((t) => t.name === name);
    return hit?.value ?? null;
  }
  if (typeof tags === "object") {
    const v = (tags as Record<string, string>)[name];
    return v ?? null;
  }
  return null;
}

/**
 * Resend webhook: email.delivered | email.opened | email.clicked | email.bounced
 * URL: https://crm.vantage-lane.com/api/webhooks/resend
 * Requires SUPABASE_SERVICE_ROLE_KEY on Render + open/click tracking on the domain.
 */
export async function POST(request: Request) {
  let event: ResendWebhookEvent;
  try {
    event = (await request.json()) as ResendWebhookEvent;
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const type = event.type ?? "";
  const emailId = event.data?.email_id || event.data?.id;
  const invitationIdFromTag = tagValue(event.data?.tags, "invitation_id");

  if (!emailId && !invitationIdFromTag) {
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
  let inv: InvitationTrackRow | null = null;
  let error: { message: string } | null = null;

  if (emailId) {
    const res = await db
      .from<InvitationTrackRow>("organization_invitations")
      .update(patch)
      .eq("resend_message_id", emailId)
      .select("id, organization_id")
      .maybeSingle();
    inv = res.data;
    error = res.error;
  }

  if (!inv && invitationIdFromTag) {
    const res = await db
      .from<InvitationTrackRow>("organization_invitations")
      .update({
        ...patch,
        ...(emailId ? { resend_message_id: emailId } : {}),
      })
      .eq("id", invitationIdFromTag)
      .select("id, organization_id")
      .maybeSingle();
    inv = res.data;
    error = res.error;
  }

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

  return NextResponse.json({
    ok: true,
    invitationId: inv?.id ?? null,
    status,
    matched: Boolean(inv),
  });
}
