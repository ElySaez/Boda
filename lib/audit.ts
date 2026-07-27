import "server-only";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import type { Json } from "@/types/database.types";

/**
 * Registra una acción administrativa relevante en `audit_log`.
 *
 * Se usa el cliente service_role para garantizar que la escritura del log
 * ocurra siempre, incluso si en el futuro se restringen más las políticas
 * RLS para `authenticated` — el registro de auditoría no debe depender de
 * permisos que el propio actor auditado podría llegar a controlar.
 */
export async function logAdminAction(params: {
  userId: string;
  action: string;
  entity: string;
  entityId?: string | null;
  details?: Record<string, unknown>;
}): Promise<void> {
  const supabase = createSupabaseAdminClient();

  const { data: admin } = await supabase
    .from("administrators")
    .select("id")
    .eq("user_id", params.userId)
    .maybeSingle();

  const { error } = await supabase.from("audit_log").insert([
    {
      admin_id: admin?.id ?? null,
      action: params.action,
      entity: params.entity,
      entity_id: params.entityId ?? null,
      details: (params.details as Json) ?? null,
    },
  ]);

  if (error) {
    console.error("audit_log_insert_failed", error.message);
  }
}
