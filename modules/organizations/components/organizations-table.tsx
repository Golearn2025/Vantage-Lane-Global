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
  type SortingState,
  useReactTable,
  type VisibilityState,
} from "@tanstack/react-table";
import { Plus, Search } from "lucide-react";
import { useOrganizationSummaries } from "@/modules/organizations/hooks";
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
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({
    serviceName: false,
    lastActivityAt: false,
    createdAt: false,
    isTest: false,
  });

  const columns = useMemo<ColumnDef<OrganizationSummary>[]>(
    () => [
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
    ],
    [],
  );

  const table = useReactTable({
    data: data ?? [],
    columns,
    state: { sorting, columnVisibility },
    onSortingChange: setSorting,
    onColumnVisibilityChange: setColumnVisibility,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: { pagination: { pageSize: 20 } },
  });

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

          <div className="space-y-3 md:hidden">
            {table.getRowModel().rows.map((row) => (
              <Link
                key={row.id}
                href={`/organizations/${row.original.organizationId}`}
                className="block rounded-lg border border-border bg-card p-4"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-medium">{row.original.displayName}</p>
                      {row.original.isTest ? <TestBadge /> : null}
                    </div>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {row.original.legalCountryCode ?? "—"} ·{" "}
                      {row.original.primaryBaseCity ?? "No base"}
                    </p>
                  </div>
                  <RelationshipStatusBadge
                    status={row.original.relationshipStatus}
                  />
                </div>
                <div className="mt-3 flex flex-wrap gap-2">
                  <OperationalStatusBadge
                    status={row.original.operationalStatus}
                  />
                  <span className="text-xs text-muted-foreground">
                    Coverage {row.original.coverageCount}
                  </span>
                </div>
              </Link>
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
