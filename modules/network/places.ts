"use client";

import { createClient } from "@/shared/lib/supabase/client";
import type { Database } from "@/shared/types/database";

export type PlacesPrediction = {
  placeId: string;
  description: string;
  mainText: string;
  secondaryText: string | null;
  types: string[];
};

export type GooglePlaceDetails = {
  googlePlaceId: string;
  name: string;
  formattedAddress: string | null;
  lat: number | null;
  lng: number | null;
  kinds: string[];
  kind: Database["public"]["Enums"]["location_kind"];
  countryCode: string | null;
  iata: string | null;
  timezone: string | null;
};

export async function searchGooglePlaces(q: string): Promise<PlacesPrediction[]> {
  const response = await fetch(
    `/api/places/autocomplete?q=${encodeURIComponent(q)}`,
  );
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error || "Places search failed");
  }
  return data.predictions ?? [];
}

export async function fetchGooglePlaceDetails(
  placeId: string,
): Promise<GooglePlaceDetails> {
  const response = await fetch(
    `/api/places/details?placeId=${encodeURIComponent(placeId)}`,
  );
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error || "Place details failed");
  }
  return data.place as GooglePlaceDetails;
}

type LocationRow = Database["public"]["Tables"]["locations"]["Row"];

async function applyGoogleCoords(
  locationId: string,
  place: GooglePlaceDetails,
): Promise<LocationRow> {
  // Prefer ensure RPC so partners (no platform.catalog.manage) can enrich coords
  const supabase = createClient();
  const { data: viaRpc, error: rpcErr } = await supabase.rpc(
    "rpc_ensure_location_from_google_place",
    {
      p_payload: {
        google_place_id: place.googlePlaceId,
        name: place.name,
        kind: place.kind,
        country_code: place.countryCode,
        iata: place.iata,
        lat: place.lat,
        lng: place.lng,
        formatted_address: place.formattedAddress,
      },
    },
  );
  if (!rpcErr && viaRpc) return viaRpc as LocationRow;

  const { data, error } = await supabase
    .from("locations")
    .update({
      lat: place.lat,
      lng: place.lng,
      google_place_id: place.googlePlaceId,
      country_code: place.countryCode,
    })
    .eq("id", locationId)
    .select("*")
    .single();
  if (error) throw error;
  return data;
}

/** If a catalog row has no coords, resolve via Google and persist lat/lng. */
export async function enrichLocationCoordinates(location: {
  id: string;
  name: string;
  countryCode: string | null;
  kind: string;
  lat: number | null;
  lng: number | null;
  googlePlaceId: string | null;
}): Promise<{
  id: string;
  name: string;
  iata: string | null;
  country_code: string | null;
  kind: string;
  lat: number | null;
  lng: number | null;
  google_place_id: string | null;
}> {
  if (location.lat != null && location.lng != null) {
    const supabase = createClient();
    const { data, error } = await supabase
      .from("locations")
      .select("*")
      .eq("id", location.id)
      .single();
    if (error) throw error;
    return data;
  }

  if (location.googlePlaceId) {
    const details = await fetchGooglePlaceDetails(location.googlePlaceId);
    if (details.lat != null && details.lng != null) {
      return applyGoogleCoords(location.id, details);
    }
  }

  const query = [location.name, location.countryCode].filter(Boolean).join(" ");
  const predictions = await searchGooglePlaces(query);
  const first = predictions[0];
  if (!first) {
    const supabase = createClient();
    const { data, error } = await supabase
      .from("locations")
      .select("*")
      .eq("id", location.id)
      .single();
    if (error) throw error;
    return data;
  }

  const details = await fetchGooglePlaceDetails(first.placeId);
  if (details.lat == null || details.lng == null) {
    const supabase = createClient();
    const { data, error } = await supabase
      .from("locations")
      .select("*")
      .eq("id", location.id)
      .single();
    if (error) throw error;
    return data;
  }

  return applyGoogleCoords(location.id, details);
}

export async function upsertLocationFromGooglePlace(
  place: GooglePlaceDetails,
) {
  const supabase = createClient();

  // SECURITY DEFINER RPC — partners can seed catalog rows for coverage matching
  const { data: ensured, error: rpcErr } = await supabase.rpc(
    "rpc_ensure_location_from_google_place",
    {
      p_payload: {
        google_place_id: place.googlePlaceId,
        name: place.name,
        kind: place.kind,
        country_code: place.countryCode,
        iata: place.iata,
        lat: place.lat,
        lng: place.lng,
        formatted_address: place.formattedAddress,
      },
    },
  );
  if (!rpcErr && ensured) return ensured as LocationRow;

  // Fallback for older deploys / platform staff with catalog.manage
  const { data: existing, error: existingError } = await supabase
    .from("locations")
    .select("*")
    .eq("google_place_id", place.googlePlaceId)
    .maybeSingle();
  if (existingError) throw existingError;
  if (existing) {
    if (
      (existing.lat == null || existing.lng == null) &&
      place.lat != null &&
      place.lng != null
    ) {
      return applyGoogleCoords(existing.id, place);
    }
    return existing;
  }

  if (place.iata) {
    const { data: byIata, error: iataError } = await supabase
      .from("locations")
      .select("*")
      .eq("iata", place.iata)
      .maybeSingle();
    if (iataError) throw iataError;
    if (byIata) {
      const { data: linked, error: linkError } = await supabase
        .from("locations")
        .update({
          google_place_id: place.googlePlaceId,
          lat: place.lat ?? byIata.lat,
          lng: place.lng ?? byIata.lng,
          country_code: place.countryCode ?? byIata.country_code,
          name: byIata.name || place.name,
        })
        .eq("id", byIata.id)
        .select("*")
        .single();
      if (linkError) throw linkError;
      return linked;
    }
  }

  if (place.kind === "LOCALITY" || place.kind === "REGION" || place.kind === "COUNTRY") {
    let byNameQuery = supabase
      .from("locations")
      .select("*")
      .eq("kind", place.kind)
      .ilike("name", place.name)
      .limit(1);
    if (place.countryCode) {
      byNameQuery = byNameQuery.eq("country_code", place.countryCode);
    }
    const { data: byNameRows, error: byNameError } = await byNameQuery;
    if (byNameError) throw byNameError;
    const byName = byNameRows?.[0] ?? null;
    if (byName) {
      return applyGoogleCoords(byName.id, place);
    }
  }

  if (rpcErr) throw rpcErr;

  const { data: created, error } = await supabase
    .from("locations")
    .insert({
      kind: place.kind,
      name: place.name,
      name_normalized: place.name.toLowerCase(),
      country_code: place.countryCode,
      iata: place.iata,
      lat: place.lat,
      lng: place.lng,
      google_place_id: place.googlePlaceId,
      is_active: true,
      metadata: {
        source: "google_places",
        formatted_address: place.formattedAddress,
        types: place.kinds,
      },
    })
    .select("*")
    .single();
  if (error) throw error;
  return created;
}
