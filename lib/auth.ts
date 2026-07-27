import "server-only";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export interface AdminSession {
  userId: string;
  email: string | null;
}

/**
 * Verifica que exista una sesión de Supabase Auth válida.
 *
 * Esta comprobación es una capa adicional a la protección ya provista por
 * middleware.ts (que redirige sin sesión) y por las políticas RLS (que
 * exigen pertenencia a `administrators` para leer/escribir datos): las
 * Server Actions no pasan por el middleware de rutas, por lo que deben
 * validar la sesión explícitamente antes de ejecutar cualquier operación.
 */
export async function requireAdminSession(): Promise<AdminSession> {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("No autorizado");
  }

  return { userId: user.id, email: user.email ?? null };
}
