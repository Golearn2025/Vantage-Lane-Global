"use client";

import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Trash2 } from "lucide-react";
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
import {
  deletePartnerRateCard,
  fetchDraftRateCard,
  upsertPartnerRateCard,
} from "@/modules/partner/api";

const CURRENCIES = [
  { code: "GBP", name: "British Pound" },
  { code: "EUR", name: "Euro" },
  { code: "CHF", name: "Swiss Franc" },
  { code: "USD", name: "US Dollar" },
  { code: "AED", name: "UAE Dirham" },
  { code: "SAR", name: "Saudi Riyal" },
  { code: "QAR", name: "Qatari Riyal" },
  { code: "SGD", name: "Singapore Dollar" },
  { code: "HKD", name: "Hong Kong Dollar" },
  { code: "AUD", name: "Australian Dollar" },
  { code: "CAD", name: "Canadian Dollar" },
  { code: "RON", name: "Romanian Leu" },
  { code: "PLN", name: "Polish Złoty" },
];

const COPY: Record<string, { title: string; blurb: string }> = {
  SECURITY: {
    title: "Operative rates",
    blurb:
      "Declare your standard hourly and daily rates for close protection / security work.",
  },
  YACHT: {
    title: "Charter rates",
    blurb: "Declare indicative hourly and daily charter rates for your vessels.",
  },
  AVIATION: {
    title: "Flight rates",
    blurb:
      "Declare indicative hourly and daily rates for your aircraft / charter operations.",
  },
  PRIVATE_AVIATION: {
    title: "Flight rates",
    blurb:
      "Declare indicative hourly and daily rates for your aircraft / charter operations.",
  },
};

function parseAmount(v: string): number | null {
  const t = v.trim();
  if (!t) return null;
  const x = parseFloat(t);
  return Number.isFinite(x) ? x : null;
}

/** Hourly/daily rate card for Security, Yacht, Aviation — no fleet gate. */
export function PartnerServiceRatesForm({
  organizationId,
  offeringId,
  serviceCode,
}: {
  organizationId: string;
  offeringId: string;
  serviceCode: string;
}) {
  const qc = useQueryClient();
  const draftQ = useQuery({
    queryKey: ["partner", "rates", organizationId],
    queryFn: () => fetchDraftRateCard(organizationId, offeringId),
  });

  const [currency, setCurrency] = useState("GBP");
  const [hourly, setHourly] = useState("");
  const [daily, setDaily] = useState("");

  useEffect(() => {
    if (!draftQ.data) return;
    if (draftQ.data.card) setCurrency(draftQ.data.card.currencyCode);
    let h = "";
    let d = "";
    for (const rule of draftQ.data.rules ?? []) {
      if (rule.ruleType === "HOURLY" && rule.hourlyAmount != null) {
        h = String(rule.hourlyAmount);
      }
      if (rule.ruleType === "DAILY" && rule.dailyAmount != null) {
        d = String(rule.dailyAmount);
      }
    }
    setHourly(h);
    setDaily(d);
  }, [draftQ.data]);

  const save = useMutation({
    mutationFn: async () => {
      const hourlyAmount = parseAmount(hourly);
      const dailyAmount = parseAmount(daily);
      if (hourlyAmount == null && dailyAmount == null) {
        throw new Error("Enter at least an hourly or daily rate");
      }
      return upsertPartnerRateCard({
        organizationId,
        offeringId,
        cardId: draftQ.data?.card?.id,
        currencyCode: currency,
        distanceUnit: "MILE",
        categoryRates: [
          {
            vehicleCategoryId: null,
            baseAmount: null,
            perUnitAmount: null,
            minimumAmount: null,
            hourlyAmount,
            dailyAmount,
            fixedTransferAmount: null,
            perMinuteAmount: null,
            notes: null,
          },
        ],
      });
    },
    onSuccess: async () => {
      toast.success("Rates saved");
      await qc.invalidateQueries({ queryKey: ["partner", "rates"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const del = useMutation({
    mutationFn: async () => {
      const id = draftQ.data?.card?.id;
      if (!id) throw new Error("No rate card to delete");
      await deletePartnerRateCard(id);
    },
    onSuccess: async () => {
      toast.success("Rate card deleted");
      setHourly("");
      setDaily("");
      await qc.invalidateQueries({ queryKey: ["partner", "rates"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const copy = COPY[serviceCode] ?? {
    title: "Rate card",
    blurb: "Declare your standard hourly and daily rates.",
  };

  if (draftQ.isLoading) {
    return (
      <p className="text-sm text-muted-foreground animate-pulse">Loading rates…</p>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-2xl tracking-tight md:text-3xl">
          {copy.title}
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">{copy.blurb}</p>
      </div>

      <section className="rounded-2xl border border-border/60 bg-card p-5 space-y-4">
        <div className="grid gap-4 sm:grid-cols-3">
          <div className="space-y-1.5">
            <Label>Currency</Label>
            <Select value={currency} onValueChange={setCurrency}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="max-h-72">
                {CURRENCIES.map((c) => (
                  <SelectItem key={c.code} value={c.code}>
                    {c.code} — {c.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label>Hourly rate</Label>
            <Input
              inputMode="decimal"
              value={hourly}
              onChange={(e) => setHourly(e.target.value)}
              placeholder="0.00"
            />
          </div>
          <div className="space-y-1.5">
            <Label>Daily rate</Label>
            <Input
              inputMode="decimal"
              value={daily}
              onChange={(e) => setDaily(e.target.value)}
              placeholder="0.00"
            />
          </div>
        </div>
      </section>

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
                window.confirm("Delete this rate card? This cannot be undone.")
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

export const SERVICE_RATE_CODES = new Set([
  "SECURITY",
  "YACHT",
  "AVIATION",
  "PRIVATE_AVIATION",
]);
