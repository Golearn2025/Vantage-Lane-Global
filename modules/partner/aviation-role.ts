export type AviationPartnerRole = "OPERATOR" | "BROKER";

export type AviationRoleInventory = {
  role: AviationPartnerRole | "";
  /** Broker-only: how they work with operators */
  workingModel?: "net_rates" | "commission" | "both" | "";
  notes?: string;
};

export const AVIATION_ROLE_STEP_KEY = "aviation_role";

/** Steps that only apply to direct AOC operators. */
const OPERATOR_ONLY_KEYS = new Set(["aircraft", "rates"]);

export function filterAviationWizardSteps<T extends { key: string }>(
  steps: T[],
  role: AviationPartnerRole | "" | null | undefined,
): T[] {
  if (!role) {
    // Until they choose, only show role + coverage/profile/docs/review basics
    return steps.filter(
      (s) =>
        s.key === "profile" ||
        s.key === "aviation_role" ||
        s.key === "coverage" ||
        s.key === "documents" ||
        s.key === "review",
    );
  }
  if (role === "BROKER") {
    return steps.filter((s) => !OPERATOR_ONLY_KEYS.has(s.key));
  }
  return steps;
}

export function aviationRoleLabel(role: AviationPartnerRole | "" | null): string {
  if (role === "OPERATOR") return "Direct operator (AOC)";
  if (role === "BROKER") return "Broker / arranger";
  return "Not set";
}
