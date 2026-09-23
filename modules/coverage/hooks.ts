"use client";

import { useQuery } from "@tanstack/react-query";
import { fetchOrganizationSummaries } from "@/modules/organizations/api";
import type { CoverageFilters } from "@/modules/coverage/types";
import { coverageKeys } from "@/shared/lib/query/keys";

export type CoverageFetchFilters = Pick<
  CoverageFilters,
  "relationshipStatus" | "testFilter"
>;

export function useCoverageInventory(fetchFilters: CoverageFetchFilters) {
  return useQuery({
    queryKey: coverageKeys.inventory(fetchFilters),
    queryFn: () =>
      fetchOrganizationSummaries({
        relationshipStatus:
          fetchFilters.relationshipStatus === "all"
            ? "all"
            : fetchFilters.relationshipStatus,
        testFilter: fetchFilters.testFilter,
        includeArchived: false,
      }),
  });
}
