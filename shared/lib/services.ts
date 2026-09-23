/** Canonical network service types (catalog-aligned). */
export const NETWORK_SERVICE_CODES = [
  "GROUND_TRANSPORTATION",
  "SECURITY",
  "PRIVATE_AVIATION",
  "AVIATION",
  "HOSPITALITY",
  "CONCIERGE",
  "EVENTS",
  "MEDICAL",
  "YACHT",
] as const;

export type NetworkServiceCode = (typeof NETWORK_SERVICE_CODES)[number];

export const NETWORK_SERVICE_LABELS: Record<NetworkServiceCode, string> = {
  GROUND_TRANSPORTATION: "Ground Transportation",
  SECURITY: "Security",
  PRIVATE_AVIATION: "Private Aviation",
  AVIATION: "Aviation",
  HOSPITALITY: "Hospitality",
  CONCIERGE: "Concierge",
  EVENTS: "Events & Protocol",
  MEDICAL: "Medical & Wellness",
  YACHT: "Yacht & Marine",
};

export function networkServiceLabel(code: string | null | undefined): string {
  if (!code) return "Unknown service";
  return (
    NETWORK_SERVICE_LABELS[code as NetworkServiceCode] ??
    code.replaceAll("_", " ")
  );
}
