"use client";

import { useRef, useState, useEffect } from "react";
import Image from "next/image";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Camera, Check, Loader2, MapPin, Pencil } from "lucide-react";
import { toast } from "sonner";
import { createClient } from "@/shared/lib/supabase/client";
import {
  fetchPartnerOrgContext,
  fetchPartnerHQLocation,
  updatePartnerOrgDetails,
  updatePartnerHQLocation,
} from "@/modules/partner/api";
import { useSessionProfile } from "@/modules/identity/session";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { Label } from "@/shared/ui/label";
import { PlacesInputWithCoords, type PlaceResult } from "@/shared/components/places-input";
import { PhoneInput } from "@/shared/components/phone-input";

/* ─── Logo uploader ─────────────────────────────────────────── */
function LogoUploader({ orgId, currentUrl, displayName }: { orgId: string; currentUrl: string | null; displayName: string }) {
  const qc = useQueryClient();
  const fileRef = useRef<HTMLInputElement>(null);

  const upload = useMutation({
    mutationFn: async (file: File) => {
      const supabase = createClient();
      const ext = file.name.split(".").pop() ?? "jpg";
      const path = `${orgId}/logo.${ext}`;
      const { error: upErr } = await supabase.storage.from("partner-avatars").upload(path, file, { upsert: true, contentType: file.type });
      if (upErr) throw upErr;
      const { data: urlData } = supabase.storage.from("partner-avatars").getPublicUrl(path);
      const { error: dbErr } = await supabase.from("organizations").update({ logo_url: urlData.publicUrl }).eq("id", orgId);
      if (dbErr) throw dbErr;
      return urlData.publicUrl;
    },
    onSuccess: () => { toast.success("Logo updated"); qc.invalidateQueries({ queryKey: ["partner", "org"] }); },
    onError: (e: Error) => toast.error(e.message),
  });

  const initials = displayName.split(" ").slice(0, 2).map((w) => w[0]).join("").toUpperCase();

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="relative">
        <div className="h-24 w-24 overflow-hidden rounded-full border-2 border-border/60 shadow-md">
          {currentUrl ? (
            <Image src={currentUrl} alt={displayName} width={96} height={96} className="h-full w-full object-cover" />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-primary/10 text-3xl font-bold text-primary">{initials}</div>
          )}
        </div>
        <button type="button" onClick={() => fileRef.current?.click()} disabled={upload.isPending}
          className="absolute bottom-0 right-0 flex h-8 w-8 items-center justify-center rounded-full border border-border/60 bg-card shadow-sm transition-colors hover:bg-muted">
          {upload.isPending ? <Loader2 className="h-3.5 w-3.5 animate-spin text-muted-foreground" /> : <Camera className="h-3.5 w-3.5 text-muted-foreground" />}
        </button>
      </div>
      <div className="text-center">
        <p className="text-sm font-medium">{displayName}</p>
        <button type="button" onClick={() => fileRef.current?.click()} disabled={upload.isPending}
          className="text-xs text-primary underline underline-offset-2 hover:opacity-70">
          {currentUrl ? "Change logo" : "Upload logo"}
        </button>
        <p className="mt-0.5 text-[11px] text-muted-foreground">JPG, PNG or WebP · max 2 MB · shown as circle</p>
      </div>
      <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp" className="hidden"
        onChange={(e) => { const f = e.target.files?.[0]; if (f) upload.mutate(f); e.target.value = ""; }} />
    </div>
  );
}

/* ─── Company details + phone editor ───────────────────────── */
function CompanyDetails({ orgId, displayName, legalName, phone }: {
  orgId: string; displayName: string; legalName: string | null; phone: string | null;
}) {
  const qc = useQueryClient();
  const [name, setName] = useState(displayName);
  const [legal, setLegal] = useState(legalName ?? "");
  const [phoneVal, setPhoneVal] = useState(phone ?? "");
  const [saved, setSaved] = useState(false);

  // Sync if props change (e.g. after invalidate)
  useEffect(() => { setName(displayName); }, [displayName]);
  useEffect(() => { setLegal(legalName ?? ""); }, [legalName]);
  useEffect(() => { setPhoneVal(phone ?? ""); }, [phone]);

  const isDirty = name !== displayName || legal !== (legalName ?? "") || phoneVal !== (phone ?? "");

  const save = useMutation({
    mutationFn: () => updatePartnerOrgDetails({
      orgId,
      displayName: name.trim(),
      legalName: legal.trim() || null,
      phone: phoneVal.trim() || null,
    }),
    onSuccess: () => {
      toast.success("Details updated");
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
      qc.invalidateQueries({ queryKey: ["partner", "org"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <div className="space-y-4">
      <div className="space-y-1.5">
        <Label>Company name</Label>
        <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Trading name" />
        <p className="text-[11px] text-muted-foreground">Shown on bookings and communications.</p>
      </div>
      <div className="space-y-1.5">
        <Label>Legal name <span className="font-normal text-muted-foreground">(optional)</span></Label>
        <Input value={legal} onChange={(e) => setLegal(e.target.value)} placeholder="Full registered name" />
        <p className="text-[11px] text-muted-foreground">As it appears on your licence or business registration.</p>
      </div>
      <PhoneInput
        label="Business phone / WhatsApp"
        valueE164={phoneVal}
        onChangeE164={setPhoneVal}
        defaultIso2="GB"
      />
      <Button size="sm" className="rounded-full" disabled={save.isPending || !isDirty || !name.trim()} onClick={() => save.mutate()}>
        {save.isPending ? <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" /> : saved ? <Check className="mr-1.5 h-3.5 w-3.5" /> : <Pencil className="mr-1.5 h-3.5 w-3.5" />}
        {saved ? "Saved" : "Save changes"}
      </Button>
    </div>
  );
}

/* ─── HQ address editor ─────────────────────────────────────── */
function HQAddress({ orgId }: { orgId: string }) {
  const qc = useQueryClient();
  const locQ = useQuery({
    queryKey: ["partner", "hq-location", orgId],
    queryFn: () => fetchPartnerHQLocation(orgId),
    enabled: Boolean(orgId),
  });

  const loc = locQ.data;
  const [address, setAddress] = useState(loc?.formattedAddress ?? loc?.city ?? "");
  const [coords, setCoords] = useState<{ lat: number; lng: number; placeId: string } | null>(
    loc?.lat ? { lat: loc.lat, lng: loc.lng!, placeId: loc.placeId ?? "" } : null,
  );
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (loc) {
      setAddress(loc.formattedAddress ?? loc.city ?? "");
      if (loc.lat) setCoords({ lat: loc.lat, lng: loc.lng!, placeId: loc.placeId ?? "" });
    }
  }, [loc]);

  function handleSelect(r: PlaceResult) {
    setAddress(r.description);
    if (r.lat) setCoords({ lat: r.lat, lng: r.lng, placeId: r.placeId });
    else setCoords(null);
  }

  const isDirty = address !== (loc?.formattedAddress ?? loc?.city ?? "");

  const save = useMutation({
    mutationFn: async () => {
      if (!loc?.id) throw new Error("No location record found");
      // Extract city from address (first part before comma)
      const city = address.split(",")[0].trim();
      const countryCode = loc.countryCode ?? "XX";
      await updatePartnerHQLocation({
        orgId,
        locationId: loc.id,
        formattedAddress: address,
        city,
        countryCode,
        lat: coords?.lat ?? null,
        lng: coords?.lng ?? null,
        placeId: coords?.placeId ?? null,
      });
    },
    onSuccess: () => {
      toast.success("HQ address updated");
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
      qc.invalidateQueries({ queryKey: ["partner", "hq-location", orgId] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  if (locQ.isLoading) return <div className="h-9 animate-pulse rounded-lg bg-muted/40" />;

  return (
    <div className="space-y-3">
      <div className="space-y-1.5">
        <Label className="flex items-center gap-1.5">
          <MapPin className="h-3.5 w-3.5" /> HQ / Operations address
        </Label>
        <PlacesInputWithCoords
          value={address}
          onSelect={handleSelect}
          placeholder="Search your office address or city…"
        />
        {coords ? (
          <p className="text-[11px] text-green-600 dark:text-green-400 flex items-center gap-1">
            📍 Location pinned on map
          </p>
        ) : (
          <p className="text-[11px] text-muted-foreground">
            Select from suggestions to pin your exact location on the partner map.
          </p>
        )}
      </div>
      <Button size="sm" className="rounded-full" disabled={save.isPending || !isDirty || !address.trim()} onClick={() => save.mutate()}>
        {save.isPending ? <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" /> : saved ? <Check className="mr-1.5 h-3.5 w-3.5" /> : <Pencil className="mr-1.5 h-3.5 w-3.5" />}
        {saved ? "Saved" : "Update address"}
      </Button>
    </div>
  );
}

/* ─── Contact / account info (read-only) ───────────────────── */
function AccountInfo({ email }: { email?: string }) {
  return (
    <div className="space-y-3">
      <div className="space-y-1.5">
        <Label>Email address</Label>
        <Input value={email ?? ""} disabled className="bg-muted/40" />
        <p className="text-[11px] text-muted-foreground">
          To change your email, contact VL support.
        </p>
      </div>
    </div>
  );
}

/* ─── Main profile page ─────────────────────────────────────── */
export function PartnerProfilePage() {
  const org = useQuery({ queryKey: ["partner", "org"], queryFn: fetchPartnerOrgContext });
  const profile = useSessionProfile();

  const orgId = org.data?.organizationId ?? "";
  const displayName = org.data?.displayName ?? "";

  return (
    <div className="mx-auto max-w-lg space-y-6">
      <div>
        <h1 className="font-display text-2xl tracking-tight">Profile</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Manage your company details, address, logo and contact information.
        </p>
      </div>

      {/* Logo */}
      <section className="rounded-2xl border border-border/60 bg-card p-6 shadow-sm">
        <h2 className="mb-5 text-xs font-semibold uppercase tracking-widest text-muted-foreground">Company logo</h2>
        {orgId ? (
          <LogoUploader orgId={orgId} currentUrl={org.data?.logoUrl ?? null} displayName={displayName} />
        ) : (
          <div className="h-24 animate-pulse rounded-full bg-muted/40" />
        )}
      </section>

      {/* Company details + phone */}
      <section className="rounded-2xl border border-border/60 bg-card p-6 shadow-sm">
        <h2 className="mb-5 text-xs font-semibold uppercase tracking-widest text-muted-foreground">Company details</h2>
        {orgId ? (
          <CompanyDetails
            orgId={orgId}
            displayName={displayName}
            legalName={org.data?.legalName ?? null}
            phone={org.data?.primaryPhone ?? null}
          />
        ) : (
          <div className="space-y-3">
            <div className="h-9 animate-pulse rounded-lg bg-muted/40" />
            <div className="h-9 animate-pulse rounded-lg bg-muted/40" />
          </div>
        )}
      </section>

      {/* HQ address */}
      <section className="rounded-2xl border border-border/60 bg-card p-6 shadow-sm">
        <h2 className="mb-5 text-xs font-semibold uppercase tracking-widest text-muted-foreground">HQ / Operations address</h2>
        {orgId ? <HQAddress orgId={orgId} /> : <div className="h-9 animate-pulse rounded-lg bg-muted/40" />}
      </section>

      {/* Account */}
      <section className="rounded-2xl border border-border/60 bg-card p-6 shadow-sm">
        <h2 className="mb-5 text-xs font-semibold uppercase tracking-widest text-muted-foreground">Account</h2>
        <AccountInfo email={profile.data?.email ?? undefined} />
      </section>
    </div>
  );
}
