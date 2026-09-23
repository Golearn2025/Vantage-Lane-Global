export const organizationsKeys = {
  all: ["organizations"] as const,
  lists: () => [...organizationsKeys.all, "list"] as const,
  list: (filters: Record<string, unknown>) =>
    [...organizationsKeys.lists(), filters] as const,
  details: () => [...organizationsKeys.all, "detail"] as const,
  detail: (id: string) => [...organizationsKeys.details(), id] as const,
  contacts: (id: string) => [...organizationsKeys.detail(id), "contacts"] as const,
  bases: (id: string) => [...organizationsKeys.detail(id), "bases"] as const,
  coverage: (id: string) => [...organizationsKeys.detail(id), "coverage"] as const,
  activities: (id: string) =>
    [...organizationsKeys.detail(id), "activities"] as const,
  locationsCatalog: (q: string) =>
    [...organizationsKeys.all, "locations-catalog", q] as const,
};

export const networkKeys = {
  all: ["network"] as const,
  locations: (q: string) => [...networkKeys.all, "locations", q] as const,
  place: (locationId: string) =>
    [...networkKeys.all, "place", locationId] as const,
  organizations: () => [...networkKeys.all, "organizations"] as const,
};

export const coverageKeys = {
  all: ["coverage"] as const,
  inventory: (filters: Record<string, unknown>) =>
    [...coverageKeys.all, "inventory", filters] as const,
};

export const identityKeys = {
  all: ["identity"] as const,
  me: () => [...identityKeys.all, "me"] as const,
  platformAccess: () => [...identityKeys.all, "platform-access"] as const,
};
