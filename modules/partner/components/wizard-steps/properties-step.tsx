"use client";

import { useState } from "react";
import { Plus, Trash2, Building2, Star } from "lucide-react";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { Label } from "@/shared/ui/label";
import { Checkbox } from "@/shared/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/ui/select";

type Property = {
  id: string;
  type: string;
  name: string;
  starRating: number;
  capacity: string;
  amenities: string[];
};

const PROPERTY_TYPES = [
  "Hotel",
  "Restaurant",
  "Private Members Club",
  "Venue",
  "Spa / Wellness",
];

const AMENITIES = [
  { value: "fine_dining", label: "Fine dining" },
  { value: "spa", label: "Spa" },
  { value: "concierge", label: "Concierge" },
  { value: "helipad", label: "Helipad" },
  { value: "private_pool", label: "Private pool" },
  { value: "meeting_rooms", label: "Meeting rooms" },
];

function newProperty(): Property {
  return {
    id: crypto.randomUUID(),
    type: "",
    name: "",
    starRating: 0,
    capacity: "",
    amenities: [],
  };
}

function StarRating({
  value,
  onChange,
}: {
  value: number;
  onChange: (v: number) => void;
}) {
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          type="button"
          onClick={() => onChange(n === value ? 0 : n)}
          className="transition-transform hover:scale-110"
          aria-label={`${n} star${n > 1 ? "s" : ""}`}
        >
          <Star
            className={`h-6 w-6 ${
              n <= value
                ? "fill-primary text-primary"
                : "fill-none text-muted-foreground"
            }`}
          />
        </button>
      ))}
    </div>
  );
}

export function PropertiesStep() {
  const [properties, setProperties] = useState<Property[]>([newProperty()]);

  function update<K extends keyof Property>(
    id: string,
    field: K,
    value: Property[K],
  ) {
    setProperties((prev) =>
      prev.map((p) => (p.id === id ? { ...p, [field]: value } : p)),
    );
  }

  function toggleAmenity(id: string, amenity: string) {
    setProperties((prev) =>
      prev.map((p) =>
        p.id === id
          ? {
              ...p,
              amenities: p.amenities.includes(amenity)
                ? p.amenities.filter((a) => a !== amenity)
                : [...p.amenities, amenity],
            }
          : p,
      ),
    );
  }

  function remove(id: string) {
    setProperties((prev) => prev.filter((p) => p.id !== id));
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl tracking-tight">Properties</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Add the hospitality properties you operate or represent.
        </p>
      </div>

      <div className="space-y-4">
        {properties.map((p, idx) => (
          <div
            key={p.id}
            className="rounded-2xl border border-border/60 bg-card p-5 shadow-sm space-y-4"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Building2 className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">Property {idx + 1}</span>
              </div>
              {properties.length > 1 && (
                <button
                  type="button"
                  onClick={() => remove(p.id)}
                  className="text-muted-foreground hover:text-destructive transition-colors"
                  aria-label="Remove property"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              )}
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label>Property type</Label>
                <Select
                  value={p.type}
                  onValueChange={(v) => update(p.id, "type", v)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    {PROPERTY_TYPES.map((t) => (
                      <SelectItem key={t} value={t}>
                        {t}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label>Property name</Label>
                <Input
                  placeholder="e.g. The Connaught"
                  value={p.name}
                  onChange={(e) => update(p.id, "name", e.target.value)}
                />
              </div>

              <div className="space-y-1.5 sm:col-span-2">
                <Label>Star rating</Label>
                <StarRating
                  value={p.starRating}
                  onChange={(v) => update(p.id, "starRating", v)}
                />
              </div>

              <div className="space-y-1.5">
                <Label>Number of rooms / covers / capacity</Label>
                <Input
                  inputMode="numeric"
                  placeholder="e.g. 120"
                  value={p.capacity}
                  onChange={(e) => update(p.id, "capacity", e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Key amenities</Label>
              <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                {AMENITIES.map((a) => (
                  <label
                    key={a.value}
                    className="flex cursor-pointer items-center gap-2.5 rounded-xl border border-border/60 bg-card/40 px-3 py-2.5 text-sm hover:bg-muted/40 transition-colors"
                  >
                    <Checkbox
                      checked={p.amenities.includes(a.value)}
                      onCheckedChange={() => toggleAmenity(p.id, a.value)}
                    />
                    <span>{a.label}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>

      <Button
        type="button"
        variant="outline"
        className="w-full rounded-full gap-2"
        onClick={() => setProperties((prev) => [...prev, newProperty()])}
      >
        <Plus className="h-4 w-4" />
        Add another property
      </Button>
    </div>
  );
}
