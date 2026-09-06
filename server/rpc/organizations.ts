import "server-only";

import { createClient } from "@/shared/lib/supabase/server";
import {
  mapQuickAddResult,
  toQuickAddPayload,
} from "@/modules/organizations/mappers";
import type { QuickAddOperatorInput } from "@/modules/organizations/types";
import type { RelationshipStatus } from "@/shared/types/domain";

export async function rpcQuickAddOperator(input: QuickAddOperatorInput) {
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("rpc_quick_add_operator", {
    p_payload: toQuickAddPayload(input),
  });
  if (error) throw error;
  return mapQuickAddResult(data);
}

export async function rpcChangeRelationshipStatus(params: {
  organizationId: string;
  newStatus: RelationshipStatus;
  note?: string;
}) {
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("rpc_change_relationship_status", {
    p_organization_id: params.organizationId,
    p_new_status: params.newStatus,
    p_note: params.note ?? undefined,
  });
  if (error) throw error;
  return data;
}
