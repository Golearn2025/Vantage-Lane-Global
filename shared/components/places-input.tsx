"use client";

import { useEffect, useRef, useState } from "react";
import { MapPin } from "lucide-react";
import { cn } from "@/shared/lib/utils";

type Suggestion = {
  placeId: string;
  description: string;
  mainText: string;
  secondaryText: string;
};

type Props = {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
};

export type PlaceResult = {
  description: string;
  placeId: string;
  lat: number;
  lng: number;
};

type PropsWithCoords = {
  value: string;
  onSelect: (result: PlaceResult) => void;
  placeholder?: string;
  className?: string;
};

declare global {
  interface Window {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    google: any;
    __placesScriptLoaded?: boolean;
  }
}

function loadGoogleScript(): Promise<void> {
  if (window.__placesScriptLoaded) return Promise.resolve();
  return new Promise((resolve, reject) => {
    const existing = document.getElementById("google-places-script");
    if (existing) {
      existing.addEventListener("load", () => resolve());
      return;
    }
    const script = document.createElement("script");
    script.id = "google-places-script";
    script.src = `https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}&libraries=places`;
    script.async = true;
    script.defer = true;
    script.onload = () => {
      window.__placesScriptLoaded = true;
      resolve();
    };
    script.onerror = reject;
    document.head.appendChild(script);
  });
}

/* ─── PlacesInputWithCoords — resolves lat/lng via Geocoder ── */
export function PlacesInputWithCoords({ value, onSelect, placeholder, className }: PropsWithCoords) {
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [open, setOpen] = useState(false);
  const [activeIdx, setActiveIdx] = useState(-1);
  const [loading, setLoading] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const serviceRef = useRef<any>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const geocoderRef = useRef<any>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadGoogleScript().then(() => {
      if (window.google?.maps?.places) {
        serviceRef.current = new window.google.maps.places.AutocompleteService();
        geocoderRef.current = new window.google.maps.Geocoder();
      }
    });
  }, []);

  function fetchSuggestions(input: string) {
    if (!serviceRef.current || input.length < 2) { setSuggestions([]); setOpen(false); return; }
    setLoading(true);
    serviceRef.current.getPlacePredictions(
      { input },
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (predictions: any[] | null, status: string) => {
        setLoading(false);
        if (status !== "OK" || !predictions) { setSuggestions([]); setOpen(false); return; }
        setSuggestions(predictions.slice(0, 5).map((p) => ({
          placeId: p.place_id,
          description: p.description,
          mainText: p.structured_formatting?.main_text ?? p.description,
          secondaryText: p.structured_formatting?.secondary_text ?? "",
        })));
        setOpen(true);
        setActiveIdx(-1);
      },
    );
  }

  function pick(s: Suggestion) {
    setOpen(false);
    setSuggestions([]);
    if (!geocoderRef.current) {
      onSelect({ description: s.description, placeId: s.placeId, lat: 0, lng: 0 });
      return;
    }
    geocoderRef.current.geocode(
      { placeId: s.placeId },
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (results: any[], status: string) => {
        if (status === "OK" && results[0]?.geometry?.location) {
          const loc = results[0].geometry.location;
          onSelect({ description: s.description, placeId: s.placeId, lat: loc.lat(), lng: loc.lng() });
        } else {
          onSelect({ description: s.description, placeId: s.placeId, lat: 0, lng: 0 });
        }
      },
    );
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const v = e.target.value;
    onSelect({ description: v, placeId: "", lat: 0, lng: 0 });
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => fetchSuggestions(v), 250);
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (!open) return;
    if (e.key === "ArrowDown") { e.preventDefault(); setActiveIdx((i) => Math.min(i + 1, suggestions.length - 1)); }
    else if (e.key === "ArrowUp") { e.preventDefault(); setActiveIdx((i) => Math.max(i - 1, 0)); }
    else if (e.key === "Enter" && activeIdx >= 0) { e.preventDefault(); pick(suggestions[activeIdx]); }
    else if (e.key === "Escape") setOpen(false);
  }

  useEffect(() => {
    function handler(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div ref={containerRef} className="relative">
      <input
        type="text"
        value={value}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        onFocus={() => suggestions.length > 0 && setOpen(true)}
        placeholder={placeholder}
        autoComplete="off"
        className={cn(
          "flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors",
          "placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring",
          className,
        )}
      />
      {loading && (
        <span className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2">
          <svg className="h-3.5 w-3.5 animate-spin text-muted-foreground" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4l3-3-3-3V0a12 12 0 100 24v-4l-3 3 3 3v4A12 12 0 014 12z" />
          </svg>
        </span>
      )}
      {open && suggestions.length > 0 && (
        <div className="absolute z-50 top-full mt-2 left-0 right-0 overflow-hidden rounded-2xl border border-border/60 bg-card shadow-2xl">
          <div className="px-3 pt-2.5 pb-1">
            <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
              Suggestions
            </p>
          </div>
          <div className="pb-2">
            {suggestions.map((s, i) => (
              <button
                key={s.placeId}
                type="button"
                onMouseDown={() => pick(s)}
                className={cn(
                  "flex w-full items-center gap-3 px-3 py-2.5 text-left transition-colors",
                  i === activeIdx ? "bg-primary/8" : "hover:bg-muted/50",
                )}
              >
                <div className={cn(
                  "flex h-8 w-8 shrink-0 items-center justify-center rounded-xl",
                  i === activeIdx ? "bg-primary/15" : "bg-muted",
                )}>
                  <MapPin className={cn("h-4 w-4", i === activeIdx ? "text-primary" : "text-muted-foreground")} />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold leading-tight">{s.mainText}</p>
                  {s.secondaryText && (
                    <p className="truncate text-xs text-muted-foreground leading-tight mt-0.5">{s.secondaryText}</p>
                  )}
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

/* ─── PlacesInput — simple, no coords ───────────────────────── */
export function PlacesInput({ value, onChange, placeholder, className }: Props) {
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [open, setOpen] = useState(false);
  const [activeIdx, setActiveIdx] = useState(-1);
  const [loading, setLoading] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const serviceRef = useRef<any>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Load Google script once
  useEffect(() => {
    loadGoogleScript().then(() => {
      if (window.google?.maps?.places) {
        serviceRef.current = new window.google.maps.places.AutocompleteService();
      }
    });
  }, []);

  function fetchSuggestions(input: string) {
    if (!serviceRef.current || input.length < 2) {
      setSuggestions([]);
      setOpen(false);
      return;
    }
    setLoading(true);
    serviceRef.current.getPlacePredictions(
      { input },
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (predictions: any[] | null, status: string) => {
        setLoading(false);
        if (status !== "OK" || !predictions) {
          setSuggestions([]);
          setOpen(false);
          return;
        }
        setSuggestions(
          predictions.slice(0, 5).map((p) => ({
            placeId: p.place_id,
            description: p.description,
            mainText: p.structured_formatting?.main_text ?? p.description,
            secondaryText: p.structured_formatting?.secondary_text ?? "",
          })),
        );
        setOpen(true);
        setActiveIdx(-1);
      },
    );
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const v = e.target.value;
    onChange(v);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => fetchSuggestions(v), 250);
  }

  function pick(s: Suggestion) {
    onChange(s.description);
    setSuggestions([]);
    setOpen(false);
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (!open) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIdx((i) => Math.min(i + 1, suggestions.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIdx((i) => Math.max(i - 1, 0));
    } else if (e.key === "Enter" && activeIdx >= 0) {
      e.preventDefault();
      pick(suggestions[activeIdx]);
    } else if (e.key === "Escape") {
      setOpen(false);
    }
  }

  // Close on outside click
  useEffect(() => {
    function handler(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div ref={containerRef} className="relative">
      <input
        type="text"
        value={value}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        onFocus={() => suggestions.length > 0 && setOpen(true)}
        placeholder={placeholder}
        autoComplete="off"
        className={cn(
          "flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors",
          "placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring",
          className,
        )}
      />

      {/* Spinner */}
      {loading && (
        <span className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2">
          <svg className="h-3.5 w-3.5 animate-spin text-muted-foreground" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4l3-3-3-3V0a12 12 0 100 24v-4l-3 3 3 3v4A12 12 0 014 12z" />
          </svg>
        </span>
      )}

      {/* Dropdown */}
      {open && suggestions.length > 0 && (
        <div className="absolute z-50 top-full mt-2 left-0 right-0 overflow-hidden rounded-2xl border border-border/60 bg-card shadow-2xl">
          <div className="px-3 pt-2.5 pb-1">
            <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
              Suggestions
            </p>
          </div>
          <div className="pb-2">
            {suggestions.map((s, i) => (
              <button
                key={s.placeId}
                type="button"
                onMouseDown={() => pick(s)}
                className={cn(
                  "flex w-full items-center gap-3 px-3 py-2.5 text-left transition-colors",
                  i === activeIdx ? "bg-primary/8" : "hover:bg-muted/50",
                )}
              >
                <div className={cn(
                  "flex h-8 w-8 shrink-0 items-center justify-center rounded-xl",
                  i === activeIdx ? "bg-primary/15" : "bg-muted",
                )}>
                  <MapPin className={cn("h-4 w-4", i === activeIdx ? "text-primary" : "text-muted-foreground")} />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold leading-tight">{s.mainText}</p>
                  {s.secondaryText && (
                    <p className="truncate text-xs text-muted-foreground leading-tight mt-0.5">{s.secondaryText}</p>
                  )}
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
