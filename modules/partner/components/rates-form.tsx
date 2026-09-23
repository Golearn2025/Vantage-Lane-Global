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
  minHours: string;      // minimum billable hours for hourly
  minFare: string;       // minimum charge (one-way)
};

type SimMode = "one_way" | "hourly";

type SimResult = {
  mode: SimMode;
  distanceValue: number;   // km or miles (one-way)
  distanceLabel: string;
  durationMins: number;
  durationLabel: string;
  hoursSelected?: number;
  hoursBilled?: number;
  estimated: number;
  appliedMinFare: boolean;
  appliedMinHours?: boolean;
  bandLow?: number;
  bandHigh?: number;
  bandStatus?: "ok" | "low" | "high";
};

const emptyCatRates = (): CatRates => ({
  baseFare: "",
  perDistance: "",
  perMinute: "",
  hourly: "",
  minHours: "",
  minFare: "",
});

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
  const [simMode, setSimMode] = useState<SimMode>("one_way");
  const [simCatId, setSimCatId] = useState<string>("");
  const [simOrigin, setSimOrigin] = useState("");
  const [simDest, setSimDest] = useState("");
  const [simHours, setSimHours] = useState("3");
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
      next[c.id] = emptyCatRates();
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
          next[id].minHours =
            rule.minHours != null ? String(rule.minHours) : "";
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
      const current = prev[catId] ?? emptyCatRates();
      return {
        ...prev,
        [catId]: { ...current, [field]: value },
      };
    });
    setSimResult(null);
  }

  /* ── Run simulator ── */
  async function runSim() {
    if (!simCatId) {
      toast.error("Choose a vehicle category");
      return;
    }
    const catRates = rates[simCatId] ?? emptyCatRates();

    if (simMode === "hourly") {
      const hourlyRate = n(catRates.hourly);
      if (hourlyRate == null) {
        toast.error("Set an hourly rate for this category first");
        return;
      }
      const minH = n(catRates.minHours) ?? 0;
      const selected = n(simHours);
      if (selected == null || selected <= 0) {
        toast.error("Enter how many hours to simulate");
        return;
      }
      const billed = Math.max(selected, minH);
      const fare = hourlyRate * billed;
      setSimResult({
        mode: "hourly",
        distanceValue: 0,
        distanceLabel: "—",
        durationMins: billed * 60,
        durationLabel: `${billed} h billed`,
        hoursSelected: selected,
        hoursBilled: billed,
        estimated: fare,
        appliedMinFare: false,
        appliedMinHours: billed > selected,
      });
      return;
    }

    if (!simOrigin.trim() || !simDest.trim()) {
      toast.error("Choose pick-up and drop-off for a one-way trip");
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
      const { fare, appliedMin } = computeFare(catRates, distVal, durMins);

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
        mode: "one_way",
        distanceValue: distVal,
        distanceLabel:
          data.distanceLabel ??
          data.label ??
          `${distVal.toFixed(1)} ${distanceUnit.toLowerCase()}`,
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
          minHours: n(r.minHours),
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

      <section className="rounded-2xl border border-border/60 bg-muted/30 px-4 py-4 text-sm space-y-2">
        <p className="font-semibold text-foreground">How pricing works</p>
        <ul className="space-y-1.5 text-muted-foreground list-disc pl-4">
          <li>
            <span className="text-foreground font-medium">One-way</span> — airport
            / point-to-point. Uses base + distance + per-minute (+ min fare if the
            total is lower). Simulator needs pick-up and drop-off.
          </li>
          <li>
            <span className="text-foreground font-medium">Hourly</span> — as-directed
            hire. Price = hourly rate × hours. Set a{" "}
            <span className="text-foreground font-medium">min hours</span> (e.g. 3)
            so shorter bookings still bill the minimum. Simulator only needs
            category + hours — no addresses.
          </li>
        </ul>
      </section>

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
          <div className="grid grid-cols-[minmax(0,1.1fr)_repeat(6,minmax(0,64px))] gap-1 px-2 py-2.5 bg-muted/40 sm:px-4 sm:grid-cols-[1fr_70px_70px_70px_70px_64px_70px]">
            <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
              Category
            </p>
            <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground text-right">
              Base
            </p>
            <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground text-right">
              /{distanceUnit === "MILE" ? "mi" : "km"}
            </p>
            <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground text-right">
              /min
            </p>
            <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground text-right">
              /hr
            </p>
            <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground text-right">
              Min h
            </p>
            <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground text-right">
              Min $
            </p>
          </div>

          {activeCats.map((cat) => {
            const r = rates[cat.id] ?? emptyCatRates();
            const isOpen = expanded[cat.id] ?? false;
            const hasAnyRate =
              n(r.baseFare) != null ||
              n(r.perDistance) != null ||
              n(r.perMinute) != null ||
              n(r.hourly) != null ||
              n(r.minFare) != null;

            return (
              <div key={cat.id}>
                <div
                  className={cn(
                    "grid grid-cols-[minmax(0,1.1fr)_repeat(6,minmax(0,64px))] gap-1 px-2 py-3 items-center sm:px-4 sm:grid-cols-[1fr_70px_70px_70px_70px_64px_70px]",
                    isOpen && "bg-muted/20",
                  )}
                >
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
                        <p className="text-[11px] text-muted-foreground truncate">
                          {cat.exampleModels}
                        </p>
                      )}
                    </div>
                    {isOpen ? (
                      <ChevronUp className="ml-auto h-3.5 w-3.5 text-muted-foreground shrink-0" />
                    ) : (
                      <ChevronDown className="ml-auto h-3.5 w-3.5 text-muted-foreground shrink-0" />
                    )}
                  </button>

                  {(
                    [
                      "baseFare",
                      "perDistance",
                      "perMinute",
                      "hourly",
                      "minHours",
                      "minFare",
                    ] as const
                  ).map((field) => (
                    <div key={field}>
                      <Input
                        inputMode="decimal"
                        value={r[field]}
                        onChange={(e) => setField(cat.id, field, e.target.value)}
                        className="px-1 text-right text-sm h-8"
                        placeholder={field === "minHours" ? "3" : "0"}
                      />
                    </div>
                  ))}
                </div>

                {isOpen && (
                  <div className="border-t border-border/40 bg-muted/10 px-4 py-3">
                    <div className="grid grid-cols-2 gap-3 text-[11px] text-muted-foreground sm:grid-cols-3">
                      <div>
                        <p className="font-semibold text-foreground">One-way fields</p>
                        <p>Base, per distance, per minute, and min fare for point-to-point trips.</p>
                      </div>
                      <div>
                        <p className="font-semibold text-foreground">Hourly (/hr)</p>
                        <p>As-directed rate charged per hour for this category.</p>
                      </div>
                      <div>
                        <p className="font-semibold text-foreground">Min hours</p>
                        <p>
                          Shortest hire you accept (e.g. 3). Simulator bills at least
                          this many hours even if fewer are selected.
                        </p>
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
        <div>
          <div className="flex items-center gap-2">
            <Calculator className="h-4 w-4 text-primary" />
            <p className="text-sm font-semibold">Price simulator</p>
          </div>
          <p className="mt-1 text-xs text-muted-foreground">
            Pick a pricing mode and a category from your fleet, then calculate.
          </p>
        </div>

        {/* Mode */}
        <div className="space-y-1.5">
          <Label className="text-xs">Pricing mode</Label>
          <div className="flex gap-2">
            {(
              [
                { id: "one_way" as const, label: "One way", hint: "Addresses + route" },
                { id: "hourly" as const, label: "Hourly", hint: "Hours only" },
              ] as const
            ).map((m) => (
              <button
                key={m.id}
                type="button"
                onClick={() => {
                  setSimMode(m.id);
                  setSimResult(null);
                  if (m.id === "hourly" && simCatId) {
                    const minH = n(rates[simCatId]?.minHours);
                    if (minH != null && minH > 0) setSimHours(String(minH));
                  }
                }}
                className={cn(
                  "flex-1 rounded-xl border px-3 py-2.5 text-left transition-colors",
                  simMode === m.id
                    ? "border-primary bg-primary/10"
                    : "border-border bg-muted/30 hover:border-primary/40",
                )}
              >
                <p className="text-sm font-semibold">{m.label}</p>
                <p className="text-[11px] text-muted-foreground">{m.hint}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Category */}
        <div className="space-y-1.5">
          <Label className="text-xs">Vehicle category</Label>
          <div className="flex flex-wrap gap-2">
            {activeCats.map((cat) => (
              <button
                key={cat.id}
                type="button"
                onClick={() => {
                  setSimCatId(cat.id);
                  setSimResult(null);
                  if (simMode === "hourly") {
                    const minH = n(rates[cat.id]?.minHours);
                    if (minH != null && minH > 0) setSimHours(String(minH));
                  }
                }}
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
        </div>

        {simMode === "one_way" ? (
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label className="flex items-center gap-1.5 text-xs">
                <Navigation className="h-3 w-3" /> Pick-up location
              </Label>
              <PlacesInput
                placeholder="e.g. Heathrow Airport, London"
                value={simOrigin}
                onChange={(v) => {
                  setSimOrigin(v);
                  setSimResult(null);
                }}
              />
            </div>
            <div className="space-y-1.5">
              <Label className="flex items-center gap-1.5 text-xs">
                <MapPin className="h-3 w-3" /> Drop-off location
              </Label>
              <PlacesInput
                placeholder="e.g. The Savoy, London"
                value={simDest}
                onChange={(v) => {
                  setSimDest(v);
                  setSimResult(null);
                }}
              />
            </div>
          </div>
        ) : (
          <div className="space-y-2 rounded-xl border border-border/60 bg-muted/20 p-4">
            <Label className="text-xs">Hours to hire</Label>
            <div className="flex flex-wrap items-center gap-2">
              {[2, 3, 4, 5, 6, 8, 10, 12].map((h) => (
                <button
                  key={h}
                  type="button"
                  onClick={() => {
                    setSimHours(String(h));
                    setSimResult(null);
                  }}
                  className={cn(
                    "rounded-full border px-3 py-1 text-xs font-medium",
                    n(simHours) === h
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-border bg-card text-muted-foreground hover:border-primary/40",
                  )}
                >
                  {h}h
                </button>
              ))}
              <Input
                inputMode="decimal"
                className="h-8 w-20"
                value={simHours}
                onChange={(e) => {
                  setSimHours(e.target.value);
                  setSimResult(null);
                }}
                placeholder="hrs"
              />
            </div>
            {simCatId && n(rates[simCatId]?.minHours) != null ? (
              <p className="text-[11px] text-muted-foreground">
                Your min hire for this category is{" "}
                <strong className="text-foreground">
                  {n(rates[simCatId].minHours)} hours
                </strong>
                . Shorter selections still bill the minimum.
              </p>
            ) : (
              <p className="text-[11px] text-muted-foreground">
                No addresses needed — hourly is as-directed time, not a mapped
                route.
              </p>
            )}
            {simCatId && n(rates[simCatId]?.hourly) == null ? (
              <p className="text-[11px] text-amber-600 dark:text-amber-400">
                Set an /hr rate for this category in the table above first.
              </p>
            ) : null}
          </div>
        )}

        <Button
          type="button"
          variant="outline"
          className="w-full"
          disabled={
            simLoading ||
            !simCatId ||
            (simMode === "one_way"
              ? !simOrigin.trim() || !simDest.trim()
              : !n(simHours))
          }
          onClick={() => void runSim()}
        >
          {simLoading
            ? "Calculating…"
            : simMode === "hourly"
              ? "Calculate hourly price →"
              : "Calculate one-way price →"}
        </Button>

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
            <div className="flex flex-wrap gap-4 text-sm">
              <div>
                <p className="text-[11px] text-muted-foreground uppercase tracking-wide">
                  Mode
                </p>
                <p className="font-semibold">
                  {simResult.mode === "hourly" ? "Hourly" : "One way"}
                </p>
              </div>
              <div>
                <p className="text-[11px] text-muted-foreground uppercase tracking-wide">
                  Category
                </p>
                <p className="font-semibold">{simCat.name}</p>
              </div>
              {simResult.mode === "one_way" ? (
                <>
                  <div>
                    <p className="text-[11px] text-muted-foreground uppercase tracking-wide">
                      Distance
                    </p>
                    <p className="font-semibold">{simResult.distanceLabel}</p>
                  </div>
                  <div>
                    <p className="text-[11px] text-muted-foreground uppercase tracking-wide">
                      Duration
                    </p>
                    <p className="font-semibold">{simResult.durationLabel}</p>
                  </div>
                </>
              ) : (
                <>
                  <div>
                    <p className="text-[11px] text-muted-foreground uppercase tracking-wide">
                      Selected
                    </p>
                    <p className="font-semibold">{simResult.hoursSelected} h</p>
                  </div>
                  <div>
                    <p className="text-[11px] text-muted-foreground uppercase tracking-wide">
                      Billed
                    </p>
                    <p className="font-semibold">{simResult.hoursBilled} h</p>
                  </div>
                </>
              )}
            </div>

            <div className="rounded-lg bg-background/60 px-4 py-3 space-y-1.5">
              {simResult.mode === "hourly" ? (
                <>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">
                      {simResult.hoursBilled} h × {currency}{" "}
                      {n(rates[simCatId]?.hourly)?.toFixed(2)}/hr
                    </span>
                    <span>
                      {currency} {simResult.estimated.toFixed(2)}
                    </span>
                  </div>
                  {simResult.appliedMinHours ? (
                    <p className="text-[11px] text-amber-600 dark:text-amber-400">
                      Min hours applied (you selected {simResult.hoursSelected}{" "}
                      h).
                    </p>
                  ) : null}
                </>
              ) : (
                <>
                  {n(rates[simCatId]?.baseFare) != null && (
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Base fare</span>
                      <span>
                        {currency} {n(rates[simCatId].baseFare)!.toFixed(2)}
                      </span>
                    </div>
                  )}
                  {n(rates[simCatId]?.perDistance) != null && (
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">
                        {simResult.distanceLabel} × {currency}
                        {n(rates[simCatId].perDistance)!.toFixed(2)}/
                        {distanceUnit === "MILE" ? "mi" : "km"}
                      </span>
                      <span>
                        {currency}{" "}
                        {(
                          simResult.distanceValue *
                          n(rates[simCatId].perDistance)!
                        ).toFixed(2)}
                      </span>
                    </div>
                  )}
                  {n(rates[simCatId]?.perMinute) != null && (
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">
                        {simResult.durationLabel} × {currency}
                        {n(rates[simCatId].perMinute)!.toFixed(2)}/min
                      </span>
                      <span>
                        {currency}{" "}
                        {(
                          simResult.durationMins *
                          n(rates[simCatId].perMinute)!
                        ).toFixed(2)}
                      </span>
                    </div>
                  )}
                </>
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

            {simResult.mode === "one_way" ? (
              simResult.bandStatus ? (
                <div
                  className={cn(
                    "rounded-lg px-3 py-2.5 text-sm",
                    simResult.bandStatus === "ok" &&
                      "bg-green-500/10 text-green-700 dark:text-green-400",
                    simResult.bandStatus === "low" &&
                      "bg-amber-400/15 text-amber-700 dark:text-amber-400",
                    simResult.bandStatus === "high" &&
                      "bg-red-500/10 text-red-700 dark:text-red-400",
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
                  No market benchmark available for your currency yet.
                </p>
              )
            ) : null}
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
