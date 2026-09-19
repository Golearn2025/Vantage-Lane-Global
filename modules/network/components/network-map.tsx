"use client";

import { useEffect, useRef, useState, useMemo } from "react";
import Link from "next/link";
import {
  APIProvider,
  AdvancedMarker,
  Map,
  useMap,
} from "@vis.gl/react-google-maps";
import type { NetworkOrganization } from "@/modules/network/types";
import {
  OperationalStatusBadge,
  RelationshipStatusBadge,
  TestBadge,
} from "@/shared/components/status-badges";
import { Button } from "@/shared/ui/button";
import { Badge } from "@/shared/ui/badge";
import { ArrowUpRight, Star, X } from "lucide-react";

type Props = {
  organizations: NetworkOrganization[];
  focus?: { lat: number; lng: number; zoom?: number } | null;
  focusedOrgId?: string | null;
  flashingOrgId?: string | null;
  fitToPins?: boolean;
  resetViewKey?: number;
  height?: string;
};

/* ── Neon colours per service ── */
const SERVICE_NEON: Record<string, { fill: string; glow: string; pulse: string }> = {
  GROUND_TRANSPORTATION: { fill: "#00ff88", glow: "rgba(0,255,136,0.4)",  pulse: "rgba(0,255,136,0.2)"  },
  AVIATION:              { fill: "#00cfff", glow: "rgba(0,207,255,0.4)",  pulse: "rgba(0,207,255,0.2)"  },
  SECURITY:              { fill: "#ff3c6e", glow: "rgba(255,60,110,0.4)", pulse: "rgba(255,60,110,0.2)" },
  HOSPITALITY:           { fill: "#ff9f0a", glow: "rgba(255,159,10,0.4)", pulse: "rgba(255,159,10,0.2)" },
  CONCIERGE:             { fill: "#bf5af2", glow: "rgba(191,90,242,0.4)", pulse: "rgba(191,90,242,0.2)" },
  YACHT:                 { fill: "#0af5f4", glow: "rgba(10,245,244,0.4)", pulse: "rgba(10,245,244,0.2)" },
  MEDICAL:               { fill: "#ff6b6b", glow: "rgba(255,107,107,0.4)",pulse: "rgba(255,107,107,0.2)"},
  EVENTS:                { fill: "#ffd60a", glow: "rgba(255,214,10,0.4)", pulse: "rgba(255,214,10,0.2)" },
};
const DEFAULT_NEON = { fill: "#aaaaaa", glow: "rgba(170,170,170,0.3)", pulse: "rgba(170,170,170,0.15)" };

function getNeon(serviceCode: string | null) {
  return SERVICE_NEON[serviceCode ?? ""] ?? DEFAULT_NEON;
}

/* ── Custom pin SVG — neon per service ── */
function OrgPin({
  selected,
  flashing,
  serviceCode,
}: {
  selected: boolean;
  flashing: boolean;
  serviceCode: string | null;
}) {
  const neon = getNeon(serviceCode);
  const size = flashing ? 32 : selected ? 28 : 22;
  const h = flashing ? 44 : selected ? 38 : 30;

  return (
    <div className="relative flex items-center justify-center">
      {/* Pulse rings */}
      <span
        className="pointer-events-none absolute inline-flex h-10 w-10 rounded-full transition-opacity duration-300"
        style={{
          background: neon.glow,
          opacity: flashing ? 1 : 0,
          animation: flashing ? "ping 1s cubic-bezier(0,0,0.2,1) infinite" : "none",
        }}
      />
      <span
        className="pointer-events-none absolute inline-flex h-7 w-7 rounded-full transition-opacity duration-300"
        style={{
          background: neon.pulse,
          opacity: flashing ? 1 : 0,
          animation: flashing ? "ping 1s cubic-bezier(0,0,0.2,1) 150ms infinite" : "none",
        }}
      />
      {/* Neon glow shadow */}
      <div
        className="pointer-events-none absolute rounded-full transition-opacity duration-300"
        style={{
          width: size,
          height: size,
          boxShadow: selected || flashing ? `0 0 12px 4px ${neon.glow}` : `0 0 6px 2px ${neon.pulse}`,
          borderRadius: "50%",
          opacity: 0.8,
        }}
      />
      {/* Pin SVG */}
      <svg
        width={size}
        height={h}
        viewBox="0 0 22 30"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        style={{ transition: "width 0.15s, height 0.15s", display: "block", filter: `drop-shadow(0 0 4px ${neon.fill})` }}
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

/* ── Inner component — has access to map instance via useMap() ── */
function MapInner({
  organizations,
  focus,
  focusedOrgId,
  flashingOrgId,
  fitToPins,
  resetViewKey,
}: Omit<Props, "height">) {
  const map = useMap();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const prevFocusRef = useRef<string | null>(null);
  const prevPinsKeyRef = useRef<string>("");
  const prevGeoFocusRef = useRef<string>("");

  const pins = useMemo(
    () =>
      organizations.filter(
        (org) => org.primaryBaseLat != null && org.primaryBaseLng != null,
      ),
    [organizations],
  );

  const selected = useMemo(
    () => pins.find((org) => org.organizationId === selectedId) ?? null,
    [pins, selectedId],
  );

  /* Reset prevPinsKeyRef când search-ul e golit (forțează re-fitBounds) */
  useEffect(() => {
    prevPinsKeyRef.current = "";
  }, [resetViewKey]);

  /* Pan + zoom când focus geocodat se schimbă (Places search) */
  useEffect(() => {
    if (!map || !focus?.zoom) return;
    const key = `${focus.lat},${focus.lng},${focus.zoom}`;
    if (prevGeoFocusRef.current === key) return;
    prevGeoFocusRef.current = key;
    map.panTo({ lat: focus.lat, lng: focus.lng });
    map.setZoom(focus.zoom);
  }, [map, focus]);

  /* fitBounds când lista de pinuri se schimbă (search filter) */
  useEffect(() => {
    if (!map) return;
    const key = (fitToPins ? "fit" : "all") + ":" + pins.map((p) => p.organizationId).join(",");
    if (prevPinsKeyRef.current === key) return;
    prevPinsKeyRef.current = key;

    if (pins.length === 0) return;

    if (!fitToPins) {
      // Search cleared → toți operatorii → fitBounds pe toți
      if (pins.length === 1) {
        map.panTo({ lat: Number(pins[0].primaryBaseLat), lng: Number(pins[0].primaryBaseLng) });
        map.setZoom(11);
        return;
      }
      const bounds = new window.google.maps.LatLngBounds();
      for (const pin of pins) {
        bounds.extend({ lat: Number(pin.primaryBaseLat), lng: Number(pin.primaryBaseLng) });
      }
      map.fitBounds(bounds, 60);
      return;
    }

    // Search activ → fitBounds pe pinurile filtrate
    if (pins.length === 1) {
      map.panTo({ lat: Number(pins[0].primaryBaseLat), lng: Number(pins[0].primaryBaseLng) });
      map.setZoom(11);
      return;
    }
    const bounds = new window.google.maps.LatLngBounds();
    for (const pin of pins) {
      bounds.extend({ lat: Number(pin.primaryBaseLat), lng: Number(pin.primaryBaseLng) });
    }
    map.fitBounds(bounds, 60);
  }, [map, pins, fitToPins]);

  /* Click operator în sidebar → pan + zoom + selectează */
  useEffect(() => {
    if (!map || !focusedOrgId) return;
    if (prevFocusRef.current === focusedOrgId) return;
    prevFocusRef.current = focusedOrgId;

    const org = organizations.find((o) => o.organizationId === focusedOrgId);
    if (org?.primaryBaseLat != null && org.primaryBaseLng != null) {
      map.panTo({ lat: Number(org.primaryBaseLat), lng: Number(org.primaryBaseLng) });
      map.setZoom(11);
      setSelectedId(focusedOrgId);
    }
  }, [map, focusedOrgId, organizations]);

  return (
    <>
      {pins.map((org) => {
        const isSelected = selectedId === org.organizationId;
        const isFlashing = flashingOrgId === org.organizationId;

        return (
          <AdvancedMarker
            key={`pin-${org.organizationId}-${org.serviceCode ?? "x"}`}
            position={{
              lat: Number(org.primaryBaseLat),
              lng: Number(org.primaryBaseLng),
            }}
            title={org.displayName}
            zIndex={isFlashing ? 20 : isSelected ? 10 : 1}
            onClick={() =>
              setSelectedId((prev) =>
                prev === org.organizationId ? null : org.organizationId,
              )
            }
          >
            <OrgPin selected={isSelected} flashing={isFlashing} serviceCode={org.serviceCode ?? null} />
          </AdvancedMarker>
        );
      })}

      {/* Selected card — bottom-right overlay, rendered outside map tiles */}
      {selected ? (
        <div
          style={{
            position: "absolute",
            bottom: 16,
            right: 16,
            zIndex: 30,
            width: 288,
            maxWidth: "calc(100vw - 2rem)",
          }}
        >
          <div className="overflow-hidden rounded-xl border border-border bg-card/96 shadow-xl backdrop-blur">
            <div className="flex items-start justify-between gap-2 p-3">
              <div className="min-w-0 flex-1">
                <p className="truncate font-semibold leading-snug">{selected.displayName}</p>
                <p className="mt-0.5 truncate text-xs text-muted-foreground">
                  {[selected.primaryBaseLabel, selected.primaryBaseCity]
                    .filter(Boolean)
                    .join(" · ") || "No base label"}
                </p>
                {selected.googleReviewCount != null ? (
                  <p className="mt-1 flex items-center gap-1 text-xs text-amber-700 dark:text-amber-400">
                    <Star className="h-3 w-3 fill-current" />
                    {selected.googleRating != null
                      ? `${selected.googleRating.toFixed(1)} · `
                      : ""}
                    {selected.googleReviewCount}
                    {selected.googleReviewCount >= 200 ? "+" : ""} Google reviews
                  </p>
                ) : null}
              </div>
              <button
                type="button"
                onClick={() => setSelectedId(null)}
                className="shrink-0 rounded p-0.5 text-muted-foreground hover:text-foreground"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="flex flex-wrap gap-1.5 px-3 pb-2">
              {selected.isTest ? <TestBadge /> : null}
              {selected.serviceCode ? (() => {
                const svc = SERVICE_NEON[selected.serviceCode];
                const label = {
                  GROUND_TRANSPORTATION: "GT",
                  AVIATION: "Aviation",
                  SECURITY: "Security",
                  HOSPITALITY: "Hospitality",
                  CONCIERGE: "Concierge",
                  YACHT: "Yacht",
                  MEDICAL: "Medical",
                  EVENTS: "Events",
                }[selected.serviceCode] ?? selected.serviceCode;
                return (
                  <span
                    className="inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold"
                    style={svc ? {
                      color: svc.fill,
                      background: svc.pulse,
                      border: `1px solid ${svc.fill}60`,
                      boxShadow: `0 0 6px ${svc.fill}40`,
                    } : {}}
                  >
                    {label}
                  </span>
                );
              })() : null}
              <RelationshipStatusBadge status={selected.relationshipStatus} />
              <OperationalStatusBadge status={selected.operationalStatus} />
              {selected.coverageAirportIatas.length > 0 ? (
                <Badge variant="outline" className="text-[10px]">
                  {selected.coverageAirportIatas.join(", ")}
                </Badge>
              ) : null}
            </div>
            <div className="border-t border-border px-3 py-2">
              <Button asChild size="sm" className="w-full">
                <Link href={`/organizations/${selected.organizationId}`}>
                  Open profile
                  <ArrowUpRight className="ml-1 h-3.5 w-3.5" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}

/* ── Outer wrapper ── */
export function NetworkMap({
  organizations,
  focus,
  focusedOrgId,
  flashingOrgId,
  fitToPins,
  resetViewKey,
  height = "100%",
}: Props) {
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

  const pins = useMemo(
    () =>
      organizations.filter(
        (org) => org.primaryBaseLat != null && org.primaryBaseLng != null,
      ),
    [organizations],
  );

  const defaultCenter =
    focus ??
    (pins[0]
      ? { lat: Number(pins[0].primaryBaseLat), lng: Number(pins[0].primaryBaseLng) }
      : { lat: 30, lng: 15 }); // centru rezonabil Europa/Middle East la zoom 2

  if (!apiKey) {
    return (
      <div className="flex h-full items-center justify-center bg-muted/30 p-6 text-sm text-muted-foreground">
        Set{" "}
        <code className="mx-1 rounded bg-muted px-1">NEXT_PUBLIC_GOOGLE_MAPS_API_KEY</code> to
        enable the map.
      </div>
    );
  }

  return (
    <div className="relative h-full w-full overflow-hidden">
      <APIProvider apiKey={apiKey}>
        <Map
          style={{ width: "100%", height }}
          defaultCenter={defaultCenter}
          defaultZoom={pins.length === 0 ? 2 : focus ? 8 : 3}
          mapId={process.env.NEXT_PUBLIC_GOOGLE_MAPS_MAP_ID || "DEMO_MAP_ID"}
          gestureHandling="greedy"
          disableDefaultUI={false}
          minZoom={3}
          restriction={{
            latLngBounds: { north: 84, south: -84, west: -179, east: 179 },
            strictBounds: false,
          }}
        >
          <MapInner
            organizations={organizations}
            focus={focus}
            focusedOrgId={focusedOrgId}
            flashingOrgId={flashingOrgId}
            fitToPins={fitToPins}
            resetViewKey={resetViewKey}
          />
        </Map>
      </APIProvider>

    </div>
  );
}
