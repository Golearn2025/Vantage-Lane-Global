"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  useReactTable,
  type ColumnDef,
  type RowSelectionState,
} from "@tanstack/react-table";
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

const PAGE_SIZE = 25;

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

function canSelectForSend(row: InviteLead, statusFilter: string) {
  if (!row.inviteEmail) return false;
  const st = deriveInviteStatus(row);
  if (statusFilter === "not_sent") return st === "not_sent";
  if (st === "failed" || st === "bounced") return true;
  if (ALREADY_INVITED.includes(st)) return false;
  return st === "not_sent";
}

export function InvitesWorkspace() {
  const [serviceCode, setServiceCode] = useState("all");
  const [statusFilter, setStatusFilter] = useState("not_sent");
  const [q, setQ] = useState("");
  const [onlyWithEmail, setOnlyWithEmail] = useState(true);
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: PAGE_SIZE,
  });

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

  useEffect(() => {
    setPagination((p) => ({ ...p, pageIndex: 0 }));
    setRowSelection({});
  }, [serviceCode, statusFilter, q, onlyWithEmail]);

  const columns = useMemo<ColumnDef<InviteLead>[]>(
    () => [
      {
        id: "select",
        enableSorting: false,
        header: ({ table }) => {
          const pageRows = table.getRowModel().rows.filter((r) =>
            canSelectForSend(r.original, statusFilter),
          );
          const allSelected =
            pageRows.length > 0 && pageRows.every((r) => r.getIsSelected());
          return (
            <Checkbox
              checked={allSelected}
              onCheckedChange={(value) => {
                const checked = Boolean(value);
                for (const row of pageRows) row.toggleSelected(checked);
              }}
              aria-label="Select page"
            />
          );
        },
        cell: ({ row }) => (
          <Checkbox
            disabled={!canSelectForSend(row.original, statusFilter)}
            checked={row.getIsSelected()}
            onCheckedChange={(value) => row.toggleSelected(Boolean(value))}
            aria-label="Select row"
            onClick={(e) => e.stopPropagation()}
          />
        ),
      },
      {
        accessorKey: "displayName",
        header: "Company",
        cell: ({ row }) => (
          <div>
            <Link
              href={`/organizations/${row.original.organizationId}`}
              className="font-medium hover:underline"
            >
              {row.original.displayName}
            </Link>
            <p className="text-xs text-muted-foreground">
              {row.original.city || "—"}
              {row.original.countryCode ? `, ${row.original.countryCode}` : ""}
            </p>
          </div>
        ),
      },
      {
        id: "service",
        header: "Service",
        cell: ({ row }) => (
          <span className="text-muted-foreground">
            {serviceLabel(row.original.serviceCode)}
          </span>
        ),
      },
      {
        accessorKey: "inviteEmail",
        header: "Email",
        cell: ({ row }) =>
          row.original.inviteEmail || (
            <span className="text-muted-foreground">—</span>
          ),
      },
      {
        id: "status",
        header: "Status",
        cell: ({ row }) => {
          const status = deriveInviteStatus(row.original);
          return (
            <div>
              <span
                className={cn(
                  "inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium",
                  STATUS_STYLES[status],
                )}
              >
                {STATUS_LABEL[status]}
              </span>
              {row.original.convertedOrganizationId ? (
                <p className="mt-1 text-[11px] text-muted-foreground">
                  →{" "}
                  <Link
                    className="underline"
                    href={`/organizations/${row.original.convertedOrganizationId}`}
                  >
                    new org
                  </Link>
                </p>
              ) : null}
            </div>
          );
        },
      },
      {
        id: "actions",
        header: "",
        cell: ({ row }) => (
          <div className="text-right">
            <Button asChild variant="ghost" size="sm">
              <Link href={`/organizations/${row.original.organizationId}`}>
                Open
              </Link>
            </Button>
          </div>
        ),
      },
    ],
    [statusFilter],
  );

  const table = useReactTable({
    data: rows,
    columns,
    state: { rowSelection, pagination },
    onRowSelectionChange: setRowSelection,
    onPaginationChange: setPagination,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getRowId: (row) => row.organizationId,
    enableRowSelection: (row) => canSelectForSend(row.original, statusFilter),
  });

  const selectedIds = useMemo(
    () =>
      table
        .getSelectedRowModel()
        .rows.map((r) => r.original.organizationId),
    // eslint-disable-next-line react-hooks/exhaustive-deps -- selection + data drive this
    [rowSelection, rows],
  );

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
      const skipped = res.skipped ?? 0;
      toast.success(
        `Sent ${res.sent} · failed ${res.failed}${skipped ? ` · skipped ${skipped}` : ""}`,
      );
      setRowSelection({});
      void refetch();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Send failed");
    }
  }

  const pageRows = table.getRowModel().rows;

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Invites</h1>
          <p className="mt-1 max-w-xl text-sm text-muted-foreground">
            Paginated list ({PAGE_SIZE}/page). Default filter = not sent yet.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => void refetch()}
            disabled={isFetching}
          >
            <RefreshCw
              className={cn("mr-1.5 size-3.5", isFetching && "animate-spin")}
            />
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
          onChange={(e) => setQ(e.target.value)}
          className="lg:max-w-xs"
        />
        <Select value={serviceCode} onValueChange={setServiceCode}>
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
        <Select value={statusFilter} onValueChange={setStatusFilter}>
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
            onCheckedChange={(v) => setOnlyWithEmail(Boolean(v))}
          />
          Only with email
        </label>
        <p className="text-xs text-muted-foreground lg:ml-auto">
          {rows.length} match
          {data ? ` · ${data.length} total` : ""}
        </p>
      </div>

      {isLoading ? (
        <div className="space-y-2">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-14 w-full rounded-xl" />
          ))}
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
            Change status filter or search.
          </p>
        </div>
      ) : (
        <>
          <div className="hidden overflow-hidden rounded-2xl border border-border/60 md:block">
            <table className="w-full text-sm">
              <thead className="border-b border-border/60 bg-muted/30 text-left text-xs uppercase tracking-wide text-muted-foreground">
                {table.getHeaderGroups().map((headerGroup) => (
                  <tr key={headerGroup.id}>
                    {headerGroup.headers.map((header) => (
                      <th key={header.id} className="px-3 py-3 font-medium">
                        {header.isPlaceholder
                          ? null
                          : flexRender(
                              header.column.columnDef.header,
                              header.getContext(),
                            )}
                      </th>
                    ))}
                  </tr>
                ))}
              </thead>
              <tbody>
                {pageRows.map((row) => (
                  <tr
                    key={row.id}
                    className="border-b border-border/40 last:border-0 hover:bg-muted/20"
                  >
                    {row.getVisibleCells().map((cell) => (
                      <td key={cell.id} className="px-3 py-3 align-middle">
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext(),
                        )}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="space-y-3 md:hidden">
            {pageRows.map((row) => {
              const status = deriveInviteStatus(row.original);
              const canSelect = canSelectForSend(row.original, statusFilter);
              return (
                <div
                  key={row.id}
                  className="rounded-2xl border border-border/60 bg-card/50 p-4"
                >
                  <div className="flex items-start gap-3">
                    <Checkbox
                      className="mt-1"
                      disabled={!canSelect}
                      checked={row.getIsSelected()}
                      onCheckedChange={(v) =>
                        row.toggleSelected(Boolean(v))
                      }
                    />
                    <div className="min-w-0 flex-1">
                      <Link
                        href={`/organizations/${row.original.organizationId}`}
                        className="font-medium hover:underline"
                      >
                        {row.original.displayName}
                      </Link>
                      <p className="mt-0.5 text-xs text-muted-foreground">
                        {serviceLabel(row.original.serviceCode)} ·{" "}
                        {row.original.city || "—"} {row.original.countryCode || ""}
                      </p>
                      <p className="mt-2 truncate text-sm">
                        {row.original.inviteEmail || (
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

          <div className="flex items-center justify-between gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
            >
              Previous
            </Button>
            <span className="text-xs text-muted-foreground">
              Page {table.getState().pagination.pageIndex + 1} of{" "}
              {Math.max(table.getPageCount(), 1)}
              <span className="hidden sm:inline">
                {" "}
                · {PAGE_SIZE} per page
              </span>
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
            >
              Next
            </Button>
          </div>
        </>
      )}
    </div>
  );
}
