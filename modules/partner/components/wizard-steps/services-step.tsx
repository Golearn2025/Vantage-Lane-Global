"use client";

import { Checkbox } from "@/shared/ui/checkbox";
import { Input } from "@/shared/ui/input";
import { Label } from "@/shared/ui/label";
import { useOnboardingInventoryStep } from "@/modules/partner/hooks/use-onboarding-inventory-step";
import { InventorySaveBar } from "@/modules/partner/components/wizard-steps/inventory-save-bar";

const MEDICAL_SERVICES = [
  { value: "medical_escort", label: "Medical escort & accompaniment" },
  { value: "gp_on_call", label: "GP / Doctor on call" },
  { value: "emergency_response", label: "Emergency response" },
  { value: "aesthetics_wellness", label: "Aesthetics & wellness" },
  { value: "psychological_support", label: "Psychological support" },
  { value: "dental", label: "Dental" },
  { value: "physiotherapy", label: "Physiotherapy" },
  { value: "wellness_retreat", label: "Wellness retreat coordination" },
];

type ServicesInventory = {
  services: string[];
  regNumber: string;
  cqcRegistered: "yes" | "no" | "";
  cqcNumber: string;
  indemnityProvider: string;
};

const DEFAULTS: ServicesInventory = {
  services: [],
  regNumber: "",
  cqcRegistered: "",
  cqcNumber: "",
  indemnityProvider: "",
};

export function ServicesStep() {
  const { value, setValue, save, isReady } = useOnboardingInventoryStep(
    "services",
    DEFAULTS,
  );

  function toggleService(code: string) {
    setValue({
      ...value,
      services: value.services.includes(code)
        ? value.services.filter((v) => v !== code)
        : [...value.services, code],
    });
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl tracking-tight">Services</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Describe the medical and wellness services you provide.
        </p>
      </div>

      <div className="rounded-2xl border border-border/60 bg-card p-5 shadow-sm space-y-6">
        <div className="space-y-2">
          <Label>Services offered</Label>
          <div className="grid gap-2 sm:grid-cols-2">
            {MEDICAL_SERVICES.map((s) => (
              <label
                key={s.value}
                className="flex cursor-pointer items-center gap-2.5 rounded-xl border border-border/60 bg-card/40 px-3 py-2.5 text-sm hover:bg-muted/40 transition-colors"
              >
                <Checkbox
                  checked={value.services.includes(s.value)}
                  onCheckedChange={() => toggleService(s.value)}
                />
                <span>{s.label}</span>
              </label>
            ))}
          </div>
        </div>

        <div className="space-y-1.5">
          <Label>Regulatory body registration number</Label>
          <Input
            placeholder="e.g. GMC 1234567"
            value={value.regNumber}
            onChange={(e) => setValue({ ...value, regNumber: e.target.value })}
          />
        </div>

        <div className="space-y-2">
          <Label>CQC registration (UK) or equivalent</Label>
          <div className="flex gap-3">
            {(["yes", "no"] as const).map((v) => (
              <button
                key={v}
                type="button"
                onClick={() => setValue({ ...value, cqcRegistered: v })}
                className={`flex-1 rounded-full border py-2 text-sm font-medium transition-colors ${
                  value.cqcRegistered === v
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border text-muted-foreground hover:bg-muted"
                }`}
              >
                {v === "yes" ? "Registered" : "Not applicable"}
              </button>
            ))}
          </div>
          {value.cqcRegistered === "yes" && (
            <div className="mt-2 space-y-1.5">
              <Label>CQC / registration number</Label>
              <Input
                placeholder="Registration reference"
                value={value.cqcNumber}
                onChange={(e) =>
                  setValue({ ...value, cqcNumber: e.target.value })
                }
              />
            </div>
          )}
        </div>

        <div className="space-y-1.5">
          <Label>Indemnity insurance provider</Label>
          <Input
            placeholder="e.g. Medical Protection Society"
            value={value.indemnityProvider}
            onChange={(e) =>
              setValue({ ...value, indemnityProvider: e.target.value })
            }
          />
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
