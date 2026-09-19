"use client";

import { useState } from "react";
import { Plus, Trash2, Anchor } from "lucide-react";
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

type Vessel = {
  id: string;
  name: string;
  type: string;
  lengthMeters: string;
  guestCapacityDay: string;
  guestCapacityOvernight: string;
  flagState: string;
  homePort: string;
  buildYear: string;
};

const VESSEL_TYPES = [
  "Motor Yacht",
  "Sailing Yacht",
  "Catamaran",
  "Superyacht",
  "Tender",
  "RIB",
];

function newVessel(): Vessel {
  return {
    id: crypto.randomUUID(),
    name: "",
    type: "",
    lengthMeters: "",
    guestCapacityDay: "",
    guestCapacityOvernight: "",
    flagState: "",
    homePort: "",
    buildYear: "",
  };
}

export function VesselsStep() {
  const [vessels, setVessels] = useState<Vessel[]>([newVessel()]);

  function update(id: string, field: keyof Vessel, value: string) {
    setVessels((prev) =>
      prev.map((v) => (v.id === id ? { ...v, [field]: value } : v)),
    );
  }

  function remove(id: string) {
    setVessels((prev) => prev.filter((v) => v.id !== id));
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl tracking-tight">Vessels</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Declare the yachts and vessels available for charter or use.
        </p>
      </div>

      <div className="space-y-4">
        {vessels.map((v, idx) => (
          <div
            key={v.id}
            className="rounded-2xl border border-border/60 bg-card p-5 shadow-sm space-y-4"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Anchor className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">Vessel {idx + 1}</span>
              </div>
              {vessels.length > 1 && (
                <button
                  type="button"
                  onClick={() => remove(v.id)}
                  className="text-muted-foreground hover:text-destructive transition-colors"
                  aria-label="Remove vessel"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              )}
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label>Vessel name</Label>
                <Input
                  placeholder="e.g. Lady Serene"
                  value={v.name}
                  onChange={(e) => update(v.id, "name", e.target.value)}
                />
              </div>

              <div className="space-y-1.5">
                <Label>Vessel type</Label>
                <Select
                  value={v.type}
                  onValueChange={(val) => update(v.id, "type", val)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    {VESSEL_TYPES.map((t) => (
                      <SelectItem key={t} value={t}>
                        {t}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label>Length (metres)</Label>
                <Input
                  inputMode="decimal"
                  placeholder="e.g. 42"
                  value={v.lengthMeters}
                  onChange={(e) => update(v.id, "lengthMeters", e.target.value)}
                />
              </div>

              <div className="space-y-1.5">
                <Label>Build year</Label>
                <Input
                  inputMode="numeric"
                  placeholder="e.g. 2018"
                  value={v.buildYear}
                  onChange={(e) => update(v.id, "buildYear", e.target.value)}
                />
              </div>

              <div className="space-y-1.5">
                <Label>Guest capacity (day)</Label>
                <Input
                  inputMode="numeric"
                  placeholder="e.g. 12"
                  value={v.guestCapacityDay}
                  onChange={(e) =>
                    update(v.id, "guestCapacityDay", e.target.value)
                  }
                />
              </div>

              <div className="space-y-1.5">
                <Label>Guest capacity (overnight)</Label>
                <Input
                  inputMode="numeric"
                  placeholder="e.g. 6"
                  value={v.guestCapacityOvernight}
                  onChange={(e) =>
                    update(v.id, "guestCapacityOvernight", e.target.value)
                  }
                />
              </div>

              <div className="space-y-1.5">
                <Label>Flag state</Label>
                <Input
                  placeholder="e.g. Cayman Islands"
                  value={v.flagState}
                  onChange={(e) => update(v.id, "flagState", e.target.value)}
                />
              </div>

              <div className="space-y-1.5">
                <Label>Home port / marina</Label>
                <Input
                  placeholder="e.g. Port Vauban, Antibes"
                  value={v.homePort}
                  onChange={(e) => update(v.id, "homePort", e.target.value)}
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
        onClick={() => setVessels((prev) => [...prev, newVessel()])}
      >
        <Plus className="h-4 w-4" />
        Add another vessel
      </Button>
    </div>
  );
}
