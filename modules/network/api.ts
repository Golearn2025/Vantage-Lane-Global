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
  let query = supabase
    .from("locations")
    .select("*")
    .eq("is_active", true)
    .order("name")
    .limit(30);

  if (q.trim()) {
    const term = `%${q.trim()}%`;
    query = query.or(
      `name.ilike.${term},iata.ilike.${term},icao.ilike.${term},name_normalized.ilike.${term}`,
    );
  }
  // fără filtru când q e gol — returnează primele 30 sortate după nume

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
