"use client";

import { useState } from "react";
import { X, Plus } from "lucide-react";
import { Input } from "@/shared/ui/input";
import { Label } from "@/shared/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/ui/select";

const RESPONSE_TIME_OPTIONS = [
  { value: "1hr", label: "Within 1 hour" },
  { value: "4hr", label: "Within 4 hours" },
  { value: "24hr", label: "Within 24 hours" },
  { value: "same_day", label: "Same day" },
];

const ENGAGEMENT_OPTIONS = [
  { value: "per_request", label: "Per request" },
  { value: "monthly_retainer", label: "Monthly retainer" },
  { value: "annual_retainer", label: "Annual retainer" },
];

export function AvailabilityStep() {
  const [tagInput, setTagInput] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [responseTime, setResponseTime] = useState("");
  const [is247, setIs247] = useState(false);
  const [hoursFrom, setHoursFrom] = useState("09:00");
  const [hoursTo, setHoursTo] = useState("21:00");
  const [engagement, setEngagement] = useState("");

  function addTag() {
    const t = tagInput.trim();
    if (t && !tags.includes(t)) {
      setTags((prev) => [...prev, t]);
    }
    setTagInput("");
  }

  function removeTag(tag: string) {
    setTags((prev) => prev.filter((t) => t !== tag));
  }

  function handleTagKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      addTag();
    }
    if (e.key === "Backspace" && tagInput === "" && tags.length > 0) {
      setTags((prev) => prev.slice(0, -1));
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl tracking-tight">Availability</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Set your coverage areas, response commitments, and operational hours.
        </p>
      </div>

      <div className="rounded-2xl border border-border/60 bg-card p-5 shadow-sm space-y-5">
        {/* Cities / regions covered */}
        <div className="space-y-1.5">
          <Label>Cities / regions covered</Label>
          <div className="flex min-h-[2.75rem] flex-wrap gap-2 rounded-lg border border-border bg-background px-3 py-2">
            {tags.map((tag) => (
              <span
                key={tag}
                className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary"
              >
                {tag}
                <button
                  type="button"
                  onClick={() => removeTag(tag)}
                  className="hover:text-destructive transition-colors"
                  aria-label={`Remove ${tag}`}
                >
                  <X className="h-3 w-3" />
                </button>
              </span>
            ))}
            <input
              className="flex-1 min-w-[6rem] bg-transparent text-sm outline-none placeholder:text-muted-foreground"
              placeholder={tags.length === 0 ? "Type a city and press Enter…" : "Add more…"}
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyDown={handleTagKeyDown}
              onBlur={addTag}
            />
          </div>
          <p className="text-xs text-muted-foreground">
            Press Enter or comma to add each city / region.
          </p>
        </div>

        {/* Response time */}
        <div className="space-y-1.5">
          <Label>Response time commitment</Label>
          <Select value={responseTime} onValueChange={setResponseTime}>
            <SelectTrigger>
              <SelectValue placeholder="Select response time" />
            </SelectTrigger>
            <SelectContent>
              {RESPONSE_TIME_OPTIONS.map((o) => (
                <SelectItem key={o.value} value={o.value}>
                  {o.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Hours of operation */}
        <div className="space-y-2">
          <Label>Hours of operation</Label>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setIs247((v) => !v)}
              className={`rounded-full border px-4 py-1.5 text-sm font-medium transition-colors ${
                is247
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border text-muted-foreground hover:bg-muted"
              }`}
            >
              24 / 7
            </button>
            {!is247 && (
              <div className="flex items-center gap-2">
                <Input
                  type="time"
                  value={hoursFrom}
                  onChange={(e) => setHoursFrom(e.target.value)}
                  className="w-32"
                />
                <span className="text-sm text-muted-foreground">to</span>
                <Input
                  type="time"
                  value={hoursTo}
                  onChange={(e) => setHoursTo(e.target.value)}
                  className="w-32"
                />
              </div>
            )}
          </div>
        </div>

        {/* Minimum engagement */}
        <div className="space-y-1.5">
          <Label>Minimum engagement</Label>
          <Select value={engagement} onValueChange={setEngagement}>
            <SelectTrigger>
              <SelectValue placeholder="Select minimum engagement" />
            </SelectTrigger>
            <SelectContent>
              {ENGAGEMENT_OPTIONS.map((o) => (
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
