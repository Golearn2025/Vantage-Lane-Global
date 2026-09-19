"use client";

import { useMemo, useState } from "react";
import {
  DIAL_COUNTRIES,
  findDialCountry,
  toE164,
  type DialCountry,
} from "@/shared/lib/phone/dial-countries";
import { Input } from "@/shared/ui/input";
import { Label } from "@/shared/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/ui/select";
import { cn } from "@/shared/lib/utils";

type PhoneInputProps = {
  id?: string;
  label?: string;
  valueE164: string;
  onChangeE164: (e164: string) => void;
  defaultIso2?: string;
  className?: string;
  error?: string | null;
};

function splitE164(
  e164: string,
  fallbackIso: string,
): { country: DialCountry; national: string } {
  const sorted = [...DIAL_COUNTRIES].sort(
    (a, b) => b.dial.length - a.dial.length,
  );
  const match = sorted.find((c) => e164.startsWith(c.dial));
  if (match) {
    return { country: match, national: e164.slice(match.dial.length) };
  }
  return { country: findDialCountry(fallbackIso), national: e164.replace(/^\+/, "") };
}

export function PhoneInput({
  id = "phone",
  label = "Phone / WhatsApp",
  valueE164,
  onChangeE164,
  defaultIso2 = "GB",
  className,
  error,
}: PhoneInputProps) {
  const initial = useMemo(
    () => splitE164(valueE164 || "", defaultIso2),
    // only seed once from default
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );
  const [iso2, setIso2] = useState(initial.country.iso2);
  const [national, setNational] = useState(initial.national);
  const country = findDialCountry(iso2);

  function emit(nextIso: string, nextNational: string) {
    const c = findDialCountry(nextIso);
    onChangeE164(toE164(c.dial, nextNational));
  }

  return (
    <div className={cn("space-y-2", className)}>
      {label ? <Label htmlFor={id}>{label}</Label> : null}
      <div className="flex gap-2">
        <Select
          value={iso2}
          onValueChange={(v) => {
            setIso2(v);
            emit(v, national);
          }}
        >
          <SelectTrigger className="w-[8.5rem] shrink-0" aria-label="Country code">
            <SelectValue>
              <span className="flex items-center gap-1.5">
                <span className="text-base leading-none">{country.flag}</span>
                <span className="text-sm">{country.dial}</span>
              </span>
            </SelectValue>
          </SelectTrigger>
          <SelectContent className="max-h-72">
            {DIAL_COUNTRIES.map((c) => (
              <SelectItem key={`${c.iso2}-${c.dial}`} value={c.iso2}>
                <span className="flex items-center gap-2">
                  <span>{c.flag}</span>
                  <span className="min-w-[3.25rem] tabular-nums">{c.dial}</span>
                  <span className="text-muted-foreground">{c.name}</span>
                </span>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Input
          id={id}
          type="tel"
          inputMode="tel"
          autoComplete="tel-national"
          placeholder="7123 456789"
          className="min-w-0 flex-1"
          value={national}
          onChange={(e) => {
            const next = e.target.value.replace(/[^\d\s]/g, "");
            setNational(next);
            emit(iso2, next);
          }}
        />
      </div>
      {error ? <p className="text-xs text-danger">{error}</p> : null}
    </div>
  );
}
