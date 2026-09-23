"use client";

import { useMemo, useState } from "react";
import {
  LocationSearchPicker,
  type PickedLocation,
} from "@/modules/network/components/location-search-picker";
import { CoverageRadiusMap } from "@/modules/network/components/coverage-radius-map";
import {
  defaultRadiusForKind,
  resolveCoverageMode,
} from "@/modules/organizations/coverage-mode";
import { FieldHint } from "@/shared/components/country-combobox";
import { Badge } from "@/shared/ui/badge";
import { Button } from "@/shared/ui/button";
import { Checkbox } from "@/shared/ui/checkbox";
import { Label } from "@/shared/ui/label";
import type { Database } from "@/shared/types/database";
import {
  getCoverageServiceProfile,
  type CoverageServiceProfile,
} from "@/modules/organizations/coverage-profile";

export type CoverageDraft = {
  locationId: string;
  locationName: string;
  iata: string | null;
  kind: string;
  lat: number | null;
  lng: number | null;
  radiusKm: number | null;
  coverageMode: Database["public"]["Enums"]["coverage_mode"];
};

export type CoverageBundle = {
  primary: CoverageDraft | null;
  secondaries: CoverageDraft[];
};

type Props = {
  /** Live updates for Quick Add (primary + airports). */
  onChange?: (bundle: CoverageBundle) => void;
  /** Single-save mode (org profile sheet). */
  confirmLabel?: string;
  onConfirm?: (draft: CoverageDraft) => void | Promise<void>;
  pending?: boolean;
  /** Allow secondary airports after primary is set (default true). */
  allowSecondaries?: boolean;
  /** Partner onboarding uses clearer step-by-step copy. */
  audience?: "admin" | "partner";
  /** Drives partner copy + secondary labels (airports vs cities vs ports). */
  serviceCode?: string | null;
};

function toDraft(
  location: PickedLocation,
  radiusKm: number | null,
): CoverageDraft {
  return {
    locationId: location.id,
    locationName: location.name,
    iata: location.iata,
    kind: location.kind,
    lat: location.lat,
    lng: location.lng,
    radiusKm,
    coverageMode: resolveCoverageMode(location.kind, radiusKm),
  };
}

export function CoverageComposer({
  onChange,
  confirmLabel,
  onConfirm,
  pending,
  allowSecondaries = true,
  audience = "admin",
  serviceCode = null,
}: Props) {
  const [primary, setPrimary] = useState<PickedLocation | null>(null);
  const [radiusKm, setRadiusKm] = useState(30);
  const [useRadius, setUseRadius] = useState(true);
  const [secondaries, setSecondaries] = useState<PickedLocation[]>([]);
  const partner = audience === "partner";
  const profile: CoverageServiceProfile = getCoverageServiceProfile(serviceCode);

  const singleMode = Boolean(confirmLabel && onConfirm);

  function emit(
    nextPrimary: PickedLocation | null,
    nextRadiusKm: number,
    nextUseRadius: boolean,
    nextSecondaries: PickedLocation[],
  ) {
    if (!onChange) return;
    const radius = nextPrimary && nextUseRadius ? nextRadiusKm : null;
    onChange({
      primary: nextPrimary ? toDraft(nextPrimary, radius) : null,
      secondaries: nextSecondaries.map((item) =>
        toDraft(item, item.kind === "AIRPORT" ? null : nextRadiusKm),
      ),
    });
  }

  function handlePick(location: PickedLocation) {
    // Profile sheet: one place at a time
    if (singleMode || !allowSecondaries) {
      const nextRadius = defaultRadiusForKind(location.kind);
      setPrimary(location);
      setRadiusKm(nextRadius);
      setUseRadius(true);
      setSecondaries([]);
      emit(location, nextRadius, true, []);
      return;
    }

    // Quick Add: first pick = primary zone; later picks = secondary airports
    if (!primary) {
      const nextRadius = defaultRadiusForKind(location.kind);
      setPrimary(location);
      setRadiusKm(nextRadius);
      setUseRadius(true);
      emit(location, nextRadius, true, secondaries);
      return;
    }

    if (location.id === primary.id) return;
    if (secondaries.some((item) => item.id === location.id)) return;

    const next = [...secondaries, location];
    setSecondaries(next);
    emit(primary, radiusKm, useRadius, next);
  }

  function handleRadius(next: number) {
    setRadiusKm(next);
    if (primary) emit(primary, next, useRadius, secondaries);
  }

  function handleUseRadius(checked: boolean) {
    setUseRadius(checked);
    if (primary) emit(primary, radiusKm, checked, secondaries);
  }

  function clearPrimary() {
    setPrimary(null);
    setSecondaries([]);
    setUseRadius(true);
    setRadiusKm(30);
    emit(null, 30, true, []);
  }

  function removeSecondary(id: string) {
    const next = secondaries.filter((item) => item.id !== id);
    setSecondaries(next);
    if (primary) emit(primary, radiusKm, useRadius, next);
  }

  const extraPins = useMemo(
    () =>
      secondaries
        .filter((item) => item.lat != null && item.lng != null)
        .map((item) => ({
          lat: item.lat!,
          lng: item.lng!,
          label: item.iata ? `${item.name} (${item.iata})` : item.name,
        })),
    [secondaries],
  );

  return (
    <div className="space-y-4">
      {!primary ? (
        <div className="space-y-2">
          <Label>
            {partner ? profile.primaryLabel : "Primary coverage zone"}
          </Label>
          <FieldHint>
            {partner ? (
              <>
                {profile.primaryHint}{" "}
                <strong>Tap a suggestion</strong> — typing alone does nothing.
              </>
            ) : (
              <>
                Start with the main city / area (e.g. London) + radius. Tap a
                result — typing alone does nothing.
              </>
            )}
          </FieldHint>
          <LocationSearchPicker
            onPick={handlePick}
            placeholder={
              partner
                ? profile.primaryPlaceholder
                : "Primary zone: London, Milan…"
            }
          />
        </div>
      ) : (
        <div className="space-y-3 rounded-md border border-border p-3">
          {partner ? (
            <p className="rounded-lg bg-muted/50 px-3 py-2 text-xs text-muted-foreground">
              <strong className="text-foreground">Step 2 — Radius.</strong>{" "}
              {profile.radiusHint}
            </p>
          ) : null}
          <div className="flex flex-wrap items-start justify-between gap-2">
            <div>
              <div className="mb-1 flex flex-wrap items-center gap-2">
                <Badge variant="primary">Primary zone</Badge>
                <span className="text-sm font-medium">
                  {primary.name}
                  {primary.iata ? ` (${primary.iata})` : ""}
                </span>
              </div>
              <p className="text-xs text-muted-foreground">
                {primary.kind}
                {primary.countryCode ? ` · ${primary.countryCode}` : ""}
                {useRadius ? ` · ${radiusKm} km radius` : " · no radius"}
              </p>
            </div>
            <Button type="button" size="sm" variant="ghost" onClick={clearPrimary}>
              Change
            </Button>
          </div>

          <div className="flex items-center gap-2">
            <Checkbox
              id="use-radius"
              checked={useRadius}
              onCheckedChange={(checked) => handleUseRadius(checked === true)}
            />
            <Label htmlFor="use-radius" className="font-normal">
              {partner
                ? "Draw how far you cover from this city (recommended)"
                : "Draw service radius on map"}
            </Label>
          </div>

          {useRadius ? (
            <CoverageRadiusMap
              lat={primary.lat}
              lng={primary.lng}
              radiusKm={radiusKm}
              onRadiusChange={handleRadius}
              label={primary.name}
              square
              extraPins={extraPins}
            />
          ) : (
            <p className="text-xs text-muted-foreground">
              Radius off — pin only for this primary zone.
            </p>
          )}

          {confirmLabel && onConfirm ? (
            <Button
              type="button"
              className="w-full"
              disabled={pending}
              onClick={async () => {
                const radius = useRadius ? radiusKm : null;
                await onConfirm(toDraft(primary, radius));
              }}
            >
              {confirmLabel}
            </Button>
          ) : null}
        </div>
      )}

      {primary && allowSecondaries && !singleMode ? (
        <div className="space-y-2">
          <Label>
            {partner
              ? profile.secondaryLabel
              : profile.secondaryMode === "airports"
                ? "Secondary airports / places"
                : profile.secondaryMode === "ports"
                  ? "Secondary ports / marinas"
                  : "Secondary cities / areas"}
          </Label>
          <FieldHint>
            {partner ? (
              <>
                {profile.secondaryHint} When ready, press{" "}
                <strong>Save coverage</strong> below.
              </>
            ) : profile.secondaryMode === "airports" ? (
              <>
                Add airports this partner also covers (Gatwick, Stansted,
                Luton…). They stay listed here and show as extra pins on the
                map.
              </>
            ) : profile.secondaryMode === "ports" ? (
              <>
                Add other ports / marinas / coastal cities this partner also
                covers.
              </>
            ) : (
              <>
                Add other cities or areas this partner also covers (not airport
                transfers).
              </>
            )}
          </FieldHint>
          <LocationSearchPicker
            selectedId={null}
            onPick={handlePick}
            placeholder={
              partner
                ? profile.secondaryPlaceholder
                : profile.secondaryMode === "airports"
                  ? "Add airport: LGW, STN, LTN…"
                  : profile.secondaryMode === "ports"
                    ? "Add port / marina / coastal city…"
                    : "Add city or area…"
            }
          />
          {secondaries.length > 0 ? (
            <ul className="space-y-1 rounded-md border border-border p-2">
              {secondaries.map((item) => (
                <li
                  key={item.id}
                  className="flex min-h-10 items-center justify-between gap-2 rounded px-2 text-sm"
                >
                  <span className="truncate">
                    <Badge className="mr-2" variant="outline">
                      Secondary
                    </Badge>
                    {item.name}
                    {item.iata ? ` (${item.iata})` : ""}
                  </span>
                  <Button
                    type="button"
                    size="sm"
                    variant="ghost"
                    onClick={() => removeSecondary(item.id)}
                  >
                    Remove
                  </Button>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-xs text-muted-foreground">
              {partner
                ? "No airports added yet — optional, then Save coverage."
                : "No secondary airports yet."}
            </p>
          )}
        </div>
      ) : null}
    </div>
  );
}
