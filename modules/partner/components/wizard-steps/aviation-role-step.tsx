"use client";

import { Plane, Network } from "lucide-react";
import { Button } from "@/shared/ui/button";
import { Label } from "@/shared/ui/label";
import { Input } from "@/shared/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/ui/select";
import { InventorySaveBar } from "@/modules/partner/components/wizard-steps/inventory-save-bar";
import { useOnboardingInventoryStep } from "@/modules/partner/hooks/use-onboarding-inventory-step";
import {
  AVIATION_ROLE_STEP_KEY,
  type AviationPartnerRole,
  type AviationRoleInventory,
} from "@/modules/partner/aviation-role";
import { cn } from "@/shared/lib/utils";

const DEFAULTS: AviationRoleInventory = {
  role: "",
  workingModel: "",
  notes: "",
};

const ROLE_OPTIONS: {
  value: AviationPartnerRole;
  title: string;
  blurb: string;
  icon: typeof Plane;
}[] = [
  {
    value: "OPERATOR",
    title: "Direct operator",
    blurb:
      "You hold an AOC (or operate aircraft under your certificate) and declare fleet + rates.",
    icon: Plane,
  },
  {
    value: "BROKER",
    title: "Broker / arranger",
    blurb:
      "You source capacity from operators. No AOC or aircraft declaration required for VL onboarding.",
    icon: Network,
  },
];

export function AviationRoleStep() {
  const { value, setValue, save, isReady } = useOnboardingInventoryStep(
    AVIATION_ROLE_STEP_KEY,
    DEFAULTS,
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl tracking-tight">
          Operator or broker?
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Aviation partners are not all the same. Choose how you work so we ask
          for the right documents and steps.
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        {ROLE_OPTIONS.map((opt) => {
          const Icon = opt.icon;
          const selected = value.role === opt.value;
          return (
            <button
              key={opt.value}
              type="button"
              onClick={() =>
                setValue({
                  ...value,
                  role: opt.value,
                  workingModel:
                    opt.value === "BROKER" ? value.workingModel || "" : "",
                })
              }
              className={cn(
                "rounded-2xl border p-5 text-left transition-colors",
                selected
                  ? "border-primary bg-primary/5 shadow-sm"
                  : "border-border/60 bg-card hover:bg-muted/40",
              )}
            >
              <Icon
                className={cn(
                  "mb-3 h-5 w-5",
                  selected ? "text-primary" : "text-muted-foreground",
                )}
              />
              <p className="font-medium">{opt.title}</p>
              <p className="mt-1 text-xs text-muted-foreground">{opt.blurb}</p>
            </button>
          );
        })}
      </div>

      {value.role === "BROKER" ? (
        <div className="space-y-4 rounded-2xl border border-border/60 bg-card p-5">
          <div className="space-y-1.5">
            <Label>How do you usually work with operators?</Label>
            <Select
              value={value.workingModel || ""}
              onValueChange={(v) =>
                setValue({
                  ...value,
                  workingModel: v as AviationRoleInventory["workingModel"],
                })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select model" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="net_rates">Net rates from operators</SelectItem>
                <SelectItem value="commission">Commission on charter</SelectItem>
                <SelectItem value="both">Both / case by case</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label>Notes (optional)</Label>
            <Input
              placeholder="e.g. Europe + Middle East empty legs"
              value={value.notes ?? ""}
              onChange={(e) =>
                setValue({ ...value, notes: e.target.value })
              }
            />
          </div>
        </div>
      ) : null}

      {value.role === "OPERATOR" ? (
        <p className="text-sm text-muted-foreground">
          Next you will declare aircraft, indicative rates, AOC and aviation
          insurance.
        </p>
      ) : null}

      <InventorySaveBar
        onSave={() => {
          if (!value.role) return;
          save.mutate();
        }}
        isPending={save.isPending}
        disabled={!isReady || !value.role}
      />
    </div>
  );
}
