"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AlertTriangle, Car, Copy, FileText, Mail, MessageCircle, MoreHorizontal, ShieldCheck, Tag, Trash2 } from "lucide-react";
import {
  useAddCoverage,
  useArchiveBase,
  useArchiveContact,
  useArchiveCoverage,
  useChangeRelationshipStatus,
  useDeleteOrganization,
  useLogCommunication,
  useOrganizationActivities,
  useOrganizationBases,
  useOrganizationContacts,
  useOrganizationCoverage,
  useOrganizationOverview,
  useUpsertBase,
  useUpsertContact,
} from "@/modules/organizations/hooks";
import { useOrganizationProfileRealtime } from "@/modules/organizations/realtime";
import {
  OperationalStatusBadge,
  RelationshipStatusBadge,
  TestBadge,
} from "@/shared/components/status-badges";
import { formatDateTime } from "@/shared/lib/utils";
import {
  CONTACT_TYPES,
  RELATIONSHIP_STATUSES,
  type RelationshipStatus,
} from "@/shared/types/domain";
import { Button } from "@/shared/ui/button";
import { Badge } from "@/shared/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card";
import { Skeleton } from "@/shared/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/shared/ui/tabs";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/shared/ui/sheet";
import { Input } from "@/shared/ui/input";
import { Label } from "@/shared/ui/label";
import { Checkbox } from "@/shared/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/shared/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/shared/ui/dialog";
import { toast } from "sonner";
import { useSessionProfile } from "@/modules/identity/session";
import { LocationSearchPicker } from "@/modules/network/components/location-search-picker";
import { CoverageComposer } from "@/modules/organizations/components/coverage-composer";
import type { OrganizationContact, OrganizationBase } from "@/modules/organizations/types";

function whatsappHref(number: string) {
  const digits = number.replace(/[^\d+]/g, "").replace("+", "");
  return `https://wa.me/${digits}`;
}

function emailHref(email: string) {
  return `mailto:${email}`;
}

export function OrganizationProfile({
  organizationId,
}: {
  organizationId: string;
}) {
  const router = useRouter();
  const { data: profile } = useSessionProfile();
  const overview = useOrganizationOverview(organizationId);
  useOrganizationProfileRealtime(organizationId);
  const contacts = useOrganizationContacts(organizationId);
  const bases = useOrganizationBases(organizationId);
  const coverage = useOrganizationCoverage(organizationId);
  const activities = useOrganizationActivities(organizationId);
  const logCommunication = useLogCommunication(organizationId);
  const changeStatus = useChangeRelationshipStatus(organizationId);

  const [contactOpen, setContactOpen] = useState(false);
  const [editingContact, setEditingContact] = useState<OrganizationContact | null>(
    null,
  );
  const [baseOpen, setBaseOpen] = useState(false);
  const [editingBase, setEditingBase] = useState<OrganizationBase | null>(null);
  const [coverageOpen, setCoverageOpen] = useState(false);
  const [statusOpen, setStatusOpen] = useState(false);
  const [nextStatus, setNextStatus] = useState<RelationshipStatus>("CONTACTED");
  const [statusNote, setStatusNote] = useState("");
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteConfirmName, setDeleteConfirmName] = useState("");

  const upsertContact = useUpsertContact(organizationId);
  const archiveContact = useArchiveContact(organizationId);
  const upsertBase = useUpsertBase(organizationId);
  const archiveBase = useArchiveBase(organizationId);
  const addCoverage = useAddCoverage(
    organizationId,
    overview.data?.offeringId ?? null,
  );
  const archiveCoverage = useArchiveCoverage(organizationId);
  const deleteOrg = useDeleteOrganization();

  const org = overview.data;

  const outreachTargets = useMemo(() => {
    return {
      whatsapp:
        org?.primaryContactWhatsappE164 ||
        org?.primaryWhatsappE164 ||
        null,
      email: org?.primaryContactEmail || org?.primaryEmail || null,
    };
  }, [org]);

  async function handleOpenWhatsApp() {
    if (!outreachTargets.whatsapp) return;
    window.open(whatsappHref(outreachTargets.whatsapp), "_blank", "noopener,noreferrer");
    await logCommunication.mutateAsync({
      channel: "WHATSAPP",
      action_type: "OPEN_WHATSAPP",
      contact_id: org?.primaryContactId,
    });
  }

  async function handleCopyWhatsApp() {
    if (!outreachTargets.whatsapp) return;
    await navigator.clipboard.writeText(outreachTargets.whatsapp);
    toast.success("WhatsApp number copied");
    await logCommunication.mutateAsync({
      channel: "WHATSAPP",
      action_type: "COPY_WHATSAPP",
      contact_id: org?.primaryContactId,
      body_snapshot: outreachTargets.whatsapp,
    });
  }

  async function handleOpenEmail() {
    if (!outreachTargets.email) return;
    window.location.href = emailHref(outreachTargets.email);
    await logCommunication.mutateAsync({
      channel: "EMAIL",
      action_type: "OPEN_EMAIL",
      contact_id: org?.primaryContactId,
    });
  }

  if (overview.isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-28 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (overview.isError || !org) {
    return (
      <div className="rounded-lg border border-danger/30 bg-danger/5 p-6">
        <p className="font-medium text-danger">Organization not available</p>
        <p className="mt-1 text-sm text-muted-foreground">
          {overview.error instanceof Error
            ? overview.error.message
            : "Missing or unauthorized"}
        </p>
        <Button asChild className="mt-4" variant="outline">
          <Link href="/organizations">Back to organizations</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl space-y-5 px-1 sm:px-0">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-1.5 text-sm text-muted-foreground">
        <Link href="/organizations" className="hover:text-foreground hover:underline">
          Organizations
        </Link>
        <span>/</span>
        <span className="text-foreground">{org.displayName}</span>
      </nav>

      {/* ─── Hero ─── */}
      <section className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
        {/* accent strip */}
        <div className="h-1.5 bg-primary/60" />

        <div className="px-6 py-5 md:px-8 md:py-6">
          {/* top row: name + actions */}
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div className="min-w-0 space-y-2">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="font-display text-2xl tracking-tight md:text-3xl">
                  {org.displayName}
                </h1>
                {org.isTest ? <TestBadge /> : null}
              </div>
              {org.legalName ? (
                <p className="text-xs text-muted-foreground">{org.legalName}</p>
              ) : null}
              <div className="flex flex-wrap gap-1.5">
                <Badge variant="primary">{org.serviceName ?? "Ground Transportation"}</Badge>
                <RelationshipStatusBadge status={org.relationshipStatus} />
                <OperationalStatusBadge status={org.operationalStatus} />
                {org.legalCountryCode ? (
                  <Badge variant="outline">{org.legalCountryCode}</Badge>
                ) : null}
              </div>
            </div>

            {/* CTA buttons */}
            <div className="flex shrink-0 flex-wrap gap-2">
              <Button
                size="sm"
                onClick={handleOpenWhatsApp}
                disabled={!outreachTargets.whatsapp}
              >
                <MessageCircle className="h-4 w-4" />
                WhatsApp
              </Button>
              <Button
                size="sm"
                variant="secondary"
                onClick={handleOpenEmail}
                disabled={!outreachTargets.email}
              >
                <Mail className="h-4 w-4" />
                Email
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button size="sm" variant="outline">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem
                    disabled={!outreachTargets.whatsapp}
                    onClick={handleCopyWhatsApp}
                  >
                    <Copy className="mr-2 h-4 w-4" />
                    Copy WhatsApp number
                  </DropdownMenuItem>
                  {profile?.canManageNetwork ? (
                    <DropdownMenuItem onClick={() => setStatusOpen(true)}>
                      Change relationship status
                    </DropdownMenuItem>
                  ) : null}
                  {profile?.canManageNetwork ? (
                    <>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        className="text-danger focus:text-danger"
                        onClick={() => {
                          setDeleteConfirmName("");
                          setDeleteOpen(true);
                        }}
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete organization…
                      </DropdownMenuItem>
                    </>
                  ) : null}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          {/* key facts bar */}
          <dl className="mt-5 grid grid-cols-2 gap-x-8 gap-y-3 border-t border-border pt-4 text-sm sm:grid-cols-4">
            <div>
              <dt className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Base
              </dt>
              <dd className="mt-0.5 truncate font-medium">
                {[org.primaryBaseLabel, org.primaryBaseCity].filter(Boolean).join(" · ") || "—"}
              </dd>
            </div>
            <div>
              <dt className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Coverage
              </dt>
              <dd className="mt-0.5 font-medium">
                {org.coverageCount > 0
                  ? `${org.coverageCount} location${org.coverageCount !== 1 ? "s" : ""}`
                  : "—"}
              </dd>
            </div>
            <div>
              <dt className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Airports
              </dt>
              <dd className="mt-0.5 truncate font-medium">
                {org.coverageAirportIatas.length
                  ? org.coverageAirportIatas.join(", ")
                  : "—"}
              </dd>
            </div>
            <div>
              <dt className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Website
              </dt>
              <dd className="mt-0.5 truncate font-medium">
                {org.websiteUrl ? (
                  <a
                    href={org.websiteUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:underline"
                  >
                    {org.websiteDomain ?? org.websiteUrl}
                  </a>
                ) : (
                  "—"
                )}
              </dd>
            </div>
          </dl>
        </div>
      </section>

      {/* ─── Tabs ─── */}
      <Tabs defaultValue="overview">
        <div className="overflow-x-auto">
          <TabsList className="flex w-max min-w-full justify-start gap-0 border-b border-border bg-transparent p-0">
            {(
              [
                { value: "overview", label: "Overview" },
                { value: "contacts", label: "Contacts" },
                { value: "coverage", label: "Coverage", count: org.coverageCount },
                { value: "fleet", label: "Fleet", soon: true },
                { value: "pricing", label: "Pricing", soon: true },
                { value: "documents", label: "Documents", soon: true },
                { value: "standards", label: "Standards", soon: true },
                { value: "activity", label: "Activity" },
              ] as const
            ).map((tab) => (
              <TabsTrigger
                key={tab.value}
                value={tab.value}
                className="relative rounded-none border-b-2 border-transparent px-4 pb-2.5 pt-1.5 text-sm font-medium data-[state=active]:border-primary data-[state=active]:text-foreground data-[state=inactive]:text-muted-foreground"
              >
                {tab.label}
                {"count" in tab && tab.count > 0 ? (
                  <span className="ml-1.5 rounded-full bg-muted px-1.5 py-px text-[10px] text-muted-foreground">
                    {tab.count}
                  </span>
                ) : null}
                {"soon" in tab && tab.soon ? (
                  <span className="ml-1.5 rounded-full bg-muted px-1.5 py-px text-[10px] text-muted-foreground/60">
                    soon
                  </span>
                ) : null}
              </TabsTrigger>
            ))}
          </TabsList>
        </div>

        {/* ── Overview ── */}
        <TabsContent value="overview" className="mt-4 space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            {/* Primary contact */}
            <Card>
              <CardHeader className="flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                  Primary contact
                </CardTitle>
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-7 text-xs"
                  onClick={() => {
                    setEditingContact(null);
                    setContactOpen(true);
                  }}
                >
                  + Add
                </Button>
              </CardHeader>
              <CardContent className="pt-0">
                {org.primaryContactName ? (
                  <div className="space-y-0.5">
                    <p className="font-medium">{org.primaryContactName}</p>
                    <p className="text-xs text-muted-foreground">
                      {[org.primaryContactType, org.primaryContactEmail]
                        .filter(Boolean)
                        .join(" · ")}
                    </p>
                    {org.primaryContactWhatsappE164 ? (
                      <p className="text-xs text-muted-foreground">
                        WhatsApp: {org.primaryContactWhatsappE164}
                      </p>
                    ) : null}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">No primary contact yet</p>
                )}
              </CardContent>
            </Card>

            {/* Primary base */}
            <Card>
              <CardHeader className="flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                  Operational base
                </CardTitle>
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-7 text-xs"
                  onClick={() => {
                    setEditingBase(null);
                    setBaseOpen(true);
                  }}
                >
                  + Add
                </Button>
              </CardHeader>
              <CardContent className="space-y-1.5 pt-0">
                {org.primaryBaseLabel ? (
                  <div>
                    <p className="font-medium">{org.primaryBaseLabel}</p>
                    <p className="text-xs text-muted-foreground">
                      {[org.primaryBaseCity, org.primaryBaseRegion, org.primaryBaseCountryCode]
                        .filter(Boolean)
                        .join(", ")}
                    </p>
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">No base yet</p>
                )}
                {(bases.data ?? []).length > 0 ? (
                  <div className="mt-2 space-y-1 border-t border-border pt-2">
                    {(bases.data ?? []).map((base) => (
                      <div
                        key={base.id}
                        className="flex items-center justify-between gap-2 text-xs"
                      >
                        <button
                          type="button"
                          className="flex min-w-0 flex-1 items-center gap-1.5 text-left hover:opacity-70"
                          onClick={() => {
                            setEditingBase(base);
                            setBaseOpen(true);
                          }}
                        >
                          <span className="truncate text-foreground">{base.label}</span>
                          {base.isPrimary ? (
                            <Badge variant="primary" className="py-px text-[10px]">
                              Primary
                            </Badge>
                          ) : null}
                          {base.city ? (
                            <span className="text-muted-foreground">· {base.city}</span>
                          ) : null}
                        </button>
                        <button
                          type="button"
                          className="shrink-0 text-muted-foreground hover:text-danger"
                          onClick={() => {
                            if (confirm("Archive this base?")) archiveBase.mutate(base.id);
                          }}
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                ) : null}
              </CardContent>
            </Card>

            {/* Lifecycle */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                  Lifecycle
                </CardTitle>
              </CardHeader>
              <CardContent className="flex flex-wrap items-center gap-2 pt-0">
                <RelationshipStatusBadge status={org.relationshipStatus} />
                <OperationalStatusBadge status={org.operationalStatus} />
                {profile?.canManageNetwork ? (
                  <Button
                    size="sm"
                    variant="outline"
                    className="ml-auto h-7 text-xs"
                    onClick={() => setStatusOpen(true)}
                  >
                    Update
                  </Button>
                ) : null}
              </CardContent>
            </Card>

            {/* Next action */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                  Next action
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0 text-sm">
                {org.nextActionTitle ? (
                  <>
                    <p className="font-medium">{org.nextActionTitle}</p>
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      Due {formatDateTime(org.nextActionDueAt)}
                    </p>
                  </>
                ) : (
                  <p className="text-muted-foreground">No open follow-up</p>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Activity feed */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                Recent activity
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-0 pt-0">
              {(activities.data ?? []).slice(0, 6).map((activity, idx, arr) => (
                <div
                  key={activity.id}
                  className={`py-3 text-sm ${idx < arr.length - 1 ? "border-b border-border" : ""}`}
                >
                  <p className="font-medium leading-snug">{activity.summary}</p>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    {formatDateTime(activity.occurredAt)}
                    <span className="mx-1 text-border">·</span>
                    {activity.activityType}
                  </p>
                </div>
              ))}
              {(activities.data ?? []).length === 0 ? (
                <p className="py-4 text-sm text-muted-foreground">No activity yet</p>
              ) : null}
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── Contacts ── */}
        <TabsContent value="contacts" className="mt-4 space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-muted-foreground">
              {(contacts.data ?? []).length} contact
              {(contacts.data ?? []).length !== 1 ? "s" : ""}
            </p>
            <Button
              size="sm"
              onClick={() => {
                setEditingContact(null);
                setContactOpen(true);
              }}
            >
              Add contact
            </Button>
          </div>

          {(contacts.data ?? []).length === 0 ? (
            <div className="rounded-lg border border-dashed border-border py-10 text-center">
              <p className="text-sm text-muted-foreground">No contacts yet</p>
              <Button
                size="sm"
                variant="outline"
                className="mt-3"
                onClick={() => {
                  setEditingContact(null);
                  setContactOpen(true);
                }}
              >
                Add first contact
              </Button>
            </div>
          ) : (
            <div className="overflow-hidden rounded-xl border border-border">
              {(contacts.data ?? []).map((contact, idx, arr) => (
                <div
                  key={contact.id}
                  className={`flex items-start justify-between gap-4 px-4 py-3 ${
                    idx < arr.length - 1 ? "border-b border-border" : ""
                  }`}
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-1.5">
                      <span className="font-medium">{contact.fullName}</span>
                      {contact.isPrimary ? (
                        <Badge variant="primary" className="py-px text-[10px]">
                          Primary
                        </Badge>
                      ) : null}
                    </div>
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      {[contact.contactType, contact.title].filter(Boolean).join(" · ")}
                    </p>
                    <div className="mt-1 flex flex-wrap gap-x-4 gap-y-0.5 text-xs text-muted-foreground">
                      {contact.email ? <span>{contact.email}</span> : null}
                      {contact.whatsappE164 ?? contact.phoneE164 ? (
                        <span>{contact.whatsappE164 ?? contact.phoneE164}</span>
                      ) : null}
                    </div>
                  </div>
                  <div className="flex shrink-0 gap-1.5">
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-7 text-xs"
                      onClick={() => {
                        setEditingContact(contact);
                        setContactOpen(true);
                      }}
                    >
                      Edit
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-7 text-xs text-muted-foreground hover:text-danger"
                      onClick={() => {
                        if (confirm("Archive this contact?")) archiveContact.mutate(contact.id);
                      }}
                    >
                      ×
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </TabsContent>

        {/* ── Coverage ── */}
        <TabsContent value="coverage" className="mt-4 space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-muted-foreground">
              {org.coverageCount} location{org.coverageCount !== 1 ? "s" : ""} on network
            </p>
            <Button size="sm" onClick={() => setCoverageOpen(true)}>
              Add coverage
            </Button>
          </div>

          {(coverage.data ?? []).length === 0 ? (
            <div className="rounded-lg border border-dashed border-border py-10 text-center">
              <p className="text-sm text-muted-foreground">No coverage yet</p>
              <Button
                size="sm"
                variant="outline"
                className="mt-3"
                onClick={() => setCoverageOpen(true)}
              >
                Add first coverage
              </Button>
            </div>
          ) : (
            <div className="overflow-hidden rounded-xl border border-border">
              {(coverage.data ?? []).map((item, idx, arr) => (
                <div
                  key={item.id}
                  className={`flex items-center gap-4 px-4 py-3 ${
                    idx < arr.length - 1 ? "border-b border-border" : ""
                  }`}
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-1.5">
                      <span className="font-medium">
                        {item.locationName ?? "Location"}
                      </span>
                      {item.iata ? (
                        <Badge variant="outline" className="py-px text-[10px]">
                          {item.iata}
                        </Badge>
                      ) : null}
                      {item.coverageMode === "RADIUS" ? (
                        <Badge variant="muted" className="py-px text-[10px]">
                          Radius
                        </Badge>
                      ) : item.coverageMode === "AIRPORT_EXPLICIT" ? (
                        <Badge variant="muted" className="py-px text-[10px]">
                          Airport
                        </Badge>
                      ) : null}
                    </div>
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      {item.radiusValue != null
                        ? `${item.radiusValue} ${item.radiusUnit ?? "km"} radius`
                        : item.coverageMode.replace(/_/g, " ").toLowerCase()}
                      {item.countryCode ? ` · ${item.countryCode}` : ""}
                    </p>
                  </div>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-7 shrink-0 text-xs text-muted-foreground hover:text-danger"
                    onClick={() => {
                      if (confirm("Archive this coverage?")) archiveCoverage.mutate(item.id);
                    }}
                  >
                    ×
                  </Button>
                </div>
              ))}
            </div>
          )}
        </TabsContent>

        {/* ── Fleet ── */}
        <TabsContent value="fleet" className="mt-4">
          <ComingSoonPlaceholder
            icon={<Car className="h-8 w-8" />}
            title="Fleet"
            description="Vehicle categories, quantities, year and quality hints. Needed before this operator can receive jobs."
          />
        </TabsContent>

        {/* ── Pricing ── */}
        <TabsContent value="pricing" className="mt-4">
          <ComingSoonPlaceholder
            icon={<Tag className="h-8 w-8" />}
            title="Pricing"
            description="Fixed transfers, airport transfers, distance-based rates, hourly / daily, surcharges. Rate card per vehicle category and currency."
          />
        </TabsContent>

        {/* ── Documents ── */}
        <TabsContent value="documents" className="mt-4">
          <ComingSoonPlaceholder
            icon={<FileText className="h-8 w-8" />}
            title="Documents"
            description="Insurance, licences, vehicle age certs, airport permits. Records + files with expiry warnings."
          />
        </TabsContent>

        {/* ── Standards ── */}
        <TabsContent value="standards" className="mt-4">
          <ComingSoonPlaceholder
            icon={<ShieldCheck className="h-8 w-8" />}
            title="Operational standards"
            description="VL-controlled checklist: vehicle presentation, chauffeur dress code, meet & greet, GPS tracking. Pass / fail tracked per operator."
          />
        </TabsContent>

        {/* ── Activity ── */}
        <TabsContent value="activity" className="mt-4">
          {(activities.data ?? []).length === 0 ? (
            <div className="rounded-lg border border-dashed border-border py-10 text-center">
              <p className="text-sm text-muted-foreground">No activity logged yet</p>
            </div>
          ) : (
            <div className="overflow-hidden rounded-xl border border-border">
              {(activities.data ?? []).map((activity, idx, arr) => (
                <div
                  key={activity.id}
                  className={`px-4 py-3 ${idx < arr.length - 1 ? "border-b border-border" : ""}`}
                >
                  <p className="text-sm font-medium leading-snug">{activity.summary}</p>
                  {activity.body ? (
                    <p className="mt-0.5 text-xs text-muted-foreground">{activity.body}</p>
                  ) : null}
                  <p className="mt-1 text-xs text-muted-foreground">
                    {formatDateTime(activity.occurredAt)}
                    <span className="mx-1 text-border">·</span>
                    {activity.activityType}
                  </p>
                </div>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      <ContactSheet
        open={contactOpen}
        onOpenChange={setContactOpen}
        initial={editingContact}
        pending={upsertContact.isPending}
        onSubmit={async (values) => {
          await upsertContact.mutateAsync({
            id: editingContact?.id,
            ...values,
          });
          setContactOpen(false);
        }}
      />

      <BaseSheet
        open={baseOpen}
        onOpenChange={setBaseOpen}
        initial={editingBase}
        pending={upsertBase.isPending}
        defaultCountry={org.legalCountryCode}
        onSubmit={async (values) => {
          await upsertBase.mutateAsync({
            id: editingBase?.id,
            ...values,
          });
          setBaseOpen(false);
        }}
      />

      <Sheet open={coverageOpen} onOpenChange={setCoverageOpen}>
        <SheetContent className="w-full overflow-y-auto sm:max-w-lg">
          <SheetHeader>
            <SheetTitle>Add coverage</SheetTitle>
            <SheetDescription>
              Search a place, then set the service radius on the map.
            </SheetDescription>
          </SheetHeader>
          <div className="mt-4">
            <CoverageComposer
              confirmLabel="Save coverage"
              allowSecondaries={false}
              pending={addCoverage.isPending}
              onConfirm={async (draft) => {
                await addCoverage.mutateAsync({
                  locationId: draft.locationId,
                  coverageMode: draft.coverageMode,
                  radiusKm: draft.radiusKm,
                });
                setCoverageOpen(false);
              }}
            />
          </div>
        </SheetContent>
      </Sheet>

      {/* ── Delete confirmation dialog ── */}
      <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-danger">
              <AlertTriangle className="h-5 w-5" />
              Delete organization permanently
            </DialogTitle>
            <DialogDescription>
              This removes <strong>{org.displayName}</strong> and all related
              data (contacts, bases, coverage, activity, communications) from the
              database. This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <div className="space-y-1.5">
              <Label className="text-sm">
                Type <span className="font-mono font-semibold">{org.displayName}</span> to confirm
              </Label>
              <Input
                value={deleteConfirmName}
                onChange={(e) => setDeleteConfirmName(e.target.value)}
                placeholder={org.displayName}
                autoComplete="off"
              />
            </div>
            <div className="flex gap-2">
              <Button variant="outline" className="flex-1" onClick={() => setDeleteOpen(false)}>
                Cancel
              </Button>
              <Button
                variant="danger"
                className="flex-1"
                disabled={
                  deleteConfirmName.trim() !== org.displayName.trim() ||
                  deleteOrg.isPending
                }
                onClick={async () => {
                  await deleteOrg.mutateAsync(organizationId);
                  setDeleteOpen(false);
                  router.replace("/organizations");
                }}
              >
                {deleteOrg.isPending ? "Deleting…" : "Delete permanently"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={statusOpen} onOpenChange={setStatusOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Change relationship status</DialogTitle>
            <DialogDescription>
              Uses the transactional CRM command. Current:{" "}
              {org.relationshipStatus ?? "—"}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <div className="space-y-2">
              <Label>New status</Label>
              <Select
                value={nextStatus}
                onValueChange={(value) =>
                  setNextStatus(value as RelationshipStatus)
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {RELATIONSHIP_STATUSES.map((status) => (
                    <SelectItem key={status} value={status}>
                      {status}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Note / reason (optional)</Label>
              <Input
                value={statusNote}
                onChange={(event) => setStatusNote(event.target.value)}
              />
            </div>
            <Button
              disabled={changeStatus.isPending}
              onClick={async () => {
                await changeStatus.mutateAsync({
                  newStatus: nextStatus,
                  note: statusNote || undefined,
                });
                setStatusOpen(false);
                setStatusNote("");
              }}
            >
              Save status
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function ComingSoonPlaceholder({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border bg-muted/20 px-6 py-14 text-center">
      <div className="mb-3 text-muted-foreground/40">{icon}</div>
      <p className="font-medium text-foreground">{title}</p>
      <p className="mt-1.5 max-w-sm text-sm text-muted-foreground">{description}</p>
      <span className="mt-4 inline-flex items-center rounded-full border border-border px-3 py-1 text-xs text-muted-foreground">
        Coming in next milestone
      </span>
    </div>
  );
}

function ContactSheet({
  open,
  onOpenChange,
  initial,
  pending,
  onSubmit,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initial: OrganizationContact | null;
  pending: boolean;
  onSubmit: (values: {
    full_name: string;
    contact_type?: string;
    title?: string;
    email?: string;
    phone_e164?: string;
    whatsapp_e164?: string;
    is_primary?: boolean;
  }) => Promise<void>;
}) {
  const [fullName, setFullName] = useState(initial?.fullName ?? "");
  const [contactType, setContactType] = useState(initial?.contactType ?? "Owner");
  const [title, setTitle] = useState(initial?.title ?? "");
  const [email, setEmail] = useState(initial?.email ?? "");
  const [phone, setPhone] = useState(initial?.phoneE164 ?? "");
  const [whatsapp, setWhatsapp] = useState(initial?.whatsappE164 ?? "");
  const [isPrimary, setIsPrimary] = useState(initial?.isPrimary ?? false);

  useEffect(() => {
    if (!open) return;
    setFullName(initial?.fullName ?? "");
    setContactType(initial?.contactType ?? "Owner");
    setTitle(initial?.title ?? "");
    setEmail(initial?.email ?? "");
    setPhone(initial?.phoneE164 ?? "");
    setWhatsapp(initial?.whatsappE164 ?? "");
    setIsPrimary(initial?.isPrimary ?? false);
  }, [initial, open]);

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>{initial ? "Edit contact" : "Add contact"}</SheetTitle>
          <SheetDescription>
            Contacts are CRM people, not authenticated users.
          </SheetDescription>
        </SheetHeader>
        <form
          className="mt-4 space-y-3"
          onSubmit={async (event) => {
            event.preventDefault();
            await onSubmit({
              full_name: fullName,
              contact_type: contactType,
              title: title || undefined,
              email: email || undefined,
              phone_e164: phone || undefined,
              whatsapp_e164: whatsapp || undefined,
              is_primary: isPrimary,
            });
          }}
        >
          <div className="space-y-2">
            <Label>Full name</Label>
            <Input value={fullName} onChange={(e) => setFullName(e.target.value)} required />
          </div>
          <div className="space-y-2">
            <Label>Type</Label>
            <Select value={contactType} onValueChange={setContactType}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {CONTACT_TYPES.map((type) => (
                  <SelectItem key={type} value={type}>
                    {type}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Title</Label>
            <Input value={title} onChange={(e) => setTitle(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>Email</Label>
            <Input value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>Phone</Label>
            <Input value={phone} onChange={(e) => setPhone(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>WhatsApp</Label>
            <Input value={whatsapp} onChange={(e) => setWhatsapp(e.target.value)} />
          </div>
          <div className="flex items-center gap-2">
            <Checkbox
              checked={isPrimary}
              onCheckedChange={(checked) => setIsPrimary(Boolean(checked))}
            />
            <Label>Primary contact</Label>
          </div>
          <Button type="submit" disabled={pending || !fullName.trim()}>
            {pending ? "Saving…" : "Save contact"}
          </Button>
        </form>
      </SheetContent>
    </Sheet>
  );
}

function BaseSheet({
  open,
  onOpenChange,
  initial,
  pending,
  defaultCountry,
  onSubmit,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initial: OrganizationBase | null;
  pending: boolean;
  defaultCountry: string | null;
  onSubmit: (values: {
    label: string;
    city?: string;
    country_code?: string;
    address_line1?: string;
    is_primary?: boolean;
    location_kind?: "HQ" | "OPS_BASE" | "DEPOT" | "OTHER";
    lat?: number | null;
    lng?: number | null;
    google_place_id?: string | null;
  }) => Promise<void>;
}) {
  const [label, setLabel] = useState(initial?.label ?? "");
  const [city, setCity] = useState(initial?.city ?? "");
  const [country, setCountry] = useState(
    initial?.countryCode ?? defaultCountry ?? "GB",
  );
  const [address, setAddress] = useState(initial?.addressLine1 ?? "");
  const [isPrimary, setIsPrimary] = useState(initial?.isPrimary ?? true);
  const [kind, setKind] = useState<"HQ" | "OPS_BASE" | "DEPOT" | "OTHER">(
    initial?.locationKind ?? "OPS_BASE",
  );
  const [lat, setLat] = useState<number | null>(initial?.lat ?? null);
  const [lng, setLng] = useState<number | null>(initial?.lng ?? null);
  const [googlePlaceId, setGooglePlaceId] = useState<string | null>(
    initial?.googlePlaceId ?? null,
  );

  useEffect(() => {
    if (!open) return;
    setLabel(initial?.label ?? "");
    setCity(initial?.city ?? "");
    setCountry(initial?.countryCode ?? defaultCountry ?? "GB");
    setAddress(initial?.addressLine1 ?? "");
    setIsPrimary(initial?.isPrimary ?? true);
    setKind(initial?.locationKind ?? "OPS_BASE");
    setLat(initial?.lat ?? null);
    setLng(initial?.lng ?? null);
    setGooglePlaceId(initial?.googlePlaceId ?? null);
  }, [initial, open, defaultCountry]);

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full overflow-y-auto sm:max-w-lg">
        <SheetHeader>
          <SheetTitle>{initial ? "Edit base" : "Add base"}</SheetTitle>
          <SheetDescription>
            Operational HQ / depot. Separate from coverage. Add as many as you
            need; mark one primary for the map pin.
          </SheetDescription>
        </SheetHeader>
        <form
          className="mt-4 space-y-3"
          onSubmit={async (event) => {
            event.preventDefault();
            await onSubmit({
              label,
              city: city || undefined,
              country_code: country || undefined,
              address_line1: address || undefined,
              is_primary: isPrimary,
              location_kind: kind,
              lat,
              lng,
              google_place_id: googlePlaceId,
            });
          }}
        >
          <div className="space-y-2">
            <Label>Find place</Label>
            <LocationSearchPicker
              placeholder="Search London, Milan depot…"
              onPick={(location) => {
                const isCountry = location.kind === "COUNTRY";
                // Mereu resetăm la selecție nouă — nu păstrăm valorile anterioare
                setCity(isCountry ? "" : location.name);
                setLabel(`${location.name} base`);
                if (location.countryCode) setCountry(location.countryCode);
                setLat(location.lat);
                setLng(location.lng);
                setGooglePlaceId(location.googlePlaceId);
              }}
            />
            {lat != null && lng != null ? (
              <p className="text-xs text-muted-foreground">
                Coordinates saved for map pin: {lat.toFixed(4)}, {lng.toFixed(4)}
              </p>
            ) : null}
          </div>
          <div className="space-y-2">
            <Label>Label</Label>
            <Input value={label} onChange={(e) => setLabel(e.target.value)} required />
          </div>
          <div className="space-y-2">
            <Label>Kind</Label>
            <Select value={kind} onValueChange={(value) => setKind(value as typeof kind)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="OPS_BASE">OPS_BASE</SelectItem>
                <SelectItem value="HQ">HQ</SelectItem>
                <SelectItem value="DEPOT">DEPOT</SelectItem>
                <SelectItem value="OTHER">OTHER</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>City</Label>
            <Input value={city} onChange={(e) => setCity(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>Country</Label>
            <Input
              value={country}
              maxLength={2}
              onChange={(e) => setCountry(e.target.value.toUpperCase())}
            />
          </div>
          <div className="space-y-2">
            <Label>Address</Label>
            <Input value={address} onChange={(e) => setAddress(e.target.value)} />
          </div>
          <div className="flex items-center gap-2">
            <Checkbox
              checked={isPrimary}
              onCheckedChange={(checked) => setIsPrimary(Boolean(checked))}
            />
            <Label>Primary base (map pin)</Label>
          </div>
          <Button type="submit" disabled={pending || !label.trim()}>
            {pending ? "Saving…" : "Save base"}
          </Button>
        </form>
      </SheetContent>
    </Sheet>
  );
}
