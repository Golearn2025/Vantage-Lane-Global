"use client";

import { useState } from "react";
import { Shield } from "lucide-react";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { Label } from "@/shared/ui/label";
import { Checkbox } from "@/shared/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/ui/select";
import { PartnerStepNotPersistedBanner } from "./not-persisted-banner";

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

export function OperativesStep() {
  const [totalOperatives, setTotalOperatives] = useState("");
  const [siaCategories, setSiaCategories] = useState<string[]>([]);
  const [bs7858, setBs7858] = useState<"yes" | "no" | "">("");
  const [acsApproved, setAcsApproved] = useState<"yes" | "no" | "">("");
  const [acsNumber, setAcsNumber] = useState("");
  const [areas, setAreas] = useState<string[]>([]);

  function toggleSia(value: string) {
    setSiaCategories((prev) =>
      prev.includes(value) ? prev.filter((v) => v !== value) : [...prev, value],
    );
  }

  function toggleArea(value: string) {
    setAreas((prev) =>
      prev.includes(value) ? prev.filter((v) => v !== value) : [...prev, value],
    );
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

      <PartnerStepNotPersistedBanner label="Operatives" />

      <div className="rounded-2xl border border-border/60 bg-card p-5 shadow-sm space-y-5">
        {/* Total operatives */}
        <div className="space-y-1.5">
          <Label>Total number of licensed operatives</Label>
          <Input
            inputMode="numeric"
            placeholder="e.g. 24"
            value={totalOperatives}
            onChange={(e) => setTotalOperatives(e.target.value)}
          />
        </div>

        {/* SIA licence categories */}
        <div className="space-y-2">
          <Label>SIA licence categories held</Label>
          <div className="grid gap-2 sm:grid-cols-2">
            {SIA_CATEGORIES.map((cat) => (
              <label
                key={cat.value}
                className="flex cursor-pointer items-center gap-2.5 rounded-xl border border-border/60 bg-card/40 px-3 py-2.5 text-sm hover:bg-muted/40 transition-colors"
              >
                <Checkbox
                  checked={siaCategories.includes(cat.value)}
                  onCheckedChange={() => toggleSia(cat.value)}
                />
                <span>{cat.label}</span>
              </label>
            ))}
          </div>
        </div>

        {/* BS7858 screening */}
        <div className="space-y-1.5">
          <Label>BS7858 screening compliance</Label>
          <div className="flex gap-3">
            {(["yes", "no"] as const).map((v) => (
              <button
                key={v}
                type="button"
                onClick={() => setBs7858(v)}
                className={`flex-1 rounded-full border py-2 text-sm font-medium transition-colors ${
                  bs7858 === v
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border text-muted-foreground hover:bg-muted"
                }`}
              >
                {v === "yes" ? "Compliant" : "Not yet"}
              </button>
            ))}
          </div>
        </div>

        {/* ACS approved */}
        <div className="space-y-1.5">
          <Label>ACS approved (Approved Contractor Scheme)</Label>
          <div className="flex gap-3">
            {(["yes", "no"] as const).map((v) => (
              <button
                key={v}
                type="button"
                onClick={() => setAcsApproved(v)}
                className={`flex-1 rounded-full border py-2 text-sm font-medium transition-colors ${
                  acsApproved === v
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border text-muted-foreground hover:bg-muted"
                }`}
              >
                {v === "yes" ? "Yes" : "No"}
              </button>
            ))}
          </div>
          {acsApproved === "yes" && (
            <div className="mt-2 space-y-1.5">
              <Label>ACS number</Label>
              <Input
                placeholder="ACS reference number"
                value={acsNumber}
                onChange={(e) => setAcsNumber(e.target.value)}
              />
            </div>
          )}
        </div>

        {/* Areas of operation */}
        <div className="space-y-2">
          <Label>Areas of operation</Label>
          <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {UK_REGIONS.map((region) => (
              <label
                key={region}
                className="flex cursor-pointer items-center gap-2.5 rounded-xl border border-border/60 bg-card/40 px-3 py-2.5 text-sm hover:bg-muted/40 transition-colors"
              >
                <Checkbox
                  checked={areas.includes(region)}
                  onCheckedChange={() => toggleArea(region)}
                />
                <span>{region}</span>
              </label>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
