import type { OrganizationSummary } from "@/modules/organizations/types";
import type { RelationshipStatus } from "@/shared/types/domain";

export type CoverageLeadRow = OrganizationSummary;

export type CoverageFilters = {
  country: string;
  city: string;
  serviceCode: string;
  relationshipStatus: RelationshipStatus | "all";
  testFilter: "all" | "test" | "real";
};

export type CoverageMatrixRow = {
  key: string;
  label: string;
  sublabel?: string;
  byService: Record<string, number>;
  total: number;
};

export type CoverageSummary = {
  totalRows: number;
  countryCount: number;
  cityCount: number;
  serviceCount: number;
  matrixRows: CoverageMatrixRow[];
  serviceTotals: Record<string, number>;
};
