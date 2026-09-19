import { NextResponse } from "next/server";
import { requirePlatformSession } from "@/shared/lib/google/server";
import { createHash, randomBytes } from "crypto";
import { buildNetworkInviteEmail } from "@/emails/outreach/gt-invite";
import {
  EMAIL_FROM_DEFAULT,
  EMAIL_REPLY_TO_DEFAULT,
} from "@/shared/lib/email/brand";

type Body = {
  organizationIds?: string[];
  serviceCode?: string;
};

type InviteLeadRow = {
  organization_id: string;
  display_name: string | null;
  invite_email: string | null;
  contact_id: string | null;
  service_code: string | null;
};

function hashToken(token: string) {
  return createHash("sha256").update(token, "utf8").digest("hex");
}

async function sendResendEmail(opts: {
  to: string;
  subject: string;
  html: string;
}) {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    throw new Error("RESEND_API_KEY is not configured");
  }
  const from = process.env.EMAIL_FROM || EMAIL_FROM_DEFAULT;
  const replyTo = process.env.EMAIL_REPLY_TO || EMAIL_REPLY_TO_DEFAULT;

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from,
      to: [opts.to],
      reply_to: replyTo,
      subject: opts.subject,
      html: opts.html,
    }),
  });

  const json = (await res.json()) as {
    id?: string;
    message?: string;
    error?: { message?: string };
  };
  if (!res.ok) {
    throw new Error(json.error?.message || json.message || "Resend send failed");
  }
  return json.id as string;
}

export async function POST(request: Request) {
  const auth = await requirePlatformSession();
  if (!auth.ok) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  let body: Body;
  try {
    body = (await request.json()) as Body;
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const organizationIds = Array.from(
    new Set((body.organizationIds ?? []).filter(Boolean)),
  );
  if (organizationIds.length === 0) {
    return NextResponse.json({ error: "Select at least one lead" }, { status: 400 });
  }
  if (organizationIds.length > 50) {
    return NextResponse.json({ error: "Max 50 invites per batch" }, { status: 400 });
  }

  const serviceCode = (body.serviceCode || "GROUND_TRANSPORTATION").toUpperCase();
  const origin =
    process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "") ||
    new URL(request.url).origin;

  const { data: leadRows, error: viewErr } = await (auth.supabase as any)
    .from("v_invite_leads")
    .select("organization_id, display_name, invite_email, contact_id, service_code")
    .in("organization_id", organizationIds);

  if (viewErr) {
    return NextResponse.json({ error: viewErr.message }, { status: 500 });
  }

  const results: Array<{
    organizationId: string;
    ok: boolean;
    error?: string;
    invitationId?: string;
  }> = [];

  for (const lead of (leadRows ?? []) as InviteLeadRow[]) {
    const email = lead.invite_email?.trim().toLowerCase() ?? "";
    if (!email) {
      results.push({
        organizationId: lead.organization_id,
        ok: false,
        error: "No email on lead",
      });
      continue;
    }

    const token = randomBytes(24).toString("hex");
    const tokenHash = hashToken(token);
    const expiresAt = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString();
    const inviteService = lead.service_code || serviceCode;
    const inviteUrl = `${origin}/join?invite=${token}`;

    const { data: invitation, error: invErr } = await (auth.supabase as any)
      .from("organization_invitations")
      .insert({
        organization_id: lead.organization_id,
        email,
        contact_id: lead.contact_id,
        token_hash: tokenHash,
        expires_at: expiresAt,
        invited_by_user_id: auth.user.id,
        service_code: inviteService,
        last_email_status: "queued",
      })
      .select("id")
      .single();

    if (invErr || !invitation) {
      results.push({
        organizationId: lead.organization_id,
        ok: false,
        error: invErr?.message || "Failed to create invitation",
      });
      continue;
    }

    try {
      const mail = buildNetworkInviteEmail({
        organizationName: lead.display_name || "Partner",
        serviceCode: inviteService,
        inviteUrl,
      });
      const resendId = await sendResendEmail({
        to: email,
        subject: mail.subject,
        html: mail.html,
      });

      await (auth.supabase as any)
        .from("organization_invitations")
        .update({
          resend_message_id: resendId,
          last_email_status: "sent",
        })
        .eq("id", invitation.id);

      await auth.supabase.from("communications").insert({
        organization_id: lead.organization_id,
        contact_id: lead.contact_id,
        channel: "EMAIL",
        action_type: "SENT_EMAIL" as "OPEN_EMAIL",
        subject: mail.subject,
        body_snapshot: inviteUrl,
        actor_user_id: auth.user.id,
        metadata: {
          resend_id: resendId,
          invitation_id: invitation.id,
          service_code: inviteService,
          invite_url: inviteUrl,
        },
      });

      results.push({
        organizationId: lead.organization_id,
        ok: true,
        invitationId: invitation.id,
      });
    } catch (err) {
      await (auth.supabase as any)
        .from("organization_invitations")
        .update({ last_email_status: "failed" })
        .eq("id", invitation.id);
      results.push({
        organizationId: lead.organization_id,
        ok: false,
        error: err instanceof Error ? err.message : "Send failed",
      });
    }
  }

  const sent = results.filter((r) => r.ok).length;
  return NextResponse.json({
    sent,
    failed: results.length - sent,
    results,
  });
}
