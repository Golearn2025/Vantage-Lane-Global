"use client";

import { useEffect, useRef, useState } from "react";
import { MapPin } from "lucide-react";
import { cn } from "@/shared/lib/utils";
import {
  fetchGooglePlaceDetails,
  searchGooglePlaces,
} from "@/modules/network/places";

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

function SuggestionsDropdown({
  open,
  suggestions,
  activeIdx,
  onPick,
}: {
  open: boolean;
  suggestions: Suggestion[];
  activeIdx: number;
  onPick: (s: Suggestion) => void;
}) {
  if (!open || suggestions.length === 0) return null;
  return (
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
            onMouseDown={() => onPick(s)}
            className={cn(
              "flex w-full items-center gap-3 px-3 py-2.5 text-left transition-colors",
              i === activeIdx ? "bg-primary/8" : "hover:bg-muted/50",
            )}
          >
            <div
              className={cn(
                "flex h-8 w-8 shrink-0 items-center justify-center rounded-xl",
                i === activeIdx ? "bg-primary/15" : "bg-muted",
              )}
            >
              <MapPin
                className={cn(
                  "h-4 w-4",
                  i === activeIdx ? "text-primary" : "text-muted-foreground",
                )}
              />
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold leading-tight">
                {s.mainText}
              </p>
              {s.secondaryText ? (
                <p className="truncate text-xs text-muted-foreground leading-tight mt-0.5">
                  {s.secondaryText}
                </p>
              ) : null}
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

function LoadingSpinner() {
  return (
    <span className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2">
      <svg
        className="h-3.5 w-3.5 animate-spin text-muted-foreground"
        viewBox="0 0 24 24"
        fill="none"
      >
        <circle
          className="opacity-25"
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          strokeWidth="4"
        />
        <path
          className="opacity-75"
          fill="currentColor"
          d="M4 12a8 8 0 018-8v4l3-3-3-3V0a12 12 0 100 24v-4l-3 3 3 3v4A12 12 0 014 12z"
        />
      </svg>
    </span>
  );
}

const inputClass =
  "flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring";

async function loadSuggestions(input: string): Promise<Suggestion[]> {
  if (input.trim().length < 2) return [];
  const rows = await searchGooglePlaces(input.trim());
  return rows.slice(0, 5).map((p) => ({
    placeId: p.placeId,
    description: p.description,
    mainText: p.mainText,
    secondaryText: p.secondaryText ?? "",
  }));
}

/* ─── PlacesInputWithCoords — resolves lat/lng via server details ── */
export function PlacesInputWithCoords({
  value,
  onSelect,
  placeholder,
  className,
}: PropsWithCoords) {
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [open, setOpen] = useState(false);
  const [activeIdx, setActiveIdx] = useState(-1);
  const [loading, setLoading] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const requestIdRef = useRef(0);

  async function fetchSuggestions(input: string) {
    if (input.trim().length < 2) {
      setSuggestions([]);
      setOpen(false);
      return;
    }
    const requestId = ++requestIdRef.current;
    setLoading(true);
    try {
      const next = await loadSuggestions(input);
      if (requestId !== requestIdRef.current) return;
      setSuggestions(next);
      setOpen(next.length > 0);
      setActiveIdx(-1);
    } catch {
      if (requestId !== requestIdRef.current) return;
      setSuggestions([]);
      setOpen(false);
    } finally {
      if (requestId === requestIdRef.current) setLoading(false);
    }
  }

  async function pick(s: Suggestion) {
    setOpen(false);
    setSuggestions([]);
    try {
      const details = await fetchGooglePlaceDetails(s.placeId);
      onSelect({
        description: details.formattedAddress || s.description,
        placeId: s.placeId,
        lat: details.lat ?? 0,
        lng: details.lng ?? 0,
      });
    } catch {
      onSelect({
        description: s.description,
        placeId: s.placeId,
        lat: 0,
        lng: 0,
      });
    }
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const v = e.target.value;
    onSelect({ description: v, placeId: "", lat: 0, lng: 0 });
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => fetchSuggestions(v), 250);
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
      void pick(suggestions[activeIdx]);
    } else if (e.key === "Escape") setOpen(false);
  }

  useEffect(() => {
    function handler(e: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
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
        className={cn(inputClass, className)}
      />
      {loading ? <LoadingSpinner /> : null}
      <SuggestionsDropdown
        open={open}
        suggestions={suggestions}
        activeIdx={activeIdx}
        onPick={(s) => void pick(s)}
      />
    </div>
  );
}

/* ─── PlacesInput — simple address string (price simulator etc.) ── */
export function PlacesInput({ value, onChange, placeholder, className }: Props) {
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [open, setOpen] = useState(false);
  const [activeIdx, setActiveIdx] = useState(-1);
  const [loading, setLoading] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const requestIdRef = useRef(0);

  async function fetchSuggestions(input: string) {
    if (input.trim().length < 2) {
      setSuggestions([]);
      setOpen(false);
      return;
    }
    const requestId = ++requestIdRef.current;
    setLoading(true);
    try {
      const next = await loadSuggestions(input);
      if (requestId !== requestIdRef.current) return;
      setSuggestions(next);
      setOpen(next.length > 0);
      setActiveIdx(-1);
    } catch {
      if (requestId !== requestIdRef.current) return;
      setSuggestions([]);
      setOpen(false);
    } finally {
      if (requestId === requestIdRef.current) setLoading(false);
    }
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

  useEffect(() => {
    function handler(e: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
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
        className={cn(inputClass, className)}
      />
      {loading ? <LoadingSpinner /> : null}
      <SuggestionsDropdown
        open={open}
        suggestions={suggestions}
        activeIdx={activeIdx}
        onPick={pick}
      />
    </div>
  );
}
