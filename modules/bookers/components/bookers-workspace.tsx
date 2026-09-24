"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import {
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  useReactTable,
  type ColumnDef,
  type RowSelectionState,
} from "@tanstack/react-table";
import { List, Mail, MapPinned, RefreshCw, Send } from "lucide-react";
import { toast } from "sonner";
import { useBookerLeads, useSendBookerEmails } from "@/modules/bookers/hooks";
import { BookersMap } from "@/modules/bookers/components/bookers-map";
import {
  deriveBookerStatus,
  type BookerLead,
  type BookerStatus,
} from "@/modules/bookers/types";
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

const PAGE_SIZE_OPTIONS = ["25", "50", "100", "all"] as const;
type PageSizeOption = (typeof PAGE_SIZE_OPTIONS)[number];

const SERVICE_FILTERS = [
  { value: "all", label: "All types" },
  { value: "HOSPITALITY", label: "Hospitality" },
  { value: "CONCIERGE", label: "Concierge" },
  { value: "EVENTS", label: "Events" },
];

/** VL Bookers working set: London only for now. Networking stays worldwide. */
const REGION_FILTERS = [
  { value: "london", label: "London (VL focus)" },
  { value: "all", label: "All VL markets" },
] as const;

type RegionFilter = (typeof REGION_FILTERS)[number]["value"];

function isLondonBooker(row: BookerLead) {
  return (
    (row.countryCode || "").toUpperCase() === "GB" &&
    (row.city || "").trim().toLowerCase() === "london"
  );
}

const STATUS_FILTERS: { value: string; label: string }[] = [
  { value: "not_sent", label: "Not sent (ready)" },
  { value: "sent_family", label: "Already contacted (sent+)" },
  { value: "sent", label: "Sent" },
  { value: "delivered", label: "Delivered" },
  { value: "opened", label: "Opened" },
  { value: "clicked", label: "Clicked" },
  { value: "signed_up", label: "Interested" },
  { value: "failed", label: "Failed / bounced" },
  { value: "all", label: "All statuses" },
];

const STATUS_STYLES: Record<BookerStatus, string> = {
  not_sent: "bg-muted text-muted-foreground",
  sent: "bg-sky-500/15 text-sky-700 dark:text-sky-300",
  delivered: "bg-sky-500/15 text-sky-700 dark:text-sky-300",
  opened: "bg-amber-500/15 text-amber-700 dark:text-amber-300",
  clicked: "bg-violet-500/15 text-violet-700 dark:text-violet-300",
  signed_up: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300",
  failed: "bg-danger/15 text-danger",
  bounced: "bg-danger/15 text-danger",
};

const STATUS_LABEL: Record<BookerStatus, string> = {
  not_sent: "Not sent",
  sent: "Sent",
  delivered: "Delivered",
  opened: "Opened",
  clicked: "Clicked",
  signed_up: "Interested",
  failed: "Failed",
  bounced: "Bounced",
};

const ALREADY_CONTACTED: BookerStatus[] = [
  "sent",
  "delivered",
  "opened",
  "clicked",
  "signed_up",
];

function matchesStatusFilter(status: BookerStatus, filter: string) {
  if (filter === "all") return true;
  if (filter === "not_sent") return status === "not_sent";
  if (filter === "sent_family") return ALREADY_CONTACTED.includes(status);
  if (filter === "failed") return status === "failed" || status === "bounced";
  return status === filter;
}

function canSelectForSend(row: BookerLead, statusFilter: string) {
  if (!row.inviteEmail) return false;
  const st = deriveBookerStatus(row);
  if (
    statusFilter === "sent_family" ||
    statusFilter === "sent" ||
    statusFilter === "delivered" ||
    statusFilter === "opened" ||
    statusFilter === "clicked" ||
    statusFilter === "all"
  ) {
    return st !== "signed_up";
  }
  if (statusFilter === "failed") return st === "failed" || st === "bounced";
  if (statusFilter === "not_sent") return st === "not_sent";
  return st === "not_sent" || st === "failed" || st === "bounced";
}

function initialStatusFromParams(raw: string | null): string {
  if (!raw) return "not_sent";
  if (STATUS_FILTERS.some((s) => s.value === raw)) return raw;
  return "not_sent";
}

export function BookersWorkspace() {
  const searchParams = useSearchParams();
  const [view, setView] = useState<"leads" | "map">(() =>
    searchParams.get("view") === "map" ? "map" : "leads",
  );
  const [regionFilter, setRegionFilter] = useState<RegionFilter>(() =>
    searchParams.get("region") === "all" ? "all" : "london",
  );
  const [serviceCode, setServiceCode] = useState("all");
  const [statusFilter, setStatusFilter] = useState(() =>
    initialStatusFromParams(searchParams.get("status")),
  );
  const [q, setQ] = useState("");
  const [onlyWithEmail, setOnlyWithEmail] = useState(true);
  const [pageSizeOption, setPageSizeOption] = useState<PageSizeOption>("25");
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
  const [focusedOrgId, setFocusedOrgId] = useState<string | null>(null);
  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: 25,
  });

  const { data, isLoading, isError, error, refetch, isFetching } = useBookerLeads({
    serviceCode,
    q,
    onlyWithEmail: view === "map" ? false : onlyWithEmail,
  });
  const sendEmails = useSendBookerEmails();

  const regionScoped = useMemo(() => {
    const list = data ?? [];
    if (regionFilter === "london") return list.filter(isLondonBooker);
    return list;
  }, [data, regionFilter]);

  const rows = useMemo(() => {
    return regionScoped.filter((r) =>
      matchesStatusFilter(deriveBookerStatus(r), statusFilter),
    );
  }, [regionScoped, statusFilter]);

  const mapRows = useMemo(() => {
    if (statusFilter === "all") return regionScoped;
    return regionScoped.filter((r) =>
      matchesStatusFilter(deriveBookerStatus(r), statusFilter),
    );
  }, [regionScoped, statusFilter]);

  const resolvedPageSize =
    pageSizeOption === "all" ? Math.max(rows.length, 1) : Number(pageSizeOption);

  useEffect(() => {
    setPagination((p) => ({
      ...p,
      pageIndex: 0,
      pageSize: resolvedPageSize,
    }));
    setRowSelection({});
    setFocusedOrgId(null);
  }, [serviceCode, statusFilter, q, onlyWithEmail, pageSizeOption, regionFilter]);

  useEffect(() => {
    setPagination((p) =>
      p.pageSize === resolvedPageSize ? p : { ...p, pageSize: resolvedPageSize },
    );
  }, [resolvedPageSize]);

  const columns = useMemo<ColumnDef<BookerLead>[]>(
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
        header: "Desk / company",
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
        header: "Type",
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
          const status = deriveBookerStatus(row.original);
          return (
            <span
              className={cn(
                "inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium",
                STATUS_STYLES[status],
              )}
            >
              {STATUS_LABEL[status]}
            </span>
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
      toast.error("Select at least one booker ready to contact");
      return;
    }
    const resending =
      statusFilter === "sent_family" ||
      statusFilter === "sent" ||
      statusFilter === "delivered" ||
      statusFilter === "opened" ||
      statusFilter === "clicked" ||
      statusFilter === "all";
    try {
      const res = await sendEmails.mutateAsync({
        organizationIds: selectedIds,
        serviceCode: serviceCode === "all" ? "HOSPITALITY" : serviceCode,
        skipAlreadyInvited: statusFilter === "not_sent",
        forceResend: resending,
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
          <h1 className="text-2xl font-semibold tracking-tight">Bookers</h1>
          <p className="mt-1 max-w-xl text-sm text-muted-foreground">
            Ținte VL (hotel / concierge pe care le contactăm) — separat de
            Network. Focus acum: <span className="text-foreground">London</span>
            . Partnerii worldwide rămân în Network / Invites.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <div className="flex rounded-full border border-border/60 p-0.5">
            <Button
              type="button"
              size="sm"
              variant={view === "leads" ? "secondary" : "ghost"}
              className="rounded-full"
              onClick={() => setView("leads")}
            >
              <List className="mr-1.5 size-3.5" />
              Leads
            </Button>
            <Button
              type="button"
              size="sm"
              variant={view === "map" ? "secondary" : "ghost"}
              className="rounded-full"
              onClick={() => setView("map")}
            >
              <MapPinned className="mr-1.5 size-3.5" />
              Map
            </Button>
          </div>
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
          {view === "leads" ? (
            <Button
              size="sm"
              className="rounded-full"
              disabled={selectedIds.length === 0 || sendEmails.isPending}
              onClick={() => void handleSend()}
            >
              <Send className="mr-1.5 size-3.5" />
              {sendEmails.isPending
                ? "Sending…"
                : `Send${selectedIds.length ? ` (${selectedIds.length})` : ""}`}
            </Button>
          ) : null}
        </div>
      </div>

      <div className="flex flex-col gap-3 rounded-2xl border border-border/60 bg-card/40 p-3 lg:flex-row lg:flex-wrap lg:items-center">
        <Input
          placeholder="Search desk or email…"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          className="lg:max-w-xs"
        />
        <Select
          value={regionFilter}
          onValueChange={(v) => setRegionFilter(v as RegionFilter)}
        >
          <SelectTrigger className="lg:w-48">
            <SelectValue placeholder="Region" />
          </SelectTrigger>
          <SelectContent>
            {REGION_FILTERS.map((s) => (
              <SelectItem key={s.value} value={s.value}>
                {s.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={serviceCode} onValueChange={setServiceCode}>
          <SelectTrigger className="lg:w-52">
            <SelectValue placeholder="Type" />
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
        {view === "leads" ? (
          <label className="flex items-center gap-2 text-sm text-muted-foreground">
            <Checkbox
              checked={onlyWithEmail}
              onCheckedChange={(v) => setOnlyWithEmail(Boolean(v))}
            />
            Only with email
          </label>
        ) : null}
        <p className="text-xs text-muted-foreground lg:ml-auto">
          {view === "map" ? mapRows.length : rows.length} match
          {data ? ` · ${data.length} total` : ""}
        </p>
      </div>

      {view === "map" ? (
        isLoading ? (
          <Skeleton className="h-[560px] w-full rounded-2xl" />
        ) : isError ? (
          <p className="text-sm text-danger">
            {error instanceof Error ? error.message : "Failed to load bookers"}
          </p>
        ) : (
          <div className="grid gap-4 lg:grid-cols-[280px_minmax(0,1fr)]">
            <div className="max-h-[560px] space-y-1 overflow-y-auto rounded-2xl border border-border/60 p-2">
              {mapRows.length === 0 ? (
                <p className="p-4 text-sm text-muted-foreground">No bookers</p>
              ) : (
                mapRows.map((row) => (
                  <button
                    key={row.organizationId}
                    type="button"
                    onClick={() => setFocusedOrgId(row.organizationId)}
                    className={cn(
                      "w-full rounded-xl px-3 py-2.5 text-left transition-colors hover:bg-muted/40",
                      focusedOrgId === row.organizationId && "bg-muted/50",
                    )}
                  >
                    <p className="truncate text-sm font-medium">
                      {row.displayName}
                    </p>
                    <p className="truncate text-xs text-muted-foreground">
                      {row.primaryBaseCity || row.city || "—"}
                      {row.countryCode ? `, ${row.countryCode}` : ""}
                      {row.primaryBaseLat == null ? " · no pin" : ""}
                    </p>
                  </button>
                ))
              )}
            </div>
            <div className="h-[560px] overflow-hidden rounded-2xl border border-border/60">
              <BookersMap
                bookers={mapRows}
                focusedOrgId={focusedOrgId}
                londonFocus={regionFilter === "london"}
                className="h-full"
              />
            </div>
          </div>
        )
      ) : isLoading ? (
        <div className="space-y-2">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-14 w-full rounded-xl" />
          ))}
        </div>
      ) : isError ? (
        <p className="text-sm text-danger">
          {error instanceof Error ? error.message : "Failed to load bookers"}
        </p>
      ) : rows.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border/70 px-6 py-16 text-center">
          <Mail className="mx-auto mb-3 size-8 text-muted-foreground" />
          <p className="font-medium">No matching bookers</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Add BUYER leads or change filters. Run the bookers migration for UK
            starter desks.
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
              const status = deriveBookerStatus(row.original);
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
                        {row.original.city || "—"}{" "}
                        {row.original.countryCode || ""}
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

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center justify-between gap-2 sm:justify-start">
              <Button
                variant="outline"
                size="sm"
                onClick={() => table.previousPage()}
                disabled={!table.getCanPreviousPage()}
              >
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => table.nextPage()}
                disabled={!table.getCanNextPage()}
              >
                Next
              </Button>
            </div>
            <div className="flex flex-wrap items-center justify-between gap-3 sm:justify-end">
              <span className="text-xs text-muted-foreground">
                Page {table.getState().pagination.pageIndex + 1} of{" "}
                {Math.max(table.getPageCount(), 1)}
                <span className="hidden sm:inline">
                  {" "}
                  ·{" "}
                  {pageSizeOption === "all"
                    ? "all rows"
                    : `${pageSizeOption} per page`}
                </span>
              </span>
              <Select
                value={pageSizeOption}
                onValueChange={(v) => setPageSizeOption(v as PageSizeOption)}
              >
                <SelectTrigger className="h-8 w-[7.5rem]" aria-label="Page size">
                  <SelectValue placeholder="Page size" />
                </SelectTrigger>
                <SelectContent>
                  {PAGE_SIZE_OPTIONS.map((opt) => (
                    <SelectItem key={opt} value={opt}>
                      {opt === "all" ? "All" : `${opt} / page`}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
