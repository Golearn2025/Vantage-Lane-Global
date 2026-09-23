"use client";

import Link from "next/link";
import { useMemo, useRef, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { ArrowUpRight, MapPinned, Plus, Search, Star } from "lucide-react";
import {
  useNetworkLocationSearch,
  useNetworkOrganizations,
  useNetworkPlaceRealtime,
  usePlaceSuppliers,
} from "@/modules/network/hooks";
import { NetworkMap } from "@/modules/network/components/network-map";
import type { NetworkOrganization } from "@/modules/network/types";
import {
  OperationalStatusBadge,
  RelationshipStatusBadge,
  TestBadge,
} from "@/shared/components/status-badges";
import type { RelationshipStatus } from "@/shared/types/domain";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { Badge } from "@/shared/ui/badge";
import { Skeleton } from "@/shared/ui/skeleton";

/* ── Neon colours per service (must match network-map.tsx) ── */
const SERVICE_FILTERS = [
  { code: "GROUND_TRANSPORTATION", label: "GT",          color: "#00ff88" },
  { code: "AVIATION",              label: "Aviation",    color: "#00cfff" },
  { code: "SECURITY",              label: "Security",    color: "#ff3c6e" },
  { code: "HOSPITALITY",           label: "Hospitality", color: "#ff9f0a" },
  { code: "CONCIERGE",             label: "Concierge",   color: "#bf5af2" },
  { code: "YACHT",                 label: "Yacht",       color: "#0af5f4" },
  { code: "MEDICAL",               label: "Medical",     color: "#ff6b6b" },
  { code: "EVENTS",                label: "Events",      color: "#ffd60a" },
];

/* ── Status bucket helpers ── */
const BUCKETS: { key: string; label: string; color: string; statuses: RelationshipStatus[] }[] = [
  { key: "active", label: "Active", color: "bg-success", statuses: ["ACTIVE"] },
  {
    key: "onboarding",
    label: "Onboarding",
    color: "bg-info",
    statuses: ["ONBOARDING", "UNDER_REVIEW", "INTERESTED"],
  },
  { key: "contacted", label: "Contacted", color: "bg-warning", statuses: ["CONTACTED"] },
  { key: "leads", label: "Lead", color: "bg-muted-foreground", statuses: ["LEAD"] },
  {
    key: "other",
    label: "Paused / other",
    color: "bg-muted-foreground/40",
    statuses: ["PAUSED", "REJECTED", "INACTIVE"],
  },
];

function bucketFor(status: RelationshipStatus | null) {
  if (!status) return "other";
  return BUCKETS.find((b) => b.statuses.includes(status))?.key ?? "other";
}

function statusDot(status: RelationshipStatus | null) {
  const bucket = BUCKETS.find((b) => b.statuses.includes(status ?? "LEAD")) ?? BUCKETS[3];
  return bucket.color;
}

export function NetworkExplorer() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const selectedLocationId = searchParams.get("location") ?? "";
  const [qOps, setQOps] = useState("");
  const [qPlaces, setQPlaces] = useState("");
  const [resetViewKey, setResetViewKey] = useState(0);
  const [sidebarTab, setSidebarTab] = useState<"operators" | "places">("operators");
  const [focusedOrgId, setFocusedOrgId] = useState<string | null>(null);
  const [flashingOrgId, setFlashingOrgId] = useState<string | null>(null);
  // Filtre servicii — set gol = toate vizibile
  const [serviceFilter, setServiceFilter] = useState<Set<string>>(new Set());
  // Filtru status — "all" implicit
  const [statusFilter, setStatusFilter] = useState<"active" | "all">("all");
  // Focus geocodat pentru Places search
  const [geoFocus, setGeoFocus] = useState<{ lat: number; lng: number; zoom: number } | null>(null);
  const geoDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [selectedPlace, setSelectedPlace] = useState<{
    id: string;
    name: string;
    kind: string;
    countryCode: string | null;
    lat: number | null;
    lng: number | null;
  } | null>(null);

  const locations = useNetworkLocationSearch(qPlaces);
  const suppliers = usePlaceSuppliers(selectedLocationId || null);
  const networkOrgs = useNetworkOrganizations(true);
  useNetworkPlaceRealtime(selectedLocationId || null);

  /* Click operator în sidebar → centrează harta + flash 1.5s */
  function focusOrg(orgId: string) {
    setFocusedOrgId(orgId);
    setFlashingOrgId(orgId);
    setTimeout(() => setFlashingOrgId(null), 1800);
  }

  /* Geocodare Places — API server (cheia publică din browser nu e de încredere) */
  function geocodeQuery(q: string) {
    if (geoDebounceRef.current) clearTimeout(geoDebounceRef.current);
    if (!q.trim()) {
      if (!selectedPlace) setGeoFocus(null);
      return;
    }
    geoDebounceRef.current = setTimeout(async () => {
      try {
        const res = await fetch(
          `/api/places/geocode?q=${encodeURIComponent(q.trim())}`,
        );
        const data = (await res.json()) as {
          result?: { lat: number; lng: number; zoom: number } | null;
        };
        if (data.result) {
          setGeoFocus({
            lat: data.result.lat,
            lng: data.result.lng,
            zoom: data.result.zoom,
          });
        }
      } catch {
        /* ignore */
      }
    }, 600);
  }

  function focusFromPlace(place: {
    kind: string;
    lat: number | null;
    lng: number | null;
  }) {
    if (place.lat == null || place.lng == null) return;
    const zoom =
      place.kind === "COUNTRY"
        ? 4
        : place.kind === "REGION"
          ? 6
          : place.kind === "LOCALITY"
            ? 11
            : 12;
    setGeoFocus({ lat: place.lat, lng: place.lng, zoom });
  }

  function matchesSelectedPlace(org: NetworkOrganization) {
    if (!selectedPlace) return true;
    const code = selectedPlace.countryCode;
    if (selectedPlace.kind === "COUNTRY" && code) {
      return (
        org.primaryBaseCountryCode === code || org.legalCountryCode === code
      );
    }
    if (selectedPlace.kind === "LOCALITY") {
      const needle = selectedPlace.name
        .toLowerCase()
        .replace(/\s+city$/i, "")
        .trim();
      const city = (org.primaryBaseCity ?? "").toLowerCase();
      const label = (org.primaryBaseLabel ?? "").toLowerCase();
      return Boolean(
        (city && (city.includes(needle) || needle.includes(city))) ||
          (label && label.includes(needle)),
      );
    }
    if (code) {
      return (
        org.primaryBaseCountryCode === code || org.legalCountryCode === code
      );
    }
    return true;
  }

  /* Map focus: focus pe org selectat, pe geocoding din Places, sau pe primul supplier */
  const mapFocus = useMemo(() => {
    if (focusedOrgId) {
      const org = (networkOrgs.data ?? []).find((o) => o.organizationId === focusedOrgId);
      if (org?.primaryBaseLat != null && org.primaryBaseLng != null) {
        return { lat: Number(org.primaryBaseLat), lng: Number(org.primaryBaseLng) };
      }
    }
    if (geoFocus) return geoFocus;
    const first = (suppliers.data ?? []).find(
      (row) => row.primaryBaseLat != null && row.primaryBaseLng != null,
    );
    if (first?.primaryBaseLat != null && first.primaryBaseLng != null) {
      return { lat: Number(first.primaryBaseLat), lng: Number(first.primaryBaseLng) };
    }
    return null;
  }, [focusedOrgId, geoFocus, networkOrgs.data, suppliers.data]);

  /* Operators sidebar — caută + filtrează per serviciu + status */
  const filteredOrgs = useMemo(() => {
    let orgs = [...(networkOrgs.data ?? [])];

    // Filtru status
    if (statusFilter === "active") {
      orgs = orgs.filter((o) => o.relationshipStatus === "ACTIVE");
    }

    // Filtru servicii — set gol = toate
    if (serviceFilter.size > 0) {
      orgs = orgs.filter((o) => o.serviceCode && serviceFilter.has(o.serviceCode));
    }

    // Căutare text (+ alias America/USA → US)
    if (qOps.trim()) {
      const q = qOps.toLowerCase().trim();
      const countryAlias =
        q === "america" || q === "usa" || q === "us" || q === "united states"
          ? "US"
          : q === "uk" || q === "britain" || q === "england"
            ? "GB"
            : null;
      orgs = orgs.filter((o) => {
        if (
          countryAlias &&
          (o.primaryBaseCountryCode === countryAlias ||
            o.legalCountryCode === countryAlias)
        ) {
          return true;
        }
        const haystack = [
          o.displayName,
          o.primaryBaseCity,
          o.primaryBaseCountryCode,
          o.legalCountryCode,
          ...o.coverageAirportIatas,
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();
        return haystack.includes(q);
      });
    }

    // Places select: țară/oraș → arată operatorii cu baza acolo (Danny/Continental în US)
    if (selectedPlace) {
      orgs = orgs.filter(matchesSelectedPlace);
    }

    return orgs.sort((a, b) => {
      const ra = a.googleReviewCount ?? -1;
      const rb = b.googleReviewCount ?? -1;
      if (rb !== ra) return rb - ra;
      return a.displayName.localeCompare(b.displayName);
    });
  }, [networkOrgs.data, qOps, serviceFilter, statusFilter, selectedPlace]);

  /* Which orgs to show as pins — filtrele de serviciu + status se aplică mereu pe hartă */
  const mapOrgs: NetworkOrganization[] = useMemo(() => {
    let base = [...(networkOrgs.data ?? [])];

    // Aplică filtru status
    if (statusFilter === "active") {
      base = base.filter((o) => o.relationshipStatus === "ACTIVE");
    }
    // Aplică filtru servicii
    if (serviceFilter.size > 0) {
      base = base.filter((o) => o.serviceCode && serviceFilter.has(o.serviceCode));
    }

    if (selectedPlace) {
      base = base.filter(matchesSelectedPlace);
    }

    // Dacă search text activ → intersectează cu filteredOrgs (care au și căutarea)
    if (qOps.trim()) {
      const ids = new Set(filteredOrgs.map((o) => o.organizationId));
      return base.filter((o) => ids.has(o.organizationId));
    }

    return base;
  }, [
    networkOrgs.data,
    statusFilter,
    serviceFilter,
    qOps,
    filteredOrgs,
    selectedPlace,
  ]);

  function selectLocation(location: {
    id: string;
    name: string;
    kind: string;
    countryCode: string | null;
    lat: number | null;
    lng: number | null;
  }) {
    setSelectedPlace(location);
    focusFromPlace(location);
    setSidebarTab("operators");
    const params = new URLSearchParams(searchParams.toString());
    params.set("location", location.id);
    router.replace(`${pathname}?${params.toString()}`);
  }

  function clearSelectedPlace() {
    setSelectedPlace(null);
    setGeoFocus(null);
    const params = new URLSearchParams(searchParams.toString());
    params.delete("location");
    router.replace(`${pathname}?${params.toString()}`);
  }

  return (
    /* Full-height layout: sidebar left, map right */
    <div className="flex h-[calc(100vh-3.5rem-3rem)] min-h-[520px] flex-col gap-0 overflow-hidden rounded-xl border border-border lg:flex-row">

      {/* ── Left sidebar ── */}
      <div className="flex w-full shrink-0 flex-col border-b border-border bg-card lg:w-72 lg:border-b-0 lg:border-r">
        {/* Header */}
        <div className="border-b border-border p-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <MapPinned className="h-4 w-4 text-primary" />
              <span className="text-sm font-semibold">Network</span>
            </div>
            <Button size="sm" asChild className="h-7 text-xs">
              <Link
                href={
                  selectedLocationId
                    ? `/organizations/new?coverage_location_id=${selectedLocationId}`
                    : "/organizations/new"
                }
              >
                <Plus className="h-3 w-3" />
                Add
              </Link>
            </Button>
          </div>

          {/* Tab switcher */}
          <div className="mt-2 flex rounded-md border border-border p-0.5">
            <button
              type="button"
              onClick={() => setSidebarTab("operators")}
              className={`flex-1 rounded py-1 text-xs font-medium transition-colors ${
                sidebarTab === "operators"
                  ? "bg-muted text-foreground"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Operators
            </button>
            <button
              type="button"
              onClick={() => setSidebarTab("places")}
              className={`flex-1 rounded py-1 text-xs font-medium transition-colors ${
                sidebarTab === "places"
                  ? "bg-muted text-foreground"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Places
            </button>
          </div>
          {selectedPlace ? (
            <div className="mt-2 flex items-center gap-2 rounded-lg border border-primary/30 bg-primary/5 px-2.5 py-1.5 text-xs">
              <span className="min-w-0 flex-1 truncate font-medium">
                Place: {selectedPlace.name}
                {selectedPlace.countryCode
                  ? ` · ${selectedPlace.countryCode}`
                  : ""}
              </span>
              <button
                type="button"
                onClick={clearSelectedPlace}
                className="shrink-0 text-muted-foreground hover:text-foreground"
              >
                Clear
              </button>
            </div>
          ) : null}
        </div>

        {/* Sidebar content */}
        <div className="flex-1 overflow-y-auto">
          {sidebarTab === "operators" ? (
            <>
              {/* Search operators */}
              <div className="sticky top-0 z-10 border-b border-border bg-card px-2 py-2">
                <div className="relative">
                  <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    className="h-8 pl-8 text-sm"
                    placeholder="Operator, city, country, airport…"
                    value={qOps}
                    onChange={(e) => {
                      const val = e.target.value;
                      if (!val && qOps) setResetViewKey((k) => k + 1);
                      setQOps(val);
                    }}
                    autoComplete="off"
                  />
                </div>
              </div>
              {/* Operators list */}
              {networkOrgs.isLoading ? (
              <div className="space-y-1 p-2">
                {Array.from({ length: 6 }).map((_, i) => (
                  <Skeleton key={i} className="h-14 w-full rounded-lg" />
                ))}
              </div>
            ) : filteredOrgs.length === 0 ? (
              <div className="p-4 text-center">
                <p className="text-sm text-muted-foreground">No operators yet</p>
                <Button size="sm" variant="outline" className="mt-3" asChild>
                  <Link href="/organizations/new">Add first operator</Link>
                </Button>
              </div>
            ) : (
              <div className="space-y-px p-1.5">
                {filteredOrgs.map((org, idx) => {
                  const hasPin =
                    org.primaryBaseLat != null && org.primaryBaseLng != null;
                  const isActive = focusedOrgId === org.organizationId;
                  return (
                    <button
                      key={`${org.organizationId}-${org.serviceCode ?? "x"}-${idx}`}
                      type="button"
                      onClick={() => {
                        if (hasPin) focusOrg(org.organizationId);
                      }}
                      className={`flex w-full items-start gap-2.5 rounded-lg px-2.5 py-2 text-left transition-colors ${
                        isActive
                          ? "bg-primary/10 ring-1 ring-primary/20"
                          : "hover:bg-muted/60"
                      } ${!hasPin ? "opacity-60" : ""}`}
                      title={hasPin ? "Click to locate on map" : "No map coordinates yet"}
                    >
                      {/* Status dot */}
                      <span
                        className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${statusDot(org.relationshipStatus)}`}
                      />
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5">
                          <span className="truncate text-sm font-medium">{org.displayName}</span>
                          {org.isTest ? <TestBadge /> : null}
                        </div>
                        <p className="mt-0.5 truncate text-[11px] text-muted-foreground">
                          {[
                            org.primaryBaseCity,
                            org.primaryBaseCountryCode ?? org.legalCountryCode,
                          ]
                            .filter(Boolean)
                            .join(", ") || "No base"}
                          {org.coverageAirportIatas.length > 0
                            ? ` · ${org.coverageAirportIatas.slice(0, 3).join(", ")}`
                            : ""}
                        </p>
                        {org.googleReviewCount != null ? (
                          <p className="mt-0.5 flex items-center gap-1 text-[11px] text-amber-700 dark:text-amber-400">
                            <Star className="h-3 w-3 fill-current" />
                            <span>
                              {org.googleRating != null ? `${org.googleRating.toFixed(1)} · ` : ""}
                              {org.googleReviewCount}
                              {org.googleReviewCount >= 200 ? "+" : ""} reviews
                            </span>
                          </p>
                        ) : (
                          <p className="mt-0.5 text-[11px] text-muted-foreground/70">
                            Google reviews: unknown
                          </p>
                        )}
                      </div>
                      {hasPin ? (
                        <MapPinned className="mt-0.5 h-3.5 w-3.5 shrink-0 text-muted-foreground/50" />
                      ) : null}
                    </button>
                  );
                })}
              </div>
            )}
            </>
          ) : (
            /* Places catalog list */
            <>
              {/* Search places */}
              <div className="sticky top-0 z-10 border-b border-border bg-card px-2 py-2">
                <div className="relative">
                  <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    className="h-8 pl-8 text-sm"
                    placeholder="Country, city, airport, IATA…"
                    value={qPlaces}
                    onChange={(e) => {
                      const val = e.target.value;
                      setQPlaces(val);
                      geocodeQuery(val);
                    }}
                    autoComplete="off"
                  />
                </div>
              </div>
              <div className="space-y-px p-1.5">
              {locations.isLoading ? (
                Array.from({ length: 6 }).map((_, i) => (
                  <Skeleton key={i} className="h-10 w-full rounded-lg" />
                ))
              ) : (locations.data ?? []).length === 0 ? (
                <p className="p-4 text-center text-sm text-muted-foreground">
                  {qPlaces.length >= 2 ? "No catalog matches." : "Type to search places…"}
                </p>
              ) : (
                (locations.data ?? []).map((location) => {
                  const active = location.id === selectedLocationId;
                  return (
                    <button
                      key={location.id}
                      type="button"
                      onClick={() =>
                        selectLocation({
                          id: location.id,
                          name: location.name,
                          kind: location.kind,
                          countryCode: location.countryCode,
                          lat: location.lat,
                          lng: location.lng,
                        })
                      }
                      className={`flex w-full items-center justify-between rounded-lg px-2.5 py-2 text-left text-sm transition-colors ${
                        active ? "bg-primary/10 text-foreground" : "hover:bg-muted/60"
                      }`}
                    >
                      <span className="min-w-0 truncate font-medium">
                        {location.name}
                        {location.iata ? (
                          <span className="ml-1.5 text-xs text-muted-foreground">
                            {location.iata}
                          </span>
                        ) : null}
                      </span>
                      <span className="ml-2 shrink-0 text-[11px] text-muted-foreground">
                        {location.kind === "COUNTRY"
                          ? location.countryCode ?? "Country"
                          : location.countryCode ?? location.kind}
                      </span>
                    </button>
                  );
                })
              )}
              </div>
            </>
          )}
        </div>

      </div>

      {/* ── Map — fills remaining space ── */}
      <div className="relative min-h-[320px] flex-1 lg:min-h-0">

        {/* ── Filter bar deasupra hărții ── */}
        <div className="absolute left-0 right-0 top-0 z-20 flex flex-wrap items-center gap-2 border-b border-border/60 bg-background/80 px-3 py-2 backdrop-blur">
          {/* Status toggle */}
          <div className="flex gap-1 rounded-full border border-border/60 bg-card/80 p-0.5">
            {(["all", "active"] as const).map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => setStatusFilter(s)}
                className={`rounded-full px-2.5 py-0.5 text-[11px] font-semibold transition-all ${
                  statusFilter === s
                    ? "bg-foreground text-background shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {s === "all" ? "All" : "Active"}
              </button>
            ))}
          </div>

          {/* Separator */}
          <div className="h-4 w-px bg-border/60" />

          {/* Service filter pills — empty set = toate; click = doar acel serviciu (sau multi-select) */}
          {SERVICE_FILTERS.map((svc) => {
            const isOn = serviceFilter.size === 0 || serviceFilter.has(svc.code);
            return (
              <button
                key={svc.code}
                type="button"
                onClick={() => {
                  setServiceFilter((prev) => {
                    // Toate vizibile → click pe un serviciu = doar acela
                    if (prev.size === 0) {
                      return new Set([svc.code]);
                    }
                    const next = new Set(prev);
                    if (next.has(svc.code)) {
                      next.delete(svc.code);
                      // Ultimul scos → înapoi la toate
                      return next.size === 0 ? new Set() : next;
                    }
                    next.add(svc.code);
                    // Dacă le-ai selectat pe toate → set gol (= toate)
                    return next.size === SERVICE_FILTERS.length ? new Set() : next;
                  });
                }}
                className="flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[11px] font-semibold transition-all"
                style={{
                  borderColor: isOn ? svc.color : "rgba(128,128,128,0.25)",
                  color: isOn ? svc.color : "var(--muted-foreground)",
                  background: isOn ? `${svc.color}18` : "transparent",
                  boxShadow: isOn ? `0 0 8px ${svc.color}50` : "none",
                  opacity: isOn ? 1 : 0.5,
                }}
              >
                <span
                  className="inline-block h-1.5 w-1.5 rounded-full"
                  style={{ background: isOn ? svc.color : "currentColor", boxShadow: isOn ? `0 0 4px ${svc.color}` : "none" }}
                />
                {svc.label}
              </button>
            );
          })}

          {/* Reset dacă sunt filtre active */}
          {serviceFilter.size > 0 && (
            <button
              type="button"
              onClick={() => setServiceFilter(new Set())}
              className="ml-1 rounded-full border border-border/40 px-2 py-0.5 text-[10px] text-muted-foreground hover:text-foreground transition-colors"
            >
              Reset
            </button>
          )}

          {/* Pins counter */}
          <span className="ml-auto text-[11px] text-muted-foreground">
            {mapOrgs.filter((o) => o.primaryBaseLat != null).length} on map
          </span>
        </div>
        {/* Place suppliers overlay when a place is selected */}
        {selectedLocationId && (suppliers.data?.length ?? 0) > 0 ? (
          <div className="absolute left-3 top-[52px] z-10 max-h-48 w-64 overflow-y-auto rounded-xl border border-border bg-card/95 shadow-lg backdrop-blur">
            <div className="border-b border-border px-3 py-2">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                Covering this place
              </p>
            </div>
            {(suppliers.data ?? []).map((row) => (
              <Link
                key={row.organizationId}
                href={`/organizations/${row.organizationId}`}
                className="flex items-center justify-between gap-2 px-3 py-2 text-sm hover:bg-muted/60"
              >
                <span className="truncate font-medium">{row.displayName}</span>
                <div className="flex shrink-0 gap-1">
                  <RelationshipStatusBadge status={row.relationshipStatus} />
                </div>
              </Link>
            ))}
          </div>
        ) : null}

        <div className="absolute inset-0 top-[44px]">
          <NetworkMap
            organizations={mapOrgs}
            focus={mapFocus}
            focusedOrgId={focusedOrgId}
            flashingOrgId={flashingOrgId}
            fitToPins={qOps.trim().length > 0}
            resetViewKey={resetViewKey}
            height="100%"
          />
        </div>
      </div>
    </div>
  );
}
