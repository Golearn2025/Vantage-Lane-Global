"use client";

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { MapPin } from "lucide-react";
import { Button } from "@/shared/ui/button";
import {
  CoverageComposer,
  type CoverageBundle,
} from "@/modules/organizations/components/coverage-composer";
import {
  fetchPartnerCoverages,
  fetchPartnerOrgContext,
  savePartnerCoverages,
} from "@/modules/partner/api";

/**
 * Same data model as admin Add Operator coverage:
 * offering_coverages + catalog locations + optional radius_km.
 * Soft-linked LEADs keep their own coverage; this writes on the partner org.
 */
export function PartnerCoverageForm() {
  const qc = useQueryClient();
  const orgQ = useQuery({
    queryKey: ["partner", "org"],
    queryFn: fetchPartnerOrgContext,
  });
  const covQ = useQuery({
    queryKey: ["partner", "coverages", orgQ.data?.organizationId],
    enabled: Boolean(orgQ.data?.organizationId),
    queryFn: () => fetchPartnerCoverages(orgQ.data!.organizationId),
  });

  const [draft, setDraft] = useState<CoverageBundle | null>(null);
  const [composerKey, setComposerKey] = useState(0);

  const save = useMutation({
    mutationFn: async () => {
      if (!orgQ.data) throw new Error("No organization");
      const primary = draft?.primary;
      if (!primary) {
        throw new Error(
          "Pick a primary zone from the catalog (tap a result — typing alone does nothing)",
        );
      }
      const items = [
        {
          locationId: primary.locationId,
          coverageMode: primary.coverageMode,
          radiusKm: primary.radiusKm,
        },
        ...(draft?.secondaries ?? []).map((s) => ({
          locationId: s.locationId,
          coverageMode: s.coverageMode,
          radiusKm: s.radiusKm,
        })),
      ];
      await savePartnerCoverages({
        organizationId: orgQ.data.organizationId,
        offeringId: orgQ.data.offeringId,
        items,
      });
    },
    onSuccess: async () => {
      toast.success("Coverage saved — visible on the network map");
      setDraft(null);
      setComposerKey((k) => k + 1);
      await qc.invalidateQueries({ queryKey: ["partner", "coverages"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  if (orgQ.isLoading || covQ.isLoading) {
    return (
      <p className="text-sm text-muted-foreground animate-pulse">
        Loading coverage…
      </p>
    );
  }

  const existing = covQ.data ?? [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl tracking-tight md:text-3xl">
          Coverage
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Same as when we add you as a lead: primary city / area + radius, then
          optional airports. This is how you appear on the network map and match
          jobs.
        </p>
      </div>

      {existing.length > 0 && (
        <section className="rounded-2xl border border-border/60 bg-card p-5 space-y-3">
          <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
            Saved on your organisation
          </p>
          <ul className="space-y-2">
            {existing.map((c, idx) => (
              <li
                key={c.id}
                className="flex items-center gap-2 rounded-xl border border-border/50 bg-background px-3 py-2 text-sm"
              >
                <MapPin className="h-3.5 w-3.5 shrink-0 text-primary" />
                <span className="font-medium">
                  {c.locationName ?? "Zone"}
                  {c.iata ? ` (${c.iata})` : ""}
                </span>
                <span className="ml-auto text-xs text-muted-foreground">
                  {idx === 0 ? "Primary" : "Secondary"}
                  {c.radiusValue != null
                    ? ` · ${c.radiusValue} ${c.radiusUnit ?? "KM"}`
                    : ""}
                </span>
              </li>
            ))}
          </ul>
          <p className="text-[11px] text-muted-foreground">
            Saving below replaces these zones with your new selection.
          </p>
        </section>
      )}

      <section className="rounded-2xl border border-border/60 bg-card p-5 space-y-4">
        <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
          {existing.length > 0 ? "Update coverage" : "Set coverage"}
        </p>
        <CoverageComposer key={composerKey} onChange={setDraft} />
        <Button
          size="lg"
          className="w-full rounded-full"
          disabled={save.isPending || !draft?.primary}
          onClick={() => save.mutate()}
        >
          {save.isPending ? "Saving…" : "Save coverage →"}
        </Button>
      </section>
    </div>
  );
}
