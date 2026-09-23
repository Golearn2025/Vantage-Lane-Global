"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { CheckCircle2, Clock, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/shared/ui/button";
import {
  fetchPartnerOrgContext,
  fetchServiceTypeConfig,
  submitForReview,
} from "@/modules/partner/api";

export function ReviewStep() {
  const qc = useQueryClient();

  const orgQ = useQuery({
    queryKey: ["partner", "org"],
    queryFn: fetchPartnerOrgContext,
  });

  const serviceCode = orgQ.data?.serviceCode ?? "GROUND_TRANSPORTATION";

  const configQ = useQuery({
    queryKey: ["partner", "service-config", serviceCode],
    queryFn: () => fetchServiceTypeConfig(serviceCode),
    enabled: Boolean(serviceCode),
  });

  const steps = configQ.data?.wizardSteps ?? [];
  const alreadySubmitted =
    orgQ.data?.relationshipStatus === "UNDER_REVIEW" ||
    orgQ.data?.relationshipStatus === "ACTIVE";

  const submit = useMutation({
    mutationFn: async () => {
      if (!orgQ.data) throw new Error("No organisation found");
      await submitForReview(orgQ.data.organizationId);
    },
    onSuccess: async () => {
      toast.success("Submitted for review — Vantage Lane will be in touch.");
      await qc.invalidateQueries({ queryKey: ["partner", "org"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl tracking-tight">Review &amp; Submit</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Check that all steps are complete, then submit your application for
          the Vantage Lane team to review.
        </p>
      </div>

      {/* Steps summary */}
      <div className="rounded-2xl border border-border/60 bg-card p-5 shadow-sm space-y-3">
        <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
          Onboarding checklist
        </h2>
        <ul className="space-y-2">
          {steps
            .filter((s) => s.key !== "review")
            .map((step) => (
              <li
                key={step.key}
                className="flex items-center gap-3 rounded-xl border border-border/60 bg-background px-4 py-3"
              >
                <CheckCircle2 className="h-4 w-4 shrink-0 text-primary" />
                <span className="capitalize text-sm font-medium">
                  {step.label}
                </span>
                <span className="ml-auto text-xs text-muted-foreground">
                  {["fleet", "rates", "documents", "profile", "coverage", "availability"].includes(step.key)
                    ? "Persisted"
                    : "UI draft"}
                </span>
              </li>
            ))}
        </ul>
      </div>

      {/* Status notice */}
      {alreadySubmitted ? (
        <div className="flex items-start gap-3 rounded-2xl border border-border/60 bg-card px-4 py-4">
          <Clock className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
          <div>
            <p className="text-sm font-medium">
              {orgQ.data?.relationshipStatus === "ACTIVE"
                ? "Your application has been approved."
                : "Under review — we'll notify you once complete."}
            </p>
            <p className="mt-0.5 text-xs text-muted-foreground">
              Status: {orgQ.data?.relationshipStatus?.replaceAll("_", " ")}
            </p>
          </div>
        </div>
      ) : (
        <div className="flex items-start gap-3 rounded-2xl border border-border/60 bg-card px-4 py-4">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">
            Submitting will lock your application for review. You can still
            update documents and details while under review — please contact
            your Vantage Lane account manager.
          </p>
        </div>
      )}

      {!alreadySubmitted && (
        <Button
          className="w-full rounded-full"
          size="lg"
          disabled={submit.isPending}
          onClick={() => submit.mutate()}
        >
          {submit.isPending ? "Submitting…" : "Submit for review"}
        </Button>
      )}
    </div>
  );
}
