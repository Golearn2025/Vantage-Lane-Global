import { createHash, randomBytes } from "crypto";
import { NextResponse } from "next/server";
import { requirePlatformSession } from "@/shared/lib/google/server";
import { buildBookerDemandEmail } from "@/emails/outreach/vl-booker-invite";
import {
  EMAIL_FROM_DEFAULT,
  EMAIL_REPLY_TO_DEFAULT,
} from "@/shared/lib/email/brand";
import { looseDb } from "@/shared/lib/supabase/loose";

/** VL hotel outreach — not "Network" (supplier invites). */
const BOOKER_EMAIL_FROM =
  process.env.EMAIL_FROM_BOOKER || "Vantage Lane <partnerships@vantage-lane.com>";

type Body = {
  organizationIds?: string[];
  serviceCode?: string;
  skipAlreadyInvited?: boolean;
  forceResend?: boolean;
};

type BookerLeadRow = {
  organization_id: string;
  display_name: string | null;
  invite_email: string | null;
  contact_id: string | null;
  contact_name: string | null;
  service_code: string | null;
  legal_city: string | null;
  invite_accepted_at?: string | null;
  last_email_status?: string | null;
  invited_at?: string | null;
};

type InvitationRow = { id: string };

function hashToken(token: string) {
  return createHash("sha256").update(token, "utf8").digest("hex");
}

async function sendResendEmail(opts: {
  to: string;
  subject: string;
  html: string;
  invitationId: string;
  organizationId: string;
}) {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    throw new Error("RESEND_API_KEY is not configured");
  }
  const from = BOOKER_EMAIL_FROM || process.env.EMAIL_FROM || EMAIL_FROM_DEFAULT;
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
      tags: [
        { name: "invitation_id", value: opts.invitationId },
        { name: "organization_id", value: opts.organizationId },
        { name: "category", value: "booker_demand" },
      ],
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
    return NextResponse.json({ error: "Select at least one booker" }, { status: 400 });
  }
  if (organizationIds.length > 50) {
    return NextResponse.json({ error: "Max 50 emails per batch" }, { status: 400 });
  }

  const serviceCode = (body.serviceCode || "HOSPITALITY").toUpperCase();
  const origin =
    process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "") ||
    new URL(request.url).origin;

  const db = looseDb(auth.supabase);
  const skipAlready = body.skipAlreadyInvited === true;
  const forceResend = body.forceResend === true;
  const { data: leadRows, error: viewErr } = await db
    .from<BookerLeadRow>("v_booker_leads")
    .select(
      "organization_id, display_name, invite_email, contact_id, contact_name, service_code, legal_city, invite_accepted_at, last_email_status, invited_at",
    )
    .in("organization_id", organizationIds);

  if (viewErr) {
    return NextResponse.json({ error: viewErr.message }, { status: 500 });
  }

  const results: Array<{
    organizationId: string;
    ok: boolean;
    error?: string;
    invitationId?: string;
    skipped?: boolean;
  }> = [];

  for (const lead of (leadRows as BookerLeadRow[] | null) ?? []) {
    if (skipAlready && !forceResend) {
      const status = (lead.last_email_status || "").toLowerCase();
      const already =
        Boolean(lead.invite_accepted_at) ||
        Boolean(lead.invited_at) ||
        ["sent", "queued", "delivered", "opened", "clicked", "signed_up"].includes(
          status,
        );
      if (already) {
        results.push({
          organizationId: lead.organization_id,
          ok: true,
          skipped: true,
        });
        continue;
      }
    }
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
    const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();
    const inviteService = lead.service_code || serviceCode;
    const interestUrl = `${origin}/interest?invite=${token}`;

    const { data: invitation, error: invErr } = await db
      .from<InvitationRow>("organization_invitations")
      .insert({
        organization_id: lead.organization_id,
        email,
        contact_id: lead.contact_id,
        token_hash: tokenHash,
        expires_at: expiresAt,
        invited_by_user_id: auth.user.id,
        service_code: inviteService,
        invite_kind: "booker",
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
      const mail = buildBookerDemandEmail({
        organizationName: lead.display_name || "Team",
        contactName: lead.contact_name,
        interestUrl,
        cityHint: lead.legal_city,
      });
      const resendId = await sendResendEmail({
        to: email,
        subject: mail.subject,
        html: mail.html,
        invitationId: invitation.id,
        organizationId: lead.organization_id,
      });

      await db
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
        action_type: "SENT_EMAIL",
        subject: mail.subject,
        body_snapshot: interestUrl,
        actor_user_id: auth.user.id,
        metadata: {
          resend_id: resendId,
          invitation_id: invitation.id,
          service_code: inviteService,
          interest_url: interestUrl,
          invite_kind: "booker",
        },
      });

      results.push({
        organizationId: lead.organization_id,
        ok: true,
        invitationId: invitation.id,
      });
    } catch (err) {
      await db
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

  const sent = results.filter((r) => r.ok && !r.skipped).length;
  const skipped = results.filter((r) => r.skipped).length;
  return NextResponse.json({
    sent,
    failed: results.length - sent - skipped,
    skipped,
    results,
  });
}
