"use client";

import Link from "next/link";
import { RefreshCw } from "lucide-react";
import { useOutreachDashboardStats } from "@/modules/dashboard/hooks";
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

export function DashboardWorkspace() {
  const { data: profile, isLoading: profileLoading } = useSessionProfile();
  const canView = Boolean(profile?.canViewOpsDashboard);
  const { data, isLoading, isError, error, refetch, isFetching } =
    useOutreachDashboardStats(canView);

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

  const kpis: Kpi[] = [
    {
      key: "ready",
      label: "Not sent (ready)",
      value: data?.leadsReadyNotSent ?? 0,
      href: "/invites?status=not_sent",
      hint: "Leads with email, not invited yet",
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
      hint: `${data?.leadsTotal ?? 0} leads total`,
    },
    {
      key: "contacts",
      label: "Contacts w/ email",
      value: data?.contactsWithEmail ?? 0,
      href: "/contacts",
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="font-display text-3xl tracking-tight">Dashboard</h1>
          <p className="mt-1 max-w-xl text-sm text-muted-foreground">
            Outreach funnel and ops metrics for non-test network leads.
            {data && data.communicationsEmailSent > 0 ? (
              <>
                {" "}
                {data.communicationsEmailSent.toLocaleString()} emails logged.
              </>
            ) : null}
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => void refetch()}
          disabled={isFetching}
        >
          <RefreshCw
            className={cn("mr-1.5 size-3.5", isFetching && "animate-spin")}
          />
          Refresh
        </Button>
      </div>

      {isError ? (
        <p className="text-sm text-danger">
          {error instanceof Error ? error.message : "Failed to load metrics"}
        </p>
      ) : null}

      <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4">
        {isLoading
          ? Array.from({ length: 9 }).map((_, i) => (
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
    </div>
  );
}
