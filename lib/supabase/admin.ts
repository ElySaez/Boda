import "server-only";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database.types";

/**
 * Cliente de Supabase con la clave service_role.
 *
 * IMPORTANTE: este cliente bypassa Row Level Security por completo.
 * Debe usarse EXCLUSIVAMENTE dentro de Server Actions o Route Handlers
 * que ya validaron manualmente la autorización correspondiente:
 *   - Para el flujo público de RSVP: validar el token del invitado.
 *   - Para el panel admin: validar la sesión y pertenencia a `administrators`
 *     (normalmente ya cubierto por el cliente de server.ts + RLS; este
 *     cliente admin solo se usa ahí para operaciones puntuales como
 *     generación de tokens o exportaciones masivas).
 *
 * El import "server-only" hace fallar el build si este archivo se importa
 * accidentalmente desde un componente de cliente.
 */
export function createSupabaseAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceRoleKey) {
    throw new Error(
      "Faltan variables de entorno de Supabase (URL o service role key).",
    );
  }

  return createClient<Database>(url, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}
