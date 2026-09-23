"use client";

import { createClient } from "@/shared/lib/supabase/client";
import {
  mapNetworkLocation,
  mapNetworkOrganization,
  mapPlaceSupplier,
} from "@/modules/network/mappers";
import type {
  NetworkLocationOption,
  NetworkOrganization,
  NetworkPlaceSupplier,
} from "@/modules/network/types";

export async function searchNetworkLocations(
  q: string,
): Promise<NetworkLocationOption[]> {
  const supabase = createClient();
  const raw = q.trim();
  const lower = raw.toLowerCase();

  // People type "America" / "USA" expecting United States
  const aliases: Record<string, string[]> = {
    america: ["united states", "US"],
    usa: ["united states", "US"],
    us: ["united states", "US"],
    "united states of america": ["united states", "US"],
    uk: ["united kingdom", "GB"],
    britain: ["united kingdom", "GB"],
    england: ["united kingdom", "GB"],
    dubai: ["united arab emirates", "AE"],
    uae: ["united arab emirates", "AE"],
    emirates: ["united arab emirates", "AE"],
    france: ["france", "FR"],
    germany: ["germany", "DE"],
    switzerland: ["switzerland", "CH"],
    holland: ["netherlands", "NL"],
    netherlands: ["netherlands", "NL"],
  };
  const aliasTerms = aliases[lower] ?? [];

  let query = supabase
    .from("locations")
    .select("*")
    .eq("is_active", true)
    .order("name")
    .limit(30);

  if (raw) {
    const term = `%${raw}%`;
    const parts = [
      `name.ilike.${term}`,
      `iata.ilike.${term}`,
      `icao.ilike.${term}`,
      `name_normalized.ilike.${term}`,
      `country_code.ilike.${term}`,
    ];
    for (const a of aliasTerms) {
      if (a.length === 2) {
        parts.push(`country_code.eq.${a}`);
      } else {
        parts.push(`name.ilike.%${a}%`);
        parts.push(`name_normalized.ilike.%${a}%`);
      }
    }
    query = query.or(parts.join(","));
  }

  const { data, error } = await query;
  if (error) throw error;
  return (data ?? []).map(mapNetworkLocation);
}

export async function fetchPlaceSuppliers(
  locationId: string,
): Promise<NetworkPlaceSupplier[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("v_network_place_suppliers")
    .select("*")
    .eq("location_id", locationId)
    .order("display_name");
  if (error) throw error;
  return (data ?? [])
    .map(mapPlaceSupplier)
    .filter((row): row is NetworkPlaceSupplier => row !== null);
}

export async function fetchNetworkOrganizations(): Promise<NetworkOrganization[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("v_network_organizations")
    .select("*")
    .order("display_name");
  if (error) throw error;
  // Deduplicate by organization_id (view can emit duplicates if multi-partnership)
  const seen = new Set<string>();
  const result: NetworkOrganization[] = [];
  for (const raw of data ?? []) {
    const row = mapNetworkOrganization(raw);
    if (!row || seen.has(row.organizationId)) continue;
    seen.add(row.organizationId);
    result.push(row);
  }
  return result;
}
