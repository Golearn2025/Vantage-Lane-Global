"use client";

import Link from "next/link";
import { useMemo } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import {
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  useReactTable,
  type ColumnDef,
} from "@tanstack/react-table";
import { ArrowUpRight, RefreshCw } from "lucide-react";
import {
  buildCoverageSummary,
  countryLabel,
  describeCoverageView,
  filterCoverageRows,
  resolveCity,
  resolveCountry,
  uniqueCitiesForCountry,
  uniqueCountries,
} from "@/modules/coverage/aggregate";
import { useCoverageInventory } from "@/modules/coverage/hooks";
import type { CoverageFilters, CoverageLeadRow } from "@/modules/coverage/types";
import { useOrganizationsListRealtime } from "@/modules/organizations/realtime";
import { RelationshipStatusBadge } from "@/shared/components/status-badges";
import {
  NETWORK_SERVICE_CODES,
  networkServiceLabel,
} from "@/shared/lib/services";
import { cn } from "@/shared/lib/utils";
import {
  RELATIONSHIP_STATUSES,
  type RelationshipStatus,
} from "@/shared/types/domain";
import { Button } from "@/shared/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/ui/select";
import { Skeleton } from "@/shared/ui/skeleton";

const PAGE_SIZE = 25;

function useCoverageUrlFilters(): {
  filters: CoverageFilters;
  setParam: (key: string, value: string) => void;
  setParams: (updates: Record<string, string | null>) => void;
} {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const filters: CoverageFilters = {
    country: searchParams.get("country") ?? "all",
    city: searchParams.get("city") ?? "all",
    serviceCode: searchParams.get("service") ?? "all",
    relationshipStatus: (searchParams.get("rel") ?? "LEAD") as
      | RelationshipStatus
      | "all",
    testFilter: (searchParams.get("test") ?? "real") as "all" | "test" | "real",
  };

  function setParams(updates: Record<string, string | null>) {
    const params = new URLSearchParams(searchParams.toString());
    for (const [key, value] of Object.entries(updates)) {
      if (!value || value === "all") params.delete(key);
      else params.set(key, value);
    }
    router.replace(`${pathname}?${params.toString()}`);
  }

  function setParam(key: string, value: string) {
    if (key === "country") {
      setParams({ country: value === "all" ? null : value, city: null });
      return;
    }
    setParams({ [key]: value === "all" ? null : value });
  }

  return { filters, setParam, setParams };
}

function StatTile({
  label,
  value,
  hint,
}: {
  label: string;
  value: number | string;
  hint?: string;
}) {
  return (
    <div className="rounded-lg border border-border bg-card/60 px-4 py-3">
      <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
        {label}
      </p>
      <p className="mt-1 font-display text-2xl tabular-nums tracking-tight">
        {value}
      </p>
      {hint ? (
        <p className="mt-0.5 text-xs text-muted-foreground">{hint}</p>
      ) : null}
    </div>
  );
}

export function CoverageWorkspace() {
  const { filters, setParam, setParams } = useCoverageUrlFilters();
  const { data, isLoading, isError, error, refetch, isFetching } =
    useCoverageInventory({
      relationshipStatus: filters.relationshipStatus,
      testFilter: filters.testFilter,
    });
  useOrganizationsListRealtime();

  const allRows = data ?? [];

  const countryOptions = useMemo(
    () => uniqueCountries(allRows),
    [allRows],
  );

  const cityOptions = useMemo(() => {
    if (filters.country === "all") return [];
    return uniqueCitiesForCountry(allRows, filters.country);
  }, [allRows, filters.country]);

  const filteredRows = useMemo(
    () => filterCoverageRows(allRows, filters),
    [allRows, filters],
  );

  const summary = useMemo(
    () => buildCoverageSummary(filteredRows, filters),
    [filteredRows, filters],
  );

  const isCityDrill =
    filters.country !== "all" && filters.city !== "all";
  const isServiceGlobal =
    filters.serviceCode !== "all" && filters.country === "all";
  const showServiceColumns = !isCityDrill && !isServiceGlobal;

  const matrixTitle = useMemo(() => {
    if (isCityDrill) return "Services in this city";
    if (isServiceGlobal) return "Countries with this service";
    if (filters.country !== "all" && filters.city === "all") {
      return "Cities in " + countryLabel(filters.country);
    }
    if (filters.serviceCode !== "all" && filters.country !== "all") {
      return "Cities · " + networkServiceLabel(filters.serviceCode);
    }
    return "Countries × services";
  }, [filters, isCityDrill, isServiceGlobal]);

  const listColumns = useMemo<ColumnDef<CoverageLeadRow>[]>(
    () => [
      {
        accessorKey: "displayName",
        header: "Organization",
        cell: ({ row }) => (
          <div className="min-w-[10rem]">
            <p className="font-medium">{row.original.displayName}</p>
            {row.original.primaryBaseCity ? (
              <p className="text-xs text-muted-foreground">
                {row.original.primaryBaseCity}
              </p>
            ) : null}
          </div>
        ),
      },
      {
        id: "country",
        header: "Country",
        cell: ({ row }) => resolveCountry(row.original),
      },
      {
        id: "city",
        header: "City",
        cell: ({ row }) => resolveCity(row.original),
      },
      {
        accessorKey: "serviceName",
        header: "Service",
        cell: ({ row }) =>
          row.original.serviceName ??
          networkServiceLabel(row.original.serviceCode),
      },
      {
        accessorKey: "relationshipStatus",
        header: "Status",
        cell: ({ row }) =>
          row.original.relationshipStatus ? (
            <RelationshipStatusBadge status={row.original.relationshipStatus} />
          ) : (
            "—"
          ),
      },
      {
        id: "open",
        header: "",
        cell: ({ row }) => (
          <Button variant="ghost" size="sm" asChild>
            <Link href={`/organizations/${row.original.organizationId}`}>
              Open
              <ArrowUpRight className="ml-1 h-3.5 w-3.5" />
            </Link>
          </Button>
        ),
      },
    ],
    [],
  );

  const table = useReactTable({
    data: filteredRows,
    columns: listColumns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: { pagination: { pageSize: PAGE_SIZE } },
  });

  function clearGeo() {
    setParams({ country: null, city: null });
  }

  function clearService() {
    setParam("service", "all");
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="font-display text-3xl tracking-tight">
            Lead coverage
          </h1>
          <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
            Inventory of suppliers by country, city, and service. Default view
            shows <span className="text-foreground">LEAD</span> records (real
            data only).
          </p>
          <p className="mt-2 text-sm text-foreground/80">
            {describeCoverageView(filters)}
            {filteredRows.length > 0 ? (
              <span className="text-muted-foreground">
                {" "}
                · {filteredRows.length} record
                {filteredRows.length === 1 ? "" : "s"}
              </span>
            ) : null}
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => refetch()}
          disabled={isFetching}
        >
          <RefreshCw
            className={cn("mr-2 h-4 w-4", isFetching && "animate-spin")}
          />
          Refresh
        </Button>
      </div>

      <div className="flex flex-wrap gap-2">
        <Select
          value={filters.country}
          onValueChange={(v) => setParam("country", v)}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Country" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All countries</SelectItem>
            {countryOptions.map((code) => (
              <SelectItem key={code} value={code}>
                {countryLabel(code)} ({code})
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={filters.city}
          onValueChange={(v) => setParam("city", v)}
          disabled={filters.country === "all"}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue
              placeholder={
                filters.country === "all" ? "Select country first" : "City"
              }
            />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All cities</SelectItem>
            {cityOptions.map((city) => (
              <SelectItem key={city} value={city}>
                {city}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={filters.serviceCode}
          onValueChange={(v) => setParam("service", v)}
        >
          <SelectTrigger className="w-[220px]">
            <SelectValue placeholder="Service" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All services</SelectItem>
            {NETWORK_SERVICE_CODES.map((code) => (
              <SelectItem key={code} value={code}>
                {networkServiceLabel(code)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={filters.relationshipStatus}
          onValueChange={(v) => setParam("rel", v)}
        >
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder="Relationship" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            {RELATIONSHIP_STATUSES.map((status) => (
              <SelectItem key={status} value={status}>
                {status}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={filters.testFilter}
          onValueChange={(v) => setParam("test", v)}
        >
          <SelectTrigger className="w-[140px]">
            <SelectValue placeholder="Data" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="real">Real only</SelectItem>
            <SelectItem value="test">Test only</SelectItem>
            <SelectItem value="all">All records</SelectItem>
          </SelectContent>
        </Select>

        {(filters.country !== "all" ||
          filters.city !== "all" ||
          filters.serviceCode !== "all") && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() =>
              setParams({ country: null, city: null, service: null })
            }
          >
            Clear filters
          </Button>
        )}
      </div>

      <div className="flex flex-wrap gap-2">
        {NETWORK_SERVICE_CODES.map((code) => {
          const count = summary.serviceTotals[code] ?? 0;
          const active = filters.serviceCode === code;
          return (
            <button
              key={code}
              type="button"
              onClick={() =>
                setParam("service", active ? "all" : code)
              }
              className={cn(
                "rounded-full border px-3 py-1 text-xs transition-colors",
                active
                  ? "border-primary bg-primary/10 text-foreground"
                  : count === 0
                    ? "border-border/60 text-muted-foreground/70"
                    : "border-border hover:bg-muted/60",
              )}
            >
              {networkServiceLabel(code)}{" "}
              <span className="tabular-nums font-medium">{count}</span>
            </button>
          );
        })}
      </div>

      {isLoading ? (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-20 w-full" />
          ))}
        </div>
      ) : isError ? (
        <Card>
          <CardContent className="py-8 text-sm text-danger">
            {error instanceof Error ? error.message : "Could not load coverage"}
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <StatTile label="Matching records" value={summary.totalRows} />
            <StatTile label="Countries" value={summary.countryCount} />
            <StatTile label="City locations" value={summary.cityCount} />
            <StatTile
              label="Services present"
              value={summary.serviceCount}
              hint={`of ${NETWORK_SERVICE_CODES.length} types`}
            />
          </div>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-medium">
                {matrixTitle}
              </CardTitle>
            </CardHeader>
            <CardContent className="overflow-x-auto">
              {summary.matrixRows.length === 0 ? (
                <p className="py-6 text-sm text-muted-foreground">
                  No records match these filters. Try widening country or
                  service, or switch relationship to{" "}
                  <button
                    type="button"
                    className="underline"
                    onClick={() => setParam("rel", "all")}
                  >
                    all statuses
                  </button>
                  .
                </p>
              ) : (
                <table className="w-full min-w-[640px] border-collapse text-sm">
                  <thead>
                    <tr className="border-b border-border text-left text-xs text-muted-foreground">
                      <th className="sticky left-0 z-10 bg-card py-2 pr-3 font-medium">
                        {isCityDrill ? "Service" : isServiceGlobal ? "Country" : filters.country !== "all" ? "City" : "Country"}
                      </th>
                      {showServiceColumns
                        ? NETWORK_SERVICE_CODES.map((code) => (
                            <th
                              key={code}
                              className="px-1 py-2 text-center font-medium"
                              title={networkServiceLabel(code)}
                            >
                              <span className="hidden lg:inline">
                                {networkServiceLabel(code)}
                              </span>
                              <span className="lg:hidden">
                                {code.slice(0, 3)}
                              </span>
                            </th>
                          ))
                        : null}
                      <th className="px-2 py-2 text-right font-medium">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {summary.matrixRows.map((row) => (
                      <tr
                        key={row.key}
                        className="border-b border-border/60 hover:bg-muted/30"
                      >
                        <td className="sticky left-0 z-10 bg-card py-2 pr-3">
                          <div>
                            {isServiceGlobal ? (
                              <button
                                type="button"
                                className="font-medium hover:underline"
                                onClick={() => {
                                  setParams({
                                    country: row.key,
                                    city: null,
                                  });
                                }}
                              >
                                {countryLabel(row.key)}
                              </button>
                            ) : filters.country !== "all" &&
                              filters.city === "all" &&
                              !isCityDrill ? (
                              <button
                                type="button"
                                className="font-medium hover:underline"
                                onClick={() => setParam("city", row.label)}
                              >
                                {row.label}
                              </button>
                            ) : filters.country === "all" &&
                              filters.serviceCode === "all" ? (
                              <button
                                type="button"
                                className="font-medium hover:underline"
                                onClick={() => {
                                  setParams({
                                    country: row.key,
                                    city: null,
                                  });
                                }}
                              >
                                {row.label}
                              </button>
                            ) : (
                              <span className="font-medium">{row.label}</span>
                            )}
                            {row.sublabel ? (
                              <p className="text-xs text-muted-foreground">
                                {row.sublabel}
                              </p>
                            ) : null}
                          </div>
                        </td>
                        {showServiceColumns
                          ? NETWORK_SERVICE_CODES.map((code) => {
                              const n = row.byService[code] ?? 0;
                              return (
                                <td
                                  key={code}
                                  className={cn(
                                    "px-1 py-2 text-center tabular-nums",
                                    n === 0
                                      ? "text-muted-foreground/40"
                                      : "text-foreground",
                                  )}
                                >
                                  {n || "·"}
                                </td>
                              );
                            })
                          : null}
                        <td className="px-2 py-2 text-right tabular-nums font-medium">
                          {row.total}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-base font-medium">
                Organizations
              </CardTitle>
              <div className="flex gap-2 text-xs text-muted-foreground">
                {filters.country !== "all" ? (
                  <button
                    type="button"
                    className="hover:text-foreground"
                    onClick={clearGeo}
                  >
                    Clear geo
                  </button>
                ) : null}
                {filters.serviceCode !== "all" ? (
                  <button
                    type="button"
                    className="hover:text-foreground"
                    onClick={clearService}
                  >
                    Clear service
                  </button>
                ) : null}
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="overflow-x-auto rounded-md border border-border">
                <table className="w-full text-sm">
                  <thead>
                    {table.getHeaderGroups().map((hg) => (
                      <tr
                        key={hg.id}
                        className="border-b border-border bg-muted/40 text-left text-xs text-muted-foreground"
                      >
                        {hg.headers.map((h) => (
                          <th key={h.id} className="px-3 py-2 font-medium">
                            {h.isPlaceholder
                              ? null
                              : flexRender(
                                  h.column.columnDef.header,
                                  h.getContext(),
                                )}
                          </th>
                        ))}
                      </tr>
                    ))}
                  </thead>
                  <tbody>
                    {table.getRowModel().rows.length === 0 ? (
                      <tr>
                        <td
                          colSpan={listColumns.length}
                          className="px-3 py-8 text-center text-muted-foreground"
                        >
                          No organizations in this slice.
                        </td>
                      </tr>
                    ) : (
                      table.getRowModel().rows.map((row) => (
                        <tr
                          key={row.id}
                          className="border-b border-border/60 last:border-0"
                        >
                          {row.getVisibleCells().map((cell) => (
                            <td key={cell.id} className="px-3 py-2.5">
                              {flexRender(
                                cell.column.columnDef.cell,
                                cell.getContext(),
                              )}
                            </td>
                          ))}
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
              {table.getPageCount() > 1 ? (
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">
                    Page {table.getState().pagination.pageIndex + 1} of{" "}
                    {table.getPageCount()}
                  </span>
                  <div className="flex gap-2">
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
                </div>
              ) : null}
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
