"use client";

import { useMemo, useState } from "react";
import { Check, ChevronsUpDown } from "lucide-react";
import { COUNTRIES, type CountryOption } from "@/shared/lib/countries";
import { cn } from "@/shared/lib/utils";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";

type Props = {
  value: string;
  onChange: (country: CountryOption) => void;
  className?: string;
};

export function CountryCombobox({ value, onChange, className }: Props) {
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const selected = COUNTRIES.find((c) => c.code === value) ?? null;

  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase();
    if (!needle) return COUNTRIES;
    return COUNTRIES.filter(
      (c) =>
        c.name.toLowerCase().includes(needle) ||
        c.code.toLowerCase().includes(needle) ||
        c.dial.includes(needle),
    );
  }, [q]);

  return (
    <div className={cn("relative", className)}>
      <Button
        type="button"
        variant="outline"
        className="h-10 w-full justify-between px-3 font-normal"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
      >
        <span className="truncate text-left">
          {selected
            ? `${selected.name} (${selected.code}) · ${selected.dial}`
            : "Select country"}
        </span>
        <ChevronsUpDown className="h-4 w-4 opacity-50" />
      </Button>

      {open ? (
        <div className="absolute z-50 mt-2 w-full rounded-md border border-border bg-card p-2 shadow-lg">
          <Input
            autoFocus
            placeholder="Search country, ISO or +dial…"
            value={q}
            onChange={(event) => setQ(event.target.value)}
            className="mb-2"
          />
          <div className="max-h-56 overflow-y-auto overscroll-contain">
            {filtered.length === 0 ? (
              <p className="px-2 py-3 text-sm text-muted-foreground">
                No countries match
              </p>
            ) : (
              filtered.map((country) => {
                const active = country.code === value;
                return (
                  <button
                    key={country.code}
                    type="button"
                    className={cn(
                      "flex w-full items-center justify-between gap-2 rounded-md px-2 py-2.5 text-left text-sm hover:bg-muted",
                      active && "bg-muted",
                    )}
                    onClick={() => {
                      onChange(country);
                      setOpen(false);
                      setQ("");
                    }}
                  >
                    <span className="min-w-0 truncate">
                      {country.name}{" "}
                      <span className="text-muted-foreground">
                        ({country.code})
                      </span>
                    </span>
                    <span className="flex shrink-0 items-center gap-2 text-xs text-muted-foreground">
                      {country.dial}
                      {active ? <Check className="h-4 w-4 text-primary" /> : null}
                    </span>
                  </button>
                );
              })
            )}
          </div>
        </div>
      ) : null}
    </div>
  );
}

export function FieldHint({ children }: { children: React.ReactNode }) {
  return <p className="text-xs leading-relaxed text-muted-foreground">{children}</p>;
}
