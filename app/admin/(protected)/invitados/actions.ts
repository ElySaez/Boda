"use server";

import { revalidatePath } from "next/cache";
import { fromZonedTime } from "date-fns-tz";
import { guestSchema, type GuestFormInput } from "@/schemas/guest.schema";
import { sanitizeText, sanitizePhone } from "@/lib/sanitize";
import { requireAdminSession } from "@/lib/auth";
import { logAdminAction } from "@/lib/audit";
import { EVENT_TIME_ZONE } from "@/lib/format";
import {
  createGuestAdmin,
  deleteGuestAdmin,
  regenerateGuestTokenAdmin,
  updateGuestAdmin,
} from "@/services/guests.service";
import type { GuestInsert, GuestUpdate } from "@/types/domain";

function toDeadlineIso(value: string | undefined): string | null {
  if (!value) return null;
  return fromZonedTime(value, EVENT_TIME_ZONE).toISOString();
}

function toGuestPayload(input: GuestFormInput): Omit<GuestInsert, "token"> {
  return {
    full_name: sanitizeText(input.fullName, 150),
    family_group: sanitizeText(input.familyGroup, 150) || null,
    phone: sanitizePhone(input.phone) || null,
    email: input.email ? sanitizeText(input.email, 200) : null,
    maximum_guests: input.maximumGuests,
    children_allowed: input.childrenAllowed,
    plus_one_allowed: input.plusOneAllowed,
    table_number: input.tableNumber ? Number(input.tableNumber) : null,
    internal_notes: sanitizeText(input.internalNotes, 1000) || null,
    invitation_delivered: input.invitationDelivered,
    invitation_active: input.invitationActive,
    response_deadline: toDeadlineIso(input.responseDeadline),
  };
}

function revalidateGuestPages() {
  revalidatePath("/admin/invitados");
  revalidatePath("/admin");
}

export async function createGuestAction(rawInput: unknown) {
  const session = await requireAdminSession();
  const parsed = guestSchema.safeParse(rawInput);

  if (!parsed.success) {
    return { success: false as const, error: "Revisa los datos del formulario." };
  }

  const { guest, error } = await createGuestAdmin(toGuestPayload(parsed.data));

  if (error || !guest) {
    return { success: false as const, error: error ?? "No se pudo crear el invitado." };
  }

  await logAdminAction({
    userId: session.userId,
    action: "guest_created",
    entity: "guest",
    entityId: guest.id,
    details: { full_name: guest.full_name },
  });

  revalidateGuestPages();
  return { success: true as const, guest };
}

export async function updateGuestAction(id: string, rawInput: unknown) {
  const session = await requireAdminSession();
  const parsed = guestSchema.safeParse(rawInput);

  if (!parsed.success) {
    return { success: false as const, error: "Revisa los datos del formulario." };
  }

  const { guest, error } = await updateGuestAdmin(id, toGuestPayload(parsed.data) as GuestUpdate);

  if (error || !guest) {
    return { success: false as const, error: error ?? "No se pudo actualizar el invitado." };
  }

  await logAdminAction({
    userId: session.userId,
    action: "guest_updated",
    entity: "guest",
    entityId: id,
  });

  revalidateGuestPages();
  return { success: true as const, guest };
}

export async function deleteGuestAction(id: string) {
  const session = await requireAdminSession();
  const { error } = await deleteGuestAdmin(id);

  if (error) {
    return { success: false as const, error };
  }

  await logAdminAction({
    userId: session.userId,
    action: "guest_deleted",
    entity: "guest",
    entityId: id,
  });

  revalidateGuestPages();
  return { success: true as const };
}

export async function toggleGuestFieldAction(
  id: string,
  field: "invitation_active" | "invitation_delivered",
  value: boolean,
) {
  const session = await requireAdminSession();
  const { guest, error } = await updateGuestAdmin(id, { [field]: value });

  if (error || !guest) {
    return { success: false as const, error: error ?? "No se pudo actualizar el invitado." };
  }

  await logAdminAction({
    userId: session.userId,
    action: field === "invitation_active" ? "guest_active_toggled" : "guest_delivered_toggled",
    entity: "guest",
    entityId: id,
    details: { [field]: value },
  });

  revalidateGuestPages();
  return { success: true as const, guest };
}

export async function regenerateTokenAction(id: string) {
  const session = await requireAdminSession();
  const { token, error } = await regenerateGuestTokenAdmin(id);

  if (error || !token) {
    return { success: false as const, error: error ?? "No se pudo regenerar el enlace." };
  }

  await logAdminAction({
    userId: session.userId,
    action: "guest_token_regenerated",
    entity: "guest",
    entityId: id,
  });

  revalidateGuestPages();
  return { success: true as const, token };
}
