"use client";

import Link from "next/link";
import { RefreshCw } from "lucide-react";
import {
  useBookerDashboardStats,
  useOutreachDashboardStats,
} from "@/modules/dashboard/hooks";
import { useSessionProfile } from "@/modules/identity/session";
import { cn } from "@/shared/lib/utils";
import { Button } from "@/shared/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card";
import { Skeleton } from "@/shared/ui/skeleton";

type Kpi = {
  key: string;
  label: string;
  value: number;
  href?: string;
  hint?: string;
};

function KpiGrid({
  kpis,
  loading,
  count = 8,
}: {
  kpis: Kpi[];
  loading: boolean;
  count?: number;
}) {
  return (
    <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4">
      {loading
        ? Array.from({ length: count }).map((_, i) => (
            <Skeleton key={i} className="h-28 rounded-lg" />
          ))
        : kpis.map((kpi) => {
            const body = (
              <>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    {kpi.label}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="font-display text-3xl tracking-tight tabular-nums">
                    {kpi.value.toLocaleString()}
                  </p>
                  {kpi.hint ? (
                    <p className="mt-1 text-xs text-muted-foreground">
                      {kpi.hint}
                    </p>
                  ) : null}
                </CardContent>
              </>
            );

            if (kpi.href) {
              return (
                <Link
                  key={kpi.key}
                  href={kpi.href}
                  className="block min-w-0 transition-opacity hover:opacity-90"
                >
                  <Card className="h-full">{body}</Card>
                </Link>
              );
            }

            return (
              <Card key={kpi.key} className="min-w-0">
                {body}
              </Card>
            );
          })}
    </div>
  );
}

export function DashboardWorkspace() {
  const { data: profile, isLoading: profileLoading } = useSessionProfile();
  const canView = Boolean(profile?.canViewOpsDashboard);
  const networkQ = useOutreachDashboardStats(canView);
  const bookerQ = useBookerDashboardStats(canView);

  if (profileLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-9 w-48" />
        <Skeleton className="h-4 w-72" />
        <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <Skeleton key={i} className="h-28 rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  if (!canView) {
    return (
      <div className="space-y-2">
        <h1 className="font-display text-3xl tracking-tight">Dashboard</h1>
        <p className="max-w-lg text-sm text-muted-foreground">
          You do not have permission to view outreach and ops dashboard metrics.
        </p>
      </div>
    );
  }

  const data = networkQ.data;
  const booker = bookerQ.data;
  const isFetching = networkQ.isFetching || bookerQ.isFetching;

  const networkKpis: Kpi[] = [
    {
      key: "ready",
      label: "Not sent (ready)",
      value: data?.leadsReadyNotSent ?? 0,
      href: "/invites?status=not_sent",
      hint: "Supplier leads with email, not invited yet",
    },
    {
      key: "sent",
      label: "Sent",
      value: data?.invitesSent ?? 0,
      href: "/invites?status=sent",
    },
    {
      key: "delivered",
      label: "Delivered",
      value: data?.invitesDelivered ?? 0,
      href: "/invites?status=delivered",
    },
    {
      key: "opened",
      label: "Opened",
      value: data?.invitesOpened ?? 0,
      href: "/invites?status=opened",
    },
    {
      key: "clicked",
      label: "Clicked",
      value: data?.invitesClicked ?? 0,
      href: "/invites?status=clicked",
    },
    {
      key: "signed_up",
      label: "Signed up",
      value: data?.invitesSignedUp ?? 0,
      href: "/invites?status=signed_up",
    },
    {
      key: "failed",
      label: "Failed / bounced",
      value: data?.invitesFailed ?? 0,
      href: "/invites?status=failed",
    },
    {
      key: "leads_email",
      label: "Leads w/ email",
      value: data?.leadsWithEmail ?? 0,
      href: "/invites?status=all",
      hint: `${data?.leadsTotal ?? 0} supplier leads total`,
    },
    {
      key: "contacts",
      label: "Contacts w/ email",
      value: data?.contactsWithEmail ?? 0,
      href: "/contacts",
    },
  ];

  const bookerKpis: Kpi[] = [
    {
      key: "b_ready",
      label: "Not sent (ready)",
      value: booker?.leadsReadyNotSent ?? 0,
      href: "/bookers?status=not_sent",
      hint: "Hotel / concierge desks ready to contact",
    },
    {
      key: "b_sent",
      label: "Sent",
      value: booker?.emailsSent ?? 0,
      href: "/bookers?status=sent",
    },
    {
      key: "b_delivered",
      label: "Delivered",
      value: booker?.emailsDelivered ?? 0,
      href: "/bookers?status=delivered",
    },
    {
      key: "b_opened",
      label: "Opened",
      value: booker?.emailsOpened ?? 0,
      href: "/bookers?status=opened",
    },
    {
      key: "b_clicked",
      label: "Clicked",
      value: booker?.emailsClicked ?? 0,
      href: "/bookers?status=clicked",
    },
    {
      key: "b_interested",
      label: "Interested",
      value: booker?.interested ?? 0,
      href: "/bookers?status=signed_up",
      hint: "CTA /interest accepted",
    },
    {
      key: "b_failed",
      label: "Failed / bounced",
      value: booker?.emailsFailed ?? 0,
      href: "/bookers?status=failed",
    },
    {
      key: "b_leads",
      label: "Bookers w/ email",
      value: booker?.leadsWithEmail ?? 0,
      href: "/bookers?status=all",
      hint: `${booker?.leadsTotal ?? 0} booker leads total`,
    },
  ];

  return (
    <div className="space-y-10">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="font-display text-3xl tracking-tight">Dashboard</h1>
          <p className="mt-1 max-w-xl text-sm text-muted-foreground">
            Two funnels, kept separate: Network partner invites and VL Bookers
            (hotels / demand).
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            void networkQ.refetch();
            void bookerQ.refetch();
          }}
          disabled={isFetching}
        >
          <RefreshCw
            className={cn("mr-1.5 size-3.5", isFetching && "animate-spin")}
          />
          Refresh
        </Button>
      </div>

      <section className="space-y-3">
        <div>
          <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
            Network · partner invites
          </h2>
          <p className="mt-0.5 text-xs text-muted-foreground">
            Supplier LEADs · join network
            {data && data.communicationsEmailSent > 0 ? (
              <> · {data.communicationsEmailSent.toLocaleString()} emails logged</>
            ) : null}
          </p>
        </div>
        {networkQ.isError ? (
          <p className="text-sm text-danger">
            {networkQ.error instanceof Error
              ? networkQ.error.message
              : "Failed to load network metrics"}
          </p>
        ) : null}
        <KpiGrid kpis={networkKpis} loading={networkQ.isLoading} count={9} />
      </section>

      <section className="space-y-3">
        <div>
          <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
            Vantage Lane · bookers
          </h2>
          <p className="mt-0.5 text-xs text-muted-foreground">
            Hotels / concierge demand · not network join
            {booker && booker.communicationsEmailSent > 0 ? (
              <>
                {" "}
                · {booker.communicationsEmailSent.toLocaleString()} booker emails
                logged
              </>
            ) : null}
          </p>
        </div>
        {bookerQ.isError ? (
          <p className="text-sm text-danger">
            {bookerQ.error instanceof Error
              ? bookerQ.error.message
              : "Failed to load booker metrics"}
          </p>
        ) : null}
        <KpiGrid kpis={bookerKpis} loading={bookerQ.isLoading} count={8} />
      </section>
    </div>
  );
}
