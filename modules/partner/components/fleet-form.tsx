"use client";

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { AlertTriangle, Car, Plus, Trash2 } from "lucide-react";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { Label } from "@/shared/ui/label";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/shared/ui/select";
import {
  fetchFleetDeclarations,
  fetchMinVehicleYear,
  fetchPartnerOrgContext,
  fetchVehicleCategories,
  saveFleetDeclaration,
} from "@/modules/partner/api";
import { cn } from "@/shared/lib/utils";

/* ─── VL Categories ─────────────────────────────────────────── */

/** Codes MUST match public.vehicle_categories (ADR-007). */
const VL_CATEGORIES = [
  {
    code: "EXECUTIVE_SEDAN",
    label: "Executive Sedan",
    description: "Business-class saloon — up to 3 pax, 2 large cases",
    examples: "Mercedes E-Class, BMW 5 Series, Audi A6",
  },
  {
    code: "LUXURY_SEDAN",
    label: "Luxury Sedan",
    description: "First-class saloon — up to 3 pax (incl. Maybach / RR / Bentley)",
    examples: "Mercedes S-Class, BMW 7 / i7, Maybach, Ghost, Flying Spur",
  },
  {
    code: "LUXURY_SUV",
    label: "Luxury SUV",
    description: "Luxury SUV — up to 4 pax, 3+ large cases",
    examples: "Range Rover, Escalade, GLS, Cullinan, Bentayga",
  },
  {
    code: "LUXURY_MPV",
    label: "Luxury MPV",
    description: "Premium people carrier — up to 7 pax",
    examples: "Mercedes V-Class, EQV, Toyota Granvia",
  },
  {
    code: "EXECUTIVE_VAN",
    label: "Executive Van / Sprinter",
    description: "Executive van / Sprinter VIP",
    examples: "Mercedes Sprinter VIP, Vito Tourer",
  },
  {
    code: "MINIBUS",
    label: "Minibus",
    description: "Small group transfers",
    examples: "Mercedes Sprinter Minibus, Ford Transit",
  },
  {
    code: "COACH",
    label: "Coach",
    description: "Larger group / coach",
    examples: "Coach / tour bus",
  },
] as const;

type VLCategoryCode = (typeof VL_CATEGORIES)[number]["code"];

/* ─── Makes & Models by VL category ────────────────────────── */

const MAKES_BY_CATEGORY: Record<VLCategoryCode, { make: string; models: string[] }[]> = {
  EXECUTIVE_SEDAN: [
    { make: "Mercedes-Benz", models: ["E-Class (W214)", "E-Class (W213)"] },
    { make: "BMW", models: ["5 Series (G60)", "5 Series (G30)"] },
    { make: "Audi", models: ["A6"] },
    { make: "Lexus", models: ["ES 300h"] },
    { make: "Tesla", models: ["Model 3"] },
    { make: "Volvo", models: ["S90", "V90"] },
    { make: "Jaguar", models: ["XF"] },
  ],
  LUXURY_SEDAN: [
    { make: "Mercedes-Benz", models: ["S-Class (W223)", "S-Class (W222)", "Maybach S-Class", "Maybach S 680", "Maybach S 580"] },
    { make: "BMW", models: ["7 Series (G70)", "7 Series (G11/G12)", "i7", "i7 M70 xDrive"] },
    { make: "Audi", models: ["A8 L", "A8"] },
    { make: "Lexus", models: ["LS 500h", "LS 500"] },
    { make: "Tesla", models: ["Model S"] },
    { make: "Genesis", models: ["G90"] },
    { make: "Jaguar", models: ["XJ"] },
    { make: "Rolls-Royce", models: ["Ghost", "Ghost Extended", "Phantom", "Phantom Extended"] },
    { make: "Bentley", models: ["Flying Spur", "Flying Spur Hybrid", "Mulsanne"] },
  ],
  LUXURY_SUV: [
    { make: "Range Rover", models: ["Range Rover LWB Autobiography", "Range Rover Autobiography", "Range Rover Sport"] },
    { make: "BMW", models: ["X5", "X7"] },
    { make: "Mercedes-Benz", models: ["GLS 580", "GLS 450", "GLE", "Maybach GLS 600"] },
    { make: "Audi", models: ["Q7", "Q8"] },
    { make: "Cadillac", models: ["Escalade", "Escalade ESV"] },
    { make: "Tesla", models: ["Model X"] },
    { make: "Volvo", models: ["XC90"] },
    { make: "Porsche", models: ["Cayenne", "Cayenne Turbo"] },
    { make: "Lexus", models: ["LX 600", "RX 500h"] },
    { make: "Rolls-Royce", models: ["Cullinan", "Cullinan Series II"] },
    { make: "Bentley", models: ["Bentayga", "Bentayga EWB", "Bentayga Hybrid"] },
    { make: "Lamborghini", models: ["Urus"] },
  ],
  LUXURY_MPV: [
    { make: "Mercedes-Benz", models: ["V-Class Extra Long", "V-Class Long", "EQV 300"] },
    { make: "Toyota", models: ["Granvia", "Alphard"] },
    { make: "Volkswagen", models: ["Multivan", "Caravelle"] },
    { make: "Ford", models: ["Tourneo Custom", "Tourneo Connect"] },
  ],
  EXECUTIVE_VAN: [
    { make: "Mercedes-Benz", models: ["Sprinter VIP", "Vito Tourer", "Sprinter"] },
    { make: "Volkswagen", models: ["Crafter"] },
    { make: "Ford", models: ["Transit"] },
  ],
  MINIBUS: [
    { make: "Mercedes-Benz", models: ["Sprinter Minibus"] },
    { make: "Ford", models: ["Transit Minibus"] },
    { make: "Volkswagen", models: ["Crafter Minibus"] },
  ],
  COACH: [
    { make: "Mercedes-Benz", models: ["Tourismo", "Travego"] },
    { make: "Setra", models: ["ComfortClass", "TopClass"] },
    { make: "Volvo", models: ["9700", "9900"] },
  ],
};

/* ─── Year options ──────────────────────────────────────────── */

const currentYear = new Date().getFullYear();
const YEAR_OPTIONS = Array.from(
  { length: currentYear - 2018 + 1 },
  (_, i) => currentYear - i,
);

/* ─── Fleet entry row ───────────────────────────────────────── */

type FleetEntry = {
  id: string;
  vlCategory: VLCategoryCode | "";
  make: string;
  customMake: string;
  model: string;
  customModel: string;
  year: string;
  customYear: string;
  qty: string;
};

const emptyEntry = (): FleetEntry => ({
  id: Math.random().toString(36).slice(2),
  vlCategory: "",
  make: "",
  customMake: "",
  model: "",
  customModel: "",
  year: "",
  customYear: "",
  qty: "1",
});

/* ─── Component ─────────────────────────────────────────────── */

export function PartnerFleetForm() {
  const qc = useQueryClient();

  const orgQ = useQuery({
    queryKey: ["partner", "org"],
    queryFn: fetchPartnerOrgContext,
  });
  const minYearQ = useQuery({
    queryKey: ["partner", "min-year"],
    queryFn: fetchMinVehicleYear,
  });
  const vehicleCatsQ = useQuery({
    queryKey: ["partner", "vehicle-categories"],
    queryFn: fetchVehicleCategories,
  });
  const fleetQ = useQuery({
    queryKey: ["partner", "fleet", orgQ.data?.organizationId],
    enabled: Boolean(orgQ.data),
    queryFn: () =>
      fetchFleetDeclarations(orgQ.data!.organizationId, orgQ.data!.offeringId),
  });

  const [entries, setEntries] = useState<FleetEntry[]>([emptyEntry()]);

  const minYear = minYearQ.data ?? 2023;

  function updateEntry(id: string, patch: Partial<FleetEntry>) {
    setEntries((prev) =>
      prev.map((e) =>
        e.id === id
          ? {
              ...e,
              ...patch,
              // reset downstream when category changes
              ...(patch.vlCategory !== undefined && patch.vlCategory !== e.vlCategory
                ? { make: "", customMake: "", model: "", customModel: "" }
                : {}),
              // reset model when make changes
              ...(patch.make !== undefined && patch.make !== e.make
                ? { model: "", customModel: "" }
                : {}),
            }
          : e,
      ),
    );
  }

  function removeEntry(id: string) {
    setEntries((prev) => (prev.length > 1 ? prev.filter((e) => e.id !== id) : prev));
  }

  const save = useMutation({
    mutationFn: async () => {
      if (!orgQ.data) throw new Error("No organization");

      // Build code → UUID map from DB categories
      const catMap = new Map(
        (vehicleCatsQ.data ?? []).map((c) => [c.code, c.id]),
      );

      for (const entry of entries) {
        if (!entry.vlCategory) throw new Error("Select a VL category for all rows");

        // Resolve UUID from code
        const vehicleCategoryId = catMap.get(entry.vlCategory);
        if (!vehicleCategoryId)
          throw new Error(
            `Category "${entry.vlCategory}" not found in database. Refresh and try again.`,
          );

        const resolvedMake =
          entry.make === "Other" ? entry.customMake.trim() : entry.make;
        const resolvedModel =
          entry.model === "Other" ? entry.customModel.trim() : entry.model;
        const resolvedYear =
          entry.year === "other" ? Number(entry.customYear) : Number(entry.year);
        const qty = Number(entry.qty);

        if (!resolvedMake) throw new Error("Make is required");
        if (!resolvedModel) throw new Error("Model is required");
        if (!Number.isFinite(resolvedYear) || resolvedYear < 2000)
          throw new Error("Enter a valid year (2000+)");
        if (!Number.isFinite(qty) || qty < 1) throw new Error("Quantity must be at least 1");

        await saveFleetDeclaration({
          organizationId: orgQ.data.organizationId,
          offeringId: orgQ.data.offeringId,
          vehicleCategoryId, // UUID corect din DB
          make: resolvedMake,
          modelFamily: resolvedModel,
          yearFrom: resolvedYear,
          quantity: qty,
        });
      }
    },
    onSuccess: async () => {
      toast.success("Fleet saved successfully");
      setEntries([emptyEntry()]);
      await qc.invalidateQueries({ queryKey: ["partner", "fleet"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="font-display text-2xl tracking-tight md:text-3xl">Fleet declaration</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Select the Vantage Lane categories that match your vehicles, then specify make, model and year.
          Network standard is <span className="font-medium text-foreground">{minYear} or newer</span>.
        </p>
      </div>

      {/* VL Category legend */}
      <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
        {VL_CATEGORIES.map((cat) => (
          <div
            key={cat.code}
            className="rounded-xl border border-border/50 bg-card/40 px-3 py-2.5"
          >
            <div className="flex items-center gap-2">
              <Car className="h-3.5 w-3.5 shrink-0 text-primary" />
              <p className="text-xs font-semibold">{cat.label}</p>
            </div>
            <p className="mt-0.5 text-[11px] text-muted-foreground">{cat.description}</p>
            <p className="mt-0.5 text-[10px] text-muted-foreground/70">{cat.examples}</p>
          </div>
        ))}
      </div>

      {/* Fleet entries */}
      <div className="space-y-4">
        {entries.map((entry, idx) => {
          const catData = VL_CATEGORIES.find((c) => c.code === entry.vlCategory);
          const makesForCat = entry.vlCategory
              ? MAKES_BY_CATEGORY[entry.vlCategory] ?? []
              : [];
          const modelsForMake =
            makesForCat.find((m) => m.make === entry.make)?.models ?? [];

          const resolvedYear =
            entry.year === "other" ? Number(entry.customYear) : Number(entry.year);
          const belowMin =
            Number.isFinite(resolvedYear) && resolvedYear < minYear && resolvedYear >= 2000;

          return (
            <div
              key={entry.id}
              className={cn(
                "rounded-2xl border bg-card p-4 shadow-sm",
                belowMin ? "border-warning/40" : "border-border/60",
              )}
            >
              {/* Row header */}
              <div className="mb-4 flex items-center justify-between">
                <span className="text-sm font-medium text-muted-foreground">
                  Vehicle {idx + 1}
                  {catData ? ` — ${catData.label}` : ""}
                </span>
                {entries.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeEntry(entry.id)}
                    className="text-muted-foreground hover:text-danger transition-colors"
                    aria-label="Remove vehicle"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                )}
              </div>

              <div className="space-y-4">
                {/* VL Category */}
                <div className="space-y-1.5">
                  <Label>Vantage Lane category</Label>
                  <Select
                    value={entry.vlCategory}
                    onValueChange={(v) =>
                      updateEntry(entry.id, { vlCategory: v as VLCategoryCode })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select category…" />
                    </SelectTrigger>
                    <SelectContent>
                      {VL_CATEGORIES.map((cat) => (
                        <SelectItem key={cat.code} value={cat.code} className="py-2.5">
                          <div>
                            <p className="text-sm font-medium">{cat.label}</p>
                            <p className="text-xs text-muted-foreground">{cat.description}</p>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {catData && (
                    <p className="text-[11px] text-muted-foreground">
                      Typical: {catData.examples}
                    </p>
                  )}
                </div>

                {/* Make */}
                <div className="space-y-1.5">
                  <Label>Make</Label>
                  <Select
                    value={entry.make}
                    onValueChange={(v) => updateEntry(entry.id, { make: v })}
                    disabled={!entry.vlCategory}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={entry.vlCategory ? "Select make…" : "Select category first"} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        <SelectLabel>Common makes</SelectLabel>
                        {makesForCat.map((m) => (
                          <SelectItem key={m.make} value={m.make}>
                            {m.make}
                          </SelectItem>
                        ))}
                      </SelectGroup>
                      <SelectGroup>
                        <SelectLabel>Not listed</SelectLabel>
                        <SelectItem value="Other">Other — type manually</SelectItem>
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                  {entry.make === "Other" && (
                    <Input
                      placeholder="e.g. Hongqi"
                      value={entry.customMake}
                      onChange={(e) => updateEntry(entry.id, { customMake: e.target.value })}
                    />
                  )}
                </div>

                {/* Model */}
                <div className="space-y-1.5">
                  <Label>Model</Label>
                  <Select
                    value={entry.model}
                    onValueChange={(v) => updateEntry(entry.id, { model: v })}
                    disabled={!entry.make}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={entry.make ? "Select model…" : "Select make first"} />
                    </SelectTrigger>
                    <SelectContent>
                      {modelsForMake.length > 0 && (
                        <SelectGroup>
                          <SelectLabel>Common models</SelectLabel>
                          {modelsForMake.map((m) => (
                            <SelectItem key={m} value={m}>
                              {m}
                            </SelectItem>
                          ))}
                        </SelectGroup>
                      )}
                      <SelectGroup>
                        <SelectLabel>Not listed</SelectLabel>
                        <SelectItem value="Other">Other — type manually</SelectItem>
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                  {entry.model === "Other" && (
                    <Input
                      placeholder="e.g. E400L AMG Line"
                      value={entry.customModel}
                      onChange={(e) => updateEntry(entry.id, { customModel: e.target.value })}
                    />
                  )}
                </div>

                {/* Year + Qty */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label>Year of manufacture</Label>
                    <Select
                      value={entry.year}
                      onValueChange={(v) => updateEntry(entry.id, { year: v })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select year…" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectGroup>
                          <SelectLabel>Standard ({minYear}+)</SelectLabel>
                          {YEAR_OPTIONS.filter((y) => y >= minYear).map((y) => (
                            <SelectItem key={y} value={String(y)}>
                              {y}
                            </SelectItem>
                          ))}
                        </SelectGroup>
                        <SelectGroup>
                          <SelectLabel>Below standard (score impact)</SelectLabel>
                          {YEAR_OPTIONS.filter((y) => y < minYear).map((y) => (
                            <SelectItem key={y} value={String(y)}>
                              {y}
                            </SelectItem>
                          ))}
                        </SelectGroup>
                        <SelectGroup>
                          <SelectLabel>Not listed</SelectLabel>
                          <SelectItem value="other">Other year</SelectItem>
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                    {entry.year === "other" && (
                      <Input
                        placeholder="e.g. 2019"
                        inputMode="numeric"
                        value={entry.customYear}
                        onChange={(e) => updateEntry(entry.id, { customYear: e.target.value })}
                      />
                    )}
                    {belowMin && (
                      <div className="flex items-start gap-1.5 rounded-lg bg-warning/10 px-2.5 py-2">
                        <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-warning-foreground" />
                        <p className="text-[11px] text-warning-foreground">
                          Below {minYear} standard — eligibility score reduced for this vehicle.
                        </p>
                      </div>
                    )}
                  </div>

                  <div className="space-y-1.5">
                    <Label>Quantity</Label>
                    <Select
                      value={
                        Number(entry.qty) > 19 ? "other" : entry.qty
                      }
                      onValueChange={(v) =>
                        updateEntry(entry.id, { qty: v === "other" ? "" : v })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select…" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectGroup>
                          <SelectLabel>Quick select</SelectLabel>
                          {Array.from({ length: 19 }, (_, i) => i + 1).map((n) => (
                            <SelectItem key={n} value={String(n)}>
                              {n} {n === 1 ? "vehicle" : "vehicles"}
                            </SelectItem>
                          ))}
                        </SelectGroup>
                        <SelectGroup>
                          <SelectLabel>More</SelectLabel>
                          <SelectItem value="other">20+ — type number</SelectItem>
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                    {(entry.qty === "" || Number(entry.qty) > 19) && (
                      <Input
                        placeholder="e.g. 25"
                        inputMode="numeric"
                        value={entry.qty}
                        onChange={(e) =>
                          updateEntry(entry.id, {
                            qty: e.target.value.replace(/\D/g, ""),
                          })
                        }
                      />
                    )}
                    <p className="text-[11px] text-muted-foreground">
                      How many of this exact make/model/year.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          );
        })}

        {/* Add another */}
        <button
          type="button"
          onClick={() => setEntries((prev) => [...prev, emptyEntry()])}
          className="flex w-full items-center justify-center gap-2 rounded-2xl border border-dashed border-border/70 py-3.5 text-sm text-muted-foreground transition-colors hover:border-primary/40 hover:text-primary"
        >
          <Plus className="h-4 w-4" />
          Add another vehicle
        </button>
      </div>

      {/* Save */}
      <Button
        size="lg"
        className="w-full rounded-full"
        disabled={save.isPending}
        onClick={() => save.mutate()}
      >
        {save.isPending ? "Saving…" : "Save fleet →"}
      </Button>

      {/* Declared fleet */}
      {(fleetQ.data ?? []).length > 0 && (
        <section className="space-y-3">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
            Declared fleet
          </h2>
          <div className="divide-y divide-border/50 rounded-xl border border-border/60 bg-card overflow-hidden">
            {(fleetQ.data ?? []).map((row) => {
              const isOld = row.yearFrom != null && row.yearFrom < minYear;
              return (
                <div key={row.id} className="flex items-center justify-between px-4 py-3">
                  <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-muted">
                      <Car className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">
                        {row.make} {row.modelFamily}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {row.yearFrom} · ×{row.quantity}
                        {isOld && (
                          <span className="ml-1.5 text-warning-foreground">
                            · Below {minYear} standard
                          </span>
                        )}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}
    </div>
  );
}
