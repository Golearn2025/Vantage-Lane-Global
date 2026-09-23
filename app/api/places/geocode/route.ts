import { NextResponse } from "next/server";
import {
  getGoogleMapsServerKey,
  requireAuthenticatedSession,
} from "@/shared/lib/google/server";

export async function GET(request: Request) {
  const auth = await requireAuthenticatedSession();
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
  const q = (searchParams.get("q") ?? "").trim();
  if (q.length < 2) {
    return NextResponse.json({ result: null });
  }

  const url = new URL("https://maps.googleapis.com/maps/api/geocode/json");
  url.searchParams.set("address", q);
  url.searchParams.set("key", key);
  url.searchParams.set("language", "en");

  const response = await fetch(url.toString(), { next: { revalidate: 0 } });
  const data = (await response.json()) as {
    status: string;
    error_message?: string;
    results?: Array<{
      geometry?: { location?: { lat: number; lng: number } };
      types?: string[];
      formatted_address?: string;
    }>;
  };

  if (data.status !== "OK" && data.status !== "ZERO_RESULTS") {
    return NextResponse.json(
      { error: data.error_message || data.status || "Geocode failed" },
      { status: 502 },
    );
  }

  const first = data.results?.[0];
  if (!first?.geometry?.location) {
    return NextResponse.json({ result: null });
  }

  const types = first.types ?? [];
  const zoom = types.includes("country")
    ? 4
    : types.includes("administrative_area_level_1")
      ? 6
      : types.includes("locality") || types.includes("postal_town")
        ? 11
        : 13;

  return NextResponse.json({
    result: {
      lat: first.geometry.location.lat,
      lng: first.geometry.location.lng,
      zoom,
      label: first.formatted_address ?? q,
      types,
    },
  });
}
