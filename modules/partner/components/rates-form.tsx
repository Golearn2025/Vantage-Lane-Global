"use client";

import { useEffect, useRef, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  Calculator,
  ChevronDown,
  ChevronUp,
  MapPin,
  Navigation,
  Trash2,
} from "lucide-react";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { Label } from "@/shared/ui/label";
import { PlacesInput } from "@/shared/components/places-input";
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
  deletePartnerRateCard,
  fetchBenchmarkBands,
  fetchDraftRateCard,
  fetchFleetDeclarations,
  fetchPartnerOrgContext,
  fetchVehicleCategories,
  upsertPartnerRateCard,
} from "@/modules/partner/api";
import { cn } from "@/shared/lib/utils";
import {
  PartnerServiceRatesForm,
  SERVICE_RATE_CODES,
} from "./service-rates-form";

/* ─── Types ──────────────────────────────────────────────────── */
type CatRates = {
  baseFare: string;      // fixed amount at start of trip
  perDistance: string;   // per km or per mile
  perMinute: string;     // per minute of travel time
  hourly: string;        // as-directed / hourly hire
  minFare: string;       // minimum charge
};

type SimResult = {
  distanceValue: number;   // km or miles
  distanceLabel: string;   // e.g. "15.3 mi"
  durationMins: number;    // minutes
  durationLabel: string;   // e.g. "24 mins"
  estimated: number;       // computed fare
  appliedMinFare: boolean; // true if min fare was applied
  bandLow?: number;
  bandHigh?: number;
  bandStatus?: "ok" | "low" | "high";
};

/* ─── Helpers ────────────────────────────────────────────────── */
function n(v: string): number | null {
  const t = v.trim();
  if (!t) return null;
  const x = parseFloat(t);
  return Number.isFinite(x) ? x : null;
}

function computeFare(
  rates: CatRates,
  distKm: number,
  durationMins: number,
): { fare: number; appliedMin: boolean } {
  const base = n(rates.baseFare) ?? 0;
  const perDist = n(rates.perDistance) ?? 0;
  const perMin = n(rates.perMinute) ?? 0;
  const minF = n(rates.minFare) ?? 0;
  const raw = base + distKm * perDist + durationMins * perMin;
  const fare = Math.max(raw, minF);
  return { fare, appliedMin: minF > 0 && raw < minF };
}

const CURRENCIES: { code: string; name: string; symbol: string; region: string }[] = [
  // Europe
  { code: "GBP", name: "British Pound",    symbol: "£",  region: "United Kingdom" },
  { code: "EUR", name: "Euro",             symbol: "€",  region: "Eurozone (FR, DE, IT, ES, NL…)" },
  { code: "CHF", name: "Swiss Franc",      symbol: "Fr", region: "Switzerland" },
  { code: "RON", name: "Romanian Leu",     symbol: "lei",region: "Romania" },
  { code: "PLN", name: "Polish Złoty",     symbol: "zł", region: "Poland" },
  { code: "SEK", name: "Swedish Krona",    symbol: "kr", region: "Sweden" },
  { code: "NOK", name: "Norwegian Krone",  symbol: "kr", region: "Norway" },
  { code: "DKK", name: "Danish Krone",     symbol: "kr", region: "Denmark" },
  // Middle East
  { code: "AED", name: "UAE Dirham",       symbol: "د.إ",region: "UAE / Dubai" },
  { code: "SAR", name: "Saudi Riyal",      symbol: "﷼",  region: "Saudi Arabia" },
  { code: "QAR", name: "Qatari Riyal",     symbol: "QR", region: "Qatar" },
  { code: "KWD", name: "Kuwaiti Dinar",    symbol: "KD", region: "Kuwait" },
  { code: "BHD", name: "Bahraini Dinar",   symbol: "BD", region: "Bahrain" },
  // Americas
  { code: "USD", name: "US Dollar",        symbol: "$",  region: "United States" },
  { code: "CAD", name: "Canadian Dollar",  symbol: "C$", region: "Canada" },
  { code: "BRL", name: "Brazilian Real",   symbol: "R$", region: "Brazil" },
  // Asia-Pacific
  { code: "SGD", name: "Singapore Dollar", symbol: "S$", region: "Singapore" },
  { code: "HKD", name: "Hong Kong Dollar", symbol: "HK$",region: "Hong Kong" },
  { code: "JPY", name: "Japanese Yen",     symbol: "¥",  region: "Japan" },
  { code: "AUD", name: "Australian Dollar",symbol: "A$", region: "Australia" },
  { code: "INR", name: "Indian Rupee",     symbol: "₹",  region: "India" },
  // Africa
  { code: "ZAR", name: "South African Rand",symbol: "R", region: "South Africa" },
  { code: "MAD", name: "Moroccan Dirham",  symbol: "DH", region: "Morocco" },
];

/* ─── Component ─────────────────────────────────────────────── */
export function PartnerRatesForm() {
  const orgQ = useQuery({ queryKey: ["partner", "org"], queryFn: fetchPartnerOrgContext });
  const serviceCode = orgQ.data?.serviceCode ?? "GROUND_TRANSPORTATION";

  // Security / Yacht / Aviation: hourly+daily form, no fleet dependency
  if (orgQ.data && SERVICE_RATE_CODES.has(serviceCode)) {
    return (
      <PartnerServiceRatesForm
        organizationId={orgQ.data.organizationId}
        offeringId={orgQ.data.offeringId}
        serviceCode={serviceCode}
      />
    );
  }

  if (orgQ.isLoading) {
    return <p className="text-sm text-muted-foreground animate-pulse">Loading rates…</p>;
  }

  return <PartnerGtRatesForm />;
}

function PartnerGtRatesForm() {
  const qc = useQueryClient();

  const orgQ = useQuery({ queryKey: ["partner", "org"], queryFn: fetchPartnerOrgContext });
  const catsQ = useQuery({ queryKey: ["partner", "categories"], queryFn: fetchVehicleCategories });
  const bandsQ = useQuery({
    queryKey: ["partner", "bands", "london_uk"],
    queryFn: () => fetchBenchmarkBands("london_uk"),
  });
  const draftQ = useQuery({
    queryKey: ["partner", "rates", orgQ.data?.organizationId],
    enabled: Boolean(orgQ.data),
    queryFn: () => fetchDraftRateCard(orgQ.data!.organizationId, orgQ.data!.offeringId),
  });
  const fleetQ = useQuery({
    queryKey: ["partner", "fleet", orgQ.data?.organizationId],
    enabled: Boolean(orgQ.data),
    queryFn: () => fetchFleetDeclarations(orgQ.data!.organizationId, orgQ.data!.offeringId),
  });

  /* ── Card-level state ── */
  const [currency, setCurrency] = useState("GBP");
  const [distanceUnit, setDistanceUnit] = useState<"KM" | "MILE">("MILE");

  /* ── Per-category rates ── */
  const [rates, setRates] = useState<Record<string, CatRates>>({});

  /* ── Simulator state ── */
  const [simCatId, setSimCatId] = useState<string>("");
  const [simOrigin, setSimOrigin] = useState("");
  const [simDest, setSimDest] = useState("");
  const [simLoading, setSimLoading] = useState(false);
  const [simResult, setSimResult] = useState<SimResult | null>(null);

  /* ── Expanded cats ── */
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  const [ratesDirty, setRatesDirty] = useState(false);
  const seededCardIdRef = useRef<string | null | undefined>(undefined);

  /* ── Seed from draft once per card (avoid wiping in-progress edits) ── */
  useEffect(() => {
    if (!catsQ.data || draftQ.isLoading) return;

    const cardId = draftQ.data?.card?.id ?? null;
    // Re-seed after save (new/changed card) or first load; skip while user is editing
    if (seededCardIdRef.current === cardId && ratesDirty) return;
    if (seededCardIdRef.current === cardId && seededCardIdRef.current !== undefined) {
      return;
    }

    const next: Record<string, CatRates> = {};
    for (const c of catsQ.data) {
      next[c.id] = {
        baseFare: "",
        perDistance: "",
        perMinute: "",
        hourly: "",
        minFare: "",
      };
    }

    if (draftQ.data?.card) {
      setCurrency(draftQ.data.card.currencyCode);
      setDistanceUnit(draftQ.data.card.distanceUnit);
    }
    if (draftQ.data?.rules) {
      for (const rule of draftQ.data.rules) {
        const id = rule.vehicleCategoryId;
        if (!id || !next[id]) continue;
        if (rule.ruleType === "DISTANCE") {
          next[id].baseFare = rule.baseAmount?.toString() ?? "";
          next[id].perDistance = rule.perUnitAmount?.toString() ?? "";
          next[id].minFare = rule.minimumAmount?.toString() ?? "";
        }
        if (rule.ruleType === "WAITING" && rule.waitUnit === "MINUTE") {
          next[id].perMinute = rule.waitAmountPerUnit?.toString() ?? "";
        }
        if (rule.ruleType === "HOURLY" && rule.hourlyAmount != null) {
          next[id].hourly = rule.hourlyAmount.toString();
        }
      }
    }

    seededCardIdRef.current = cardId;
    setRatesDirty(false);
    setRates(next);
  }, [catsQ.data, draftQ.data, draftQ.isLoading, ratesDirty]);

  /* GT rates require fleet categories with valid DB UUIDs (ADR-007 catalog). */
  const fleetCatIds = new Set(
    (fleetQ.data ?? [])
      .map((f) => f.vehicleCategoryId)
      .filter((id): id is string => Boolean(id)),
  );
  const activeCats = (catsQ.data ?? []).filter((c) => fleetCatIds.has(c.id));

  /* ── Auto-select first active cat for simulator ── */
  useEffect(() => {
    if (!simCatId && activeCats.length > 0) {
      setSimCatId(activeCats[0].id);
    }
  }, [activeCats, simCatId]);

  /* ── Field updater ── */
  function setField(catId: string, field: keyof CatRates, value: string) {
    setRatesDirty(true);
    setRates((prev) => {
      const current = prev[catId] ?? {
        baseFare: "",
        perDistance: "",
        perMinute: "",
        hourly: "",
        minFare: "",
      };
      return {
        ...prev,
        [catId]: { ...current, [field]: value },
      };
    });
    setSimResult(null);
  }

  /* ── Run simulator ── */
  async function runSim() {
    if (!simCatId || !simOrigin.trim() || !simDest.trim()) {
      toast.error("Choose a category and fill in both locations");
      return;
    }
    setSimLoading(true);
    setSimResult(null);
    try {
      const res = await fetch(
        `/api/partner/distance?origin=${encodeURIComponent(simOrigin)}&destination=${encodeURIComponent(simDest)}&unit=${distanceUnit}`,
      );
      const data = (await res.json()) as {
        distance?: number;
        durationMins?: number;
        distanceLabel?: string;
        durationLabel?: string;
        label?: string;
        error?: string;
      };
      if (!res.ok) throw new Error(data.error || "Could not get route");

      const distVal = data.distance ?? 0;
      const durMins = data.durationMins ?? 0;
      const catRates = rates[simCatId] ?? {
        baseFare: "",
        perDistance: "",
        perMinute: "",
        hourly: "",
        minFare: "",
      };
      const { fare, appliedMin } = computeFare(catRates, distVal, durMins);

      // Band comparison — only show if currency matches benchmark currency
      const band = (bandsQ.data ?? []).find(
        (b) => b.vehicleCategoryId === simCatId && b.currencyCode === currency,
      );
      let bandStatus: SimResult["bandStatus"];
      if (band) {
        if (fare < (band.lowAmount ?? 0)) bandStatus = "low";
        else if (fare > (band.highAmount ?? Infinity)) bandStatus = "high";
        else bandStatus = "ok";
      }

      setSimResult({
        distanceValue: distVal,
        distanceLabel: data.distanceLabel ?? data.label ?? `${distVal.toFixed(1)} ${distanceUnit.toLowerCase()}`,
        durationMins: durMins,
        durationLabel: data.durationLabel ?? `${Math.round(durMins)} min`,
        estimated: fare,
        appliedMinFare: appliedMin,
        bandLow: band?.lowAmount,
        bandHigh: band?.highAmount,
        bandStatus,
      });
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Route error");
    } finally {
      setSimLoading(false);
    }
  }

  /* ── Save ── */
  const save = useMutation({
    mutationFn: async () => {
      if (!orgQ.data) throw new Error("No organization");
      const categoryRates = Object.entries(rates)
        .filter(([id]) => activeCats.some((c) => c.id === id))
        .filter(
          ([, r]) =>
            n(r.baseFare) != null ||
            n(r.perDistance) != null ||
            n(r.perMinute) != null ||
            n(r.hourly) != null ||
            n(r.minFare) != null,
        )
        .map(([vehicleCategoryId, r]) => ({
          vehicleCategoryId,
          baseAmount: n(r.baseFare),
          perUnitAmount: n(r.perDistance),
          minimumAmount: n(r.minFare),
          hourlyAmount: n(r.hourly),
          dailyAmount: null as number | null,
          fixedTransferAmount: null as number | null,
          perMinuteAmount: n(r.perMinute),
          notes: null as string | null,
        }));
      if (categoryRates.length === 0) {
        throw new Error(
          "Enter at least one rate (base, distance, minute, hourly, or minimum) for a category",
        );
      }
      return upsertPartnerRateCard({
        organizationId: orgQ.data.organizationId,
        offeringId: orgQ.data.offeringId,
        cardId: draftQ.data?.card?.id,
        currencyCode: currency,
        distanceUnit,
        categoryRates,
      });
    },
    onSuccess: async () => {
      toast.success("Rates saved");
      setRatesDirty(false);
      seededCardIdRef.current = undefined; // force re-seed from saved card
      await qc.invalidateQueries({ queryKey: ["partner", "rates"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const del = useMutation({
    mutationFn: async () => {
      const cardId = draftQ.data?.card?.id;
      if (!cardId) throw new Error("No rate card to delete");
      await deletePartnerRateCard(cardId);
    },
    onSuccess: async () => {
      toast.success("Rate card deleted");
      setRates({});
      setRatesDirty(false);
      seededCardIdRef.current = undefined;
      await qc.invalidateQueries({ queryKey: ["partner", "rates"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  if (orgQ.isLoading || catsQ.isLoading || fleetQ.isLoading || draftQ.isLoading) {
    return <p className="text-sm text-muted-foreground animate-pulse">Loading rates…</p>;
  }

  if (activeCats.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-border/60 px-6 py-10 text-center space-y-3">
        <p className="text-sm font-medium">No fleet declared yet</p>
        <p className="text-xs text-muted-foreground">
          Add your vehicles in the Fleet step first — rates are set per category
          you declared (must match the VL vehicle catalog).
        </p>
        <Button asChild variant="outline" className="rounded-full">
          <a href="/partner/fleet">Go to Fleet →</a>
        </Button>
      </div>
    );
  }

  const simCat = activeCats.find((c) => c.id === simCatId);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="font-display text-2xl tracking-tight md:text-3xl">Rate card</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Set your prices per vehicle category. Only categories you declared in your fleet are shown.
        </p>
      </div>

      {/* ── Card settings ── */}
      <section className="rounded-2xl border border-border/60 bg-card p-5 space-y-4">
        <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
          Card settings
        </p>
        <div className="grid grid-cols-2 gap-4">
          {/* Currency */}
          <div className="space-y-1.5">
            <Label>Currency</Label>
            <Select value={currency} onValueChange={setCurrency}>
              <SelectTrigger>
                <SelectValue>
                  <span className="flex items-center gap-2">
                    <span className="font-mono text-muted-foreground w-5 text-xs">
                      {CURRENCIES.find((c) => c.code === currency)?.symbol}
                    </span>
                    <span className="font-semibold">{currency}</span>
                    <span className="text-muted-foreground text-xs">
                      — {CURRENCIES.find((c) => c.code === currency)?.name}
                    </span>
                  </span>
                </SelectValue>
              </SelectTrigger>
              <SelectContent className="max-h-72">
                {[
                  { label: "Europe", codes: ["GBP","EUR","CHF","RON","PLN","SEK","NOK","DKK"] },
                  { label: "Middle East", codes: ["AED","SAR","QAR","KWD","BHD"] },
                  { label: "Americas", codes: ["USD","CAD","BRL"] },
                  { label: "Asia-Pacific", codes: ["SGD","HKD","JPY","AUD","INR"] },
                  { label: "Africa", codes: ["ZAR","MAD"] },
                ].map(({ label, codes }) => (
                  <SelectGroup key={label}>
                    <SelectLabel>{label}</SelectLabel>
                    {codes.map((code) => {
                      const cur = CURRENCIES.find((c) => c.code === code)!;
                      return (
                        <SelectItem key={code} value={code}>
                          <span className="flex items-center gap-2.5">
                            <span className="font-mono text-muted-foreground w-5 text-xs text-center">
                              {cur.symbol}
                            </span>
                            <span className="font-semibold font-mono">{cur.code}</span>
                            <span className="text-muted-foreground text-xs">
                              {cur.name}
                            </span>
                          </span>
                        </SelectItem>
                      );
                    })}
                  </SelectGroup>
                ))}
              </SelectContent>
            </Select>
            <p className="text-[11px] text-muted-foreground">
              Applied to all categories on this rate card
            </p>
          </div>

          {/* Distance unit */}
          <div className="space-y-1.5">
            <Label>Distance unit</Label>
            <div className="flex gap-2">
              {(["MILE", "KM"] as const).map((u) => (
                <button
                  key={u}
                  type="button"
                  onClick={() => { setDistanceUnit(u); setSimResult(null); }}
                  className={cn(
                    "flex-1 rounded-lg border py-2 text-sm font-medium transition-colors",
                    distanceUnit === u
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-border bg-card text-muted-foreground hover:border-primary/40 hover:text-foreground",
                  )}
                >
                  {u === "MILE" ? "Miles" : "Kilometres"}
                </button>
              ))}
            </div>
            <p className="text-[11px] text-muted-foreground">
              Applied to all categories
            </p>
          </div>
        </div>
      </section>

      {/* ── Per-category rate table ── */}
      <section className="space-y-3">
        <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
          Rates per category
        </p>

        <div className="divide-y divide-border/50 rounded-2xl border border-border/60 overflow-hidden bg-card">
          {/* Table header */}
          <div className="grid grid-cols-[minmax(0,1.2fr)_repeat(5,minmax(0,72px))] gap-1 px-3 py-2.5 bg-muted/40 sm:gap-0 sm:px-4 sm:grid-cols-[1fr_78px_78px_78px_78px_78px]">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
              Category
            </p>
            <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground text-right">
              Base
            </p>
            <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground text-right">
              /{distanceUnit === "MILE" ? "mi" : "km"}
            </p>
            <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground text-right">
              /min
            </p>
            <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground text-right">
              /hr
            </p>
            <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground text-right">
              Min
            </p>
          </div>

          {activeCats.map((cat) => {
            const r = rates[cat.id] ?? {
              baseFare: "",
              perDistance: "",
              perMinute: "",
              hourly: "",
              minFare: "",
            };
            const isOpen = expanded[cat.id] ?? false;
            const hasAnyRate =
              n(r.baseFare) != null ||
              n(r.perDistance) != null ||
              n(r.perMinute) != null ||
              n(r.hourly) != null ||
              n(r.minFare) != null;

            return (
              <div key={cat.id}>
                {/* Main row */}
                <div
                  className={cn(
                    "grid grid-cols-[minmax(0,1.2fr)_repeat(5,minmax(0,72px))] gap-1 px-3 py-3 items-center sm:gap-0 sm:px-4 sm:grid-cols-[1fr_78px_78px_78px_78px_78px]",
                    isOpen && "bg-muted/20",
                  )}
                >
                  {/* Category name + expand */}
                  <button
                    type="button"
                    onClick={() => setExpanded((p) => ({ ...p, [cat.id]: !isOpen }))}
                    className="flex items-center gap-2 text-left min-w-0"
                  >
                    <div
                      className={cn(
                        "flex h-5 w-5 items-center justify-center rounded-full shrink-0",
                        hasAnyRate ? "bg-green-500/15" : "bg-muted",
                      )}
                    >
                      {hasAnyRate ? (
                        <div className="h-2 w-2 rounded-full bg-green-500" />
                      ) : (
                        <div className="h-2 w-2 rounded-full bg-border" />
                      )}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium truncate">{cat.name}</p>
                      {cat.exampleModels && (
                        <p className="text-[11px] text-muted-foreground truncate">{cat.exampleModels}</p>
                      )}
                    </div>
                    {isOpen ? (
                      <ChevronUp className="ml-auto h-3.5 w-3.5 text-muted-foreground shrink-0" />
                    ) : (
                      <ChevronDown className="ml-auto h-3.5 w-3.5 text-muted-foreground shrink-0" />
                    )}
                  </button>

                  {/* Inline inputs */}
                  {(
                    [
                      "baseFare",
                      "perDistance",
                      "perMinute",
                      "hourly",
                      "minFare",
                    ] as const
                  ).map((field) => (
                    <div key={field} className="sm:pl-2">
                      <div className="relative">
                        <span className="pointer-events-none absolute left-1.5 top-1/2 -translate-y-1/2 text-[10px] text-muted-foreground">
                          {currency.slice(0, 1)}
                        </span>
                        <Input
                          inputMode="decimal"
                          value={r[field]}
                          onChange={(e) => setField(cat.id, field, e.target.value)}
                          className="pl-4 pr-1 text-right text-sm h-8"
                          placeholder="0"
                        />
                      </div>
                    </div>
                  ))}
                </div>

                {/* Expanded helper */}
                {isOpen && (
                  <div className="border-t border-border/40 bg-muted/10 px-4 py-3">
                    <div className="grid grid-cols-2 gap-3 text-[11px] text-muted-foreground sm:grid-cols-5">
                      <div>
                        <p className="font-semibold text-foreground">Base fare</p>
                        <p>Fixed charge at the start of every trip.</p>
                      </div>
                      <div>
                        <p className="font-semibold text-foreground">Per {distanceUnit === "MILE" ? "mile" : "km"}</p>
                        <p>Charged for distance driven.</p>
                      </div>
                      <div>
                        <p className="font-semibold text-foreground">Per minute</p>
                        <p>Travel / waiting time rate from duration.</p>
                      </div>
                      <div>
                        <p className="font-semibold text-foreground">Hourly</p>
                        <p>As-directed / hourly hire rate for this category.</p>
                      </div>
                      <div>
                        <p className="font-semibold text-foreground">Min fare</p>
                        <p>Floor price if the computed total is lower.</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* ── Simulator ── */}
      <section className="rounded-2xl border border-border/60 bg-card p-5 space-y-5">
        <div className="flex items-center gap-2">
          <Calculator className="h-4 w-4 text-primary" />
          <p className="text-sm font-semibold">Price simulator</p>
          <p className="ml-auto text-[11px] text-muted-foreground">
            Enter any real route — Google Maps calculates distance &amp; duration
          </p>
        </div>

        {/* Category selector */}
        <div className="flex flex-wrap gap-2">
          {activeCats.map((cat) => (
            <button
              key={cat.id}
              type="button"
              onClick={() => { setSimCatId(cat.id); setSimResult(null); }}
              className={cn(
                "rounded-full border px-3 py-1 text-xs font-medium transition-colors",
                simCatId === cat.id
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border bg-muted/40 text-muted-foreground hover:border-primary/40 hover:text-foreground",
              )}
            >
              {cat.name}
            </button>
          ))}
        </div>

        {/* Route inputs */}
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label className="flex items-center gap-1.5 text-xs">
              <Navigation className="h-3 w-3" /> Pick-up location
            </Label>
            <PlacesInput
              placeholder="e.g. Heathrow Airport, London"
              value={simOrigin}
              onChange={(v) => { setSimOrigin(v); setSimResult(null); }}
            />
          </div>
          <div className="space-y-1.5">
            <Label className="flex items-center gap-1.5 text-xs">
              <MapPin className="h-3 w-3" /> Drop-off location
            </Label>
            <PlacesInput
              placeholder="e.g. The Savoy, London"
              value={simDest}
              onChange={(v) => { setSimDest(v); setSimResult(null); }}
            />
          </div>
        </div>

        <Button
          type="button"
          variant="outline"
          className="w-full"
          disabled={simLoading || !simCatId || !simOrigin.trim() || !simDest.trim()}
          onClick={runSim}
        >
          {simLoading ? "Calculating route…" : "Calculate price →"}
        </Button>

        {/* Result card */}
        {simResult && simCat && (
          <div
            className={cn(
              "rounded-xl border p-4 space-y-3",
              simResult.bandStatus === "ok"
                ? "border-green-500/30 bg-green-500/8"
                : simResult.bandStatus === "low"
                  ? "border-amber-400/40 bg-amber-400/8"
                  : simResult.bandStatus === "high"
                    ? "border-red-500/30 bg-red-500/8"
                    : "border-border/60 bg-muted/20",
            )}
          >
            {/* Route stats */}
            <div className="flex flex-wrap gap-4 text-sm">
              <div>
                <p className="text-[11px] text-muted-foreground uppercase tracking-wide">Distance</p>
                <p className="font-semibold">{simResult.distanceLabel}</p>
              </div>
              <div>
                <p className="text-[11px] text-muted-foreground uppercase tracking-wide">Duration</p>
                <p className="font-semibold">{simResult.durationLabel}</p>
              </div>
              <div>
                <p className="text-[11px] text-muted-foreground uppercase tracking-wide">Category</p>
                <p className="font-semibold">{simCat.name}</p>
              </div>
            </div>

            {/* Price breakdown */}
            <div className="rounded-lg bg-background/60 px-4 py-3 space-y-1.5">
              {n(rates[simCatId]?.baseFare) != null && (
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Base fare</span>
                  <span>{currency} {n(rates[simCatId].baseFare)!.toFixed(2)}</span>
                </div>
              )}
              {n(rates[simCatId]?.perDistance) != null && (
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">
                    {simResult.distanceLabel} × {currency}{n(rates[simCatId].perDistance)!.toFixed(2)}/{distanceUnit === "MILE" ? "mi" : "km"}
                  </span>
                  <span>
                    {currency} {(simResult.distanceValue * n(rates[simCatId].perDistance)!).toFixed(2)}
                  </span>
                </div>
              )}
              {n(rates[simCatId]?.perMinute) != null && (
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">
                    {simResult.durationLabel} × {currency}{n(rates[simCatId].perMinute)!.toFixed(2)}/min
                  </span>
                  <span>
                    {currency} {(simResult.durationMins * n(rates[simCatId].perMinute)!).toFixed(2)}
                  </span>
                </div>
              )}
              <div className="border-t border-border/40 pt-1.5 flex justify-between text-base font-bold">
                <span>
                  Estimated fare
                  {simResult.appliedMinFare && (
                    <span className="ml-2 text-[11px] font-normal text-amber-600 dark:text-amber-400">
                      min fare applied
                    </span>
                  )}
                </span>
                <span>
                  {currency} {simResult.estimated.toFixed(2)}
                </span>
              </div>
            </div>

            {/* Band status */}
            {simResult.bandStatus ? (
              <div
                className={cn(
                  "rounded-lg px-3 py-2.5 text-sm",
                  simResult.bandStatus === "ok" && "bg-green-500/10 text-green-700 dark:text-green-400",
                  simResult.bandStatus === "low" && "bg-amber-400/15 text-amber-700 dark:text-amber-400",
                  simResult.bandStatus === "high" && "bg-red-500/10 text-red-700 dark:text-red-400",
                )}
              >
                {simResult.bandStatus === "ok" &&
                  `✓ In line with the market for this route (${currency} ${simResult.bandLow}–${simResult.bandHigh})`}
                {simResult.bandStatus === "low" &&
                  `⚠ Your rate looks low — market starts at ${currency} ${simResult.bandLow} for this distance.`}
                {simResult.bandStatus === "high" &&
                  `⚠ Your rate looks high — market cap is ${currency} ${simResult.bandHigh} for this distance.`}
              </div>
            ) : (
              <p className="text-[11px] text-muted-foreground italic">
                No market benchmark available for your currency yet — we'll build this from real partner data as the network grows.
              </p>
            )}
          </div>
        )}
      </section>

      {/* Save + Delete */}
      <div className="space-y-3">
        <Button
          size="lg"
          className="w-full rounded-full"
          disabled={save.isPending || del.isPending}
          onClick={() => save.mutate()}
        >
          {save.isPending ? "Saving…" : "Save rate card →"}
        </Button>

        {draftQ.data?.card?.id && (
          <button
            type="button"
            disabled={del.isPending || save.isPending}
            onClick={() => {
              if (
                window.confirm(
                  "Delete this rate card and all rates? This cannot be undone.",
                )
              ) {
                del.mutate();
              }
            }}
            className="flex w-full items-center justify-center gap-2 rounded-full border border-red-500/30 py-2.5 text-sm text-red-500 transition-colors hover:border-red-500/60 hover:bg-red-500/5 disabled:opacity-50"
          >
            <Trash2 className="h-3.5 w-3.5" />
            {del.isPending ? "Deleting…" : "Delete rate card"}
          </button>
        )}
      </div>
    </div>
  );
}
