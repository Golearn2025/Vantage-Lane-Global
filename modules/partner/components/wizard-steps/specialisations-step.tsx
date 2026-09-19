"use client";

import { useState } from "react";
import { Checkbox } from "@/shared/ui/checkbox";
import { Label } from "@/shared/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/ui/select";

const SPECIALISATIONS = [
  { value: "travel_jets", label: "Travel planning & jets" },
  { value: "dining", label: "Restaurant & dining reservations" },
  { value: "events_tickets", label: "Event tickets & access" },
  { value: "shopping_styling", label: "Personal shopping & styling" },
  { value: "property", label: "Property search & management" },
  { value: "medical", label: "Medical appointments" },
  { value: "security", label: "Security arrangements" },
];

const LANGUAGES = [
  "English",
  "French",
  "German",
  "Italian",
  "Spanish",
  "Arabic",
  "Mandarin",
  "Russian",
  "Japanese",
  "Portuguese",
  "Dutch",
  "Turkish",
];

const HNW_EXPERIENCE_OPTIONS = [
  { value: "0-2", label: "0–2 years" },
  { value: "3-5", label: "3–5 years" },
  { value: "6-10", label: "6–10 years" },
  { value: "10+", label: "10+ years" },
];

export function SpecialisationsStep() {
  const [specialisations, setSpecialisations] = useState<string[]>([]);
  const [languages, setLanguages] = useState<string[]>([]);
  const [hnwExperience, setHnwExperience] = useState("");

  function toggle<T>(setter: React.Dispatch<React.SetStateAction<T[]>>, value: T) {
    setter((prev) =>
      prev.includes(value) ? prev.filter((v) => v !== value) : [...prev, value],
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl tracking-tight">Specialisations</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Tell us about your concierge expertise and the services you offer
          to high-net-worth clients.
        </p>
      </div>

      <div className="rounded-2xl border border-border/60 bg-card p-5 shadow-sm space-y-6">
        {/* Service specialisations */}
        <div className="space-y-2">
          <Label>Service specialisations</Label>
          <div className="grid gap-2 sm:grid-cols-2">
            {SPECIALISATIONS.map((s) => (
              <label
                key={s.value}
                className="flex cursor-pointer items-center gap-2.5 rounded-xl border border-border/60 bg-card/40 px-3 py-2.5 text-sm hover:bg-muted/40 transition-colors"
              >
                <Checkbox
                  checked={specialisations.includes(s.value)}
                  onCheckedChange={() => toggle(setSpecialisations, s.value)}
                />
                <span>{s.label}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Languages */}
        <div className="space-y-2">
          <Label>Languages spoken</Label>
          <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {LANGUAGES.map((lang) => (
              <label
                key={lang}
                className="flex cursor-pointer items-center gap-2.5 rounded-xl border border-border/60 bg-card/40 px-3 py-2.5 text-sm hover:bg-muted/40 transition-colors"
              >
                <Checkbox
                  checked={languages.includes(lang)}
                  onCheckedChange={() => toggle(setLanguages, lang)}
                />
                <span>{lang}</span>
              </label>
            ))}
          </div>
        </div>

        {/* HNW experience */}
        <div className="space-y-1.5">
          <Label>HNW client experience</Label>
          <Select value={hnwExperience} onValueChange={setHnwExperience}>
            <SelectTrigger>
              <SelectValue placeholder="Select years of experience" />
            </SelectTrigger>
            <SelectContent>
              {HNW_EXPERIENCE_OPTIONS.map((o) => (
                <SelectItem key={o.value} value={o.value}>
                  {o.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
}
