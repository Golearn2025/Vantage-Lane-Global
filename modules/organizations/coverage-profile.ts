export type CoverageSecondaryMode = "airports" | "areas" | "ports";

export type CoverageServiceProfile = {
  secondaryMode: CoverageSecondaryMode;
  /** Partner wizard step list (1–3). */
  steps: {
    title: string;
    body: string;
  }[];
  primaryLabel: string;
  primaryHint: string;
  primaryPlaceholder: string;
  radiusHint: string;
  secondaryLabel: string;
  secondaryHint: string;
  secondaryPlaceholder: string;
};

const CITY_STEPS_BASE = {
  primaryLabel: "Step 1 — Primary city / area",
  primaryHint:
    "Type your main operating city, then tap a result from the list. Typing alone does nothing.",
  primaryPlaceholder: "Search city, then tap a result…",
  radiusHint:
    "Keep “Draw service radius” on, then drag the slider to how far you normally work from this city (typically 25–50 km).",
} as const;

const PROFILES: Record<string, CoverageServiceProfile> = {
  GROUND_TRANSPORTATION: {
    secondaryMode: "airports",
    ...CITY_STEPS_BASE,
    primaryHint:
      "Type your main operating city (e.g. London or Milan), then tap a result. After you pick it, set the radius and optionally add airports.",
    radiusHint:
      "Keep “Draw service radius” on, then set how far you cover from this city. Then add airports below if you do airport transfers.",
    secondaryLabel: "Step 3 — Airports you also cover (optional)",
    secondaryHint:
      "Search airports you serve from this base (e.g. LGW, Heathrow, STN) and tap each result. Skip if you only cover the city radius.",
    secondaryPlaceholder: "Search airport (LGW, LHR…), then tap a result",
    steps: [
      {
        title: "1. City",
        body: "— search your main city, then tap a suggestion (typing alone does nothing).",
      },
      {
        title: "2. Radius",
        body: "— after the city is selected, set how far you cover on the map (km).",
      },
      {
        title: "3. Airports",
        body: "— optionally add airports (LGW, LHR…) the same way, then Save coverage.",
      },
    ],
  },
  AVIATION: {
    secondaryMode: "airports",
    ...CITY_STEPS_BASE,
    primaryLabel: "Step 1 — Primary base / city",
    primaryHint:
      "Pick your main base city or home airport area, then tap a suggestion. You can add more airports next.",
    primaryPlaceholder: "Search base city or airport area…",
    radiusHint:
      "Set the catchment around your base. Then add the airports / FBOs you handle below.",
    secondaryLabel: "Step 3 — Airports / FBOs you also cover (optional)",
    secondaryHint:
      "Add other airports or handling points you serve (e.g. LCY, Biggin Hill). Tap each result.",
    secondaryPlaceholder: "Search airport / FBO, then tap a result",
    steps: [
      {
        title: "1. Base",
        body: "— search your main base city or airport area, then tap a suggestion.",
      },
      {
        title: "2. Radius",
        body: "— set how far you cover from that base on the map.",
      },
      {
        title: "3. Airports",
        body: "— optionally add more airports / FBOs, then Save coverage.",
      },
    ],
  },
  PRIVATE_AVIATION: {
    secondaryMode: "airports",
    ...CITY_STEPS_BASE,
    primaryLabel: "Step 1 — Primary base / city",
    primaryHint:
      "Pick your main base city or home airport area, then tap a suggestion.",
    primaryPlaceholder: "Search base city or airport area…",
    radiusHint:
      "Set the catchment around your base. Then add airports you handle below.",
    secondaryLabel: "Step 3 — Airports you also cover (optional)",
    secondaryHint:
      "Add other airports you serve. Tap each result from the list.",
    secondaryPlaceholder: "Search airport, then tap a result",
    steps: [
      {
        title: "1. Base",
        body: "— search your main base city or airport area, then tap a suggestion.",
      },
      {
        title: "2. Radius",
        body: "— set how far you cover from that base on the map.",
      },
      {
        title: "3. Airports",
        body: "— optionally add more airports, then Save coverage.",
      },
    ],
  },
  YACHT: {
    secondaryMode: "ports",
    ...CITY_STEPS_BASE,
    primaryLabel: "Step 1 — Primary marina / coastal city",
    primaryHint:
      "Search your main marina or coastal base city, then tap a suggestion.",
    primaryPlaceholder: "Search marina or coastal city…",
    radiusHint:
      "Set how far you operate from this base. Then add other ports / marinas below if needed.",
    secondaryLabel: "Step 3 — Other ports / marinas (optional)",
    secondaryHint:
      "Add other coastal cities, ports or marinas you cover. Tap each result.",
    secondaryPlaceholder: "Search port / marina / city, then tap a result",
    steps: [
      {
        title: "1. Marina / city",
        body: "— search your main marina or coastal base, then tap a suggestion.",
      },
      {
        title: "2. Radius",
        body: "— set how far you operate from that base on the map.",
      },
      {
        title: "3. Ports",
        body: "— optionally add other ports / marinas, then Save coverage. No airports needed.",
      },
    ],
  },
  SECURITY: {
    secondaryMode: "areas",
    ...CITY_STEPS_BASE,
    secondaryLabel: "Step 3 — Other cities / areas (optional)",
    secondaryHint:
      "Add extra cities or regions you also cover. This is not airport-based — skip if one city radius is enough.",
    secondaryPlaceholder: "Search another city or area…",
    steps: [
      {
        title: "1. City",
        body: "— search your main operating city, then tap a suggestion.",
      },
      {
        title: "2. Radius",
        body: "— set how far you cover on the map (km).",
      },
      {
        title: "3. Extra areas",
        body: "— optionally add other cities you cover (not airports), then Save.",
      },
    ],
  },
  HOSPITALITY: {
    secondaryMode: "areas",
    ...CITY_STEPS_BASE,
    secondaryLabel: "Step 3 — Other cities / areas (optional)",
    secondaryHint:
      "Add extra cities where you have venues or partners. Skip if one city is enough.",
    secondaryPlaceholder: "Search another city or area…",
    steps: [
      {
        title: "1. City",
        body: "— search your main city, then tap a suggestion.",
      },
      {
        title: "2. Radius",
        body: "— set how far you cover on the map.",
      },
      {
        title: "3. Extra areas",
        body: "— optionally add other cities, then Save. No airports needed.",
      },
    ],
  },
  CONCIERGE: {
    secondaryMode: "areas",
    ...CITY_STEPS_BASE,
    secondaryLabel: "Step 3 — Other cities / areas (optional)",
    secondaryHint:
      "Add extra cities you serve. Skip if one city radius is enough.",
    secondaryPlaceholder: "Search another city or area…",
    steps: [
      {
        title: "1. City",
        body: "— search your main city, then tap a suggestion.",
      },
      {
        title: "2. Radius",
        body: "— set how far you cover on the map.",
      },
      {
        title: "3. Extra areas",
        body: "— optionally add other cities, then Save. No airports needed.",
      },
    ],
  },
  MEDICAL: {
    secondaryMode: "areas",
    ...CITY_STEPS_BASE,
    secondaryLabel: "Step 3 — Other cities / areas (optional)",
    secondaryHint:
      "Add extra cities or clinic areas you cover. Skip if one zone is enough.",
    secondaryPlaceholder: "Search another city or area…",
    steps: [
      {
        title: "1. City",
        body: "— search your main city / clinic area, then tap a suggestion.",
      },
      {
        title: "2. Radius",
        body: "— set how far you cover on the map.",
      },
      {
        title: "3. Extra areas",
        body: "— optionally add other cities, then Save. No airports needed.",
      },
    ],
  },
  EVENTS: {
    secondaryMode: "areas",
    ...CITY_STEPS_BASE,
    secondaryLabel: "Step 3 — Other cities / venues areas (optional)",
    secondaryHint:
      "Add extra cities where you produce events. Skip if one city is enough.",
    secondaryPlaceholder: "Search another city or area…",
    steps: [
      {
        title: "1. City",
        body: "— search your main city, then tap a suggestion.",
      },
      {
        title: "2. Radius",
        body: "— set how far you cover on the map.",
      },
      {
        title: "3. Extra areas",
        body: "— optionally add other cities, then Save. No airports needed.",
      },
    ],
  },
};

const FALLBACK: CoverageServiceProfile = PROFILES.SECURITY;

export function getCoverageServiceProfile(
  serviceCode: string | null | undefined,
): CoverageServiceProfile {
  if (!serviceCode) return FALLBACK;
  return PROFILES[serviceCode] ?? FALLBACK;
}

export function coverageAllowsAirportSecondaries(
  serviceCode: string | null | undefined,
): boolean {
  const mode = getCoverageServiceProfile(serviceCode).secondaryMode;
  return mode === "airports";
}
