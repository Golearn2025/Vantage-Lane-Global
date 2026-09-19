"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { Mail, RefreshCw, Send } from "lucide-react";
import { toast } from "sonner";
import { useInviteLeads, useSendNetworkInvites } from "@/modules/invites/hooks";
import {
  deriveInviteStatus,
  type InviteLead,
  type InviteStatus,
} from "@/modules/invites/types";
import { serviceLabel } from "@/shared/lib/email/brand";
import { Button } from "@/shared/ui/button";
import { Checkbox } from "@/shared/ui/checkbox";
import { Input } from "@/shared/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/ui/select";
import { Skeleton } from "@/shared/ui/skeleton";
import { cn } from "@/shared/lib/utils";

const SERVICE_FILTERS = [
  { value: "all", label: "All services" },
  { value: "GROUND_TRANSPORTATION", label: "Ground Transportation" },
  { value: "SECURITY", label: "Security" },
  { value: "AVIATION", label: "Aviation" },
  { value: "HOSPITALITY", label: "Hospitality" },
  { value: "CONCIERGE", label: "Concierge" },
  { value: "YACHT", label: "Yacht" },
  { value: "MEDICAL", label: "Medical" },
  { value: "EVENTS", label: "Events" },
];

const STATUS_FILTERS: { value: string; label: string }[] = [
  { value: "not_sent", label: "Not sent (ready)" },
  { value: "sent_family", label: "Already invited (sent+)" },
  { value: "sent", label: "Sent" },
  { value: "delivered", label: "Delivered" },
  { value: "opened", label: "Opened" },
  { value: "clicked", label: "Clicked" },
  { value: "signed_up", label: "Signed up" },
  { value: "failed", label: "Failed / bounced" },
  { value: "all", label: "All statuses" },
];

const STATUS_STYLES: Record<InviteStatus, string> = {
  not_sent: "bg-muted text-muted-foreground",
  sent: "bg-sky-500/15 text-sky-700 dark:text-sky-300",
  delivered: "bg-sky-500/15 text-sky-700 dark:text-sky-300",
  opened: "bg-amber-500/15 text-amber-700 dark:text-amber-300",
  clicked: "bg-violet-500/15 text-violet-700 dark:text-violet-300",
  signed_up: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300",
  failed: "bg-danger/15 text-danger",
  bounced: "bg-danger/15 text-danger",
};

const STATUS_LABEL: Record<InviteStatus, string> = {
  not_sent: "Not sent",
  sent: "Sent",
  delivered: "Delivered",
  opened: "Opened",
  clicked: "Clicked",
  signed_up: "Signed up",
  failed: "Failed",
  bounced: "Bounced",
};

const ALREADY_INVITED: InviteStatus[] = [
  "sent",
  "delivered",
  "opened",
  "clicked",
  "signed_up",
];

function matchesStatusFilter(status: InviteStatus, filter: string) {
  if (filter === "all") return true;
  if (filter === "not_sent") return status === "not_sent";
  if (filter === "sent_family") return ALREADY_INVITED.includes(status);
  if (filter === "failed") return status === "failed" || status === "bounced";
  return status === filter;
}

export function InvitesWorkspace() {
  const [serviceCode, setServiceCode] = useState("all");
  const [statusFilter, setStatusFilter] = useState("not_sent");
  const [q, setQ] = useState("");
  const [onlyWithEmail, setOnlyWithEmail] = useState(true);
  const [selected, setSelected] = useState<Record<string, boolean>>({});

  const { data, isLoading, isError, error, refetch, isFetching } = useInviteLeads({
    serviceCode,
    q,
    onlyWithEmail,
  });
  const sendInvites = useSendNetworkInvites();

  const rows = useMemo(() => {
    const list = data ?? [];
    return list.filter((r) =>
      matchesStatusFilter(deriveInviteStatus(r), statusFilter),
    );
  }, [data, statusFilter]);

  const selectedIds = useMemo(
    () => Object.entries(selected).filter(([, v]) => v).map(([id]) => id),
    [selected],
  );

  /** Only email + not already invited (unless viewing already-invited filter) */
  const selectable = rows.filter((r) => {
    if (!r.inviteEmail) return false;
    const st = deriveInviteStatus(r);
    if (statusFilter === "not_sent") return st === "not_sent";
    if (ALREADY_INVITED.includes(st) && statusFilter !== "failed") {
      return statusFilter === "sent_family" || statusFilter === st;
    }
    return st === "not_sent" || st === "failed" || st === "bounced";
  });

  function toggleAll(checked: boolean) {
    if (!checked) {
      setSelected({});
      return;
    }
    const next: Record<string, boolean> = {};
    for (const r of selectable) next[r.organizationId] = true;
    setSelected(next);
  }

  async function handleSend() {
    if (selectedIds.length === 0) {
      toast.error("Select at least one lead ready to invite");
      return;
    }
    try {
      const res = await sendInvites.mutateAsync({
        organizationIds: selectedIds,
        serviceCode:
          serviceCode === "all" ? "GROUND_TRANSPORTATION" : serviceCode,
        skipAlreadyInvited: true,
      });
      const skipped = (res as { skipped?: number }).skipped ?? 0;
      toast.success(
        `Sent ${res.sent} · failed ${res.failed}${skipped ? ` · skipped ${skipped}` : ""}`,
      );
      setSelected({});
      void refetch();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Send failed");
    }
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Invites</h1>
          <p className="mt-1 max-w-xl text-sm text-muted-foreground">
            Default view = not sent yet. Opened/clicked need the Resend webhook
            configured. Signed up appears after they finish /join.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => void refetch()}
            disabled={isFetching}
          >
            <RefreshCw className={cn("mr-1.5 size-3.5", isFetching && "animate-spin")} />
            Refresh
          </Button>
          <Button
            size="sm"
            className="rounded-full"
            disabled={selectedIds.length === 0 || sendInvites.isPending}
            onClick={() => void handleSend()}
          >
            <Send className="mr-1.5 size-3.5" />
            {sendInvites.isPending
              ? "Sending…"
              : `Send invite${selectedIds.length ? ` (${selectedIds.length})` : ""}`}
          </Button>
        </div>
      </div>

      <div className="flex flex-col gap-3 rounded-2xl border border-border/60 bg-card/40 p-3 lg:flex-row lg:flex-wrap lg:items-center">
        <Input
          placeholder="Search company or email…"
          value={q}
          onChange={(e) => {
            setQ(e.target.value);
            setSelected({});
          }}
          className="lg:max-w-xs"
        />
        <Select
          value={serviceCode}
          onValueChange={(v) => {
            setServiceCode(v);
            setSelected({});
          }}
        >
          <SelectTrigger className="lg:w-52">
            <SelectValue placeholder="Service" />
          </SelectTrigger>
          <SelectContent>
            {SERVICE_FILTERS.map((s) => (
              <SelectItem key={s.value} value={s.value}>
                {s.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select
          value={statusFilter}
          onValueChange={(v) => {
            setStatusFilter(v);
            setSelected({});
          }}
        >
          <SelectTrigger className="lg:w-56">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            {STATUS_FILTERS.map((s) => (
              <SelectItem key={s.value} value={s.value}>
                {s.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <label className="flex items-center gap-2 text-sm text-muted-foreground">
          <Checkbox
            checked={onlyWithEmail}
            onCheckedChange={(v) => {
              setOnlyWithEmail(Boolean(v));
              setSelected({});
            }}
          />
          Only with email
        </label>
        <p className="text-xs text-muted-foreground lg:ml-auto">
          Showing {rows.length}
          {data ? ` of ${data.length}` : ""}
        </p>
      </div>

      {isLoading ? (
        <div className="space-y-2">
          <Skeleton className="h-16 w-full rounded-xl" />
          <Skeleton className="h-16 w-full rounded-xl" />
          <Skeleton className="h-16 w-full rounded-xl" />
        </div>
      ) : isError ? (
        <p className="text-sm text-danger">
          {error instanceof Error ? error.message : "Failed to load leads"}
        </p>
      ) : rows.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border/70 px-6 py-16 text-center">
          <Mail className="mx-auto mb-3 size-8 text-muted-foreground" />
          <p className="font-medium">No matching leads</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Change the status filter (e.g. All / Already invited) or search.
          </p>
        </div>
      ) : (
        <>
          <div className="hidden overflow-hidden rounded-2xl border border-border/60 md:block">
            <table className="w-full text-sm">
              <thead className="border-b border-border/60 bg-muted/30 text-left text-xs uppercase tracking-wide text-muted-foreground">
                <tr>
                  <th className="px-3 py-3">
                    <Checkbox
                      checked={
                        selectable.length > 0 &&
                        selectedIds.length === selectable.length
                      }
                      onCheckedChange={(v) => toggleAll(Boolean(v))}
                      aria-label="Select all"
                    />
                  </th>
                  <th className="px-3 py-3">Company</th>
                  <th className="px-3 py-3">Service</th>
                  <th className="px-3 py-3">Email</th>
                  <th className="px-3 py-3">Status</th>
                  <th className="px-3 py-3" />
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => (
                  <InviteTableRow
                    key={row.organizationId}
                    row={row}
                    checked={Boolean(selected[row.organizationId])}
                    canSelect={selectable.some(
                      (s) => s.organizationId === row.organizationId,
                    )}
                    onCheckedChange={(v) =>
                      setSelected((prev) => ({
                        ...prev,
                        [row.organizationId]: v,
                      }))
                    }
                  />
                ))}
              </tbody>
            </table>
          </div>

          <div className="space-y-3 md:hidden">
            <label className="flex items-center gap-2 px-1 text-sm">
              <Checkbox
                checked={
                  selectable.length > 0 &&
                  selectedIds.length === selectable.length
                }
                onCheckedChange={(v) => toggleAll(Boolean(v))}
              />
              Select all ready to send
            </label>
            {rows.map((row) => {
              const status = deriveInviteStatus(row);
              const canSelect = selectable.some(
                (s) => s.organizationId === row.organizationId,
              );
              return (
                <div
                  key={row.organizationId}
                  className="rounded-2xl border border-border/60 bg-card/50 p-4"
                >
                  <div className="flex items-start gap-3">
                    <Checkbox
                      className="mt-1"
                      disabled={!canSelect}
                      checked={Boolean(selected[row.organizationId])}
                      onCheckedChange={(v) =>
                        setSelected((prev) => ({
                          ...prev,
                          [row.organizationId]: Boolean(v),
                        }))
                      }
                    />
                    <div className="min-w-0 flex-1">
                      <Link
                        href={`/organizations/${row.organizationId}`}
                        className="font-medium hover:underline"
                      >
                        {row.displayName}
                      </Link>
                      <p className="mt-0.5 text-xs text-muted-foreground">
                        {serviceLabel(row.serviceCode)} · {row.city || "—"}{" "}
                        {row.countryCode || ""}
                      </p>
                      <p className="mt-2 truncate text-sm">
                        {row.inviteEmail || (
                          <span className="text-muted-foreground">No email</span>
                        )}
                      </p>
                      <span
                        className={cn(
                          "mt-3 inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium",
                          STATUS_STYLES[status],
                        )}
                      >
                        {STATUS_LABEL[status]}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}

function InviteTableRow({
  row,
  checked,
  canSelect,
  onCheckedChange,
}: {
  row: InviteLead;
  checked: boolean;
  canSelect: boolean;
  onCheckedChange: (v: boolean) => void;
}) {
  const status = deriveInviteStatus(row);
  return (
    <tr className="border-b border-border/40 last:border-0 hover:bg-muted/20">
      <td className="px-3 py-3">
        <Checkbox
          disabled={!canSelect}
          checked={checked}
          onCheckedChange={(v) => onCheckedChange(Boolean(v))}
        />
      </td>
      <td className="px-3 py-3">
        <Link
          href={`/organizations/${row.organizationId}`}
          className="font-medium hover:underline"
        >
          {row.displayName}
        </Link>
        <p className="text-xs text-muted-foreground">
          {row.city || "—"}
          {row.countryCode ? `, ${row.countryCode}` : ""}
        </p>
      </td>
      <td className="px-3 py-3 text-muted-foreground">
        {serviceLabel(row.serviceCode)}
      </td>
      <td className="px-3 py-3">
        {row.inviteEmail || <span className="text-muted-foreground">—</span>}
      </td>
      <td className="px-3 py-3">
        <span
          className={cn(
            "inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium",
            STATUS_STYLES[status],
          )}
        >
          {STATUS_LABEL[status]}
        </span>
        {row.convertedOrganizationId ? (
          <p className="mt-1 text-[11px] text-muted-foreground">
            →{" "}
            <Link
              className="underline"
              href={`/organizations/${row.convertedOrganizationId}`}
            >
              new org
            </Link>
          </p>
        ) : null}
      </td>
      <td className="px-3 py-3 text-right">
        <Button asChild variant="ghost" size="sm">
          <Link href={`/organizations/${row.organizationId}`}>Open</Link>
        </Button>
      </td>
    </tr>
  );
}
