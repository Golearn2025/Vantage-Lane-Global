"use client";

import { useEffect, useState } from "react";
import { Loader2, MapPin } from "lucide-react";
import {
  fetchGooglePlaceDetails,
  searchGooglePlaces,
  upsertLocationFromGooglePlace,
  type PlacesPrediction,
} from "@/modules/network/places";
import { Input } from "@/shared/ui/input";
import { toast } from "sonner";

type Props = {
  onLocationReady: (location: {
    id: string;
    name: string;
    iata: string | null;
    countryCode: string | null;
    kind: string;
    googlePlaceId: string | null;
  }) => void;
  placeholder?: string;
};

export function GooglePlacesSearch({
  onLocationReady,
  placeholder = "Search Google: Milan Airport, Italy…",
}: Props) {
  const [q, setQ] = useState("");
  const [predictions, setPredictions] = useState<PlacesPrediction[]>([]);
  const [loading, setLoading] = useState(false);
  const [importingId, setImportingId] = useState<string | null>(null);

  useEffect(() => {
    if (q.trim().length < 2) {
      setPredictions([]);
      return;
    }
    const handle = window.setTimeout(async () => {
      setLoading(true);
      try {
        const rows = await searchGooglePlaces(q.trim());
        setPredictions(rows);
      } catch (error) {
        toast.error(
          error instanceof Error ? error.message : "Google Places failed",
        );
      } finally {
        setLoading(false);
      }
    }, 300);
    return () => window.clearTimeout(handle);
  }, [q]);

  async function handleSelect(prediction: PlacesPrediction) {
    setImportingId(prediction.placeId);
    try {
      const details = await fetchGooglePlaceDetails(prediction.placeId);
      const location = await upsertLocationFromGooglePlace(details);
      onLocationReady({
        id: location.id,
        name: location.name,
        iata: location.iata,
        countryCode: location.country_code,
        kind: location.kind,
        googlePlaceId: location.google_place_id,
      });
      setQ("");
      setPredictions([]);
      toast.success(`Saved ${location.name} to locations catalog`);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Could not save location",
      );
    } finally {
      setImportingId(null);
    }
  }

  return (
    <div className="space-y-2">
      <div className="relative">
        <Input
          value={q}
          onChange={(event) => setQ(event.target.value)}
          placeholder={placeholder}
        />
        {loading ? (
          <Loader2 className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin text-muted-foreground" />
        ) : null}
      </div>
      {predictions.length > 0 ? (
        <div className="max-h-48 space-y-1 overflow-auto rounded-md border border-border bg-card p-1">
          {predictions.map((prediction) => (
            <button
              key={prediction.placeId}
              type="button"
              disabled={importingId === prediction.placeId}
              onClick={() => handleSelect(prediction)}
              className="flex w-full items-start gap-2 rounded px-2 py-2 text-left text-sm hover:bg-muted disabled:opacity-60"
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
    </div>
  );
}
