"use client";

import { useState } from "react";
import { Stethoscope } from "lucide-react";
import { Checkbox } from "@/shared/ui/checkbox";
import { Input } from "@/shared/ui/input";
import { Label } from "@/shared/ui/label";
import { PartnerStepNotPersistedBanner } from "./not-persisted-banner";

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

export function ServicesStep() {
  const [services, setServices] = useState<string[]>([]);
  const [regNumber, setRegNumber] = useState("");
  const [cqcRegistered, setCqcRegistered] = useState<"yes" | "no" | "">("");
  const [cqcNumber, setCqcNumber] = useState("");
  const [indemnityProvider, setIndemnityProvider] = useState("");

  function toggleService(value: string) {
    setServices((prev) =>
      prev.includes(value) ? prev.filter((v) => v !== value) : [...prev, value],
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl tracking-tight">Services</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Describe the medical and wellness services you provide.
        </p>
      </div>

      <PartnerStepNotPersistedBanner label="Services" />

      <div className="rounded-2xl border border-border/60 bg-card p-5 shadow-sm space-y-6">
        {/* Services offered */}
        <div className="space-y-2">
          <Label>Services offered</Label>
          <div className="grid gap-2 sm:grid-cols-2">
            {MEDICAL_SERVICES.map((s) => (
              <label
                key={s.value}
                className="flex cursor-pointer items-center gap-2.5 rounded-xl border border-border/60 bg-card/40 px-3 py-2.5 text-sm hover:bg-muted/40 transition-colors"
              >
                <Checkbox
                  checked={services.includes(s.value)}
                  onCheckedChange={() => toggleService(s.value)}
                />
                <span>{s.label}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Regulatory body */}
        <div className="space-y-1.5">
          <Label>Regulatory body registration number</Label>
          <Input
            placeholder="e.g. GMC 1234567"
            value={regNumber}
            onChange={(e) => setRegNumber(e.target.value)}
          />
        </div>

        {/* CQC registration */}
        <div className="space-y-2">
          <Label>CQC registration (UK) or equivalent</Label>
          <div className="flex gap-3">
            {(["yes", "no"] as const).map((v) => (
              <button
                key={v}
                type="button"
                onClick={() => setCqcRegistered(v)}
                className={`flex-1 rounded-full border py-2 text-sm font-medium transition-colors ${
                  cqcRegistered === v
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border text-muted-foreground hover:bg-muted"
                }`}
              >
                {v === "yes" ? "Registered" : "Not applicable"}
              </button>
            ))}
          </div>
          {cqcRegistered === "yes" && (
            <div className="mt-2 space-y-1.5">
              <Label>CQC / registration number</Label>
              <Input
                placeholder="Registration reference"
                value={cqcNumber}
                onChange={(e) => setCqcNumber(e.target.value)}
              />
            </div>
          )}
        </div>

        {/* Indemnity insurance */}
        <div className="space-y-1.5">
          <Label>Indemnity insurance provider</Label>
          <Input
            placeholder="e.g. Medical Protection Society"
            value={indemnityProvider}
            onChange={(e) => setIndemnityProvider(e.target.value)}
          />
        </div>
      </div>
    </div>
  );
}
