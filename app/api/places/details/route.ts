import { NextResponse } from "next/server";
import {
  getGoogleMapsServerKey,
  requirePlatformSession,
} from "@/shared/lib/google/server";

type PlaceDetailsResponse = {
  status: string;
  error_message?: string;
  result?: {
    place_id: string;
    name: string;
    formatted_address?: string;
    geometry?: { location?: { lat: number; lng: number } };
    types?: string[];
    address_components?: Array<{
      long_name: string;
      short_name: string;
      types: string[];
    }>;
    utc_offset?: number;
  };
};

function detectKind(
  types: string[] | undefined,
): "AIRPORT" | "LOCALITY" | "REGION" | "COUNTRY" | "POI" {
  const set = new Set(types ?? []);
  if (set.has("airport")) return "AIRPORT";
  if (set.has("country")) return "COUNTRY";
  if (set.has("administrative_area_level_1")) return "REGION";
  if (set.has("locality") || set.has("postal_town")) return "LOCALITY";
  return "POI";
}

function extractCountryCode(
  components:
    | Array<{
        long_name: string;
        short_name: string;
        types: string[];
      }>
    | undefined,
) {
  const country = (components ?? []).find((c) => c.types.includes("country"));
  return country?.short_name?.slice(0, 2).toUpperCase() ?? null;
}

function extractIataFromName(name: string) {
  const match = name.match(/\(([A-Z]{3})\)/);
  return match?.[1] ?? null;
}

export async function GET(request: Request) {
  const auth = await requirePlatformSession();
  if (!auth.ok) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  const key = getGoogleMapsServerKey();
  if (!key) {
    return NextResponse.json(
      { error: "GOOGLE_MAPS_API_KEY is not configured" },
      { status: 500 },
    );
  }

  const { searchParams } = new URL(request.url);
  const placeId = (searchParams.get("placeId") ?? "").trim();
  if (!placeId) {
    return NextResponse.json({ error: "placeId is required" }, { status: 400 });
  }

  const url = new URL(
    "https://maps.googleapis.com/maps/api/place/details/json",
  );
  url.searchParams.set("place_id", placeId);
  url.searchParams.set("key", key);
  url.searchParams.set("language", "en");
  url.searchParams.set(
    "fields",
    "place_id,name,formatted_address,geometry,types,address_components,utc_offset",
  );

  const response = await fetch(url.toString(), { next: { revalidate: 0 } });
  const data = (await response.json()) as PlaceDetailsResponse;

  if (data.status !== "OK" || !data.result) {
    return NextResponse.json(
      {
        error: data.error_message || data.status || "Place details failed",
      },
      { status: 502 },
    );
  }

  const result = data.result;
  const kind = detectKind(result.types);
  const countryCode = extractCountryCode(result.address_components);
  const iata =
    kind === "AIRPORT" ? extractIataFromName(result.name) : null;

  return NextResponse.json({
    place: {
      googlePlaceId: result.place_id,
      name: result.name,
      formattedAddress: result.formatted_address ?? null,
      lat: result.geometry?.location?.lat ?? null,
      lng: result.geometry?.location?.lng ?? null,
      kinds: result.types ?? [],
      kind,
      countryCode,
      iata,
      timezone: null as string | null,
    },
  });
}
