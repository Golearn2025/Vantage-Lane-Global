"use client";

import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Plus, Shield, Trash2 } from "lucide-react";
import { toast } from "sonner";
import {
  archiveSecurityDeclaration,
  fetchPartnerOrgContext,
  fetchSecurityDeclarations,
  fetchSecurityServiceLines,
  upsertSecurityDeclaration,
  type SecurityServiceLine,
} from "@/modules/partner/api";
import { Button } from "@/shared/ui/button";
import { Checkbox } from "@/shared/ui/checkbox";
import { Input } from "@/shared/ui/input";
import { Label } from "@/shared/ui/label";

function displayName(line: SecurityServiceLine, customLabel: string | null) {
  if (line.allowsCustomLabel && customLabel?.trim()) return customLabel.trim();
  return line.name;
}

export function SecurityServicesStep() {
  const qc = useQueryClient();
  const orgQ = useQuery({
    queryKey: ["partner", "org"],
    queryFn: fetchPartnerOrgContext,
  });
  const linesQ = useQuery({
    queryKey: ["partner", "security-lines"],
    queryFn: fetchSecurityServiceLines,
  });
  const declsQ = useQuery({
    queryKey: ["partner", "security-declarations", orgQ.data?.organizationId],
    enabled: Boolean(orgQ.data),
    queryFn: () =>
      fetchSecurityDeclarations(
        orgQ.data!.organizationId,
        orgQ.data!.offeringId,
      ),
  });

  const [customDraft, setCustomDraft] = useState("");
  const [pendingLineIds, setPendingLineIds] = useState<Set<string> | null>(
    null,
  );

  const catalogLines = useMemo(
    () => (linesQ.data ?? []).filter((l) => !l.allowsCustomLabel),
    [linesQ.data],
  );
  const otherLine = useMemo(
    () => (linesQ.data ?? []).find((l) => l.allowsCustomLabel) ?? null,
    [linesQ.data],
  );

  const selectedLineIds = useMemo(() => {
    if (pendingLineIds) return pendingLineIds;
    const set = new Set<string>();
    for (const d of declsQ.data ?? []) {
      if (!d.allowsCustomLabel) set.add(d.serviceLineId);
    }
    return set;
  }, [pendingLineIds, declsQ.data]);

  const customDecls = useMemo(
    () => (declsQ.data ?? []).filter((d) => d.allowsCustomLabel),
    [declsQ.data],
  );

  const saveSelection = useMutation({
    mutationFn: async (nextIds: Set<string>) => {
      if (!orgQ.data) throw new Error("No organisation");
      const existing = declsQ.data ?? [];
      const existingByLine = new Map(
        existing
          .filter((d) => !d.allowsCustomLabel)
          .map((d) => [d.serviceLineId, d]),
      );

      for (const lineId of nextIds) {
        if (!existingByLine.has(lineId)) {
          await upsertSecurityDeclaration({
            organizationId: orgQ.data.organizationId,
            offeringId: orgQ.data.offeringId,
            serviceLineId: lineId,
          });
        }
      }
      for (const [lineId, decl] of existingByLine) {
        if (!nextIds.has(lineId)) {
          await archiveSecurityDeclaration(decl.id);
        }
      }
    },
    onSuccess: async () => {
      setPendingLineIds(null);
      toast.success("Services saved");
      await qc.invalidateQueries({
        queryKey: ["partner", "security-declarations"],
      });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const addCustom = useMutation({
    mutationFn: async () => {
      if (!orgQ.data || !otherLine) throw new Error("Catalog not ready");
      const label = customDraft.trim();
      if (!label) throw new Error("Enter a label for your custom service");
      await upsertSecurityDeclaration({
        organizationId: orgQ.data.organizationId,
        offeringId: orgQ.data.offeringId,
        serviceLineId: otherLine.id,
        customLabel: label,
      });
    },
    onSuccess: async () => {
      setCustomDraft("");
      toast.success("Custom service added");
      await qc.invalidateQueries({
        queryKey: ["partner", "security-declarations"],
      });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const removeCustom = useMutation({
    mutationFn: (declarationId: string) =>
      archiveSecurityDeclaration(declarationId),
    onSuccess: async () => {
      toast.success("Removed");
      await qc.invalidateQueries({
        queryKey: ["partner", "security-declarations"],
      });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  function toggleLine(lineId: string) {
    const next = new Set(selectedLineIds);
    if (next.has(lineId)) next.delete(lineId);
    else next.add(lineId);
    setPendingLineIds(next);
  }

  const busy =
    saveSelection.isPending || addCustom.isPending || removeCustom.isPending;

  if (orgQ.isLoading || linesQ.isLoading || declsQ.isLoading) {
    return (
      <p className="animate-pulse text-sm text-muted-foreground">
        Loading services…
      </p>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl tracking-tight">
          Services offered
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Select the security services you sell. Add a custom line if something
          is missing (residential for HNW homes, clubs, restaurants, etc.).
        </p>
      </div>

      <div className="space-y-2 rounded-2xl border border-border/60 bg-card p-5 shadow-sm">
        <div className="mb-2 flex items-center gap-2 text-sm text-muted-foreground">
          <Shield className="h-4 w-4" />
          VL catalog
        </div>
        <div className="grid gap-2 sm:grid-cols-2">
          {catalogLines.map((line) => (
            <label
              key={line.id}
              className="flex cursor-pointer items-start gap-2.5 rounded-xl border border-border/60 bg-card/40 px-3 py-2.5 text-sm hover:bg-muted/40 transition-colors"
            >
              <Checkbox
                className="mt-0.5"
                checked={selectedLineIds.has(line.id)}
                onCheckedChange={() => toggleLine(line.id)}
                disabled={busy}
              />
              <span>
                <span className="font-medium">{line.name}</span>
                {line.description ? (
                  <span className="mt-0.5 block text-xs text-muted-foreground">
                    {line.description}
                  </span>
                ) : null}
              </span>
            </label>
          ))}
        </div>

        <Button
          type="button"
          className="mt-4 w-full rounded-full"
          disabled={busy || pendingLineIds == null}
          onClick={() => saveSelection.mutate(selectedLineIds)}
        >
          {saveSelection.isPending ? "Saving…" : "Save selected services →"}
        </Button>
      </div>

      <div className="space-y-4 rounded-2xl border border-border/60 bg-card p-5 shadow-sm">
        <div>
          <h2 className="text-sm font-medium">Other / custom</h2>
          <p className="mt-0.5 text-xs text-muted-foreground">
            e.g. “Residential CP — Mayfair townhouses”, “Members’ club door”.
          </p>
        </div>

        {customDecls.length > 0 ? (
          <ul className="space-y-2">
            {customDecls.map((d) => (
              <li
                key={d.id}
                className="flex items-center justify-between gap-3 rounded-xl border border-border/60 px-3 py-2.5 text-sm"
              >
                <span className="font-medium">
                  {d.customLabel ?? displayName(
                    {
                      id: d.serviceLineId,
                      code: d.lineCode,
                      name: d.lineName,
                      description: null,
                      allowedUnits: d.allowedUnits,
                      sortOrder: 0,
                      allowsCustomLabel: true,
                    },
                    d.customLabel,
                  )}
                </span>
                <button
                  type="button"
                  className="text-muted-foreground hover:text-destructive"
                  disabled={busy}
                  onClick={() => removeCustom.mutate(d.id)}
                  aria-label="Remove custom service"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </li>
            ))}
          </ul>
        ) : null}

        <div className="flex flex-col gap-2 sm:flex-row">
          <div className="flex-1 space-y-1.5">
            <Label htmlFor="custom-security-service">Custom service label</Label>
            <Input
              id="custom-security-service"
              value={customDraft}
              onChange={(e) => setCustomDraft(e.target.value)}
              placeholder="Describe the service you offer"
              disabled={busy || !otherLine}
            />
          </div>
          <Button
            type="button"
            variant="outline"
            className="mt-auto rounded-full gap-2"
            disabled={busy || !otherLine || !customDraft.trim()}
            onClick={() => addCustom.mutate()}
          >
            <Plus className="h-4 w-4" />
            Add
          </Button>
        </div>
      </div>
    </div>
  );
}
