import { cookies } from "next/headers";
import { createServerClient, type CookieOptions } from "@supabase/ssr";
import type { Database } from "@/types/database.types";

/**
 * Cliente de Supabase para Server Components, Server Actions y Route Handlers
 * que necesitan operar en el contexto de sesión del usuario autenticado
 * (panel admin). Usa la anon key + cookies httpOnly gestionadas por
 * @supabase/ssr; el acceso a datos queda sujeto a RLS y a la pertenencia
 * a la tabla `administrators`.
 *
 * No usar este cliente para leer/escribir datos de invitados públicos:
 * para eso existe lib/supabase/admin.ts con service_role, invocado solo
 * desde Server Actions/Route Handlers que validan el token manualmente.
 */
export async function createSupabaseServerClient() {
  const cookieStore = await cookies();

  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(
          cookiesToSet: {
            name: string;
            value: string;
            options: CookieOptions;
          }[],
        ) {
          try {
            cookiesToSet.forEach(({ name, value, options }) => {
              cookieStore.set(name, value, options);
            });
          } catch {
            // setAll puede fallar si se invoca desde un Server Component
            // sin contexto de respuesta mutable; el middleware se encarga
            // de refrescar la sesión en esos casos.
          }
        },
      },
    },
  );
}
