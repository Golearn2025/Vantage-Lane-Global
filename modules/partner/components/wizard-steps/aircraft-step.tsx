"use client";

import { useState } from "react";
import { Plus, Trash2, PlaneTakeoff } from "lucide-react";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { Label } from "@/shared/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/ui/select";

import { PartnerStepNotPersistedBanner } from "./not-persisted-banner";

type Aircraft = {
  id: string;
  type: string;
  tailNumber: string;
  aocNumber: string;
  baseAirport: string;
  passengerCapacity: string;
  yearOfManufacture: string;
};

const AIRCRAFT_TYPES = [
  "Light Jet",
  "Midsize Jet",
  "Super Midsize",
  "Heavy Jet",
  "Ultra Long Range",
  "Turboprop",
  "Helicopter",
];

function newAircraft(): Aircraft {
  return {
    id: crypto.randomUUID(),
    type: "",
    tailNumber: "",
    aocNumber: "",
    baseAirport: "",
    passengerCapacity: "",
    yearOfManufacture: "",
  };
}

export function AircraftStep() {
  const [aircraft, setAircraft] = useState<Aircraft[]>([newAircraft()]);

  function update(id: string, field: keyof Aircraft, value: string) {
    setAircraft((prev) =>
      prev.map((a) => (a.id === id ? { ...a, [field]: value } : a)),
    );
  }

  function remove(id: string) {
    setAircraft((prev) => prev.filter((a) => a.id !== id));
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl tracking-tight">Aircraft</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Declare the aircraft available in your fleet. Each aircraft must have
          a valid AOC.
        </p>
      </div>

      <PartnerStepNotPersistedBanner label="Aircraft" />

      <div className="space-y-4">
        {aircraft.map((a, idx) => (
          <div
            key={a.id}
            className="rounded-2xl border border-border/60 bg-card p-4 shadow-sm space-y-4"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <PlaneTakeoff className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">
                  Aircraft {idx + 1}
                </span>
              </div>
              {aircraft.length > 1 && (
                <button
                  type="button"
                  onClick={() => remove(a.id)}
                  className="text-muted-foreground hover:text-destructive transition-colors"
                  aria-label="Remove aircraft"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              )}
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label>Aircraft type</Label>
                <Select
                  value={a.type}
                  onValueChange={(v) => update(a.id, "type", v)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    {AIRCRAFT_TYPES.map((t) => (
                      <SelectItem key={t} value={t}>
                        {t}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label>Tail number</Label>
                <Input
                  placeholder="e.g. G-VLFJ"
                  value={a.tailNumber}
                  onChange={(e) => update(a.id, "tailNumber", e.target.value)}
                />
              </div>

              <div className="space-y-1.5">
                <Label>AOC / Air Operator Certificate number</Label>
                <Input
                  placeholder="AOC reference"
                  value={a.aocNumber}
                  onChange={(e) => update(a.id, "aocNumber", e.target.value)}
                />
              </div>

              <div className="space-y-1.5">
                <Label>Base airport / FBO (ICAO)</Label>
                <Input
                  placeholder="e.g. EGLL"
                  value={a.baseAirport}
                  onChange={(e) => update(a.id, "baseAirport", e.target.value)}
                />
              </div>

              <div className="space-y-1.5">
                <Label>Passenger capacity</Label>
                <Input
                  inputMode="numeric"
                  placeholder="e.g. 8"
                  value={a.passengerCapacity}
                  onChange={(e) =>
                    update(a.id, "passengerCapacity", e.target.value)
                  }
                />
              </div>

              <div className="space-y-1.5">
                <Label>Year of manufacture</Label>
                <Input
                  inputMode="numeric"
                  placeholder="e.g. 2019"
                  value={a.yearOfManufacture}
                  onChange={(e) =>
                    update(a.id, "yearOfManufacture", e.target.value)
                  }
                />
              </div>
            </div>
          </div>
        ))}
      </div>

      <Button
        type="button"
        variant="outline"
        className="w-full rounded-full gap-2"
        onClick={() => setAircraft((prev) => [...prev, newAircraft()])}
      >
        <Plus className="h-4 w-4" />
        Add another aircraft
      </Button>
    </div>
  );
}
