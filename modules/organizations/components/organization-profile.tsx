"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Copy, Mail, MessageCircle, MoreHorizontal } from "lucide-react";
import {
  useAddCoverage,
  useArchiveContact,
  useArchiveCoverage,
  useChangeRelationshipStatus,
  useLogCommunication,
  useLocationsCatalog,
  useOrganizationActivities,
  useOrganizationBases,
  useOrganizationContacts,
  useOrganizationCoverage,
  useOrganizationOverview,
  useUpsertBase,
  useUpsertContact,
} from "@/modules/organizations/hooks";
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
  const { data: profile } = useSessionProfile();
  const overview = useOrganizationOverview(organizationId);
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
  const [locationQuery, setLocationQuery] = useState("");
  const locations = useLocationsCatalog(locationQuery);

  const upsertContact = useUpsertContact(organizationId);
  const archiveContact = useArchiveContact(organizationId);
  const upsertBase = useUpsertBase(organizationId);
  const addCoverage = useAddCoverage(
    organizationId,
    overview.data?.offeringId ?? null,
  );
  const archiveCoverage = useArchiveCoverage(organizationId);

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
    <div className="space-y-6">
      <div className="text-sm text-muted-foreground">
        <Link href="/organizations" className="hover:underline">
          Organizations
        </Link>{" "}
        / {org.displayName}
      </div>

      <section className="overflow-hidden rounded-xl border border-border bg-card">
        <div className="bg-[linear-gradient(135deg,_hsl(var(--primary)/0.16),_transparent_55%)] p-6 md:p-8">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
            <div className="min-w-0 space-y-3">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="font-display text-3xl tracking-tight md:text-4xl">
                  {org.displayName}
                </h1>
                {org.isTest ? <TestBadge /> : null}
              </div>
              {org.legalName ? (
                <p className="text-sm text-muted-foreground">{org.legalName}</p>
              ) : null}
              <div className="flex flex-wrap gap-2">
                <Badge variant="primary">
                  {org.serviceName ?? "Ground Transportation"}
                </Badge>
                <RelationshipStatusBadge status={org.relationshipStatus} />
                <OperationalStatusBadge status={org.operationalStatus} />
                {org.legalCountryCode ? (
                  <Badge variant="outline">{org.legalCountryCode}</Badge>
                ) : null}
              </div>
              <div className="grid gap-2 text-sm text-muted-foreground sm:grid-cols-2">
                <p>
                  Primary base:{" "}
                  <span className="text-foreground">
                    {[org.primaryBaseLabel, org.primaryBaseCity]
                      .filter(Boolean)
                      .join(" · ") || "—"}
                  </span>
                </p>
                <p>
                  Coverage:{" "}
                  <span className="text-foreground">
                    {org.coverageCount}
                    {org.coverageAirportIatas.length
                      ? ` · ${org.coverageAirportIatas.join(", ")}`
                      : ""}
                  </span>
                </p>
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              <Button
                onClick={handleOpenWhatsApp}
                disabled={!outreachTargets.whatsapp}
              >
                <MessageCircle className="h-4 w-4" />
                WhatsApp
              </Button>
              <Button
                variant="secondary"
                onClick={handleOpenEmail}
                disabled={!outreachTargets.email}
              >
                <Mail className="h-4 w-4" />
                Email
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline">
                    <MoreHorizontal className="h-4 w-4" />
                    More
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem
                    disabled={!outreachTargets.whatsapp}
                    onClick={handleCopyWhatsApp}
                  >
                    <Copy className="mr-2 h-4 w-4" />
                    Copy WhatsApp
                  </DropdownMenuItem>
                  {profile?.canManageNetwork ? (
                    <DropdownMenuItem onClick={() => setStatusOpen(true)}>
                      Change relationship status
                    </DropdownMenuItem>
                  ) : null}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </section>

      <Tabs defaultValue="overview">
        <TabsList className="w-full justify-start overflow-x-auto">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="contacts">Contacts</TabsTrigger>
          <TabsTrigger value="coverage">Coverage</TabsTrigger>
          <TabsTrigger value="activity">Activity</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 lg:grid-cols-2">
            <Card>
              <CardHeader className="flex-row items-center justify-between space-y-0">
                <CardTitle>Primary contact</CardTitle>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    setEditingContact(null);
                    setContactOpen(true);
                  }}
                >
                  Add
                </Button>
              </CardHeader>
              <CardContent className="space-y-1 text-sm">
                <p className="font-medium">
                  {org.primaryContactName ?? "No primary contact"}
                </p>
                <p className="text-muted-foreground">
                  {org.primaryContactType ?? "—"}
                </p>
                <p>{org.primaryContactEmail ?? "—"}</p>
                <p>{org.primaryContactWhatsappE164 ?? "—"}</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex-row items-center justify-between space-y-0">
                <CardTitle>Primary base</CardTitle>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    setEditingBase(null);
                    setBaseOpen(true);
                  }}
                >
                  Add base
                </Button>
              </CardHeader>
              <CardContent className="space-y-1 text-sm">
                <p className="font-medium">{org.primaryBaseLabel ?? "No base"}</p>
                <p className="text-muted-foreground">
                  {[org.primaryBaseCity, org.primaryBaseRegion, org.primaryBaseCountryCode]
                    .filter(Boolean)
                    .join(", ") || "—"}
                </p>
                <div className="mt-3 space-y-2">
                  {(bases.data ?? []).map((base) => (
                    <button
                      key={base.id}
                      type="button"
                      className="flex w-full items-center justify-between rounded-md border border-border px-3 py-2 text-left hover:bg-muted/50"
                      onClick={() => {
                        setEditingBase(base);
                        setBaseOpen(true);
                      }}
                    >
                      <span>
                        {base.label}
                        {base.isPrimary ? " · Primary" : ""}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {base.city}
                      </span>
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Relationship & ops</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-wrap gap-2">
                <RelationshipStatusBadge status={org.relationshipStatus} />
                <OperationalStatusBadge status={org.operationalStatus} />
                {profile?.canManageNetwork ? (
                  <Button size="sm" variant="outline" onClick={() => setStatusOpen(true)}>
                    Update lifecycle
                  </Button>
                ) : null}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Next action</CardTitle>
              </CardHeader>
              <CardContent className="text-sm">
                {org.nextActionTitle ? (
                  <>
                    <p className="font-medium">{org.nextActionTitle}</p>
                    <p className="mt-1 text-muted-foreground">
                      Due {formatDateTime(org.nextActionDueAt)}
                    </p>
                  </>
                ) : (
                  <p className="text-muted-foreground">No open follow-up</p>
                )}
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Recent activity</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {(activities.data ?? []).slice(0, 5).map((activity) => (
                <div key={activity.id} className="border-b border-border pb-3 last:border-0">
                  <p className="text-sm font-medium">{activity.summary}</p>
                  <p className="text-xs text-muted-foreground">
                    {formatDateTime(activity.occurredAt)} · {activity.activityType}
                  </p>
                </div>
              ))}
              {(activities.data ?? []).length === 0 ? (
                <p className="text-sm text-muted-foreground">No activity yet</p>
              ) : null}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="contacts" className="space-y-4">
          <div className="flex justify-between">
            <h2 className="font-display text-xl">Contacts</h2>
            <Button
              onClick={() => {
                setEditingContact(null);
                setContactOpen(true);
              }}
            >
              Add contact
            </Button>
          </div>
          <div className="grid gap-3">
            {(contacts.data ?? []).map((contact) => (
              <Card key={contact.id}>
                <CardContent className="flex items-start justify-between gap-3 p-4">
                  <div>
                    <p className="font-medium">
                      {contact.fullName}
                      {contact.isPrimary ? (
                        <Badge className="ml-2" variant="primary">
                          Primary
                        </Badge>
                      ) : null}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {contact.contactType ?? "Other"}
                      {contact.title ? ` · ${contact.title}` : ""}
                    </p>
                    <p className="mt-1 text-sm">{contact.email ?? "—"}</p>
                    <p className="text-sm">{contact.whatsappE164 ?? contact.phoneE164 ?? "—"}</p>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
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
                      onClick={() => {
                        if (confirm("Archive this contact?")) {
                          archiveContact.mutate(contact.id);
                        }
                      }}
                    >
                      Archive
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
            {(contacts.data ?? []).length === 0 ? (
              <p className="text-sm text-muted-foreground">No contacts yet</p>
            ) : null}
          </div>
        </TabsContent>

        <TabsContent value="coverage" className="space-y-4">
          <div className="flex justify-between">
            <h2 className="font-display text-xl">Coverage</h2>
            <Button onClick={() => setCoverageOpen(true)}>Add coverage</Button>
          </div>
          <div className="grid gap-3">
            {(coverage.data ?? []).map((item) => (
              <Card key={item.id}>
                <CardContent className="flex items-center justify-between gap-3 p-4">
                  <div>
                    <p className="font-medium">
                      {item.locationName ?? "Location"}
                      {item.iata ? ` (${item.iata})` : ""}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {item.coverageMode}
                      {item.countryCode ? ` · ${item.countryCode}` : ""}
                    </p>
                  </div>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => {
                      if (confirm("Archive this coverage?")) {
                        archiveCoverage.mutate(item.id);
                      }
                    }}
                  >
                    Archive
                  </Button>
                </CardContent>
              </Card>
            ))}
            {(coverage.data ?? []).length === 0 ? (
              <p className="text-sm text-muted-foreground">No coverage yet</p>
            ) : null}
          </div>
        </TabsContent>

        <TabsContent value="activity" className="space-y-3">
          {(activities.data ?? []).map((activity) => (
            <Card key={activity.id}>
              <CardContent className="p-4">
                <p className="font-medium">{activity.summary}</p>
                {activity.body ? (
                  <p className="mt-1 text-sm text-muted-foreground">{activity.body}</p>
                ) : null}
                <p className="mt-2 text-xs text-muted-foreground">
                  {formatDateTime(activity.occurredAt)} · {activity.activityType}
                </p>
              </CardContent>
            </Card>
          ))}
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
        <SheetContent>
          <SheetHeader>
            <SheetTitle>Add coverage</SheetTitle>
            <SheetDescription>
              Select an airport or location from the catalog.
            </SheetDescription>
          </SheetHeader>
          <div className="mt-4 space-y-3">
            <Input
              placeholder="Search airports…"
              value={locationQuery}
              onChange={(event) => setLocationQuery(event.target.value)}
            />
            <div className="max-h-[60vh] space-y-1 overflow-auto">
              {(locations.data ?? []).map((location) => (
                <button
                  key={location.id}
                  type="button"
                  className="flex w-full items-center justify-between rounded-md border border-border px-3 py-2 text-left text-sm hover:bg-muted"
                  onClick={async () => {
                    await addCoverage.mutateAsync(location.id);
                    setCoverageOpen(false);
                  }}
                >
                  <span>
                    {location.name}
                    {location.iata ? ` (${location.iata})` : ""}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {location.kind}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </SheetContent>
      </Sheet>

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

  useEffect(() => {
    if (!open) return;
    setLabel(initial?.label ?? "");
    setCity(initial?.city ?? "");
    setCountry(initial?.countryCode ?? defaultCountry ?? "GB");
    setAddress(initial?.addressLine1 ?? "");
    setIsPrimary(initial?.isPrimary ?? true);
    setKind(initial?.locationKind ?? "OPS_BASE");
  }, [initial, open, defaultCountry]);

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>{initial ? "Edit base" : "Add base"}</SheetTitle>
          <SheetDescription>
            Bases are operational locations, separate from coverage.
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
            });
          }}
        >
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
            <Label>Primary base</Label>
          </div>
          <Button type="submit" disabled={pending || !label.trim()}>
            {pending ? "Saving…" : "Save base"}
          </Button>
        </form>
      </SheetContent>
    </Sheet>
  );
}
