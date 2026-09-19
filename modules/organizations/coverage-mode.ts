import type { Database } from "@/shared/types/database";

type CoverageMode = Database["public"]["Enums"]["coverage_mode"];

export function resolveCoverageMode(
  kind: string,
  radiusKm: number | null | undefined,
): CoverageMode {
  if (kind === "AIRPORT") return "AIRPORT_EXPLICIT";
  if (radiusKm != null && radiusKm > 0) return "RADIUS";
  return "CITY_OR_REGION";
}

export function defaultRadiusForKind(kind: string): number {
  return kind === "AIRPORT" ? 25 : 30;
}
