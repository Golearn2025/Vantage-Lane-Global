import type { OrganizationSummary } from "@/modules/organizations/types";
import {
  NETWORK_SERVICE_CODES,
  networkServiceLabel,
} from "@/shared/lib/services";
import type {
  CoverageFilters,
  CoverageLeadRow,
  CoverageMatrixRow,
  CoverageSummary,
} from "@/modules/coverage/types";

const regionNames = new Intl.DisplayNames(["en"], { type: "region" });

export function countryLabel(code: string | null | undefined): string {
  if (!code) return "—";
  try {
    return regionNames.of(code) ?? code;
  } catch {
    return code;
  }
}

export function resolveCountry(row: OrganizationSummary): string {
  return (
    row.legalCountryCode ??
    row.primaryBaseCountryCode ??
    "—"
  ).toUpperCase();
}

export function resolveCity(row: OrganizationSummary): string {
  const city = row.primaryBaseCity?.trim();
  return city && city.length > 0 ? city : "Unspecified";
}

export function normalizeCityKey(city: string): string {
  return city.trim().toLowerCase();
}

export function filterCoverageRows(
  rows: CoverageLeadRow[],
  filters: CoverageFilters,
): CoverageLeadRow[] {
  return rows.filter((row) => {
    if (filters.testFilter === "real" && row.isTest) return false;
    if (filters.testFilter === "test" && !row.isTest) return false;
    if (
      filters.relationshipStatus !== "all" &&
      row.relationshipStatus !== filters.relationshipStatus
    ) {
      return false;
    }
    if (filters.country !== "all") {
      if (resolveCountry(row) !== filters.country.toUpperCase()) return false;
    }
    if (filters.city !== "all") {
      if (normalizeCityKey(resolveCity(row)) !== normalizeCityKey(filters.city)) {
        return false;
      }
    }
    if (filters.serviceCode !== "all") {
      if (row.serviceCode !== filters.serviceCode) return false;
    }
    return true;
  });
}

function emptyServiceCounts(): Record<string, number> {
  const out: Record<string, number> = {};
  for (const code of NETWORK_SERVICE_CODES) out[code] = 0;
  return out;
}

function bump(
  map: Record<string, number>,
  serviceCode: string | null | undefined,
) {
  if (!serviceCode) return;
  map[serviceCode] = (map[serviceCode] ?? 0) + 1;
}

export function uniqueCountries(rows: CoverageLeadRow[]): string[] {
  const set = new Set(rows.map(resolveCountry).filter((c) => c !== "—"));
  return [...set].sort((a, b) => {
    if (a === "GB") return -1;
    if (b === "GB") return 1;
    return countryLabel(a).localeCompare(countryLabel(b));
  });
}

export function uniqueCitiesForCountry(
  rows: CoverageLeadRow[],
  countryCode: string,
): string[] {
  const map = new Map<string, string>();
  for (const row of rows) {
    if (resolveCountry(row) !== countryCode.toUpperCase()) continue;
    const city = resolveCity(row);
    map.set(normalizeCityKey(city), city);
  }
  return [...map.values()].sort((a, b) => {
    if (a === "Unspecified") return 1;
    if (b === "Unspecified") return -1;
    return a.localeCompare(b);
  });
}

type MatrixGroupBy = "country" | "city" | "service";

function buildMatrix(
  rows: CoverageLeadRow[],
  groupBy: MatrixGroupBy,
): CoverageMatrixRow[] {
  const groups = new Map<
    string,
    { label: string; sublabel?: string; counts: Record<string, number> }
  >();

  for (const row of rows) {
    let key: string;
    let label: string;
    let sublabel: string | undefined;

    if (groupBy === "country") {
      key = resolveCountry(row);
      label = countryLabel(key);
    } else if (groupBy === "city") {
      key = `${resolveCountry(row)}::${normalizeCityKey(resolveCity(row))}`;
      label = resolveCity(row);
      sublabel = countryLabel(resolveCountry(row));
    } else {
      const code = row.serviceCode ?? "UNKNOWN";
      key = code;
      label = networkServiceLabel(code);
    }

    if (!groups.has(key)) {
      groups.set(key, { label, sublabel, counts: emptyServiceCounts() });
    }
    const g = groups.get(key)!;
    bump(g.counts, row.serviceCode);
  }

  return [...groups.entries()]
    .map(([key, g]) => {
      const byService = { ...emptyServiceCounts(), ...g.counts };
      const total = Object.values(byService).reduce((a, b) => a + b, 0);
      return {
        key,
        label: g.label,
        sublabel: g.sublabel,
        byService,
        total,
      };
    })
    .sort((a, b) => b.total - a.total || a.label.localeCompare(b.label));
}

export function buildCoverageSummary(
  rows: CoverageLeadRow[],
  filters: CoverageFilters,
): CoverageSummary {
  const serviceTotals = emptyServiceCounts();
  for (const row of rows) bump(serviceTotals, row.serviceCode);

  const countries = new Set(rows.map(resolveCountry).filter((c) => c !== "—"));
  const cities = new Set(
    rows.map((r) => `${resolveCountry(r)}::${normalizeCityKey(resolveCity(r))}`),
  );
  const services = new Set(
    rows.map((r) => r.serviceCode).filter(Boolean) as string[],
  );

  let matrixRows: CoverageMatrixRow[];

  if (filters.serviceCode !== "all" && filters.country === "all") {
    matrixRows = buildMatrix(rows, "country");
  } else if (filters.country !== "all" && filters.city !== "all") {
    matrixRows = buildMatrix(rows, "service");
  } else if (filters.country !== "all") {
    matrixRows = buildMatrix(rows, "city");
  } else if (filters.serviceCode !== "all") {
    matrixRows = buildMatrix(rows, "country");
  } else {
    matrixRows = buildMatrix(rows, "country");
  }

  return {
    totalRows: rows.length,
    countryCount: countries.size,
    cityCount: cities.size,
    serviceCount: services.size,
    matrixRows,
    serviceTotals,
  };
}

export function describeCoverageView(filters: CoverageFilters): string {
  const parts: string[] = [];
  if (filters.relationshipStatus !== "all") {
    parts.push(filters.relationshipStatus);
  }
  if (filters.serviceCode !== "all") {
    parts.push(filters.serviceCode.replaceAll("_", " ").toLowerCase());
  }
  if (filters.country !== "all") {
    parts.push(countryLabel(filters.country));
  }
  if (filters.city !== "all") {
    parts.push(filters.city);
  }
  if (parts.length === 0) return "All suppliers worldwide";
  return parts.join(" · ");
}
