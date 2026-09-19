"use client";

import { useRef, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  AlertTriangle,
  CalendarDays,
  CheckCircle2,
  Clock,
  FileText,
  Loader2,
  Upload,
  X,
} from "lucide-react";
import { toast } from "sonner";
import {
  fetchDocumentTypes,
  fetchOrgDocuments,
  fetchPartnerOrgContext,
  uploadPartnerDocument,
  getServiceDocConfig,
} from "@/modules/partner/api";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { Label } from "@/shared/ui/label";
import { cn } from "@/shared/lib/utils";

/* ─── helpers ───────────────────────────────────────────────── */

// ─── Document metadata — description + expiry per code ───────
type DocMeta = { description: string; hasExpiry: boolean; expiryLabel?: string };

const DOC_META: Record<string, DocMeta> = {
  // Universal
  COMPANY_REGISTRATION: {
    description: "Certificate of incorporation or equivalent business registration document.",
    hasExpiry: false,
  },
  PUBLIC_LIABILITY_INSURANCE: {
    description: "Public liability insurance certificate for your business operations.",
    hasExpiry: true,
    expiryLabel: "Insurance expiry date",
  },
  // GT / Aviation
  OPERATOR_LICENCE: {
    description: "Private hire operator licence issued by the relevant local authority.",
    hasExpiry: true,
    expiryLabel: "Licence expiry date",
  },
  COMMERCIAL_INSURANCE: {
    description: "Public liability and commercial vehicle insurance certificate covering all vehicles used for hire.",
    hasExpiry: true,
    expiryLabel: "Insurance expiry date",
  },
  FLEET_PHOTO_SET: {
    description: "Recent photos of your vehicles — exterior and interior. Helps VL verify fleet quality and presentation.",
    hasExpiry: false,
  },
  // Aviation
  AOC_CERTIFICATE: {
    description: "Air Operator Certificate issued by the national aviation authority (CAA, EASA, FAA, etc.).",
    hasExpiry: true,
    expiryLabel: "AOC expiry date",
  },
  // Security
  SIA_LICENCE: {
    description: "SIA (or equivalent national authority) licence for your security operatives.",
    hasExpiry: true,
    expiryLabel: "Licence expiry date",
  },
  VETTING_CERTIFICATE: {
    description: "BS7858 vetting certificate or equivalent screening documentation for operatives.",
    hasExpiry: false,
  },
  // Hospitality
  FOOD_HYGIENE_CERTIFICATE: {
    description: "Food hygiene rating certificate for dining / catering operations (where applicable).",
    hasExpiry: true,
    expiryLabel: "Certificate expiry date",
  },
  VENUE_PHOTOS: {
    description: "Recent photos of your venue, restaurant, or hospitality spaces — interior and exterior.",
    hasExpiry: false,
  },
  // Concierge / Events
  PORTFOLIO: {
    description: "Portfolio or case studies demonstrating past work and service quality.",
    hasExpiry: false,
  },
  // Yacht
  MARITIME_LICENCE: {
    description: "Maritime operator licence or equivalent certification from your national maritime authority.",
    hasExpiry: true,
    expiryLabel: "Licence expiry date",
  },
  VESSEL_PHOTOS: {
    description: "Recent photos of your vessel(s) — exterior, interior, and deck areas.",
    hasExpiry: false,
  },
  // Medical
  MEDICAL_REGISTRATION: {
    description: "Registration with the relevant medical or healthcare regulatory body (GMC, CQC, etc.).",
    hasExpiry: true,
    expiryLabel: "Registration expiry date",
  },
  CLINICAL_GOVERNANCE_CERTIFICATE: {
    description: "Clinical governance or quality assurance certification for medical services.",
    hasExpiry: false,
  },
};

// Human-readable names per code (fallback to code if not listed)
const DOC_NAMES: Record<string, string> = {
  COMPANY_REGISTRATION: "Company registration document",
  PUBLIC_LIABILITY_INSURANCE: "Public liability insurance",
  OPERATOR_LICENCE: "Operator / private hire licence",
  COMMERCIAL_INSURANCE: "Commercial / private hire insurance",
  FLEET_PHOTO_SET: "Fleet / vehicle images",
  AOC_CERTIFICATE: "Air Operator Certificate (AOC)",
  SIA_LICENCE: "SIA / security operative licence",
  VETTING_CERTIFICATE: "Vetting certificate (BS7858 or equivalent)",
  FOOD_HYGIENE_CERTIFICATE: "Food hygiene certificate",
  VENUE_PHOTOS: "Venue / property photos",
  PORTFOLIO: "Portfolio / case studies",
  MARITIME_LICENCE: "Maritime operator licence",
  VESSEL_PHOTOS: "Vessel photos",
  MEDICAL_REGISTRATION: "Medical / healthcare registration",
  CLINICAL_GOVERNANCE_CERTIFICATE: "Clinical governance certificate",
};

function expiryStatus(expiresOn: string | null): "ok" | "soon" | "expired" | null {
  if (!expiresOn) return null;
  const days = Math.ceil(
    (new Date(expiresOn).getTime() - Date.now()) / (1000 * 60 * 60 * 24),
  );
  if (days < 0) return "expired";
  if (days <= 30) return "soon";
  return "ok";
}

function formatDate(d: string | null) {
  if (!d) return null;
  return new Date(d).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

/* ─── Upload modal state per doc ────────────────────────────── */

type UploadState = {
  docTypeId: string;
  docCode: string;
  file: File | null;
  expiresOn: string;
  issuedOn: string;
};

/* ─── Single document row ───────────────────────────────────── */

function DocRow({
  code,
  level,
  type,
  uploaded,
  organizationId,
}: {
  code: string;
  level: "REQUIRED" | "RECOMMENDED";
  type: { id: string; name: string; code: string } | undefined;
  uploaded: { expiresOn: string | null; fileName: string | null; verificationStatus: string } | undefined;
  organizationId: string;
}) {
  const qc = useQueryClient();
  const fileRef = useRef<HTMLInputElement>(null);
  const [open, setOpen] = useState(false);
  const [uploadState, setUploadState] = useState<UploadState>({
    docTypeId: type?.id ?? "",
    docCode: code,
    file: null,
    expiresOn: "",
    issuedOn: "",
  });

  const info = DOC_META[code];
  const displayName = DOC_NAMES[code] ?? (type?.name ?? code);
  const expStatus = expiryStatus(uploaded?.expiresOn ?? null);

  const upload = useMutation({
    mutationFn: async () => {
      if (!uploadState.file || !type) throw new Error("No file selected");
      await uploadPartnerDocument({
        organizationId,
        documentTypeId: type.id,
        file: uploadState.file,
        expiresOn: uploadState.expiresOn || null,
        issuedOn: uploadState.issuedOn || null,
      });
    },
    onSuccess: () => {
      toast.success("Document uploaded");
      setOpen(false);
      setUploadState((s) => ({ ...s, file: null, expiresOn: "", issuedOn: "" }));
      qc.invalidateQueries({ queryKey: ["partner", "docs"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  if (!type) return null;

  return (
    <div
      className={cn(
        "rounded-2xl border bg-card overflow-hidden",
        !uploaded
          ? "border-border/50 border-dashed"
          : expStatus === "expired"
            ? "border-red-500/40"
            : expStatus === "soon"
              ? "border-amber-400/40"
              : "border-green-500/30",
      )}
    >
      {/* Row header */}
      <div className="flex items-start justify-between gap-3 px-4 py-4">
        <div className="flex items-start gap-3 min-w-0">
          {/* Status icon */}
          <div
            className={cn(
              "mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full",
              !uploaded
                ? "bg-border/60"
                : expStatus === "expired"
                  ? "bg-red-500/15"
                  : expStatus === "soon"
                    ? "bg-amber-400/15"
                    : "bg-green-500/12",
            )}
          >
            {!uploaded ? (
              <FileText className="h-4 w-4 text-muted-foreground/50" />
            ) : expStatus === "expired" ? (
              <AlertTriangle className="h-4 w-4 text-red-500" />
            ) : expStatus === "soon" ? (
              <Clock className="h-4 w-4 text-amber-600 dark:text-amber-400" />
            ) : (
              <CheckCircle2 className="h-4 w-4 text-green-500" />
            )}
          </div>

          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <p className="text-sm font-semibold">{displayName}</p>
              <span
                className={cn(
                  "rounded-full px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide",
                  level === "REQUIRED"
                    ? "bg-primary/10 text-primary"
                    : "bg-muted text-muted-foreground",
                )}
              >
                {level === "REQUIRED" ? "Required" : "Recommended"}
              </span>
            </div>
            <p className="mt-0.5 text-xs text-muted-foreground">{info?.description}</p>

            {/* Uploaded file info */}
            {uploaded && (
              <div className="mt-1.5 flex flex-wrap items-center gap-3 text-xs">
                <span className="flex items-center gap-1 text-muted-foreground">
                  <FileText className="h-3 w-3" />
                  {uploaded.fileName ?? "Document uploaded"}
                </span>
                {uploaded.expiresOn && (
                  <span
                    className={cn(
                      "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-medium",
                      expStatus === "expired"
                        ? "bg-red-500/15 text-red-600 dark:text-red-400"
                        : expStatus === "soon"
                          ? "bg-amber-400/20 text-amber-700 dark:text-amber-400"
                          : "bg-muted text-muted-foreground",
                    )}
                  >
                    <CalendarDays className="h-3 w-3 shrink-0" />
                    {expStatus === "expired"
                      ? `Expired ${formatDate(uploaded.expiresOn)}`
                      : expStatus === "soon"
                        ? `Expires ${formatDate(uploaded.expiresOn)} ⚠`
                        : `Expires ${formatDate(uploaded.expiresOn)}`}
                  </span>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Upload / Re-upload button */}
        <Button
          size="sm"
          variant={uploaded ? "outline" : "default"}
          className="shrink-0 rounded-full text-xs"
          onClick={() => setOpen((v) => !v)}
        >
          <Upload className="mr-1.5 h-3.5 w-3.5" />
          {uploaded ? "Replace" : "Upload"}
        </Button>
      </div>

      {/* Upload panel */}
      {open && (
        <div className="border-t border-border/60 bg-muted/30 px-4 py-4 space-y-3">
          {/* File picker */}
          <div className="space-y-1.5">
            <Label className="text-xs">File <span className="text-muted-foreground">(PDF, JPG, PNG — max 10 MB)</span></Label>
            {uploadState.file ? (
              <div className="flex items-center justify-between rounded-lg border border-border/60 bg-card px-3 py-2">
                <div className="flex items-center gap-2 min-w-0">
                  <FileText className="h-4 w-4 shrink-0 text-muted-foreground" />
                  <span className="truncate text-sm">{uploadState.file.name}</span>
                  <span className="shrink-0 text-xs text-muted-foreground">
                    ({(uploadState.file.size / 1024).toFixed(0)} KB)
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setUploadState((s) => ({ ...s, file: null }))}
                  className="ml-2 text-muted-foreground hover:text-danger"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                className="flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-border/70 py-4 text-sm text-muted-foreground transition-colors hover:border-primary/40 hover:text-primary"
              >
                <Upload className="h-4 w-4" />
                Click to select file
              </button>
            )}
            <input
              ref={fileRef}
              type="file"
              accept="application/pdf,image/jpeg,image/png,image/webp"
              className="hidden"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) setUploadState((s) => ({ ...s, file: f }));
                e.target.value = "";
              }}
            />
          </div>

          {/* Dates */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs">Issue date <span className="text-muted-foreground">(optional)</span></Label>
              <Input
                type="date"
                className="text-sm"
                value={uploadState.issuedOn}
                onChange={(e) =>
                  setUploadState((s) => ({ ...s, issuedOn: e.target.value }))
                }
              />
            </div>
                  {info?.hasExpiry && (
              <div className="space-y-1.5">
                <Label className="text-xs">{info.expiryLabel ?? "Expiry date"}</Label>
                <Input
                  type="date"
                  className="text-sm"
                  value={uploadState.expiresOn}
                  onChange={(e) =>
                    setUploadState((s) => ({ ...s, expiresOn: e.target.value }))
                  }
                />
                <p className="text-[11px] text-muted-foreground">
                  We'll alert you before this expires.
                </p>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex gap-2">
            <Button
              size="sm"
              className="rounded-full"
              disabled={!uploadState.file || upload.isPending}
              onClick={() => upload.mutate()}
            >
              {upload.isPending ? (
                <>
                  <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
                  Uploading…
                </>
              ) : (
                "Save document"
              )}
            </Button>
            <Button
              size="sm"
              variant="ghost"
              className="rounded-full"
              onClick={() => setOpen(false)}
            >
              Cancel
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

/* ─── Main panel ────────────────────────────────────────────── */

export function PartnerDocumentsPanel() {
  const orgQ = useQuery({
    queryKey: ["partner", "org"],
    queryFn: fetchPartnerOrgContext,
  });
  const typesQ = useQuery({
    queryKey: ["partner", "doc-types"],
    queryFn: fetchDocumentTypes,
  });
  const docsQ = useQuery({
    queryKey: ["partner", "docs", orgQ.data?.organizationId],
    enabled: Boolean(orgQ.data),
    queryFn: () => fetchOrgDocuments(orgQ.data!.organizationId),
  });

  const byCode = new Map((typesQ.data ?? []).map((t) => [t.code, t]));

  // Map uploaded docs by documentTypeId
  const uploadedByTypeId = new Map(
    (docsQ.data ?? []).map((d) => [
      d.documentTypeId,
      {
        expiresOn: d.expiresOn,
        fileName: d.fileName,
        verificationStatus: d.verificationStatus,
      },
    ]),
  );

  const orgId = orgQ.data?.organizationId ?? "";
  const serviceCode = orgQ.data?.serviceCode ?? "GROUND_TRANSPORTATION";
  const docConfig = getServiceDocConfig(serviceCode);

  // Count expiring / expired
  const expiringCount = (docsQ.data ?? []).filter(
    (d) => expiryStatus(d.expiresOn) === "soon",
  ).length;
  const expiredCount = (docsQ.data ?? []).filter(
    (d) => expiryStatus(d.expiresOn) === "expired",
  ).length;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="font-display text-2xl tracking-tight md:text-3xl">
          Documents
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {serviceCode === "GROUND_TRANSPORTATION" || serviceCode === "AVIATION" || serviceCode === "YACHT"
            ? "Operator-level documents only. Driver and vehicle documents are collected separately before job assignment."
            : "Business-level documents for your organisation. Upload the documents listed below to complete your onboarding."}
        </p>
      </div>

      {/* Expiry alerts */}
      {(expiredCount > 0 || expiringCount > 0) && (
        <div className="space-y-2">
          {expiredCount > 0 && (
            <div className="flex items-center gap-3 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3">
              <AlertTriangle className="h-5 w-5 shrink-0 text-red-500" />
              <div>
                <p className="text-sm font-semibold text-red-600 dark:text-red-400">
                  {expiredCount} document{expiredCount > 1 ? "s" : ""} expired
                </p>
                <p className="text-xs text-red-500/80">
                  Upload a replacement immediately — this may affect your activation.
                </p>
              </div>
            </div>
          )}
          {expiringCount > 0 && (
            <div className="flex items-center gap-3 rounded-xl border border-amber-400/40 bg-amber-400/10 px-4 py-3">
              <Clock className="h-5 w-5 shrink-0 text-amber-600 dark:text-amber-400" />
              <div>
                <p className="text-sm font-semibold text-amber-700 dark:text-amber-400">
                  {expiringCount} document{expiringCount > 1 ? "s" : ""} expiring soon
                </p>
                <p className="text-xs text-amber-600/80 dark:text-amber-500/80">
                  Renew within 30 days to avoid interruption.
                </p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Required */}
      <section className="space-y-3">
        <h2 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
          Required
        </h2>
        <div className="space-y-3">
          {docConfig.required.map((code) => {
            const type = byCode.get(code);
            const uploaded = type ? uploadedByTypeId.get(type.id) : undefined;
            return (
              <DocRow
                key={code}
                code={code}
                level="REQUIRED"
                type={type}
                uploaded={uploaded}
                organizationId={orgId}
              />
            );
          })}
        </div>
      </section>

      {/* Recommended */}
      {docConfig.recommended.length > 0 && (
        <section className="space-y-3">
          <h2 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
            Recommended
          </h2>
          <div className="space-y-3">
            {docConfig.recommended.map((code) => {
              const type = byCode.get(code);
              const uploaded = type ? uploadedByTypeId.get(type.id) : undefined;
              return (
                <DocRow
                  key={code}
                  code={code}
                  level="RECOMMENDED"
                  type={type}
                  uploaded={uploaded}
                  organizationId={orgId}
                />
              );
            })}
          </div>
        </section>
      )}
    </div>
  );
}
