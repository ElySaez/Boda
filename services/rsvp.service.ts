import "server-only";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { sanitizePhone, sanitizeText } from "@/lib/sanitize";
import { getGuestByToken, isDeadlinePassed } from "./guests.service";
import type { RsvpFormInput } from "@/schemas/rsvp.schema";

export type SubmitRsvpResult =
  | { success: true; status: "confirmed" | "declined" }
  | { success: false; error: string };

/**
 * Registra o actualiza la respuesta de un invitado.
 *
 * Todas las reglas de negocio se revalidan aquí en el servidor —nunca se
 * confía en los límites aplicados en el formulario de cliente—:
 *   - La invitación debe existir y estar activa.
 *   - No debe haber pasado la fecha límite.
 *   - La cantidad de asistentes no puede superar el cupo autorizado.
 * El upsert por guest_id (columna UNIQUE) evita respuestas duplicadas y
 * permite modificar la respuesta hasta la fecha límite.
 */
export async function submitRsvp(
  token: string,
  input: RsvpFormInput,
): Promise<SubmitRsvpResult> {
  // El honeypot debe llegar vacío; si un bot lo completó, se descarta
  // silenciosamente el envío como si hubiese tenido éxito (no delatamos
  // la detección del bot).
  if (input.website) {
    return { success: true, status: input.attendance };
  }

  const guest = await getGuestByToken(token);

  if (!guest || !guest.invitation_active) {
    return { success: false, error: "No pudimos encontrar tu invitación." };
  }

  if (isDeadlinePassed(guest.response_deadline)) {
    return {
      success: false,
      error: "La fecha límite para confirmar tu asistencia ya pasó.",
    };
  }

  if (input.attendance === "confirmed" && input.attendeeCount > guest.maximum_guests) {
    return {
      success: false,
      error: `Superaste el cupo máximo autorizado (${guest.maximum_guests}).`,
    };
  }

  if (input.attendance === "confirmed" && !guest.plus_one_allowed && input.attendeeCount > 1) {
    return { success: false, error: "Tu invitación no incluye acompañantes." };
  }

  const supabase = createSupabaseAdminClient();

  const attendeeCount = input.attendance === "confirmed" ? input.attendeeCount : 0;
  const childrenCount =
    input.attendance === "confirmed" ? input.companions.filter((c) => c.isChild).length : 0;

  const { data: rsvpRow, error: upsertError } = await supabase
    .from("rsvps")
    .upsert(
      {
        guest_id: guest.id,
        attendance_status: input.attendance,
        attendee_count: attendeeCount,
        children_count: childrenCount,
        dietary_restrictions: sanitizeText(input.dietaryRestrictions, 300) || null,
        allergies: sanitizeText(input.allergies, 300) || null,
        accessibility_requirements: sanitizeText(input.accessibilityRequirements, 300) || null,
        message: sanitizeText(input.message, 1000) || null,
        privacy_consent: input.privacyConsent,
        submitted_at: new Date().toISOString(),
      },
      { onConflict: "guest_id" },
    )
    .select("id")
    .single();

  if (upsertError || !rsvpRow) {
    console.error("rsvp_upsert_failed", upsertError?.message);
    return {
      success: false,
      error: "No pudimos guardar tu respuesta. Intenta nuevamente en unos minutos.",
    };
  }

  // Reemplaza la lista de acompañantes por la enviada en este envío.
  await supabase.from("companions").delete().eq("rsvp_id", rsvpRow.id);

  if (input.attendance === "confirmed" && input.companions.length > 0) {
    const companionsToInsert = input.companions.map((companion) => ({
      rsvp_id: rsvpRow.id,
      full_name: sanitizeText(companion.fullName, 120),
      is_child: companion.isChild,
    }));

    const { error: companionsError } = await supabase
      .from("companions")
      .insert(companionsToInsert);

    if (companionsError) {
      console.error("companions_insert_failed", companionsError.message);
      return {
        success: false,
        error: "Guardamos tu respuesta pero hubo un problema con los acompañantes. Contáctanos para revisarlo.",
      };
    }
  }

  // El teléfono/correo entregados en el formulario quedan como el dato de
  // contacto vigente del invitado (fuente única de verdad, ver guests.phone/email).
  await supabase
    .from("guests")
    .update({
      phone: sanitizePhone(input.phone) || null,
      email: input.email ? sanitizeText(input.email, 200) : guest.email,
    })
    .eq("id", guest.id);

  return { success: true, status: input.attendance };
}
