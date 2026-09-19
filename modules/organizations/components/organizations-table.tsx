"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import {
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  type ColumnDef,
  type Row,
  type SortingState,
  useReactTable,
  type VisibilityState,
} from "@tanstack/react-table";
import { ArrowUpRight, Plus, Search, Trash2 } from "lucide-react";
import { useOrganizationSummaries } from "@/modules/organizations/hooks";
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
    router.replace(`${pathname}?${params.toString()}`);
  }

  return { filters, setParam };
}

export function OrganizationsTable() {
  const router = useRouter();
  const { filters, setParam } = useUrlFilters();
  const { data, isLoading, isError, error, refetch, isFetching } =
    useOrganizationSummaries(filters);
  useOrganizationsListRealtime();
  const [sorting, setSorting] = useState<SortingState>([{ id: "createdAt", desc: true }]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({
    serviceName: false,
    lastActivityAt: false,
    createdAt: false,
    isTest: false,
  });
  const [rowSelection, setRowSelection] = useState<Record<string, boolean>>({});

  const columns = useMemo<ColumnDef<OrganizationSummary>[]>(
    () => [
      {
        id: "select",
        enableHiding: false,
        enableSorting: false,
        header: ({ table }) => (
          <Checkbox
            checked={table.getIsAllPageRowsSelected()}
            onCheckedChange={(value) => table.toggleAllPageRowsSelected(Boolean(value))}
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
        cell: ({ row, table }) => {
          const allRows = table.getRowModel().rows;
          const idx = allRows.findIndex((r: Row<OrganizationSummary>) => r.id === row.id);
          return (
            <span className="tabular-nums text-muted-foreground">{idx + 1}</span>
          );
        },
      },
      {
        accessorKey: "displayName",
        header: "Company",
        cell: ({ row }) => (
          <div className="flex min-w-0 flex-col gap-1">
            <div className="flex items-center gap-2">
              <span className="truncate font-medium">{row.original.displayName}</span>
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
        cell: ({ getValue }) => getValue<string>() ?? "—",
      },
      {
        id: "primaryBase",
        header: "Primary Base",
        accessorFn: (row) =>
          [row.primaryBaseLabel, row.primaryBaseCity].filter(Boolean).join(" · ") ||
          "—",
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
        cell: ({ getValue }) => getValue<number>() ?? 0,
      },
      {
        id: "nextAction",
        header: "Next Action",
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
        cell: ({ getValue }) => (getValue<boolean>() ? "TEST" : "Real"),
      },
      {
        id: "actions",
        header: "",
        enableHiding: false,
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
    [],
  );

  const table = useReactTable({
    data: data ?? [],
    columns,
    state: { sorting, columnVisibility, rowSelection },
    onSortingChange: setSorting,
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    enableRowSelection: true,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: { pagination: { pageSize: 20 } },
  });

  const selectedCount = Object.values(rowSelection).filter(Boolean).length;

  const countries = useMemo(() => {
    const set = new Set(
      (data ?? [])
        .map((row) => row.legalCountryCode)
        .filter((value): value is string => Boolean(value)),
    );
    return Array.from(set).sort();
  }, [data]);

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="font-display text-3xl tracking-tight">Organizations</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Network CRM table for operators and leads.
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

      {/* Bulk action bar */}
      {selectedCount > 0 ? (
        <div className="flex items-center gap-3 rounded-lg border border-primary/30 bg-primary/5 px-4 py-2.5">
          <span className="text-sm font-medium">
            {selectedCount} selected
          </span>
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

      <div className="flex items-center justify-between gap-2">
        <p className="text-xs text-muted-foreground">
          {isFetching ? "Refreshing…" : `${data?.length ?? 0} organizations`}
        </p>
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
                  onSelect={(event) => event.preventDefault()}
                >
                  <Checkbox
                    checked={column.getIsVisible()}
                    onCheckedChange={(value) =>
                      column.toggleVisibility(Boolean(value))
                    }
                    className="mr-2"
                  />
                  {column.id}
                </DropdownMenuItem>
              ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {isLoading ? (
        <div className="space-y-2">
          {Array.from({ length: 8 }).map((_, index) => (
            <Skeleton key={index} className="h-12 w-full" />
          ))}
        </div>
      ) : isError ? (
        <div className="rounded-lg border border-danger/30 bg-danger/5 p-6">
          <p className="font-medium text-danger">Could not load organizations</p>
          <p className="mt-1 text-sm text-muted-foreground">
            {error instanceof Error ? error.message : "Unknown error"}
          </p>
          <Button className="mt-4" variant="outline" onClick={() => refetch()}>
            Retry
          </Button>
        </div>
      ) : (data?.length ?? 0) === 0 ? (
        <div className="rounded-lg border border-dashed border-border p-10 text-center">
          <p className="font-medium">No organizations match these filters</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Adjust filters or add a new operator lead.
          </p>
          <Button asChild className="mt-4">
            <Link href="/organizations/new">Add Operator</Link>
          </Button>
        </div>
      ) : (
        <>
          <div className="hidden overflow-hidden rounded-lg border border-border md:block">
            <table className="w-full text-sm">
              <thead className="bg-muted/60 text-left text-muted-foreground">
                {table.getHeaderGroups().map((headerGroup) => (
                  <tr key={headerGroup.id}>
                    {headerGroup.headers.map((header) => (
                      <th
                        key={header.id}
                        className="cursor-pointer px-3 py-2 font-medium"
                        onClick={header.column.getToggleSortingHandler()}
                      >
                        {flexRender(
                          header.column.columnDef.header,
                          header.getContext(),
                        )}
                      </th>
                    ))}
                  </tr>
                ))}
              </thead>
              <tbody>
                {table.getRowModel().rows.map((row) => (
                  <tr
                    key={row.id}
                    className="cursor-pointer border-t border-border hover:bg-muted/40"
                    onClick={() =>
                      router.push(
                        `/organizations/${row.original.organizationId}`,
                      )
                    }
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

          <div className="space-y-2 md:hidden">
            {table.getRowModel().rows.map((row) => (
              <div
                key={row.id}
                className="overflow-hidden rounded-xl border border-border bg-card"
              >
                <div className="flex items-start justify-between gap-3 p-4">
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-medium">{row.original.displayName}</p>
                      {row.original.isTest ? <TestBadge /> : null}
                    </div>
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      {row.original.legalCountryCode ?? "—"}
                      {row.original.primaryBaseCity
                        ? ` · ${row.original.primaryBaseCity}`
                        : ""}
                    </p>
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      <RelationshipStatusBadge status={row.original.relationshipStatus} />
                      <OperationalStatusBadge status={row.original.operationalStatus} />
                      {row.original.coverageCount > 0 ? (
                        <span className="inline-flex items-center rounded-full border border-border px-2 py-px text-[10px] text-muted-foreground">
                          {row.original.coverageCount} coverage
                        </span>
                      ) : null}
                    </div>
                  </div>
                  <Link
                    href={`/organizations/${row.original.organizationId}`}
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
              Page {table.getState().pagination.pageIndex + 1} of{" "}
              {table.getPageCount()}
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
