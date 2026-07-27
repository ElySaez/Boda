import "server-only";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

const DEFAULT_MAX = 5;
const DEFAULT_WINDOW_MINUTES = 10;

function getMax(): number {
  const parsed = Number(process.env.RSVP_RATE_LIMIT_MAX);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : DEFAULT_MAX;
}

function getWindowMinutes(): number {
  const parsed = Number(process.env.RSVP_RATE_LIMIT_WINDOW_MINUTES);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : DEFAULT_WINDOW_MINUTES;
}

/**
 * Limitador de solicitudes simple basado en una tabla de Postgres.
 * Cuenta cuántos intentos recientes existen para un (identifier, action) y
 * registra el intento actual. Suficiente para proteger un formulario de
 * bajo volumen como el de una invitación de matrimonio; no reemplaza un
 * WAF ni un servicio dedicado para tráfico masivo.
 */
export async function checkRateLimit(
  identifier: string,
  action: string,
): Promise<{ allowed: boolean }> {
  const supabase = createSupabaseAdminClient();
  const windowStart = new Date(Date.now() - getWindowMinutes() * 60 * 1000).toISOString();

  const { count, error } = await supabase
    .from("rate_limits")
    .select("id", { count: "exact", head: true })
    .eq("identifier", identifier)
    .eq("action", action)
    .gte("created_at", windowStart);

  if (error) {
    // Ante un error de infraestructura, no bloqueamos al usuario legítimo:
    // se prioriza disponibilidad. El error queda en logs del servidor.
    console.error("rate_limit_check_failed", error.message);
    return { allowed: true };
  }

  if ((count ?? 0) >= getMax()) {
    return { allowed: false };
  }

  await supabase.from("rate_limits").insert([{ identifier, action }]);
  return { allowed: true };
}
