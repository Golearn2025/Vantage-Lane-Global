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
          "First search your city and tap a result from the list",
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
  const hasPrimary = Boolean(draft?.primary);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl tracking-tight md:text-3xl">
          Coverage
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Tell us where you operate so we can match jobs near you. Same idea as
          when we add partners on our side.
        </p>
      </div>

      <ol className="space-y-2 rounded-2xl border border-border/60 bg-muted/30 px-4 py-4 text-sm">
        <li>
          <span className="font-semibold text-foreground">1. City</span>
          <span className="text-muted-foreground">
            {" "}
            — search your main city, then <strong>tap a suggestion</strong>{" "}
            (typing alone does nothing).
          </span>
        </li>
        <li>
          <span className="font-semibold text-foreground">2. Radius</span>
          <span className="text-muted-foreground">
            {" "}
            — after the city is selected, set how far you cover on the map
            (km).
          </span>
        </li>
        <li>
          <span className="font-semibold text-foreground">3. Airports</span>
          <span className="text-muted-foreground">
            {" "}
            — optionally add airports (LGW, LHR…) the same way, then{" "}
            <strong>Save coverage</strong>.
          </span>
        </li>
      </ol>

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
        <CoverageComposer
          key={composerKey}
          audience="partner"
          onChange={setDraft}
        />
        <Button
          size="lg"
          className="w-full rounded-full"
          disabled={save.isPending || !hasPrimary}
          onClick={() => save.mutate()}
        >
          {save.isPending
            ? "Saving…"
            : hasPrimary
              ? "Save coverage →"
              : "Select a city first (tap a result)"}
        </Button>
        {!hasPrimary ? (
          <p className="text-center text-[11px] text-muted-foreground">
            The Save button unlocks after you tap a city from the search
            suggestions.
          </p>
        ) : (
          <p className="text-center text-[11px] text-muted-foreground">
            Adjust radius and optional airports above, then save.
          </p>
        )}
      </section>
    </div>
  );
}
