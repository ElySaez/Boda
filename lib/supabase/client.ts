"use client";

import { createBrowserClient } from "@supabase/ssr";
import type { Database } from "@/types/database.types";

/**
 * Cliente de Supabase para uso en componentes de cliente.
 * Usa exclusivamente la anon key: el acceso real está gobernado por RLS,
 * y las tablas de la boda no tienen políticas públicas (ver 0002_rls_policies.sql),
 * por lo que este cliente solo sirve para flujos de autenticación de admin
 * (login/logout) en el navegador.
 */
export function createSupabaseBrowserClient() {
  return createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );
}
