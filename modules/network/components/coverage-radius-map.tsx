"use client";

import { useMemo } from "react";
import {
  APIProvider,
  AdvancedMarker,
  Circle,
  Map,
  Pin,
} from "@vis.gl/react-google-maps";
import { Minus, Plus } from "lucide-react";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { Label } from "@/shared/ui/label";

const MIN_KM = 5;
const MAX_KM = 200;
const STEP_KM = 5;

export type MapExtraPin = {
  lat: number;
  lng: number;
  label: string;
};

type Props = {
  lat?: number | null;
  lng?: number | null;
  radiusKm: number;
  onRadiusChange: (km: number) => void;
  label?: string;
  /** Square map by default (less wide rectangle). */
  square?: boolean;
  extraPins?: MapExtraPin[];
};

function zoomForRadius(km: number) {
  if (km <= 10) return 12;
  if (km <= 25) return 11;
  if (km <= 40) return 10;
  if (km <= 70) return 9;
  if (km <= 120) return 8;
  return 7;
}

function clampKm(value: number) {
  if (Number.isNaN(value)) return MIN_KM;
  return Math.min(MAX_KM, Math.max(MIN_KM, Math.round(value)));
}

export function CoverageRadiusControls({
  radiusKm,
  onRadiusChange,
}: {
  radiusKm: number;
  onRadiusChange: (km: number) => void;
}) {
  return (
    <div className="flex flex-wrap items-end gap-2">
      <div className="space-y-1">
        <Label htmlFor="coverage-radius-km">Service radius (km)</Label>
        <div className="flex items-center gap-2">
          <Button
            type="button"
            size="icon"
            variant="outline"
            className="h-10 w-10 shrink-0"
            onClick={() => onRadiusChange(clampKm(radiusKm - STEP_KM))}
            aria-label="Decrease radius"
          >
            <Minus className="h-4 w-4" />
          </Button>
          <Input
            id="coverage-radius-km"
            type="number"
            min={MIN_KM}
            max={MAX_KM}
            step={1}
            inputMode="numeric"
            className="h-10 w-24 text-center"
            value={radiusKm}
            onChange={(event) =>
              onRadiusChange(clampKm(Number(event.target.value)))
            }
          />
          <Button
            type="button"
            size="icon"
            variant="outline"
            className="h-10 w-10 shrink-0"
            onClick={() => onRadiusChange(clampKm(radiusKm + STEP_KM))}
            aria-label="Increase radius"
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>
      </div>
      <p className="pb-2 text-xs text-muted-foreground">
        {MIN_KM}–{MAX_KM} km · − / + or type
      </p>
    </div>
  );
}

export function CoverageRadiusMap({
  lat,
  lng,
  radiusKm,
  onRadiusChange,
  label,
  square = true,
  extraPins = [],
}: Props) {
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
  const hasCoords = lat != null && lng != null;
  const center = useMemo(
    () => (hasCoords ? { lat: lat!, lng: lng! } : null),
    [hasCoords, lat, lng],
  );
  const zoom = zoomForRadius(radiusKm);

  return (
    <div className="space-y-3">
      {hasCoords && center ? (
        apiKey ? (
          <div
            className={
              square
                ? "relative mx-auto aspect-square w-full max-w-[300px] overflow-hidden rounded-lg border border-border sm:max-w-[320px]"
                : "overflow-hidden rounded-lg border border-border"
            }
          >
            <APIProvider apiKey={apiKey}>
              <Map
                key={`${center.lat.toFixed(5)}-${center.lng.toFixed(5)}-${zoom}-${extraPins.length}`}
                style={{
                  width: "100%",
                  height: square ? "100%" : 260,
                  position: square ? "absolute" : undefined,
                  inset: square ? 0 : undefined,
                }}
                defaultCenter={center}
                defaultZoom={zoom}
                mapId={
                  process.env.NEXT_PUBLIC_GOOGLE_MAPS_MAP_ID || "DEMO_MAP_ID"
                }
                gestureHandling="greedy"
                disableDefaultUI
              >
                <AdvancedMarker position={center} title={label}>
                  <Pin
                    background="hsl(36 42% 58%)"
                    borderColor="hsl(220 18% 12%)"
                    glyphColor="white"
                  />
                </AdvancedMarker>
                <Circle
                  center={center}
                  radius={radiusKm * 1000}
                  strokeColor="hsl(36 42% 48%)"
                  strokeOpacity={0.9}
                  strokeWeight={2}
                  fillColor="hsl(36 42% 58%)"
                  fillOpacity={0.18}
                />
                {extraPins.map((pin) => (
                  <AdvancedMarker
                    key={`${pin.lat}-${pin.lng}-${pin.label}`}
                    position={{ lat: pin.lat, lng: pin.lng }}
                    title={pin.label}
                  >
                    <Pin
                      background="hsl(220 18% 28%)"
                      borderColor="hsl(36 42% 58%)"
                      glyphColor="white"
                    />
                  </AdvancedMarker>
                ))}
              </Map>
            </APIProvider>
          </div>
        ) : (
          <div className="rounded-md border border-border p-3 text-sm text-muted-foreground">
            Set `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` to preview the circle on the
            map.
          </div>
        )
      ) : (
        <p className="text-xs text-muted-foreground">
          No map coordinates for this place yet — you can still set the radius
          in km.
        </p>
      )}

      <CoverageRadiusControls
        radiusKm={radiusKm}
        onRadiusChange={onRadiusChange}
      />
    </div>
  );
}

export { MIN_KM as COVERAGE_RADIUS_MIN_KM, MAX_KM as COVERAGE_RADIUS_MAX_KM };
