"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { quickAddSchema, type QuickAddFormValues } from "@/modules/organizations/schemas";
import { useLocationsCatalog, useQuickAddOperator } from "@/modules/organizations/hooks";
import type { QuickAddOperatorResult } from "@/modules/organizations/types";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { Textarea } from "@/shared/ui/textarea";
import { Label } from "@/shared/ui/label";
import { Checkbox } from "@/shared/ui/checkbox";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/ui/card";
import { Badge } from "@/shared/ui/badge";

export function QuickAddOperatorForm() {
  const router = useRouter();
  const mutation = useQuickAddOperator();
  const [locationQuery, setLocationQuery] = useState("");
  const locations = useLocationsCatalog(locationQuery);
  const [lastResult, setLastResult] = useState<QuickAddOperatorResult | null>(
    null,
  );

  const form = useForm<QuickAddFormValues>({
    resolver: zodResolver(quickAddSchema),
    defaultValues: {
      display_name: "",
      legal_country_code: "GB",
      legal_name: "",
      website_url: "",
      primary_whatsapp_e164: "",
      primary_email: "",
      primary_phone_e164: "",
      base_label: "",
      base_city: "",
      google_place_id: "",
      lead_source: "",
      internal_note: "",
      coverage_location_id: "",
      is_test: false,
    },
  });

  async function onSubmit(values: QuickAddFormValues) {
    setLastResult(null);
    try {
      const parsed = quickAddSchema.parse(values);
      const result = await mutation.mutateAsync({
        ...parsed,
        coverage_location_id: parsed.coverage_location_id || undefined,
      });
      setLastResult(result);

      if (result.blocked_by_unique_identifiers) {
        return;
      }

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
          reason === "phone" ||
          reason === "whatsapp" ||
          reason === "same_name_and_country",
      ),
    ) ?? [];

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <p className="text-sm text-muted-foreground">
          <Link href="/organizations" className="hover:underline">
            Organizations
          </Link>{" "}
          / Quick Add
        </p>
        <h1 className="mt-2 font-display text-3xl tracking-tight">
          Add Operator
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Creates a Lead with Ground Transportation defaults. Fast path for
          network building.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Operator details</CardTitle>
          <CardDescription>
            Required: company name and country. Service defaults to Ground
            Transportation.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form className="space-y-5" onSubmit={form.handleSubmit(onSubmit)}>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="display_name">Company / display name *</Label>
                <Input id="display_name" {...form.register("display_name")} />
                {form.formState.errors.display_name ? (
                  <p className="text-xs text-danger">
                    {form.formState.errors.display_name.message}
                  </p>
                ) : null}
              </div>
              <div className="space-y-2">
                <Label htmlFor="legal_country_code">Country (ISO-2) *</Label>
                <Input
                  id="legal_country_code"
                  maxLength={2}
                  {...form.register("legal_country_code")}
                />
              </div>
              <div className="space-y-2">
                <Label>Service</Label>
                <Input value="Ground Transportation" disabled />
              </div>
              <div className="space-y-2">
                <Label htmlFor="legal_name">Legal name</Label>
                <Input id="legal_name" {...form.register("legal_name")} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="website_url">Website</Label>
                <Input id="website_url" {...form.register("website_url")} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="primary_whatsapp_e164">WhatsApp</Label>
                <Input
                  id="primary_whatsapp_e164"
                  placeholder="+44…"
                  {...form.register("primary_whatsapp_e164")}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="primary_email">Email</Label>
                <Input id="primary_email" {...form.register("primary_email")} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="primary_phone_e164">Phone</Label>
                <Input
                  id="primary_phone_e164"
                  {...form.register("primary_phone_e164")}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="base_label">Base label</Label>
                <Input id="base_label" {...form.register("base_label")} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="base_city">Base city</Label>
                <Input id="base_city" {...form.register("base_city")} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="google_place_id">Google Place ID</Label>
                <Input
                  id="google_place_id"
                  {...form.register("google_place_id")}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lead_source">Lead source</Label>
                <Input id="lead_source" {...form.register("lead_source")} />
              </div>
              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="coverage_search">Coverage airport / location</Label>
                <Input
                  id="coverage_search"
                  placeholder="Search LHR, MAN, city…"
                  value={locationQuery}
                  onChange={(event) => setLocationQuery(event.target.value)}
                />
                <div className="mt-2 max-h-40 space-y-1 overflow-auto rounded-md border border-border p-2">
                  {(locations.data ?? []).map((location) => {
                    const selected =
                      form.watch("coverage_location_id") === location.id;
                    return (
                      <button
                        key={location.id}
                        type="button"
                        className={`flex w-full items-center justify-between rounded px-2 py-1.5 text-left text-sm hover:bg-muted ${
                          selected ? "bg-muted" : ""
                        }`}
                        onClick={() =>
                          form.setValue(
                            "coverage_location_id",
                            selected ? "" : location.id,
                          )
                        }
                      >
                        <span>
                          {location.name}
                          {location.iata ? ` (${location.iata})` : ""}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {location.kind}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="internal_note">Internal note (VL private)</Label>
                <Textarea id="internal_note" {...form.register("internal_note")} />
              </div>
              <div className="flex items-center gap-2 sm:col-span-2">
                <Checkbox
                  checked={form.watch("is_test")}
                  onCheckedChange={(checked) =>
                    form.setValue("is_test", Boolean(checked))
                  }
                />
                <Label>Mark as TEST organization</Label>
              </div>
            </div>

            {lastResult?.blocked_by_unique_identifiers ? (
              <div className="rounded-md border border-danger/30 bg-danger/5 p-4">
                <p className="font-medium text-danger">
                  Hard block — unique identifier already exists
                </p>
                <ul className="mt-2 space-y-1 text-sm">
                  {lastResult.potential_duplicates.map((dup) => (
                    <li key={dup.organization_id}>
                      <Link
                        className="underline"
                        href={`/organizations/${dup.organization_id}`}
                      >
                        {dup.display_name}
                      </Link>{" "}
                      <Badge variant="danger" className="ml-2">
                        {dup.match_reasons.join(", ")}
                      </Badge>
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}

            {!lastResult?.blocked_by_unique_identifiers &&
            softWarnings.length > 0 ? (
              <div className="rounded-md border border-warning/40 bg-warning/10 p-4">
                <p className="font-medium">Possible duplicates (soft warning)</p>
                <ul className="mt-2 space-y-1 text-sm">
                  {softWarnings.map((dup) => (
                    <li key={dup.organization_id}>
                      {dup.display_name}{" "}
                      <span className="text-muted-foreground">
                        ({dup.match_reasons.join(", ")})
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}

            {form.formState.errors.root ? (
              <p className="text-sm text-danger">
                {form.formState.errors.root.message}
              </p>
            ) : null}

            <div className="flex gap-2">
              <Button type="submit" disabled={mutation.isPending}>
                {mutation.isPending ? "Creating…" : "Create Lead"}
              </Button>
              <Button type="button" variant="outline" asChild>
                <Link href="/organizations">Cancel</Link>
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
