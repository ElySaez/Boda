import "server-only";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { defaultSiteContent } from "@/config/wedding";
import type { SiteContent } from "@/types/domain";
import type { Json } from "@/types/database.types";

/**
 * Lee el contenido publicado del sitio (portada, historia, recinto,
 * programa, galería, regalos, FAQ).
 *
 * Usa el cliente service_role, igual que el resto de las lecturas públicas
 * (ver services/guests.service.ts): la landing y la invitación por token no
 * tienen sesión de usuario, y `site_content` no tiene política RLS pública
 * a propósito (todo acceso pasa por código de servidor).
 *
 * Si la fila no existe o hay un error, se devuelve el contenido por
 * defecto (config/wedding.ts) para que el sitio nunca quede en blanco.
 */
export async function getSiteContent(): Promise<SiteContent> {
  const supabase = createSupabaseAdminClient();

  const { data, error } = await supabase
    .from("site_content")
    .select("content")
    .eq("id", 1)
    .maybeSingle()
    .returns<{ content: Json }>();

  if (error || !data) {
    console.error("get_site_content_failed", error?.message);
    return defaultSiteContent;
  }

  // Merge superficial por sección: si en el futuro se agrega un campo nuevo
  // a SiteContent, los sitios ya publicados no se rompen mientras el admin
  // no vuelve a guardar esa sección.
  const stored = data.content as unknown as Partial<SiteContent>;
  return { ...defaultSiteContent, ...stored } as SiteContent;
}

/**
 * Actualiza una o más secciones del contenido (claves de primer nivel de
 * SiteContent), preservando el resto. Usa el cliente ligado a la sesión
 * (RLS): solo funciona si quien invoca es un administrador autenticado.
 *
 * Recibe un objeto parcial en vez de una sola clave para que las secciones
 * del editor admin que agrupan varios campos de SiteContent por motivos de
 * UX (por ejemplo "Portada y fecha" = couple + event + hero) puedan
 * guardarse en una sola escritura.
 */
export async function updateSiteContentSections(
  partial: Partial<SiteContent>,
): Promise<{ error: string | null }> {
  const supabase = await createSupabaseServerClient();

  const { data: current, error: readError } = await supabase
    .from("site_content")
    .select("content")
    .eq("id", 1)
    .maybeSingle()
    .returns<{ content: Json }>();

  if (readError) {
    console.error("read_site_content_failed", readError.message);
    return { error: "No se pudo leer el contenido actual." };
  }

  const currentContent = (current?.content as unknown as Partial<SiteContent>) ?? {};
  const nextContent = { ...defaultSiteContent, ...currentContent, ...partial };

  const { error: writeError } = await supabase
    .from("site_content")
    .update({ content: nextContent as unknown as Json })
    .eq("id", 1);

  if (writeError) {
    console.error("update_site_content_failed", writeError.message);
    return { error: "No se pudo guardar el contenido." };
  }

  return { error: null };
}
