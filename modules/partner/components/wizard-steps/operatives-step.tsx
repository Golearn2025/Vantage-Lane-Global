"use client";

import { Shield } from "lucide-react";
import { Input } from "@/shared/ui/input";
import { Label } from "@/shared/ui/label";
import { Checkbox } from "@/shared/ui/checkbox";
import { useOnboardingInventoryStep } from "@/modules/partner/hooks/use-onboarding-inventory-step";
import { InventorySaveBar } from "@/modules/partner/components/wizard-steps/inventory-save-bar";

const SIA_CATEGORIES = [
  { value: "close_protection", label: "Close Protection" },
  { value: "door_supervision", label: "Door Supervision" },
  { value: "security_guarding", label: "Security Guarding" },
  { value: "cctv_pss", label: "CCTV / PSS" },
];

const UK_REGIONS = [
  "London",
  "South East",
  "South West",
  "Midlands",
  "North West",
  "North East",
  "Yorkshire",
  "Scotland",
  "Wales",
  "Northern Ireland",
  "International",
];

type OperativesInventory = {
  totalOperatives: string;
  siaCategories: string[];
  bs7858: "yes" | "no" | "";
  acsApproved: "yes" | "no" | "";
  acsNumber: string;
  areas: string[];
};

const DEFAULTS: OperativesInventory = {
  totalOperatives: "",
  siaCategories: [],
  bs7858: "",
  acsApproved: "",
  acsNumber: "",
  areas: [],
};

export function OperativesStep() {
  const { value, setValue, save, isReady } = useOnboardingInventoryStep(
    "operatives",
    DEFAULTS,
  );

  function toggleSia(code: string) {
    setValue({
      ...value,
      siaCategories: value.siaCategories.includes(code)
        ? value.siaCategories.filter((v) => v !== code)
        : [...value.siaCategories, code],
    });
  }

  function toggleArea(region: string) {
    setValue({
      ...value,
      areas: value.areas.includes(region)
        ? value.areas.filter((v) => v !== region)
        : [...value.areas, region],
    });
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl tracking-tight">Operatives</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Provide details about your licensed security operatives and
          accreditations.
        </p>
      </div>

      <div className="rounded-2xl border border-border/60 bg-card p-5 shadow-sm space-y-5">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Shield className="h-4 w-4" />
          UK Security declaration
        </div>

        <div className="space-y-1.5">
          <Label>Total number of licensed operatives</Label>
          <Input
            inputMode="numeric"
            placeholder="e.g. 24"
            value={value.totalOperatives}
            onChange={(e) =>
              setValue({ ...value, totalOperatives: e.target.value })
            }
          />
        </div>

        <div className="space-y-2">
          <Label>SIA licence categories held</Label>
          <div className="grid gap-2 sm:grid-cols-2">
            {SIA_CATEGORIES.map((cat) => (
              <label
                key={cat.value}
                className="flex cursor-pointer items-center gap-2.5 rounded-xl border border-border/60 bg-card/40 px-3 py-2.5 text-sm hover:bg-muted/40 transition-colors"
              >
                <Checkbox
                  checked={value.siaCategories.includes(cat.value)}
                  onCheckedChange={() => toggleSia(cat.value)}
                />
                <span>{cat.label}</span>
              </label>
            ))}
          </div>
        </div>

        <div className="space-y-1.5">
          <Label>BS7858 screening compliance</Label>
          <div className="flex gap-3">
            {(["yes", "no"] as const).map((v) => (
              <button
                key={v}
                type="button"
                onClick={() => setValue({ ...value, bs7858: v })}
                className={`flex-1 rounded-full border py-2 text-sm font-medium transition-colors ${
                  value.bs7858 === v
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border text-muted-foreground hover:bg-muted"
                }`}
              >
                {v === "yes" ? "Compliant" : "Not yet"}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-1.5">
          <Label>ACS approved (Approved Contractor Scheme)</Label>
          <div className="flex gap-3">
            {(["yes", "no"] as const).map((v) => (
              <button
                key={v}
                type="button"
                onClick={() => setValue({ ...value, acsApproved: v })}
                className={`flex-1 rounded-full border py-2 text-sm font-medium transition-colors ${
                  value.acsApproved === v
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border text-muted-foreground hover:bg-muted"
                }`}
              >
                {v === "yes" ? "Yes" : "No"}
              </button>
            ))}
          </div>
          {value.acsApproved === "yes" && (
            <div className="mt-2 space-y-1.5">
              <Label>ACS number</Label>
              <Input
                placeholder="ACS reference number"
                value={value.acsNumber}
                onChange={(e) =>
                  setValue({ ...value, acsNumber: e.target.value })
                }
              />
            </div>
          )}
        </div>

        <div className="space-y-2">
          <Label>Areas of operation</Label>
          <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {UK_REGIONS.map((region) => (
              <label
                key={region}
                className="flex cursor-pointer items-center gap-2.5 rounded-xl border border-border/60 bg-card/40 px-3 py-2.5 text-sm hover:bg-muted/40 transition-colors"
              >
                <Checkbox
                  checked={value.areas.includes(region)}
                  onCheckedChange={() => toggleArea(region)}
                />
                <span>{region}</span>
              </label>
            ))}
          </div>
        </div>
      </div>

      <InventorySaveBar
        onSave={() => save.mutate()}
        isPending={save.isPending}
        disabled={!isReady}
      />
    </div>
  );
}
