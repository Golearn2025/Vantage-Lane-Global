"use client";

import { useState } from "react";
import { X } from "lucide-react";
import { Checkbox } from "@/shared/ui/checkbox";
import { Input } from "@/shared/ui/input";
import { Label } from "@/shared/ui/label";
import { PartnerStepNotPersistedBanner } from "./not-persisted-banner";

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

export function CapabilitiesStep() {
  const [eventTypes, setEventTypes] = useState<string[]>([]);
  const [maxCapacity, setMaxCapacity] = useState("");
  const [countryInput, setCountryInput] = useState("");
  const [countries, setCountries] = useState<string[]>([]);
  const [diplomaticExperience, setDiplomaticExperience] = useState<
    "yes" | "no" | ""
  >("");
  const [inHouseProduction, setInHouseProduction] = useState<
    "yes" | "no" | ""
  >("");

  function toggleEvent(value: string) {
    setEventTypes((prev) =>
      prev.includes(value) ? prev.filter((v) => v !== value) : [...prev, value],
    );
  }

  function toggleCountry(value: string) {
    setCountries((prev) =>
      prev.includes(value) ? prev.filter((v) => v !== value) : [...prev, value],
    );
  }

  function addCustomCountry() {
    const t = countryInput.trim();
    if (t && !countries.includes(t)) {
      setCountries((prev) => [...prev, t]);
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

      <PartnerStepNotPersistedBanner label="Capabilities" />

      <div className="rounded-2xl border border-border/60 bg-card p-5 shadow-sm space-y-6">
        {/* Event types */}
        <div className="space-y-2">
          <Label>Event types</Label>
          <div className="grid gap-2 sm:grid-cols-2">
            {EVENT_TYPES.map((e) => (
              <label
                key={e.value}
                className="flex cursor-pointer items-center gap-2.5 rounded-xl border border-border/60 bg-card/40 px-3 py-2.5 text-sm hover:bg-muted/40 transition-colors"
              >
                <Checkbox
                  checked={eventTypes.includes(e.value)}
                  onCheckedChange={() => toggleEvent(e.value)}
                />
                <span>{e.label}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Max capacity */}
        <div className="space-y-1.5">
          <Label>Maximum event capacity</Label>
          <Input
            inputMode="numeric"
            placeholder="e.g. 500"
            value={maxCapacity}
            onChange={(e) => setMaxCapacity(e.target.value)}
          />
        </div>

        {/* Countries */}
        <div className="space-y-2">
          <Label>Countries of operation</Label>
          <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {COUNTRIES.map((c) => (
              <label
                key={c}
                className="flex cursor-pointer items-center gap-2.5 rounded-xl border border-border/60 bg-card/40 px-3 py-2.5 text-sm hover:bg-muted/40 transition-colors"
              >
                <Checkbox
                  checked={countries.includes(c)}
                  onCheckedChange={() => toggleCountry(c)}
                />
                <span>{c}</span>
              </label>
            ))}
          </div>
          {/* Custom country input */}
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
          {countries.filter((c) => !COUNTRIES.includes(c)).length > 0 && (
            <div className="mt-2 flex flex-wrap gap-2">
              {countries
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

        {/* Diplomatic experience */}
        <div className="space-y-2">
          <Label>Diplomatic / protocol experience</Label>
          <div className="flex gap-3">
            {(["yes", "no"] as const).map((v) => (
              <button
                key={v}
                type="button"
                onClick={() => setDiplomaticExperience(v)}
                className={`flex-1 rounded-full border py-2 text-sm font-medium transition-colors ${
                  diplomaticExperience === v
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border text-muted-foreground hover:bg-muted"
                }`}
              >
                {v === "yes" ? "Yes" : "No"}
              </button>
            ))}
          </div>
        </div>

        {/* In-house production */}
        <div className="space-y-2">
          <Label>In-house production (AV, staging, etc.)</Label>
          <div className="flex gap-3">
            {(["yes", "no"] as const).map((v) => (
              <button
                key={v}
                type="button"
                onClick={() => setInHouseProduction(v)}
                className={`flex-1 rounded-full border py-2 text-sm font-medium transition-colors ${
                  inHouseProduction === v
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
    </div>
  );
}
