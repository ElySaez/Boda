"use server";

import { revalidatePath } from "next/cache";
import { requireAdminSession } from "@/lib/auth";
import { logAdminAction } from "@/lib/audit";
import { createSupabaseServerClient } from "@/lib/supabase/server";

const SEATS_PER_TABLE = 6;

type AssignResult = { success: true } | { success: false; error: string };

/**
 * Asigna (o quita, con tableNumber = null) a un invitado confirmado de una
 * mesa. Vuelve a validar la capacidad en el servidor —nunca se confía en el
 * cálculo que hizo el cliente antes de soltar el elemento arrastrado—,
 * porque dos administradores podrían estar reorganizando mesas al mismo
 * tiempo.
 */
export async function assignGuestToTableAction(
  guestId: string,
  tableNumber: number | null,
): Promise<AssignResult> {
  const session = await requireAdminSession();
  const supabase = await createSupabaseServerClient();

  if (tableNumber !== null && (!Number.isInteger(tableNumber) || tableNumber < 1)) {
    return { success: false, error: "Número de mesa inválido." };
  }

  const { data: guest, error: guestError } = await supabase
    .from("guests")
    .select("id, table_number")
    .eq("id", guestId)
    .maybeSingle()
    .returns<{ id: string; table_number: number | null }>();

  if (guestError || !guest) {
    return { success: false, error: "No se encontró el invitado." };
  }

  const { data: rsvp } = await supabase
    .from("rsvps")
    .select("attendance_status, attendee_count")
    .eq("guest_id", guestId)
    .maybeSingle()
    .returns<{ attendance_status: "confirmed" | "declined"; attendee_count: number }>();

  if (!rsvp || rsvp.attendance_status !== "confirmed") {
    return { success: false, error: "Solo se pueden asignar a una mesa invitados confirmados." };
  }

  if (tableNumber !== null) {
    const { data: tableGuests, error: tableError } = await supabase
      .from("guests")
      .select("id")
      .eq("table_number", tableNumber)
      .neq("id", guestId)
      .returns<{ id: string }[]>();

    if (tableError) {
      return { success: false, error: "No se pudo verificar la capacidad de la mesa." };
    }

    const tableGuestIds = (tableGuests ?? []).map((g) => g.id);
    let occupied = 0;

    if (tableGuestIds.length > 0) {
      const { data: tableRsvps, error: rsvpsError } = await supabase
        .from("rsvps")
        .select("attendee_count, attendance_status")
        .in("guest_id", tableGuestIds)
        .returns<{ attendee_count: number; attendance_status: string }[]>();

      if (rsvpsError) {
        return { success: false, error: "No se pudo verificar la capacidad de la mesa." };
      }

      occupied = (tableRsvps ?? [])
        .filter((r) => r.attendance_status === "confirmed")
        .reduce((sum, r) => sum + r.attendee_count, 0);
    }

    if (occupied + rsvp.attendee_count > SEATS_PER_TABLE) {
      const remaining = Math.max(0, SEATS_PER_TABLE - occupied);
      return {
        success: false,
        error: `La mesa ${tableNumber} no tiene cupo suficiente (quedan ${remaining} puestos libres).`,
      };
    }
  }

  const { error: updateError } = await supabase
    .from("guests")
    .update({ table_number: tableNumber })
    .eq("id", guestId);

  if (updateError) {
    return { success: false, error: "No se pudo actualizar la mesa." };
  }

  await logAdminAction({
    userId: session.userId,
    action: "guest_table_assigned",
    entity: "guest",
    entityId: guestId,
    details: { table_number: tableNumber },
  });

  revalidatePath("/admin/mesas");
  revalidatePath("/admin/invitados");
  return { success: true };
}
