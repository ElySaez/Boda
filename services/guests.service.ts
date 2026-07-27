import "server-only";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { generateGuestToken } from "@/lib/tokens";
import type {
  Companion,
  Guest,
  GuestInsert,
  GuestStatus,
  GuestUpdate,
  GuestWithRsvp,
  Rsvp,
} from "@/types/domain";

type RsvpWithCompanions = Rsvp & { companions: Companion[] };
// OJO: `rsvps` es una relación 1 a 1 (guest_id es UNIQUE en la tabla rsvps),
// por lo que PostgREST la devuelve como un objeto único (o null), NO como
// un arreglo, al anidarla desde `guests`. Tratarla como arreglo (`rsvps[0]`)
// hace que el panel nunca detecte confirmaciones (bug real, ver historial).
type GuestWithRsvps = Guest & { rsvps: RsvpWithCompanions | null };

/**
 * Resuelve un invitado por su token de invitación.
 *
 * Usa el cliente service_role deliberadamente: el acceso público a la
 * invitación individual NO pasa por RLS con la anon key (las tablas de
 * invitados no tienen políticas públicas, ver 0002_rls_policies.sql).
 * En su lugar, la autorización se hace aquí, en código de servidor,
 * exigiendo una coincidencia exacta de token. Como el token tiene ~192
 * bits de entropía, no es practicable de adivinar ni enumerar.
 */
export async function getGuestByToken(token: string): Promise<GuestWithRsvp | null> {
  if (!token || token.length < 16 || token.length > 128) {
    // Rechazo temprano de tokens con formato inválido, sin consultar la DB.
    return null;
  }

  const supabase = createSupabaseAdminClient();

  const { data: guest, error } = await supabase
    .from("guests")
    .select("*")
    .eq("token", token)
    .maybeSingle();

  if (error || !guest) return null;

  const { data: rsvp } = await supabase
    .from("rsvps")
    .select("*, companions(*)")
    .eq("guest_id", guest.id)
    .maybeSingle()
    .returns<RsvpWithCompanions>();

  const status: GuestStatus = rsvp
    ? rsvp.attendance_status === "confirmed"
      ? "confirmed"
      : "declined"
    : "pending";

  return {
    ...guest,
    rsvp: rsvp ?? null,
    status,
  };
}

export function isDeadlinePassed(responseDeadline: string | null): boolean {
  if (!responseDeadline) return false;
  return new Date(responseDeadline).getTime() < Date.now();
}

function toGuestWithRsvp(row: GuestWithRsvps): GuestWithRsvp {
  const rsvp = row.rsvps ?? null;
  const status: GuestStatus = rsvp
    ? rsvp.attendance_status === "confirmed"
      ? "confirmed"
      : "declined"
    : "pending";

  const { rsvps: _rsvps, ...guest } = row;
  return { ...guest, rsvp, status };
}

/**
 * Lista todos los invitados con su respuesta y acompañantes, para la tabla
 * administrativa. Usa el cliente ligado a la sesión (RLS): solo funciona
 * si quien invoca está autenticado y registrado en `administrators`.
 */
export async function listGuestsForAdmin(): Promise<GuestWithRsvp[]> {
  const supabase = await createSupabaseServerClient();

  const { data, error } = await supabase
    .from("guests")
    .select("*, rsvps(*, companions(*))")
    .order("created_at", { ascending: false })
    .returns<GuestWithRsvps[]>();

  if (error || !data) {
    console.error("list_guests_failed", error?.message);
    return [];
  }

  return data.map(toGuestWithRsvp);
}

export async function getGuestByIdForAdmin(id: string): Promise<GuestWithRsvp | null> {
  const supabase = await createSupabaseServerClient();

  const { data, error } = await supabase
    .from("guests")
    .select("*, rsvps(*, companions(*))")
    .eq("id", id)
    .maybeSingle()
    .returns<GuestWithRsvps>();

  if (error || !data) return null;
  return toGuestWithRsvp(data);
}

export async function createGuestAdmin(
  input: Omit<GuestInsert, "token">,
): Promise<{ guest: Guest | null; error: string | null }> {
  const supabase = await createSupabaseServerClient();

  const { data, error } = await supabase
    .from("guests")
    .insert([{ ...input, token: generateGuestToken() }])
    .select()
    .single();

  if (error) {
    console.error("create_guest_failed", error.message);
    return { guest: null, error: "No se pudo crear el invitado." };
  }

  return { guest: data, error: null };
}

export async function updateGuestAdmin(
  id: string,
  input: GuestUpdate,
): Promise<{ guest: Guest | null; error: string | null }> {
  const supabase = await createSupabaseServerClient();

  const { data, error } = await supabase
    .from("guests")
    .update(input)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    console.error("update_guest_failed", error.message);
    return { guest: null, error: "No se pudo actualizar el invitado." };
  }

  return { guest: data, error: null };
}

export async function deleteGuestAdmin(id: string): Promise<{ error: string | null }> {
  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.from("guests").delete().eq("id", id);

  if (error) {
    console.error("delete_guest_failed", error.message);
    return { error: "No se pudo eliminar el invitado." };
  }

  return { error: null };
}

export async function regenerateGuestTokenAdmin(
  id: string,
): Promise<{ token: string | null; error: string | null }> {
  const supabase = await createSupabaseServerClient();
  const token = generateGuestToken();

  const { error } = await supabase.from("guests").update({ token }).eq("id", id);

  if (error) {
    console.error("regenerate_token_failed", error.message);
    return { token: null, error: "No se pudo regenerar el enlace." };
  }

  return { token, error: null };
}
