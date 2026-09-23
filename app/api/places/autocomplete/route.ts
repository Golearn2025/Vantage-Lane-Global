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
    return NextResponse.json({ predictions: [] });
  }

  const url = new URL(
    "https://maps.googleapis.com/maps/api/place/autocomplete/json",
  );
  url.searchParams.set("input", q);
  url.searchParams.set("key", key);
  url.searchParams.set("language", "en");
  // Bias toward airports / cities useful for GT network
  url.searchParams.set("types", "establishment|geocode");

  const response = await fetch(url.toString(), { next: { revalidate: 0 } });
  const data = (await response.json()) as {
    status: string;
    error_message?: string;
    predictions?: Array<{
      description: string;
      place_id: string;
      structured_formatting?: {
        main_text: string;
        secondary_text?: string;
      };
      types?: string[];
    }>;
  };

  if (data.status !== "OK" && data.status !== "ZERO_RESULTS") {
    return NextResponse.json(
      {
        error: data.error_message || data.status || "Places autocomplete failed",
      },
      { status: 502 },
    );
  }

  return NextResponse.json({
    predictions: (data.predictions ?? []).map((item) => ({
      placeId: item.place_id,
      description: item.description,
      mainText: item.structured_formatting?.main_text ?? item.description,
      secondaryText: item.structured_formatting?.secondary_text ?? null,
      types: item.types ?? [],
    })),
  });
}
