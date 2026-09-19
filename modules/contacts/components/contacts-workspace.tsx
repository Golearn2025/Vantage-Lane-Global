"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import {
  Mail,
  MessageCircle,
  Search,
  ChevronRight,
  ExternalLink,
} from "lucide-react";
import { toast } from "sonner";
import { useContactRows } from "@/modules/contacts/hooks";
import { toMailtoBcc, toWaMeUrl } from "@/modules/contacts/api";
import type { ContactRow } from "@/modules/contacts/types";
import { RelationshipStatusBadge } from "@/shared/components/status-badges";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { Textarea } from "@/shared/ui/textarea";
import { Checkbox } from "@/shared/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/ui/select";
import { Skeleton } from "@/shared/ui/skeleton";
import { cn } from "@/shared/lib/utils";

const DEFAULT_OUTREACH = `Hi — Catalin here from Vantage Lane London.

We're a London chauffeur company building a trusted UK partner network for corporate, private aviation and concierge travel — quality over volume.

Our vehicle standard (model year 2023 or newer):

• Executive Sedan — Mercedes E-Class / EQE, BMW 5 Series / i5
• Luxury Sedan — Mercedes S-Class, BMW 7 Series / i7
• Luxury SUV — Range Rover Autobiography, Cadillac Escalade / Escalade ESV
• Luxury MPV — Mercedes V-Class
• Executive Van / Sprinter — Mercedes Sprinter (optional)

Also welcome if you have them: Maybach, Rolls-Royce, and similar ultra-luxury.

We're looking for serious local partners who can cover their city and main airport to that standard.

Two quick questions:
1) Would you be open to collaborating with us on that basis?
2) What areas / airports can you reliably cover from your side?

If it's a fit, next step is a simple partner link where you can add rates and fleet — no obligation at this stage.

Happy to answer anything here on WhatsApp.

Thanks,
Catalin
Vantage Lane London
https://vantage-lane.com/`;

function isMobileWhatsapp(value: string | null | undefined): boolean {
  if (!value) return false;
  const digits = value.replace(/[^\d+]/g, "");
  return (
    digits.startsWith("+447") ||
    digits.startsWith("+3538") ||
    digits.startsWith("+336") ||
    digits.startsWith("+337") ||
    digits.startsWith("+4915") ||
    digits.startsWith("+4916") ||
    digits.startsWith("+4917") ||
    digits.startsWith("+417") ||
    digits.startsWith("+316") ||
    digits.startsWith("+393") ||
    digits.startsWith("+346") ||
    digits.startsWith("+324") ||
    digits.startsWith("+436") ||
    digits.startsWith("+3519") ||
    digits.startsWith("+4206") ||
    digits.startsWith("+485")
  );
}

function useUrlFilters() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const filters = {
    q: searchParams.get("q") ?? "",
    city: searchParams.get("city") ?? "all",
    country: searchParams.get("country") ?? "all",
    channel: (searchParams.get("channel") ?? "all") as
      | "all"
      | "whatsapp"
      | "email"
      | "both"
      | "none",
  };

  function setParam(key: string, value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (!value || value === "all") params.delete(key);
    else params.set(key, value);
    router.replace(`${pathname}?${params.toString()}`);
  }

  return { filters, setParam };
}

export function ContactsWorkspace() {
  const { filters, setParam } = useUrlFilters();
  const { data, isLoading, isError, error, refetch, isFetching } =
    useContactRows(filters);
  const [selected, setSelected] = useState<Record<string, boolean>>({});
  const [message, setMessage] = useState(DEFAULT_OUTREACH);
  const [emailSubject, setEmailSubject] = useState(
    "Vantage Lane London — UK chauffeur partnership",
  );
  const [waQueue, setWaQueue] = useState<ContactRow[]>([]);
  const [waIndex, setWaIndex] = useState(0);

  const rows = data ?? [];
  const cities = useMemo(() => {
    const set = new Set(
      (data ?? []).map((r) => r.city).filter((c): c is string => Boolean(c)),
    );
    if (filters.city !== "all") set.add(filters.city);
    return [...set].sort();
  }, [data, filters.city]);

  const selectedRows = useMemo(
    () => rows.filter((r) => selected[r.organizationId]),
    [rows, selected],
  );
  const selectedWithWa = selectedRows.filter((r) =>
    isMobileWhatsapp(r.whatsappE164),
  );
  const selectedWithEmail = selectedRows.filter((r) => r.email?.trim());

  const allSelected =
    rows.length > 0 && rows.every((r) => selected[r.organizationId]);

  function toggleAll(value: boolean) {
    if (!value) {
      setSelected({});
      return;
    }
    const next: Record<string, boolean> = {};
    for (const r of rows) next[r.organizationId] = true;
    setSelected(next);
  }

  function openBulkEmail() {
    if (!selectedWithEmail.length) {
      toast.error("Niciun email pe selecție");
      return;
    }
    const href = toMailtoBcc(
      selectedWithEmail.map((r) => r.email!),
      emailSubject,
      message,
    );
    window.location.href = href;
    toast.success(`Mailto deschis pentru ${selectedWithEmail.length} contacte`);
  }

  function startWaQueue() {
    if (!selectedWithWa.length) {
      toast.error("Niciun WhatsApp mobil (+447) pe selecție");
      return;
    }
    setWaQueue(selectedWithWa);
    setWaIndex(0);
    const first = selectedWithWa[0];
    window.open(toWaMeUrl(first.whatsappE164!, message), "_blank");
    toast.message(
      `WhatsApp 1/${selectedWithWa.length}: ${first.displayName}`,
    );
  }

  function nextWa() {
    if (!waQueue.length) return;
    const next = waIndex + 1;
    if (next >= waQueue.length) {
      toast.success("Coadă WhatsApp terminată");
      setWaQueue([]);
      setWaIndex(0);
      return;
    }
    setWaIndex(next);
    const row = waQueue[next];
    window.open(toWaMeUrl(row.whatsappE164!, message), "_blank");
    toast.message(`WhatsApp ${next + 1}/${waQueue.length}: ${row.displayName}`);
  }

  if (isLoading) {
    return (
      <div className="space-y-3">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-72 w-full" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="rounded-md border border-destructive/40 bg-destructive/5 p-4 text-sm">
        <p>Nu am putut încărca contactele.</p>
        <p className="mt-1 text-muted-foreground">
          {error instanceof Error ? error.message : "Unknown error"}
        </p>
        <Button className="mt-3" variant="outline" size="sm" onClick={() => refetch()}>
          Reîncearcă
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl tracking-tight">Contacts</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            WhatsApp + email pe operatori — filtrare, selecție bulk, coadă outreach.
            {isFetching ? " Actualizare…" : ""}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button
            variant="outline"
            size="sm"
            disabled={!selectedWithEmail.length}
            onClick={openBulkEmail}
          >
            <Mail className="h-4 w-4" />
            Email ({selectedWithEmail.length})
          </Button>
          <Button
            size="sm"
            disabled={!selectedWithWa.length}
            onClick={startWaQueue}
          >
            <MessageCircle className="h-4 w-4" />
            WhatsApp queue ({selectedWithWa.length})
          </Button>
          {waQueue.length > 0 && (
            <Button variant="secondary" size="sm" onClick={nextWa}>
              <ChevronRight className="h-4 w-4" />
              Next WA ({Math.min(waIndex + 1, waQueue.length)}/{waQueue.length})
            </Button>
          )}
        </div>
      </div>

      <div className="grid gap-3 rounded-lg border border-border bg-card/40 p-3 lg:grid-cols-[1fr_1.2fr]">
        <div className="space-y-2">
          <label className="text-xs font-medium text-muted-foreground">
            Email subject
          </label>
          <Input
            value={emailSubject}
            onChange={(e) => setEmailSubject(e.target.value)}
          />
          <label className="text-xs font-medium text-muted-foreground">
            Message (email + WhatsApp prefill)
          </label>
          <Textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            rows={8}
            className="min-h-[160px] font-sans text-sm"
          />
          <p className="text-xs text-muted-foreground">
            Email = mailto BCC în clientul tău. WhatsApp = deschide wa.me pe rând (fără broadcast automat — evită ban).
          </p>
        </div>
        <div className="space-y-2">
          <div className="flex flex-wrap gap-2">
            <div className="relative min-w-[180px] flex-1">
              <Search className="pointer-events-none absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                className="pl-8"
                placeholder="Caută nume, oraș, contact…"
                value={filters.q}
                onChange={(e) => setParam("q", e.target.value)}
              />
            </div>
            <Select
              value={filters.city}
              onValueChange={(v) => setParam("city", v)}
            >
              <SelectTrigger className="w-[160px]">
                <SelectValue placeholder="City" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All cities</SelectItem>
                {cities.map((c) => (
                  <SelectItem key={c} value={c}>
                    {c}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select
              value={filters.country}
              onValueChange={(v) => setParam("country", v)}
            >
              <SelectTrigger className="w-[120px]">
                <SelectValue placeholder="Country" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="GB">GB</SelectItem>
                <SelectItem value="IE">IE</SelectItem>
                <SelectItem value="FR">FR</SelectItem>
                <SelectItem value="DE">DE</SelectItem>
                <SelectItem value="CH">CH</SelectItem>
                <SelectItem value="NL">NL</SelectItem>
                <SelectItem value="IT">IT</SelectItem>
                <SelectItem value="ES">ES</SelectItem>
                <SelectItem value="BE">BE</SelectItem>
                <SelectItem value="AT">AT</SelectItem>
                <SelectItem value="PT">PT</SelectItem>
              </SelectContent>
            </Select>
            <Select
              value={filters.channel}
              onValueChange={(v) => setParam("channel", v)}
            >
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Channel" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All channels</SelectItem>
                <SelectItem value="whatsapp">WhatsApp mobil</SelectItem>
                <SelectItem value="email">Email</SelectItem>
                <SelectItem value="both">WA + email</SelectItem>
                <SelectItem value="none">Fără contact</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="overflow-hidden rounded-md border border-border">
            <table className="w-full text-sm">
              <thead className="bg-muted/40 text-left text-xs text-muted-foreground">
                <tr>
                  <th className="w-10 px-3 py-2">
                    <Checkbox
                      checked={allSelected}
                      onCheckedChange={(v) => toggleAll(Boolean(v))}
                      aria-label="Select all"
                    />
                  </th>
                  <th className="px-3 py-2">Operator</th>
                  <th className="px-3 py-2">City</th>
                  <th className="px-3 py-2">WhatsApp</th>
                  <th className="px-3 py-2">Email</th>
                  <th className="px-3 py-2">Reviews</th>
                  <th className="px-3 py-2">Status</th>
                </tr>
              </thead>
              <tbody>
                {rows.length === 0 && (
                  <tr>
                    <td
                      colSpan={7}
                      className="px-3 py-8 text-center text-muted-foreground"
                    >
                      Niciun contact pe filtrele curente.
                    </td>
                  </tr>
                )}
                {rows.map((row) => {
                  const checked = Boolean(selected[row.organizationId]);
                  const waOk = isMobileWhatsapp(row.whatsappE164);
                  return (
                    <tr
                      key={row.organizationId}
                      className={cn(
                        "border-t border-border/70",
                        checked && "bg-primary/5",
                      )}
                    >
                      <td className="px-3 py-2">
                        <Checkbox
                          checked={checked}
                          onCheckedChange={(v) =>
                            setSelected((prev) => ({
                              ...prev,
                              [row.organizationId]: Boolean(v),
                            }))
                          }
                          aria-label={`Select ${row.displayName}`}
                        />
                      </td>
                      <td className="px-3 py-2">
                        <Link
                          href={`/organizations/${row.organizationId}`}
                          className="font-medium hover:underline"
                        >
                          {row.displayName}
                        </Link>
                      </td>
                      <td className="px-3 py-2 text-muted-foreground">
                        {row.city ?? "—"}
                      </td>
                      <td className="px-3 py-2">
                        {waOk ? (
                          <a
                            href={toWaMeUrl(row.whatsappE164!, message)}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1 text-emerald-700 hover:underline dark:text-emerald-400"
                          >
                            {row.whatsappE164}
                            <ExternalLink className="h-3 w-3" />
                          </a>
                        ) : (
                          <span className="text-muted-foreground">—</span>
                        )}
                      </td>
                      <td className="px-3 py-2">
                        {row.email ? (
                          <a
                            href={`mailto:${row.email}?subject=${encodeURIComponent(emailSubject)}&body=${encodeURIComponent(message)}`}
                            className="text-foreground hover:underline"
                          >
                            {row.email}
                          </a>
                        ) : (
                          <span className="text-muted-foreground">—</span>
                        )}
                      </td>
                      <td className="px-3 py-2 text-muted-foreground">
                        {row.googleReviewCount != null
                          ? `${row.googleRating ?? "—"}★ / ${row.googleReviewCount}`
                          : "—"}
                      </td>
                      <td className="px-3 py-2">
                        {row.relationshipStatus ? (
                          <RelationshipStatusBadge
                            status={row.relationshipStatus}
                          />
                        ) : (
                          "—"
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <p className="text-xs text-muted-foreground">
            {rows.length} contacte · {selectedRows.length} selectate ·{" "}
            {selectedWithWa.length} cu WA mobil · {selectedWithEmail.length} cu
            email
          </p>
        </div>
      </div>
    </div>
  );
}
