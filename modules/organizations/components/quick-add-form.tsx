"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import {
  LEAD_SOURCES,
  SERVICE_OPTIONS,
  quickAddSchema,
  type QuickAddFormValues,
} from "@/modules/organizations/schemas";
import { useQuickAddOperator } from "@/modules/organizations/hooks";
import type { QuickAddOperatorResult } from "@/modules/organizations/types";
import { LocationSearchPicker } from "@/modules/network/components/location-search-picker";
import { CoverageComposer } from "@/modules/organizations/components/coverage-composer";
import {
  CountryCombobox,
  FieldHint,
} from "@/shared/components/country-combobox";
import { getDialCode, withCountryDial } from "@/shared/lib/countries";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { Textarea } from "@/shared/ui/textarea";
import { Label } from "@/shared/ui/label";
import { Checkbox } from "@/shared/ui/checkbox";
import { Badge } from "@/shared/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/ui/select";

export function QuickAddOperatorForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const prefillCoverageId = searchParams.get("coverage_location_id") ?? "";
  const mutation = useQuickAddOperator();
  const [baseSummary, setBaseSummary] = useState<string | null>(null);
  const [lastResult, setLastResult] = useState<QuickAddOperatorResult | null>(null);

  const form = useForm<QuickAddFormValues>({
    resolver: zodResolver(quickAddSchema),
    defaultValues: {
      display_name: "",
      legal_country_code: "GB",
      service_code: "GROUND_TRANSPORTATION",
      legal_name: "",
      website_url: "",
      primary_whatsapp_e164: "+44 ",
      primary_email: "",
      primary_phone_e164: "+44 ",
      base_label: "",
      base_city: "",
      base_lat: null,
      base_lng: null,
      google_place_id: "",
      lead_source: "",
      internal_note: "",
      coverage_location_id: prefillCoverageId,
      coverage_radius_km: 30,
      secondary_coverage_location_ids: [],
      is_test: false,
    },
  });

  const country = form.watch("legal_country_code");
  const dial = getDialCode(country);

  useEffect(() => {
    if (prefillCoverageId) {
      form.setValue("coverage_location_id", prefillCoverageId);
    }
  }, [prefillCoverageId, form]);

  function applyDialToPhones(nextCountry: string) {
    const whatsapp = form.getValues("primary_whatsapp_e164") ?? "";
    const phone = form.getValues("primary_phone_e164") ?? "";
    form.setValue("primary_whatsapp_e164", withCountryDial(whatsapp, nextCountry));
    form.setValue("primary_phone_e164", withCountryDial(phone, nextCountry));
  }

  async function onSubmit(values: QuickAddFormValues) {
    setLastResult(null);
    try {
      const parsed = quickAddSchema.parse(values);
      const result = await mutation.mutateAsync({
        ...parsed,
        coverage_location_id: parsed.coverage_location_id || undefined,
        coverage_radius_km: parsed.coverage_location_id
          ? (parsed.coverage_radius_km ?? null)
          : null,
        secondary_coverage_location_ids: parsed.secondary_coverage_location_ids ?? [],
        google_place_id: parsed.google_place_id || undefined,
        base_lat: parsed.base_lat ?? null,
        base_lng: parsed.base_lng ?? null,
      });
      setLastResult(result);

      if (result.blocked_by_unique_identifiers) return;
      if (result.created && result.organization_id) {
        router.replace(`/organizations/${result.organization_id}`);
      }
    } catch (error) {
      form.setError("root", {
        message: error instanceof Error ? error.message : "Quick Add failed",
      });
    }
  }

  const softWarnings =
    lastResult?.potential_duplicates.filter((dup) =>
      dup.match_reasons.every(
        (reason) =>
          reason === "phone" || reason === "whatsapp" || reason === "same_name_and_country",
      ),
    ) ?? [];

  return (
    <div className="mx-auto max-w-2xl space-y-6 px-1 sm:px-0">
      {/* ── Header ── */}
      <div>
        <nav className="flex items-center gap-1.5 text-sm text-muted-foreground">
          <Link href="/organizations" className="hover:text-foreground hover:underline">
            Organizations
          </Link>
          <span>/</span>
          <span className="text-foreground">Add Operator</span>
        </nav>
        <h1 className="mt-3 font-display text-2xl tracking-tight sm:text-3xl">Add Operator</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Only <strong>Company name</strong> and <strong>Country</strong> are required — fill the
          rest as you know it.
        </p>
      </div>

      <form className="space-y-4" onSubmit={form.handleSubmit(onSubmit)}>
        {/* ── 1 · Identity ── */}
        <FormSection step="1" title="Identity" description="Who they are on the network.">
          <div className="space-y-1.5">
            <Label htmlFor="display_name">
              Company name <span className="text-danger">*</span>
            </Label>
            <FieldHint>Trading name as you know them — e.g. "Milano Executive Cars".</FieldHint>
            <Input
              id="display_name"
              autoComplete="organization"
              {...form.register("display_name")}
            />
            {form.formState.errors.display_name ? (
              <p className="text-xs text-danger">{form.formState.errors.display_name.message}</p>
            ) : null}
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label>
                Country <span className="text-danger">*</span>
              </Label>
              <FieldHint>Sets WhatsApp & phone prefix automatically.</FieldHint>
              <CountryCombobox
                value={country}
                onChange={(option) => {
                  form.setValue("legal_country_code", option.code);
                  applyDialToPhones(option.code);
                }}
              />
            </div>

            <div className="space-y-1.5">
              <Label>Service</Label>
              <FieldHint>What they supply on the network.</FieldHint>
              <Select
                value={form.watch("service_code") || "GROUND_TRANSPORTATION"}
                onValueChange={(value) =>
                  form.setValue("service_code", value as QuickAddFormValues["service_code"])
                }
              >
                <SelectTrigger className="h-10">
                  <SelectValue placeholder="Select service" />
                </SelectTrigger>
                <SelectContent>
                  {SERVICE_OPTIONS.map((option) => (
                    <SelectItem key={option.code} value={option.code}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="legal_name">Legal company name</Label>
              <FieldHint>Official registered name if different from display name.</FieldHint>
              <Input id="legal_name" {...form.register("legal_name")} />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="website_url">Website</Label>
              <Input
                id="website_url"
                type="url"
                inputMode="url"
                placeholder="https://example.com"
                {...form.register("website_url")}
              />
              {form.formState.errors.website_url ? (
                <p className="text-xs text-danger">{form.formState.errors.website_url.message}</p>
              ) : null}
            </div>
          </div>
        </FormSection>

        {/* ── 2 · Contact ── */}
        <FormSection
          step="2"
          title="Contact details"
          description="How to reach them — prefix is set automatically from country."
        >
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="primary_whatsapp_e164">
                WhatsApp{" "}
                {dial ? <span className="font-normal text-muted-foreground">({dial})</span> : null}
              </Label>
              <Input
                id="primary_whatsapp_e164"
                inputMode="tel"
                placeholder={`${dial || "+"} 7…`}
                {...form.register("primary_whatsapp_e164")}
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="primary_phone_e164">
                Phone{" "}
                {dial ? <span className="font-normal text-muted-foreground">({dial})</span> : null}
              </Label>
              <Input
                id="primary_phone_e164"
                inputMode="tel"
                placeholder={`${dial || "+"} 7…`}
                {...form.register("primary_phone_e164")}
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="primary_email">Email</Label>
            <Input
              id="primary_email"
              type="email"
              inputMode="email"
              placeholder="ops@example.com"
              {...form.register("primary_email")}
            />
          </div>
        </FormSection>

        {/* ── 3 · Base ── */}
        <FormSection
          step="3"
          title="Primary base"
          description="Where their ops sit. Search Google or catalog — add more bases later on the profile."
          optional
        >
          <LocationSearchPicker
            placeholder="Search city, depot or area…"
            onPick={(location) => {
              // Dacă locația e de tip COUNTRY (ex: Spain), city rămâne gol — nu are sens să punem țara ca și city
              const isCountry = location.kind === "COUNTRY";
              const cityValue = isCountry ? "" : location.name;
              const labelValue = isCountry
                ? `${location.name} base`
                : `${location.name} base`;

              // Mereu resetăm — nu păstrăm valori de la selecția anterioară
              form.setValue("base_city", cityValue);
              form.setValue("base_label", labelValue);
              form.setValue("base_lat", location.lat);
              form.setValue("base_lng", location.lng);
              if (location.googlePlaceId) form.setValue("google_place_id", location.googlePlaceId);
              setBaseSummary(
                `${location.name}${location.countryCode ? ` · ${location.countryCode}` : ""}${isCountry ? " (country — add city below)" : ""}`,
              );
            }}
          />
          {baseSummary ? (
            <p className="text-xs text-muted-foreground">
              Selected: <strong>{baseSummary}</strong>
            </p>
          ) : null}
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="base_label">Base nickname</Label>
              <Input
                id="base_label"
                placeholder="e.g. Milan HQ"
                value={form.watch("base_label") ?? ""}
                onChange={(e) => form.setValue("base_label", e.target.value, { shouldDirty: true })}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="base_city">City / area</Label>
              <Input
                id="base_city"
                placeholder="Auto-filled from search"
                value={form.watch("base_city") ?? ""}
                onChange={(e) => form.setValue("base_city", e.target.value, { shouldDirty: true })}
              />
            </div>
          </div>
        </FormSection>

        {/* ── 4 · Coverage ── */}
        <FormSection
          step="4"
          title="Coverage"
          description={
            form.watch("service_code") === "GROUND_TRANSPORTATION" ||
            form.watch("service_code") === "AVIATION"
              ? "Primary zone (city + radius) then optional secondary airports."
              : form.watch("service_code") === "YACHT"
                ? "Primary marina / coastal city + radius, then optional other ports."
                : "Primary city + radius, then optional extra cities (no airports)."
          }
          optional
        >
          <CoverageComposer
            serviceCode={form.watch("service_code")}
            onChange={(bundle) => {
              form.setValue("coverage_location_id", bundle.primary?.locationId ?? "");
              form.setValue("coverage_radius_km", bundle.primary?.radiusKm ?? null);
              form.setValue(
                "secondary_coverage_location_ids",
                bundle.secondaries.map((item) => item.locationId),
              );
            }}
          />
        </FormSection>

        {/* ── 5 · CRM ── */}
        <FormSection
          step="5"
          title="CRM & internal"
          description="Lead source and private notes — partners never see this."
          optional
        >
          <div className="space-y-1.5">
            <Label>Lead source</Label>
            <Select
              value={form.watch("lead_source") || undefined}
              onValueChange={(value) => form.setValue("lead_source", value)}
            >
              <SelectTrigger className="h-10">
                <SelectValue placeholder="Where did this lead come from?" />
              </SelectTrigger>
              <SelectContent>
                {LEAD_SOURCES.map((source) => (
                  <SelectItem key={source} value={source}>
                    {source}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="internal_note">Internal note</Label>
            <Textarea id="internal_note" rows={3} {...form.register("internal_note")} />
          </div>

          <div className="flex items-start gap-3 rounded-lg border border-border bg-muted/30 p-3">
            <Checkbox
              checked={form.watch("is_test")}
              onCheckedChange={(checked) => form.setValue("is_test", Boolean(checked))}
              className="mt-0.5"
            />
            <div>
              <Label className="cursor-pointer font-medium">Mark as TEST organization</Label>
              <p className="mt-0.5 text-xs text-muted-foreground">
                Shows a TEST badge — keeps demo/fake leads clearly separated.
              </p>
            </div>
          </div>
        </FormSection>

        {/* ── Alerts ── */}
        {lastResult?.blocked_by_unique_identifiers ? (
          <div className="rounded-lg border border-danger/30 bg-danger/5 p-4">
            <p className="font-medium text-danger">Hard block — identifier already exists</p>
            <ul className="mt-2 space-y-1 text-sm">
              {lastResult.potential_duplicates.map((dup) => (
                <li key={dup.organization_id}>
                  <Link className="underline" href={`/organizations/${dup.organization_id}`}>
                    {dup.display_name}
                  </Link>{" "}
                  <Badge variant="danger" className="ml-1.5">
                    {dup.match_reasons.join(", ")}
                  </Badge>
                </li>
              ))}
            </ul>
          </div>
        ) : null}

        {!lastResult?.blocked_by_unique_identifiers && softWarnings.length > 0 ? (
          <div className="rounded-lg border border-warning/40 bg-warning/10 p-4">
            <p className="font-medium">Possible duplicates — soft warning</p>
            <ul className="mt-2 space-y-1 text-sm">
              {softWarnings.map((dup) => (
                <li key={dup.organization_id}>
                  {dup.display_name}{" "}
                  <span className="text-muted-foreground">({dup.match_reasons.join(", ")})</span>
                </li>
              ))}
            </ul>
          </div>
        ) : null}

        {form.formState.errors.root ? (
          <p className="text-sm text-danger">{form.formState.errors.root.message}</p>
        ) : null}

        {/* ── Actions ── */}
        <div className="flex flex-col-reverse gap-2 pt-2 sm:flex-row sm:justify-end">
          <Button type="button" variant="outline" asChild>
            <Link href="/organizations">Cancel</Link>
          </Button>
          <Button type="submit" disabled={mutation.isPending}>
            {mutation.isPending ? "Creating…" : "Create Lead →"}
          </Button>
        </div>
      </form>
    </div>
  );
}

/* ── Helper: numbered form section ── */
function FormSection({
  step,
  title,
  description,
  optional = false,
  children,
}: {
  step: string;
  title: string;
  description: string;
  optional?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className="overflow-hidden rounded-xl border border-border bg-card">
      <div className="flex items-start gap-3 border-b border-border bg-muted/30 px-4 py-3">
        <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/15 text-xs font-semibold text-primary">
          {step}
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="text-sm font-semibold">{title}</h2>
            {optional ? (
              <span className="text-[10px] font-normal text-muted-foreground">optional</span>
            ) : null}
          </div>
          <p className="mt-0.5 text-xs text-muted-foreground">{description}</p>
        </div>
      </div>
      <div className="space-y-4 p-4">{children}</div>
    </div>
  );
}
