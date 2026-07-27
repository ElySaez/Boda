import "server-only";
import { randomUUID } from "node:crypto";
import { createSupabaseServerClient } from "@/lib/supabase/server";

const BUCKET = "wedding-media";
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/svg+xml"];
const MAX_SIZE_BYTES = 5 * 1024 * 1024;

/**
 * Sube una imagen (portada o galería) al bucket público `wedding-media`.
 *
 * Usa el cliente ligado a la sesión de administrador (RLS): las políticas
 * de storage.objects (ver 0004_site_content.sql) solo permiten escribir en
 * este bucket a usuarios autenticados que además sean administradores.
 */
export async function uploadWeddingImage(
  file: File,
  folder: "hero" | "gallery",
): Promise<{ url: string | null; error: string | null }> {
  if (!ALLOWED_TYPES.includes(file.type)) {
    return { url: null, error: "Formato no permitido. Usa JPG, PNG, WEBP o SVG." };
  }

  if (file.size > MAX_SIZE_BYTES) {
    return { url: null, error: "La imagen supera el tamaño máximo de 5 MB." };
  }

  const supabase = await createSupabaseServerClient();
  const extension = file.name.split(".").pop()?.toLowerCase() || "jpg";
  const path = `${folder}/${randomUUID()}.${extension}`;

  const { error } = await supabase.storage.from(BUCKET).upload(path, file, {
    contentType: file.type,
    upsert: false,
  });

  if (error) {
    console.error("upload_wedding_image_failed", error.message);
    return { url: null, error: "No se pudo subir la imagen." };
  }

  const { data } = supabase.storage.from(BUCKET).getPublicUrl(path);
  return { url: data.publicUrl, error: null };
}
