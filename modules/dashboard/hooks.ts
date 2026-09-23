"use client";

import { useQuery } from "@tanstack/react-query";
import { fetchOutreachDashboardStats } from "@/modules/dashboard/api";
import { dashboardKeys } from "@/shared/lib/query/keys";

export function useOutreachDashboardStats(enabled = true) {
  return useQuery({
    queryKey: dashboardKeys.stats(),
    queryFn: fetchOutreachDashboardStats,
    enabled,
  });
}
