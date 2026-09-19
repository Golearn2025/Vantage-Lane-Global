import { NextResponse } from "next/server";
import { getGoogleMapsServerKey } from "@/shared/lib/google/server";
import { requirePartnerSession } from "@/modules/partner/auth";

export async function GET(request: Request) {
  const auth = await requirePartnerSession();
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
  const origin = (searchParams.get("origin") ?? "").trim();
  const destination = (searchParams.get("destination") ?? "").trim();
  const unit = (searchParams.get("unit") ?? "MILE").toUpperCase();

  if (!origin || !destination) {
    return NextResponse.json(
      { error: "origin and destination required" },
      { status: 400 },
    );
  }

  const url = new URL(
    "https://maps.googleapis.com/maps/api/distancematrix/json",
  );
  url.searchParams.set("origins", origin);
  url.searchParams.set("destinations", destination);
  url.searchParams.set("units", unit === "KM" ? "metric" : "imperial");
  url.searchParams.set("key", key);

  const response = await fetch(url.toString(), { next: { revalidate: 0 } });
  const data = (await response.json()) as {
    status: string;
    error_message?: string;
    rows?: Array<{
      elements?: Array<{
        status: string;
        distance?: { value: number; text: string };
        duration?: { text: string };
      }>;
    }>;
  };

  if (data.status !== "OK") {
    return NextResponse.json(
      { error: data.error_message || data.status },
      { status: 502 },
    );
  }

  const element = data.rows?.[0]?.elements?.[0];
  if (!element || element.status !== "OK" || !element.distance) {
    return NextResponse.json(
      { error: element?.status || "No route" },
      { status: 502 },
    );
  }

  const metres = element.distance.value;
  const distance = unit === "KM" ? metres / 1000 : metres / 1609.344;

  const durationSecs =
    (element as unknown as { duration?: { value?: number; text: string } })
      .duration?.value ?? 0;
  const durationMins = durationSecs / 60;
  const durationLabel =
    element.duration?.text ?? `${Math.round(durationMins)} min`;
  const distanceLabel = element.distance.text;

  return NextResponse.json({
    distance,
    unit,
    durationMins,
    distanceLabel,
    durationLabel,
    label: `${distanceLabel} · ${durationLabel}`,
  });
}
