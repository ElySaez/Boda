import "server-only";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import type { DashboardStats } from "@/types/domain";

/**
 * Calcula los indicadores del dashboard administrativo.
 *
 * Dado el volumen esperado (cientos de invitados, no miles), se resuelve
 * trayendo las columnas necesarias y agregando en memoria, en vez de
 * mantener funciones SQL de agregación adicionales: es más simple de leer
 * y mantener para este caso de uso.
 */
export async function getDashboardStats(): Promise<DashboardStats> {
  const supabase = createSupabaseAdminClient();

  const [{ data: guests }, { data: rsvps }, { data: companions }] = await Promise.all([
    supabase
      .from("guests")
      .select("id, maximum_guests, table_number")
      .returns<{ id: string; maximum_guests: number; table_number: number | null }[]>(),
    supabase
      .from("rsvps")
      .select(
        "guest_id, attendance_status, attendee_count, children_count, dietary_restrictions, allergies",
      )
      .returns<
        {
          guest_id: string;
          attendance_status: "confirmed" | "declined";
          attendee_count: number;
          children_count: number;
          dietary_restrictions: string | null;
          allergies: string | null;
        }[]
      >(),
    supabase
      .from("companions")
      .select("rsvp_id, dietary_restrictions, allergies")
      .returns<{ rsvp_id: string; dietary_restrictions: string | null; allergies: string | null }[]>(),
  ]);

  const guestList = guests ?? [];
  const rsvpList = rsvps ?? [];
  const companionList = companions ?? [];

  const totalGuestsRegistered = guestList.length;
  const totalSeatsAvailable = guestList.reduce((sum, g) => sum + g.maximum_guests, 0);

  const confirmedRsvps = rsvpList.filter((r) => r.attendance_status === "confirmed");
  const declinedRsvps = rsvpList.filter((r) => r.attendance_status === "declined");

  const confirmedPeople = confirmedRsvps.reduce((sum, r) => sum + r.attendee_count, 0);
  const confirmedChildren = confirmedRsvps.reduce((sum, r) => sum + r.children_count, 0);
  const confirmedAdults = confirmedPeople - confirmedChildren;

  const declinedGuests = declinedRsvps.length;
  const pendingGuests = totalGuestsRegistered - rsvpList.length;

  const respondentsWithRestrictions = rsvpList.filter(
    (r) => (r.dietary_restrictions && r.dietary_restrictions.trim()) || (r.allergies && r.allergies.trim()),
  ).length;
  const companionsWithRestrictions = companionList.filter(
    (c) => (c.dietary_restrictions && c.dietary_restrictions.trim()) || (c.allergies && c.allergies.trim()),
  ).length;
  const peopleWithDietaryRestrictions = respondentsWithRestrictions + companionsWithRestrictions;

  const confirmationRate =
    totalGuestsRegistered > 0 ? Math.round((confirmedRsvps.length / totalGuestsRegistered) * 1000) / 10 : 0;

  const tablesInUse = new Set(
    guestList.filter((g) => g.table_number !== null).map((g) => g.table_number),
  ).size;

  return {
    totalGuestsRegistered,
    totalSeatsAvailable,
    confirmedPeople,
    declinedGuests,
    pendingGuests,
    confirmedAdults,
    confirmedChildren,
    peopleWithDietaryRestrictions,
    confirmationRate,
    tablesInUse,
  };
}
