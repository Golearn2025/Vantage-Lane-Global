"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import {
  APIProvider,
  AdvancedMarker,
  Map,
  useMap,
} from "@vis.gl/react-google-maps";
import { ArrowUpRight, X } from "lucide-react";
import type { BookerLead } from "@/modules/bookers/types";
import { deriveBookerStatus } from "@/modules/bookers/types";
import { serviceLabel } from "@/shared/lib/email/brand";
import { Button } from "@/shared/ui/button";
import { cn } from "@/shared/lib/utils";

const SERVICE_NEON: Record<string, { fill: string; glow: string }> = {
  HOSPITALITY: { fill: "#ff9f0a", glow: "rgba(255,159,10,0.4)" },
  CONCIERGE: { fill: "#bf5af2", glow: "rgba(191,90,242,0.4)" },
  EVENTS: { fill: "#ffd60a", glow: "rgba(255,214,10,0.4)" },
};
const DEFAULT_NEON = { fill: "#c4a574", glow: "rgba(196,165,116,0.35)" };

function getNeon(serviceCode: string | null) {
  return SERVICE_NEON[serviceCode ?? ""] ?? DEFAULT_NEON;
}

function BookerPin({
  selected,
  serviceCode,
}: {
  selected: boolean;
  serviceCode: string | null;
}) {
  const neon = getNeon(serviceCode);
  const size = selected ? 28 : 22;
  const h = selected ? 38 : 30;
  return (
    <div className="relative flex items-center justify-center">
      <div
        className="pointer-events-none absolute rounded-full"
        style={{
          width: size,
          height: size,
          boxShadow: `0 0 ${selected ? 12 : 6}px ${selected ? 4 : 2}px ${neon.glow}`,
          opacity: 0.85,
        }}
      />
      <svg
        width={size}
        height={h}
        viewBox="0 0 22 30"
        fill="none"
        style={{ filter: `drop-shadow(0 0 4px ${neon.fill})` }}
      >
        <path
          d="M11 0C4.925 0 0 4.925 0 11c0 7.333 11 19 11 19S22 18.333 22 11C22 4.925 17.075 0 11 0Z"
          fill={neon.fill}
          stroke="rgba(0,0,0,0.5)"
          strokeWidth="1"
        />
        <circle cx="11" cy="11" r="4" fill="rgba(0,0,0,0.7)" />
        <circle cx="11" cy="11" r="2" fill={neon.fill} opacity="0.9" />
      </svg>
    </div>
  );
}

function MapInner({
  bookers,
  focusedOrgId,
}: {
  bookers: BookerLead[];
  focusedOrgId: string | null;
}) {
  const map = useMap();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const prevFocusRef = useRef<string | null>(null);
  const prevPinsKeyRef = useRef("");

  const pins = useMemo(
    () =>
      bookers.filter(
        (b) => b.primaryBaseLat != null && b.primaryBaseLng != null,
      ),
    [bookers],
  );

  const selected = useMemo(
    () => pins.find((b) => b.organizationId === selectedId) ?? null,
    [pins, selectedId],
  );

  useEffect(() => {
    if (!map || pins.length === 0) return;
    const key = pins.map((p) => p.organizationId).join(",");
    if (prevPinsKeyRef.current === key) return;
    prevPinsKeyRef.current = key;

    if (pins.length === 1) {
      map.panTo({
        lat: Number(pins[0].primaryBaseLat),
        lng: Number(pins[0].primaryBaseLng),
      });
      map.setZoom(11);
      return;
    }
    const bounds = new window.google.maps.LatLngBounds();
    for (const pin of pins) {
      bounds.extend({
        lat: Number(pin.primaryBaseLat),
        lng: Number(pin.primaryBaseLng),
      });
    }
    map.fitBounds(bounds, 60);
  }, [map, pins]);

  useEffect(() => {
    if (!map || !focusedOrgId) return;
    if (prevFocusRef.current === focusedOrgId) return;
    prevFocusRef.current = focusedOrgId;
    const org = bookers.find((b) => b.organizationId === focusedOrgId);
    if (org?.primaryBaseLat != null && org.primaryBaseLng != null) {
      map.panTo({
        lat: Number(org.primaryBaseLat),
        lng: Number(org.primaryBaseLng),
      });
      map.setZoom(12);
      setSelectedId(focusedOrgId);
    }
  }, [map, focusedOrgId, bookers]);

  return (
    <>
      {pins.map((org) => {
        const isSelected = selectedId === org.organizationId;
        return (
          <AdvancedMarker
            key={org.organizationId}
            position={{
              lat: Number(org.primaryBaseLat),
              lng: Number(org.primaryBaseLng),
            }}
            title={org.displayName}
            zIndex={isSelected ? 10 : 1}
            onClick={() =>
              setSelectedId((prev) =>
                prev === org.organizationId ? null : org.organizationId,
              )
            }
          >
            <BookerPin selected={isSelected} serviceCode={org.serviceCode} />
          </AdvancedMarker>
        );
      })}

      {selected ? (
        <div className="absolute bottom-4 right-4 z-30 w-72 max-w-[calc(100vw-2rem)]">
          <div className="overflow-hidden rounded-xl border border-border bg-card/96 shadow-xl backdrop-blur">
            <div className="flex items-start justify-between gap-2 p-3">
              <div className="min-w-0 flex-1">
                <p className="truncate font-semibold leading-snug">
                  {selected.displayName}
                </p>
                <p className="mt-0.5 truncate text-xs text-muted-foreground">
                  {[selected.primaryBaseLabel, selected.primaryBaseCity]
                    .filter(Boolean)
                    .join(" · ") ||
                    selected.city ||
                    "No address"}
                </p>
                {selected.primaryBaseAddress ? (
                  <p className="mt-1 line-clamp-2 text-[11px] text-muted-foreground">
                    {selected.primaryBaseAddress}
                  </p>
                ) : null}
                <p className="mt-1 text-xs text-muted-foreground">
                  {serviceLabel(selected.serviceCode)} ·{" "}
                  {deriveBookerStatus(selected).replace("_", " ")}
                </p>
              </div>
              <button
                type="button"
                className="rounded-md p-1 text-muted-foreground hover:bg-muted"
                onClick={() => setSelectedId(null)}
                aria-label="Close"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="border-t border-border/60 px-3 py-2">
              <Button asChild variant="ghost" size="sm" className="h-8 w-full justify-between">
                <Link href={`/organizations/${selected.organizationId}`}>
                  Open desk
                  <ArrowUpRight className="h-3.5 w-3.5" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}

type Props = {
  bookers: BookerLead[];
  focusedOrgId?: string | null;
  /** When true, start zoomed on London and keep a London-ish min zoom. */
  londonFocus?: boolean;
  className?: string;
};

const LONDON_CENTER = { lat: 51.5074, lng: -0.1278 };

export function BookersMap({
  bookers,
  focusedOrgId = null,
  londonFocus = true,
  className,
}: Props) {
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
  const pins = useMemo(
    () =>
      bookers.filter(
        (b) => b.primaryBaseLat != null && b.primaryBaseLng != null,
      ),
    [bookers],
  );
  const defaultCenter = londonFocus
    ? LONDON_CENTER
    : pins[0]
      ? {
          lat: Number(pins[0].primaryBaseLat),
          lng: Number(pins[0].primaryBaseLng),
        }
      : LONDON_CENTER;

  if (!apiKey) {
    return (
      <div
        className={cn(
          "flex items-center justify-center bg-muted/30 p-6 text-sm text-muted-foreground",
          className,
        )}
      >
        Set{" "}
        <code className="mx-1 rounded bg-muted px-1">
          NEXT_PUBLIC_GOOGLE_MAPS_API_KEY
        </code>{" "}
        to enable the bookers map.
      </div>
    );
  }

  return (
    <div className={cn("relative min-h-[420px] w-full overflow-hidden", className)}>
      <APIProvider apiKey={apiKey}>
        <Map
          style={{ width: "100%", height: "100%" }}
          defaultCenter={defaultCenter}
          defaultZoom={londonFocus ? 11 : pins.length <= 1 ? 11 : 3}
          mapId={process.env.NEXT_PUBLIC_GOOGLE_MAPS_MAP_ID || "DEMO_MAP_ID"}
          gestureHandling="greedy"
          disableDefaultUI={false}
          minZoom={londonFocus ? 9 : 2}
        >
          <MapInner bookers={bookers} focusedOrgId={focusedOrgId} />
        </Map>
      </APIProvider>
      <p className="pointer-events-none absolute left-3 top-3 z-20 rounded-md bg-card/90 px-2.5 py-1 text-[11px] text-muted-foreground shadow backdrop-blur">
        {londonFocus ? "London · " : ""}
        {pins.length} mapped
        {bookers.length - pins.length
          ? ` · ${bookers.length - pins.length} without coords`
          : ""}
      </p>
    </div>
  );
}
