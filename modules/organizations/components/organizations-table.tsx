"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import {
  flexRender,
  getCoreRowModel,
  type ColumnDef,
  type PaginationState,
  type SortingState,
  useReactTable,
  type VisibilityState,
} from "@tanstack/react-table";
import { ArrowUpRight, Plus, Search, Trash2 } from "lucide-react";
import {
  useOrganizationFilterCountries,
  useOrganizationSummaryPage,
} from "@/modules/organizations/hooks";
import { useOrganizationsListRealtime } from "@/modules/organizations/realtime";
import type { OrganizationSummary } from "@/modules/organizations/types";
import {
  OperationalStatusBadge,
  RelationshipStatusBadge,
  TestBadge,
} from "@/shared/components/status-badges";
import { formatDate, formatDateTime } from "@/shared/lib/utils";
import {
  OPERATIONAL_STATUSES,
  RELATIONSHIP_STATUSES,
  type OperationalStatus,
  type RelationshipStatus,
} from "@/shared/types/domain";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/ui/select";
import { Skeleton } from "@/shared/ui/skeleton";
import { Checkbox } from "@/shared/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/shared/ui/dropdown-menu";

const PAGE_SIZE = 25;

const SORTABLE: Record<
  string,
  | "displayName"
  | "createdAt"
  | "lastActivityAt"
  | "relationshipStatus"
  | "operationalStatus"
> = {
  displayName: "displayName",
  createdAt: "createdAt",
  lastActivityAt: "lastActivityAt",
  relationshipStatus: "relationshipStatus",
  operationalStatus: "operationalStatus",
};

function useUrlFilters() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const filters = {
    q: searchParams.get("q") ?? "",
    relationshipStatus: (searchParams.get("rel") ?? "all") as
      | RelationshipStatus
      | "all",
    operationalStatus: (searchParams.get("ops") ?? "all") as
      | OperationalStatus
      | "all",
    country: searchParams.get("country") ?? "all",
    testFilter: (searchParams.get("test") ?? "all") as "all" | "test" | "real",
  };

  function setParam(key: string, value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (!value || value === "all") params.delete(key);
    else params.set(key, value);
    if (key !== "page") params.delete("page");
    router.replace(`${pathname}?${params.toString()}`);
  }

  const pageIndex = Math.max(
    0,
    Number.parseInt(searchParams.get("page") ?? "0", 10) || 0,
  );

  function setPageIndex(next: number) {
    const params = new URLSearchParams(searchParams.toString());
    if (next <= 0) params.delete("page");
    else params.set("page", String(next));
    router.replace(`${pathname}?${params.toString()}`);
  }

  return { filters, setParam, pageIndex, setPageIndex };
}

export function OrganizationsTable() {
  const router = useRouter();
  const { filters, setParam, pageIndex, setPageIndex } = useUrlFilters();
  const [sorting, setSorting] = useState<SortingState>([
    { id: "createdAt", desc: true },
  ]);
  const sortId = sorting[0]?.id ?? "createdAt";
  const sortBy = SORTABLE[sortId] ?? "createdAt";
  const sortDesc = sorting[0]?.desc ?? true;

  const { data, isLoading, isError, error, refetch, isFetching } =
    useOrganizationSummaryPage({
      ...filters,
      pageIndex,
      pageSize: PAGE_SIZE,
      sortBy,
      sortDesc,
    });
  const { data: countries = [] } = useOrganizationFilterCountries();
  useOrganizationsListRealtime();

  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({
    serviceName: false,
    lastActivityAt: false,
    createdAt: false,
    isTest: false,
  });
  const [rowSelection, setRowSelection] = useState<Record<string, boolean>>({});

  const rows = data?.rows ?? [];
  const totalCount = data?.totalCount ?? 0;
  const pageCount = Math.max(1, Math.ceil(totalCount / PAGE_SIZE));

  const columns = useMemo<ColumnDef<OrganizationSummary>[]>(
    () => [
      {
        id: "select",
        enableHiding: false,
        enableSorting: false,
        header: ({ table }) => (
          <Checkbox
            checked={table.getIsAllPageRowsSelected()}
            onCheckedChange={(value) =>
              table.toggleAllPageRowsSelected(Boolean(value))
            }
            aria-label="Select all"
          />
        ),
        cell: ({ row }) => (
          <Checkbox
            checked={row.getIsSelected()}
            onCheckedChange={(value) => row.toggleSelected(Boolean(value))}
            aria-label="Select row"
            onClick={(e) => e.stopPropagation()}
          />
        ),
      },
      {
        id: "rowIndex",
        enableHiding: false,
        enableSorting: false,
        header: "#",
        cell: ({ row }) => (
          <span className="tabular-nums text-muted-foreground">
            {pageIndex * PAGE_SIZE + row.index + 1}
          </span>
        ),
      },
      {
        accessorKey: "displayName",
        header: "Company",
        cell: ({ row }) => (
          <div className="flex min-w-0 flex-col gap-1">
            <div className="flex items-center gap-2">
              <span className="truncate font-medium">
                {row.original.displayName}
              </span>
              {row.original.isTest ? <TestBadge /> : null}
            </div>
            {row.original.legalName ? (
              <span className="truncate text-xs text-muted-foreground">
                {row.original.legalName}
              </span>
            ) : null}
          </div>
        ),
      },
      {
        accessorKey: "legalCountryCode",
        header: "Country",
        enableSorting: false,
        cell: ({ getValue }) => getValue<string>() ?? "—",
      },
      {
        id: "primaryBase",
        header: "Primary Base",
        enableSorting: false,
        accessorFn: (row) =>
          [row.primaryBaseLabel, row.primaryBaseCity]
            .filter(Boolean)
            .join(" · ") || "—",
      },
      {
        accessorKey: "relationshipStatus",
        header: "Relationship",
        cell: ({ row }) => (
          <RelationshipStatusBadge status={row.original.relationshipStatus} />
        ),
      },
      {
        accessorKey: "operationalStatus",
        header: "Operational",
        cell: ({ row }) => (
          <OperationalStatusBadge status={row.original.operationalStatus} />
        ),
      },
      {
        accessorKey: "coverageCount",
        header: "Coverage",
        enableSorting: false,
        cell: ({ getValue }) => getValue<number>() ?? 0,
      },
      {
        id: "nextAction",
        header: "Next Action",
        enableSorting: false,
        accessorFn: (row) => row.nextActionTitle ?? "",
        cell: ({ row }) =>
          row.original.nextActionTitle ? (
            <div className="max-w-[180px]">
              <p className="truncate text-sm">{row.original.nextActionTitle}</p>
              <p className="text-xs text-muted-foreground">
                {formatDate(row.original.nextActionDueAt)}
              </p>
            </div>
          ) : (
            <span className="text-muted-foreground">—</span>
          ),
      },
      {
        accessorKey: "serviceName",
        header: "Service",
        enableSorting: false,
        cell: ({ getValue }) => getValue<string>() ?? "—",
      },
      {
        accessorKey: "lastActivityAt",
        header: "Last Activity",
        cell: ({ getValue }) => formatDateTime(getValue<string | null>()),
      },
      {
        accessorKey: "createdAt",
        header: "Created",
        cell: ({ getValue }) => formatDate(getValue<string | null>()),
      },
      {
        accessorKey: "isTest",
        header: "Test/Real",
        enableSorting: false,
        cell: ({ getValue }) => (getValue<boolean>() ? "TEST" : "Real"),
      },
      {
        id: "actions",
        header: "",
        enableHiding: false,
        enableSorting: false,
        cell: ({ row }) => (
          <Link
            href={`/organizations/${row.original.organizationId}`}
            onClick={(e) => e.stopPropagation()}
            className="inline-flex items-center gap-1 rounded-md border border-border px-2.5 py-1 text-xs font-medium text-muted-foreground hover:border-primary/40 hover:bg-primary/5 hover:text-foreground"
          >
            Open
            <ArrowUpRight className="h-3 w-3" />
          </Link>
        ),
      },
    ],
    [pageIndex],
  );

  const pagination = useMemo<PaginationState>(
    () => ({ pageIndex, pageSize: PAGE_SIZE }),
    [pageIndex],
  );

  const table = useReactTable({
    data: rows,
    columns,
    state: { sorting, columnVisibility, rowSelection, pagination },
    onSortingChange: (updater) => {
      setSorting(updater);
      setPageIndex(0);
    },
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    onPaginationChange: (updater) => {
      const next =
        typeof updater === "function" ? updater(pagination) : updater;
      setPageIndex(next.pageIndex);
    },
    enableRowSelection: true,
    manualPagination: true,
    manualSorting: true,
    pageCount,
    getCoreRowModel: getCoreRowModel(),
    getRowId: (row) => row.organizationId,
  });

  const selectedCount = Object.values(rowSelection).filter(Boolean).length;

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="font-display text-3xl tracking-tight">Organizations</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Network CRM table for operators and leads.
            {totalCount > 0 ? (
              <span className="ml-1 tabular-nums">({totalCount})</span>
            ) : null}
            {isFetching && !isLoading ? (
              <span className="ml-2 text-xs">Refreshing…</span>
            ) : null}
          </p>
        </div>
        <Button asChild>
          <Link href="/organizations/new">
            <Plus className="h-4 w-4" />
            Add Operator
          </Link>
        </Button>
      </div>

      <div className="grid gap-3 rounded-lg border border-border bg-card/70 p-3 md:grid-cols-6">
        <div className="relative md:col-span-2">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            className="pl-9"
            placeholder="Search company, base, action…"
            defaultValue={filters.q}
            onChange={(event) => {
              const value = event.target.value;
              window.clearTimeout((window as unknown as { __q?: number }).__q);
              (window as unknown as { __q?: number }).__q = window.setTimeout(
                () => setParam("q", value),
                250,
              );
            }}
          />
        </div>
        <Select
          value={filters.relationshipStatus}
          onValueChange={(value) => setParam("rel", value)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Relationship" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All relationships</SelectItem>
            {RELATIONSHIP_STATUSES.map((status) => (
              <SelectItem key={status} value={status}>
                {status}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select
          value={filters.operationalStatus}
          onValueChange={(value) => setParam("ops", value)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Operational" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All operational</SelectItem>
            {OPERATIONAL_STATUSES.map((status) => (
              <SelectItem key={status} value={status}>
                {status}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select
          value={filters.country}
          onValueChange={(value) => setParam("country", value)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Country" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All countries</SelectItem>
            {countries.map((country) => (
              <SelectItem key={country} value={country}>
                {country}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select
          value={filters.testFilter}
          onValueChange={(value) => setParam("test", value)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Test/Real" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All orgs</SelectItem>
            <SelectItem value="real">Real only</SelectItem>
            <SelectItem value="test">Test only</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {selectedCount > 0 ? (
        <div className="flex items-center gap-3 rounded-lg border border-primary/30 bg-primary/5 px-4 py-2.5">
          <span className="text-sm font-medium">{selectedCount} selected</span>
          <div className="ml-auto flex gap-2">
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setRowSelection({})}
            >
              Clear
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="text-danger hover:border-danger/40 hover:bg-danger/5 hover:text-danger"
              onClick={() => {
                const names = table
                  .getSelectedRowModel()
                  .rows.map((r) => r.original.displayName)
                  .join(", ");
                alert(
                  `Bulk delete not yet implemented.\nSelected: ${names}\n\nOpen each profile to delete individually.`,
                );
              }}
            >
              <Trash2 className="mr-1.5 h-3.5 w-3.5" />
              Delete selected
            </Button>
          </div>
        </div>
      ) : null}

      <div className="flex items-center justify-end gap-2">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm">
              Columns
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Toggle columns</DropdownMenuLabel>
            <DropdownMenuSeparator />
            {table
              .getAllColumns()
              .filter((column) => column.getCanHide())
              .map((column) => (
                <DropdownMenuItem
                  key={column.id}
                  className="capitalize"
                  onSelect={(e) => e.preventDefault()}
                  onClick={() =>
                    column.toggleVisibility(!column.getIsVisible())
                  }
                >
                  <Checkbox
                    checked={column.getIsVisible()}
                    className="mr-2"
                    aria-hidden
                  />
                  {column.id}
                </DropdownMenuItem>
              ))}
          </DropdownMenuContent>
        </DropdownMenu>
        <Button
          variant="outline"
          size="sm"
          onClick={() => void refetch()}
          disabled={isFetching}
        >
          Refresh
        </Button>
      </div>

      {isLoading ? (
        <div className="space-y-2">
          {Array.from({ length: 8 }).map((_, i) => (
            <Skeleton key={i} className="h-12 w-full" />
          ))}
        </div>
      ) : isError ? (
        <div className="rounded-lg border border-danger/30 bg-danger/5 p-4 text-sm">
          <p className="font-medium text-danger">Could not load organizations</p>
          <p className="mt-1 text-muted-foreground">
            {error instanceof Error ? error.message : "Unknown error"}
          </p>
          <Button
            className="mt-3"
            size="sm"
            variant="outline"
            onClick={() => void refetch()}
          >
            Retry
          </Button>
        </div>
      ) : rows.length === 0 ? (
        <div className="rounded-lg border border-dashed border-border p-10 text-center text-sm text-muted-foreground">
          No organizations match these filters.
        </div>
      ) : (
        <>
          <div className="hidden overflow-x-auto rounded-lg border border-border md:block">
            <table className="w-full min-w-[960px] text-left text-sm">
              <thead className="border-b border-border bg-muted/40 text-xs uppercase tracking-wide text-muted-foreground">
                {table.getHeaderGroups().map((headerGroup) => (
                  <tr key={headerGroup.id}>
                    {headerGroup.headers.map((header) => (
                      <th
                        key={header.id}
                        className="px-3 py-2.5 font-medium"
                        onClick={header.column.getToggleSortingHandler()}
                        style={{
                          cursor: header.column.getCanSort()
                            ? "pointer"
                            : undefined,
                        }}
                      >
                        {header.isPlaceholder
                          ? null
                          : flexRender(
                              header.column.columnDef.header,
                              header.getContext(),
                            )}
                        {{
                          asc: " ↑",
                          desc: " ↓",
                        }[header.column.getIsSorted() as string] ?? null}
                      </th>
                    ))}
                  </tr>
                ))}
              </thead>
              <tbody>
                {table.getRowModel().rows.map((row) => (
                  <tr
                    key={row.id}
                    className="cursor-pointer border-b border-border/70 hover:bg-muted/30"
                    onClick={() =>
                      router.push(
                        `/organizations/${row.original.organizationId}`,
                      )
                    }
                  >
                    {row.getVisibleCells().map((cell) => (
                      <td key={cell.id} className="px-3 py-2.5 align-middle">
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
            {rows.map((row) => (
              <div
                key={row.organizationId}
                className="rounded-lg border border-border bg-card/70 p-3"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="truncate font-medium">{row.displayName}</p>
                      {row.isTest ? <TestBadge /> : null}
                    </div>
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      {[row.legalCountryCode, row.primaryBaseCity]
                        .filter(Boolean)
                        .join(" · ") || "—"}
                    </p>
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      <RelationshipStatusBadge
                        status={row.relationshipStatus}
                      />
                      <OperationalStatusBadge status={row.operationalStatus} />
                      {row.coverageCount > 0 ? (
                        <span className="inline-flex items-center rounded-full border border-border px-2 py-px text-[10px] text-muted-foreground">
                          {row.coverageCount} coverage
                        </span>
                      ) : null}
                    </div>
                  </div>
                  <Link
                    href={`/organizations/${row.organizationId}`}
                    className="mt-0.5 flex shrink-0 items-center gap-1 rounded-md border border-border px-3 py-1.5 text-xs font-medium text-muted-foreground hover:border-primary/40 hover:bg-primary/5 hover:text-foreground"
                  >
                    Open
                    <ArrowUpRight className="h-3 w-3" />
                  </Link>
                </div>
              </div>
            ))}
          </div>

          <div className="flex items-center justify-between">
            <Button
              variant="outline"
              size="sm"
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
            >
              Previous
            </Button>
            <span className="text-xs text-muted-foreground">
              Page {pageIndex + 1} of {pageCount}
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
