import { Badge } from "@/shared/ui/badge";
import type {
  OperationalStatus,
  RelationshipStatus,
} from "@/shared/types/domain";

const relationshipVariant: Record<
  RelationshipStatus,
  "muted" | "info" | "warning" | "success" | "danger" | "default"
> = {
  LEAD: "muted",
  CONTACTED: "info",
  INTERESTED: "info",
  ONBOARDING: "warning",
  UNDER_REVIEW: "warning",
  ACTIVE: "success",
  PAUSED: "warning",
  REJECTED: "danger",
  INACTIVE: "muted",
};

const operationalVariant: Record<
  OperationalStatus,
  "success" | "warning" | "danger" | "muted"
> = {
  AVAILABLE: "success",
  LIMITED: "warning",
  UNAVAILABLE: "danger",
  UNKNOWN: "muted",
};

export function RelationshipStatusBadge({
  status,
}: {
  status: RelationshipStatus | null | undefined;
}) {
  if (!status) return <Badge variant="muted">—</Badge>;
  return <Badge variant={relationshipVariant[status]}>{status}</Badge>;
}

export function OperationalStatusBadge({
  status,
}: {
  status: OperationalStatus | null | undefined;
}) {
  if (!status) return <Badge variant="muted">—</Badge>;
  return <Badge variant={operationalVariant[status]}>{status}</Badge>;
}

export function TestBadge() {
  return <Badge variant="warning">TEST</Badge>;
}
