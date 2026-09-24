"use client";

import { useState } from "react";
import { X } from "lucide-react";
import { Checkbox } from "@/shared/ui/checkbox";
import { Input } from "@/shared/ui/input";
import { Label } from "@/shared/ui/label";
import { useOnboardingInventoryStep } from "@/modules/partner/hooks/use-onboarding-inventory-step";
import { InventorySaveBar } from "@/modules/partner/components/wizard-steps/inventory-save-bar";

const EVENT_TYPES = [
  { value: "corporate_conferences", label: "Corporate conferences & summits" },
  { value: "gala_dinners", label: "Gala dinners & award ceremonies" },
  { value: "private_celebrations", label: "Private celebrations & parties" },
  { value: "diplomatic", label: "Diplomatic & protocol events" },
  { value: "product_launches", label: "Product launches & brand activations" },
  { value: "vip_private", label: "VIP / UHNW private events" },
];

const COUNTRIES = [
  "United Kingdom",
  "France",
  "Germany",
  "Italy",
  "Spain",
  "Switzerland",
  "UAE",
  "Saudi Arabia",
  "USA",
  "Monaco",
  "Singapore",
  "Hong Kong",
];

type CapabilitiesInventory = {
  eventTypes: string[];
  maxCapacity: string;
  countries: string[];
  diplomaticExperience: "yes" | "no" | "";
  inHouseProduction: "yes" | "no" | "";
};

const DEFAULTS: CapabilitiesInventory = {
  eventTypes: [],
  maxCapacity: "",
  countries: [],
  diplomaticExperience: "",
  inHouseProduction: "",
};

export function CapabilitiesStep() {
  const { value, setValue, save, isReady } = useOnboardingInventoryStep(
    "capabilities",
    DEFAULTS,
  );
  const [countryInput, setCountryInput] = useState("");

  function toggleEvent(code: string) {
    setValue({
      ...value,
      eventTypes: value.eventTypes.includes(code)
        ? value.eventTypes.filter((v) => v !== code)
        : [...value.eventTypes, code],
    });
  }

  function toggleCountry(name: string) {
    setValue({
      ...value,
      countries: value.countries.includes(name)
        ? value.countries.filter((v) => v !== name)
        : [...value.countries, name],
    });
  }

  function addCustomCountry() {
    const t = countryInput.trim();
    if (t && !value.countries.includes(t)) {
      setValue({ ...value, countries: [...value.countries, t] });
    }
    setCountryInput("");
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl tracking-tight">Capabilities</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Tell us about your events capabilities and global reach.
        </p>
      </div>

      <div className="rounded-2xl border border-border/60 bg-card p-5 shadow-sm space-y-6">
        <div className="space-y-2">
          <Label>Event types</Label>
          <div className="grid gap-2 sm:grid-cols-2">
            {EVENT_TYPES.map((e) => (
              <label
                key={e.value}
                className="flex cursor-pointer items-center gap-2.5 rounded-xl border border-border/60 bg-card/40 px-3 py-2.5 text-sm hover:bg-muted/40 transition-colors"
              >
                <Checkbox
                  checked={value.eventTypes.includes(e.value)}
                  onCheckedChange={() => toggleEvent(e.value)}
                />
                <span>{e.label}</span>
              </label>
            ))}
          </div>
        </div>

        <div className="space-y-1.5">
          <Label>Maximum event capacity</Label>
          <Input
            inputMode="numeric"
            placeholder="e.g. 500"
            value={value.maxCapacity}
            onChange={(e) =>
              setValue({ ...value, maxCapacity: e.target.value })
            }
          />
        </div>

        <div className="space-y-2">
          <Label>Countries of operation</Label>
          <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {COUNTRIES.map((c) => (
              <label
                key={c}
                className="flex cursor-pointer items-center gap-2.5 rounded-xl border border-border/60 bg-card/40 px-3 py-2.5 text-sm hover:bg-muted/40 transition-colors"
              >
                <Checkbox
                  checked={value.countries.includes(c)}
                  onCheckedChange={() => toggleCountry(c)}
                />
                <span>{c}</span>
              </label>
            ))}
          </div>
          <div className="mt-2 flex gap-2">
            <Input
              placeholder="Add another country…"
              value={countryInput}
              onChange={(e) => setCountryInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  addCustomCountry();
                }
              }}
            />
          </div>
          {value.countries.filter((c) => !COUNTRIES.includes(c)).length > 0 && (
            <div className="mt-2 flex flex-wrap gap-2">
              {value.countries
                .filter((c) => !COUNTRIES.includes(c))
                .map((c) => (
                  <span
                    key={c}
                    className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary"
                  >
                    {c}
                    <button
                      type="button"
                      onClick={() => toggleCountry(c)}
                      className="hover:text-destructive transition-colors"
                      aria-label={`Remove ${c}`}
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                ))}
            </div>
          )}
        </div>

        <div className="space-y-2">
          <Label>Diplomatic / protocol experience</Label>
          <div className="flex gap-3">
            {(["yes", "no"] as const).map((v) => (
              <button
                key={v}
                type="button"
                onClick={() =>
                  setValue({ ...value, diplomaticExperience: v })
                }
                className={`flex-1 rounded-full border py-2 text-sm font-medium transition-colors ${
                  value.diplomaticExperience === v
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border text-muted-foreground hover:bg-muted"
                }`}
              >
                {v === "yes" ? "Yes" : "No"}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <Label>In-house production (AV, staging, etc.)</Label>
          <div className="flex gap-3">
            {(["yes", "no"] as const).map((v) => (
              <button
                key={v}
                type="button"
                onClick={() => setValue({ ...value, inHouseProduction: v })}
                className={`flex-1 rounded-full border py-2 text-sm font-medium transition-colors ${
                  value.inHouseProduction === v
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border text-muted-foreground hover:bg-muted"
                }`}
              >
                {v === "yes" ? "Yes" : "No"}
              </button>
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
