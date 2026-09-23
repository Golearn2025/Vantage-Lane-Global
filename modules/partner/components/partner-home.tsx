"use client";

import { useState } from "react";
import Link from "next/link";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  BookOpen,
  CheckCircle,
  ChevronRight,
  ExternalLink,
  Lock,
} from "lucide-react";
import {
  fetchPartnerOrgContext,
  acknowledgePartnerStandard,
} from "@/modules/partner/api";
import { Button } from "@/shared/ui/button";
import { RelationshipStatusBadge } from "@/shared/components/status-badges";
import { cn } from "@/shared/lib/utils";

/* ─── helpers ──────────────────────────────────────────────── */

const SERVICE_LABELS: Record<string, string> = {
  GROUND_TRANSPORTATION: "Ground Transportation",
  AVIATION: "Aviation",
  SECURITY: "Security",
  HOSPITALITY: "Hospitality",
  CONCIERGE: "Concierge",
  YACHT: "Yacht & Marine",
  MEDICAL: "Medical & Wellness",
  EVENTS: "Events & Protocol",
};

const STANDARD_URLS: Record<string, string> = {
  GROUND_TRANSPORTATION: "https://vantage-lane.com/driversnetwork",
  AVIATION: "https://vantage-lane.com/driversnetwork",
  SECURITY: "https://vantage-lane.com/driversnetwork",
  HOSPITALITY: "https://vantage-lane.com/driversnetwork",
  CONCIERGE: "https://vantage-lane.com/driversnetwork",
  YACHT: "https://vantage-lane.com/driversnetwork",
  MEDICAL: "https://vantage-lane.com/driversnetwork",
  EVENTS: "https://vantage-lane.com/driversnetwork",
};

/* Steps per service — mirrors wizard config */
const WIZARD_STEPS: Record<string, { key: string; label: string; href: string }[]> = {
  GROUND_TRANSPORTATION: [
    { key: "coverage", label: "Coverage zone", href: "/partner/coverage" },
    { key: "fleet", label: "Declare fleet", href: "/partner/fleet" },
    { key: "rates", label: "Enter rate card", href: "/partner/rates" },
    { key: "documents", label: "Upload documents", href: "/partner/documents" },
  ],
  AVIATION: [
    { key: "coverage", label: "Coverage zone", href: "/partner/coverage" },
    { key: "aircraft", label: "Declare aircraft", href: "/partner/aircraft" },
    { key: "rates", label: "Enter rate card", href: "/partner/rates" },
    { key: "documents", label: "Upload documents", href: "/partner/documents" },
  ],
  SECURITY: [
    { key: "coverage", label: "Coverage zone", href: "/partner/coverage" },
    { key: "operatives", label: "Operatives & SIA", href: "/partner/operatives" },
    { key: "rates", label: "Enter rate card", href: "/partner/rates" },
    { key: "documents", label: "Upload documents", href: "/partner/documents" },
  ],
  HOSPITALITY: [
    { key: "coverage", label: "Coverage zone", href: "/partner/coverage" },
    { key: "properties", label: "Add properties", href: "/partner/properties" },
    { key: "documents", label: "Upload documents", href: "/partner/documents" },
  ],
  CONCIERGE: [
    { key: "coverage", label: "Coverage zone", href: "/partner/coverage" },
    { key: "specialisations", label: "Specialisations", href: "/partner/specialisations" },
    { key: "documents", label: "Upload documents", href: "/partner/documents" },
  ],
  YACHT: [
    { key: "coverage", label: "Coverage zone", href: "/partner/coverage" },
    { key: "vessels", label: "Declare vessels", href: "/partner/vessels" },
    { key: "rates", label: "Enter rate card", href: "/partner/rates" },
    { key: "documents", label: "Upload documents", href: "/partner/documents" },
  ],
  MEDICAL: [
    { key: "coverage", label: "Coverage zone", href: "/partner/coverage" },
    { key: "services", label: "Services & registration", href: "/partner/services" },
    { key: "documents", label: "Upload documents", href: "/partner/documents" },
  ],
  EVENTS: [
    { key: "coverage", label: "Coverage zone", href: "/partner/coverage" },
    { key: "capabilities", label: "Capabilities", href: "/partner/capabilities" },
    { key: "documents", label: "Upload documents", href: "/partner/documents" },
  ],
};

/* ─── Standard gate component ───────────────────────────────── */

function StandardGate({
  serviceCode,
  organizationId,
  onAcknowledged,
}: {
  serviceCode: string;
  organizationId: string;
  onAcknowledged: () => void;
}) {
  const [opened, setOpened] = useState(false);
  const queryClient = useQueryClient();

  const acknowledge = useMutation({
    mutationFn: async () => {
      await acknowledgePartnerStandard(organizationId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["partner", "org"] });
      onAcknowledged();
    },
  });

  const serviceLabel = SERVICE_LABELS[serviceCode] ?? serviceCode;
  const standardUrl = STANDARD_URLS[serviceCode] ?? "https://vantage-lane.com/driversnetwork";

  return (
    <div className="rounded-2xl border border-primary/30 bg-primary/5 p-6">
      {/* Header */}
      <div className="mb-4 flex items-start gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10">
          <BookOpen className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h2 className="font-semibold text-foreground">
            Read the Vantage Lane standard first
          </h2>
          <p className="mt-0.5 text-sm text-muted-foreground">
            Before completing your profile, you must read and acknowledge the{" "}
            <span className="font-medium text-foreground">{serviceLabel}</span>{" "}
            partner standard. This sets the quality bar every partner must meet.
          </p>
        </div>
      </div>

      {/* Standard card */}
      <a
        href={standardUrl}
        target="_blank"
        rel="noreferrer"
        onClick={() => setOpened(true)}
        className="mb-4 flex items-center justify-between rounded-xl border border-border/70 bg-card px-4 py-3 transition-colors hover:bg-card/80"
      >
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-muted">
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </div>
          <div>
            <p className="text-sm font-medium">Vantage Lane {serviceLabel} Standard</p>
            <p className="text-xs text-muted-foreground">vantage-lane.com · Opens in new tab</p>
          </div>
        </div>
        <ExternalLink className="h-4 w-4 shrink-0 text-muted-foreground" />
      </a>

      {/* Confirm button */}
      <Button
        className="w-full rounded-full"
        size="lg"
        disabled={!opened || acknowledge.isPending}
        onClick={() => acknowledge.mutate()}
      >
        {acknowledge.isPending ? (
          "Saving…"
        ) : (
          <>
            <CheckCircle className="mr-2 h-4 w-4" />
            I have read and understood the standard
          </>
        )}
      </Button>

      {!opened && (
        <p className="mt-2 text-center text-xs text-muted-foreground">
          Open the standard above first — the button unlocks after you read it.
        </p>
      )}
    </div>
  );
}

/* ─── Onboarding steps list ─────────────────────────────────── */

function OnboardingChecklist({ serviceCode }: { serviceCode: string }) {
  const steps = WIZARD_STEPS[serviceCode] ?? WIZARD_STEPS.GROUND_TRANSPORTATION;

  return (
    <div className="space-y-2">
      <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
        Onboarding steps
      </h3>
      <div className="divide-y divide-border/50 rounded-xl border border-border/60 bg-card overflow-hidden">
        {steps.map((step, i) => (
          <Link
            key={step.key}
            href={step.href}
            className="flex items-center justify-between px-4 py-3.5 transition-colors hover:bg-muted/40"
          >
            <div className="flex items-center gap-3">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-semibold text-muted-foreground">
                {i + 1}
              </span>
              <span className="text-sm font-medium">{step.label}</span>
            </div>
            <ChevronRight className="h-4 w-4 text-muted-foreground" />
          </Link>
        ))}
      </div>
    </div>
  );
}

/* ─── Main component ────────────────────────────────────────── */

export function PartnerHome() {
  const [justAcknowledged, setJustAcknowledged] = useState(false);

  const org = useQuery({
    queryKey: ["partner", "org"],
    queryFn: fetchPartnerOrgContext,
  });

  const serviceCode = org.data?.serviceCode ?? "GROUND_TRANSPORTATION";
  const status = org.data?.relationshipStatus;

  // Check if standard has been acknowledged
  const acknowledged =
    justAcknowledged || !!org.data?.standardAcknowledgedAt;

  const isLoading = org.isPending;

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      {/* Header */}
      <div>
        <h1 className="font-display text-3xl tracking-tight">
          {org.data?.displayName ?? "Welcome"}
        </h1>
        <div className="mt-2 flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
          <span>{SERVICE_LABELS[serviceCode] ?? serviceCode}</span>
          <span>·</span>
          {status ? (
            <RelationshipStatusBadge status={status as never} />
          ) : (
            <span>Loading…</span>
          )}
        </div>
      </div>

      {isLoading ? (
        <div className="h-40 animate-pulse rounded-2xl bg-muted/40" />
      ) : !acknowledged ? (
        /* ── GATE: must read standard first ── */
        <>
          <StandardGate
            serviceCode={serviceCode}
            organizationId={org.data?.organizationId ?? ""}
            onAcknowledged={() => setJustAcknowledged(true)}
          />

          {/* Locked steps preview */}
          <div className="space-y-2">
            <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
              Onboarding steps
            </h3>
            <div
              className={cn(
                "divide-y divide-border/50 rounded-xl border border-border/60 bg-card overflow-hidden opacity-40 pointer-events-none select-none",
              )}
            >
              {(WIZARD_STEPS[serviceCode] ?? WIZARD_STEPS.GROUND_TRANSPORTATION).map(
                (step, i) => (
                  <div
                    key={step.key}
                    className="flex items-center justify-between px-4 py-3.5"
                  >
                    <div className="flex items-center gap-3">
                      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-semibold text-muted-foreground">
                        {i + 1}
                      </span>
                      <span className="text-sm font-medium">{step.label}</span>
                    </div>
                    <Lock className="h-4 w-4 text-muted-foreground" />
                  </div>
                ),
              )}
            </div>
            <p className="text-center text-xs text-muted-foreground">
              Acknowledge the standard above to unlock onboarding steps.
            </p>
          </div>
        </>
      ) : (
        /* ── UNLOCKED: standard acknowledged ── */
        <>
          {/* Acknowledged banner */}
          <div className="flex items-center gap-3 rounded-xl border border-green-500/20 bg-green-500/8 px-4 py-3">
            <CheckCircle className="h-5 w-5 shrink-0 text-green-500" />
            <div>
              <p className="text-sm font-medium">Standard acknowledged</p>
              <p className="text-xs text-muted-foreground">
                You can now complete your onboarding profile.
              </p>
            </div>
            <a
              href={STANDARD_URLS[serviceCode] ?? "https://vantage-lane.com/driversnetwork"}
              target="_blank"
              rel="noreferrer"
              className="ml-auto text-xs text-muted-foreground underline underline-offset-2 hover:text-foreground"
            >
              Re-read
            </a>
          </div>

          <OnboardingChecklist serviceCode={serviceCode} />
        </>
      )}
    </div>
  );
}
