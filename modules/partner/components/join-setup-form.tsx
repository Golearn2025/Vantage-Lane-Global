"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Car,
  Plane,
  Shield,
  Hotel,
  ConciergeBell,
  Anchor,
  Stethoscope,
  Sparkles,
} from "lucide-react";
import { createClient } from "@/shared/lib/supabase/client";
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
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/shared/ui/card";
import { PhoneInput } from "@/shared/components/phone-input";
import { PlacesInputWithCoords } from "@/shared/components/places-input";
import { findDialCountry, toE164 } from "@/shared/lib/phone/dial-countries";

const COUNTRIES = [
  { code: "GB", name: "United Kingdom" },
  { code: "IE", name: "Ireland" },
  { code: "FR", name: "France" },
  { code: "DE", name: "Germany" },
  { code: "ES", name: "Spain" },
  { code: "IT", name: "Italy" },
  { code: "NL", name: "Netherlands" },
  { code: "BE", name: "Belgium" },
  { code: "CH", name: "Switzerland" },
  { code: "AT", name: "Austria" },
  { code: "PT", name: "Portugal" },
  { code: "PL", name: "Poland" },
  { code: "CZ", name: "Czechia" },
  { code: "US", name: "United States" },
  { code: "AE", name: "United Arab Emirates" },
] as const;

const SERVICES = [
  {
    code: "GROUND_TRANSPORTATION",
    label: "Ground Transportation",
    Icon: Car,
    hint: "Chauffeur, airport transfers, city-to-city — fleet & rate card",
  },
  {
    code: "AVIATION",
    label: "Aviation",
    Icon: Plane,
    hint: "Private jets, helicopters, charter brokerage & FBO handling",
  },
  {
    code: "SECURITY",
    label: "Security",
    Icon: Shield,
    hint: "Close protection, executive security, venue & event guarding",
  },
  {
    code: "HOSPITALITY",
    label: "Hospitality",
    Icon: Hotel,
    hint: "Premium hotels, private dining, venue & restaurant partnerships",
  },
  {
    code: "CONCIERGE",
    label: "Concierge",
    Icon: ConciergeBell,
    hint: "Lifestyle management, exclusive access, personal shopping",
  },
  {
    code: "YACHT",
    label: "Yacht & Marine",
    Icon: Anchor,
    hint: "Yacht charter, tender service, marina & waterside handling",
  },
  {
    code: "MEDICAL",
    label: "Medical & Wellness",
    Icon: Stethoscope,
    hint: "Medical escort, private clinic partnerships, wellness retreats",
  },
  {
    code: "EVENTS",
    label: "Events & Protocol",
    Icon: Sparkles,
    hint: "Corporate events, galas, diplomatic protocol & VIP production",
  },
] as const;

type ServiceCode = (typeof SERVICES)[number]["code"];

const SERVICE_CODES = SERVICES.map((s) => s.code) as [
  ServiceCode,
  ...ServiceCode[],
];

const schema = z.object({
  displayName: z.string().min(2, "Company name required"),
  legalName: z.string().optional(),
  country: z.string().length(2),
  city: z.string().min(2, "City or address required"),
  formattedAddress: z.string().optional(),
  placeId: z.string().optional(),
  lat: z.number().optional(),
  lng: z.number().optional(),
  phone: z
    .string()
    .min(10, "Enter a valid phone number")
    .regex(/^\+\d{8,15}$/, "Enter a valid phone number"),
  serviceCode: z.enum(SERVICE_CODES),
});

type FormValues = z.infer<typeof schema>;

export function JoinSetupForm() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [ready, setReady] = useState(false);
  const [needsConfirm, setNeedsConfirm] = useState(false);
  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      displayName: "",
      legalName: "",
      country: "GB",
      city: "",
      formattedAddress: "",
      placeId: "",
      lat: undefined,
      lng: undefined,
      phone: toE164(findDialCountry("GB").dial, ""),
      serviceCode: "GROUND_TRANSPORTATION",
    },
  });

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        router.replace("/join");
        return;
      }
      if (!user.email_confirmed_at) {
        if (!cancelled) setNeedsConfirm(true);
        return;
      }
      const { data: membership } = await supabase
        .from("organization_memberships")
        .select("id")
        .eq("user_id", user.id)
        .eq("status", "ACTIVE")
        .is("archived_at", null)
        .limit(1)
        .maybeSingle();
      if (membership) {
        router.replace("/partner");
        return;
      }
      const { data: profile } = await supabase
        .from("profiles")
        .select("display_name, phone")
        .eq("id", user.id)
        .maybeSingle();
      if (profile?.phone) form.setValue("phone", profile.phone);
      if (profile?.display_name) {
        // keep company empty; contact name already on profile
      }
      if (!cancelled) setReady(true);
    })();
    return () => {
      cancelled = true;
    };
  }, [form, router]);

  async function onSubmit(values: FormValues) {
    setError(null);
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user?.email_confirmed_at) {
      setError("Confirm your email before continuing.");
      return;
    }

  const { data, error: rpcErr } = await (supabase as unknown as {
    rpc: (
      fn: string,
      args: { p_payload: Record<string, unknown> },
    ) => Promise<{ data: unknown; error: Error | null }>;
  }).rpc("rpc_partner_bootstrap_org", {
    p_payload: {
      display_name: values.displayName.trim(),
      legal_name: values.legalName?.trim() || null,
      legal_country_code: values.country,
      legal_city: values.city.trim(),
      primary_phone_e164: values.phone.trim(),
      primary_whatsapp_e164: values.phone.trim(),
      service_code: values.serviceCode,
      contact_name: user.user_metadata?.display_name ?? null,
      hq_formatted_address: values.formattedAddress ?? null,
      hq_place_id: values.placeId ?? null,
      hq_lat: values.lat ?? null,
      hq_lng: values.lng ?? null,
    },
  });

  if (rpcErr) {
    const msg = rpcErr.message ?? "";
    if (msg.includes("phone number already registered")) {
      setError("This phone number is already registered with another organisation. Use a different number or contact VL support.");
    } else if (msg.includes("already has organization membership")) {
      setError("This account already has an organisation. Log in to your partner workspace.");
    } else {
      setError(msg);
    }
    return;
  }

  void data;
  router.replace("/partner");
  router.refresh();
}

  if (needsConfirm) {
    return (
      <div className="relative flex min-h-dvh items-center justify-center px-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Email not verified</CardTitle>
            <CardDescription>
              Open the confirmation link we sent, then return here to finish
              setup.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  if (!ready) {
    return (
      <div className="flex min-h-dvh items-center justify-center text-sm text-muted-foreground">
        Loading…
      </div>
    );
  }

  return (
    <div className="relative flex min-h-dvh flex-col items-center justify-center px-4 py-10">
      <div className="pointer-events-none fixed inset-0 -z-10 bg-[radial-gradient(ellipse_at_20%_0%,_hsl(36_42%_58%_/_0.13),_transparent_60%),radial-gradient(ellipse_at_80%_100%,_hsl(36_42%_58%_/_0.08),_transparent_60%),hsl(var(--background))]" />

      <div className="w-full max-w-md md:max-w-xl">
        <div className="mb-8 flex flex-col items-center gap-3">
          <Image src="/logo.png" alt="Vantage Lane" width={56} height={56} />
          <div className="text-center">
            <p className="font-display text-2xl tracking-widest text-foreground">
              VANTAGE LANE
            </p>
            <p className="mt-0.5 text-xs tracking-wider text-muted-foreground uppercase">
              Partner Network
            </p>
          </div>
        </div>

      <Card className="border-border/60 shadow-xl">
        <CardHeader className="pb-4">
          <CardTitle className="text-xl">Company setup</CardTitle>
          <CardDescription>
            Choose your service type — the onboarding wizard adapts to it.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form className="space-y-4" onSubmit={form.handleSubmit(onSubmit)}>
            {/* Service dropdown */}
            <div className="space-y-1.5">
              <Label>Service type</Label>
              <Select
                value={form.watch("serviceCode") ?? ""}
                onValueChange={(v) =>
                  form.setValue("serviceCode", v as ServiceCode, {
                    shouldValidate: true,
                  })
                }
              >
                <SelectTrigger className="h-auto py-3">
                  {form.watch("serviceCode") ? (
                    (() => {
                      const s = SERVICES.find(
                        (x) => x.code === form.watch("serviceCode"),
                      )!;
                      return (
                        <div className="flex items-center gap-2.5 text-left">
                          <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-primary/10">
                            <s.Icon className="h-4 w-4 text-primary" />
                          </div>
                          <div>
                            <p className="text-sm font-medium">{s.label}</p>
                            <p className="text-xs text-muted-foreground">
                              {s.hint}
                            </p>
                          </div>
                        </div>
                      );
                    })()
                  ) : (
                    <SelectValue placeholder="Select a service…" />
                  )}
                </SelectTrigger>
                <SelectContent className="max-h-80">
                  {SERVICES.map((s) => (
                    <SelectItem
                      key={s.code}
                      value={s.code}
                      className="py-2.5 [&>span:last-child]:flex-1"
                    >
                      <div className="flex items-center gap-3">
                        <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-muted">
                          <s.Icon className="h-4 w-4 text-foreground" />
                        </div>
                        <div>
                          <p className="text-sm font-medium">{s.label}</p>
                          <p className="text-xs text-muted-foreground">
                            {s.hint}
                          </p>
                        </div>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {form.formState.errors.serviceCode && (
                <p className="text-xs text-danger">
                  {form.formState.errors.serviceCode.message}
                </p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="displayName">Company name</Label>
              <Input
                id="displayName"
                placeholder="e.g. Prestige Chauffeurs Ltd"
                {...form.register("displayName")}
              />
              <p className="text-[11px] text-muted-foreground">
                The trading name your clients see — shown on bookings and
                communications.
              </p>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="legalName">Legal name <span className="text-muted-foreground font-normal">(optional)</span></Label>
              <Input
                id="legalName"
                placeholder="e.g. Prestige Transportation Services Limited"
                {...form.register("legalName")}
              />
              <p className="text-[11px] text-muted-foreground">
                Full registered company name as it appears on your operator
                licence or Companies House registration. Leave blank if same as
                above.
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label>Country of operation</Label>
                <Select
                  value={form.watch("country")}
                  onValueChange={(v) => form.setValue("country", v)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Country" />
                  </SelectTrigger>
                  <SelectContent>
                    {COUNTRIES.map((c) => (
                      <SelectItem key={c.code} value={c.code}>
                        {c.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-[11px] text-muted-foreground">
                  Where your licence / registration is based.
                </p>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="city">HQ address or city</Label>
                <PlacesInputWithCoords
                  value={form.watch("city")}
                  onSelect={(r) => {
                    form.setValue("city", r.description, { shouldValidate: true });
                    form.setValue("formattedAddress", r.description);
                    form.setValue("placeId", r.placeId);
                    if (r.lat) form.setValue("lat", r.lat);
                    if (r.lng) form.setValue("lng", r.lng);
                  }}
                  placeholder="Search your office address or city…"
                />
                {form.watch("lat") ? (
                  <p className="text-[11px] text-green-600 dark:text-green-400 flex items-center gap-1">
                    <span>📍</span> Location confirmed
                  </p>
                ) : (
                  <p className="text-[11px] text-muted-foreground">
                    Start typing — select from suggestions to pin your location on the map.
                  </p>
                )}
                {form.formState.errors.city && (
                  <p className="text-xs text-danger">{form.formState.errors.city.message}</p>
                )}
              </div>
            </div>

            <div className="space-y-1.5">
              <PhoneInput
                label="Business phone / WhatsApp"
                valueE164={form.watch("phone")}
                onChangeE164={(v) =>
                  form.setValue("phone", v, { shouldValidate: true })
                }
                defaultIso2={form.watch("country") || "GB"}
                error={form.formState.errors.phone?.message}
              />
              <p className="text-[11px] text-muted-foreground">
                Direct number for your operations team. We use this for urgent
                job dispatches and onboarding support — WhatsApp preferred.
              </p>
            </div>

            {error ? (
              <p className="rounded-lg bg-danger/10 px-3 py-2 text-sm text-danger">
                {error}
              </p>
            ) : null}

            <Button
              className="w-full rounded-full"
              size="lg"
              type="submit"
              disabled={form.formState.isSubmitting}
            >
              {form.formState.isSubmitting
                ? "Creating organization…"
                : "Continue to partner workspace →"}
            </Button>
          </form>
        </CardContent>
      </Card>
      </div>
    </div>
  );
}
