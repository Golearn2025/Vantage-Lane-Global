"use client";

import { useEffect, useMemo, useState } from "react";
import { Loader2, MapPin, Database } from "lucide-react";
import {
  enrichLocationCoordinates,
  fetchGooglePlaceDetails,
  searchGooglePlaces,
  upsertLocationFromGooglePlace,
  type PlacesPrediction,
} from "@/modules/network/places";
import { useLocationsCatalog } from "@/modules/organizations/hooks";
import type { LocationCatalogItem } from "@/modules/organizations/types";
import { Input } from "@/shared/ui/input";
import { toast } from "sonner";

export type PickedLocation = {
  id: string;
  name: string;
  iata: string | null;
  countryCode: string | null;
  kind: string;
  lat: number | null;
  lng: number | null;
  googlePlaceId: string | null;
  source: "catalog" | "google";
};

type Props = {
  onPick: (location: PickedLocation) => void;
  placeholder?: string;
  selectedId?: string | null;
};

export function LocationSearchPicker({
  onPick,
  placeholder = "Search airport or city: London, MXP, Malpensa…",
  selectedId,
}: Props) {
  const [q, setQ] = useState("");
  const [predictions, setPredictions] = useState<PlacesPrediction[]>([]);
  const [loadingGoogle, setLoadingGoogle] = useState(false);
  const [importingId, setImportingId] = useState<string | null>(null);
  const catalog = useLocationsCatalog(q);

  useEffect(() => {
    if (q.trim().length < 2) {
      setPredictions([]);
      return;
    }
    const handle = window.setTimeout(async () => {
      setLoadingGoogle(true);
      try {
        const rows = await searchGooglePlaces(q.trim());
        setPredictions(rows);
      } catch (error) {
        toast.error(
          error instanceof Error ? error.message : "Google Places failed",
        );
      } finally {
        setLoadingGoogle(false);
      }
    }, 300);
    return () => window.clearTimeout(handle);
  }, [q]);

  const catalogRows = useMemo(() => catalog.data ?? [], [catalog.data]);

  async function pickCatalog(location: LocationCatalogItem) {
    setImportingId(location.id);
    try {
      const enriched = await enrichLocationCoordinates({
        id: location.id,
        name: location.name,
        countryCode: location.countryCode,
        kind: location.kind,
        lat: location.lat,
        lng: location.lng,
        googlePlaceId: location.googlePlaceId,
      });
      onPick({
        id: enriched.id,
        name: enriched.name,
        iata: enriched.iata,
        countryCode: enriched.country_code,
        kind: enriched.kind,
        lat: enriched.lat,
        lng: enriched.lng,
        googlePlaceId: enriched.google_place_id,
        source: "catalog",
      });
      setQ("");
      setPredictions([]);
      if (enriched.lat == null || enriched.lng == null) {
        toast.message("Place saved, but map coords are still missing");
      }
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Could not load place coordinates",
      );
    } finally {
      setImportingId(null);
    }
  }

  async function pickGoogle(prediction: PlacesPrediction) {
    setImportingId(prediction.placeId);
    try {
      const details = await fetchGooglePlaceDetails(prediction.placeId);
      const location = await upsertLocationFromGooglePlace(details);
      onPick({
        id: location.id,
        name: location.name,
        iata: location.iata,
        countryCode: location.country_code,
        kind: location.kind,
        lat: location.lat,
        lng: location.lng,
        googlePlaceId: location.google_place_id,
        source: "google",
      });
      setQ("");
      setPredictions([]);
      toast.success(`${location.name} ready`);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Could not save location",
      );
    } finally {
      setImportingId(null);
    }
  }

  const showPanel =
    q.trim().length >= 2 &&
    (catalogRows.length > 0 || predictions.length > 0 || loadingGoogle || catalog.isFetching);

  return (
    <div className="space-y-2">
      <div className="relative">
        <Input
          value={q}
          onChange={(event) => setQ(event.target.value)}
          placeholder={placeholder}
          className="h-11"
        />
        {loadingGoogle || catalog.isFetching ? (
          <Loader2 className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin text-muted-foreground" />
        ) : null}
      </div>

      {showPanel ? (
        <div className="max-h-56 space-y-2 overflow-auto rounded-md border border-border bg-card p-2">
          {catalogRows.length > 0 ? (
            <div className="space-y-1">
              <p className="px-1 text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                Already in catalog
              </p>
              {catalogRows.map((location) => {
                const selected = selectedId === location.id;
                return (
                    <button
                    key={location.id}
                    type="button"
                    disabled={importingId === location.id}
                    onClick={() => void pickCatalog(location)}
                    className={`flex min-h-11 w-full items-start gap-2 rounded px-2 py-2 text-left text-sm hover:bg-muted disabled:opacity-60 ${
                      selected ? "bg-muted" : ""
                    }`}
                  >
                    <Database className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
                    <span className="min-w-0 flex-1">
                      <span className="block truncate font-medium">
                        {location.name}
                        {location.iata ? ` (${location.iata})` : ""}
                      </span>
                      <span className="block truncate text-xs text-muted-foreground">
                        {location.kind}
                        {location.countryCode ? ` · ${location.countryCode}` : ""}
                      </span>
                    </span>
                  </button>
                );
              })}
            </div>
          ) : null}

          {predictions.length > 0 ? (
            <div className="space-y-1">
              <p className="px-1 text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                Google Places
              </p>
              {predictions.map((prediction) => (
                <button
                  key={prediction.placeId}
                  type="button"
                  disabled={importingId === prediction.placeId}
                  onClick={() => void pickGoogle(prediction)}
                  className="flex min-h-11 w-full items-start gap-2 rounded px-2 py-2 text-left text-sm hover:bg-muted disabled:opacity-60"
                >
                  <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                  <span className="min-w-0">
                    <span className="block truncate font-medium">
                      {prediction.mainText}
                    </span>
                    <span className="block truncate text-xs text-muted-foreground">
                      {prediction.secondaryText ?? prediction.description}
                    </span>
                  </span>
                </button>
              ))}
            </div>
          ) : null}

          {!loadingGoogle &&
          !catalog.isFetching &&
          catalogRows.length === 0 &&
          predictions.length === 0 ? (
            <p className="px-1 py-2 text-xs text-muted-foreground">
              No matches — try another spelling or IATA code.
            </p>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
