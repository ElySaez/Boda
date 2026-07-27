"use server";

import { requireAdminSession } from "@/lib/auth";
import { logAdminAction } from "@/lib/audit";
import { sanitizePhone, sanitizeText } from "@/lib/sanitize";
import { parseGuestsCsv, exportGuestsToCsv, exportGuestsByTableToCsv } from "@/lib/csv";
import { createGuestAdmin, listGuestsForAdmin } from "@/services/guests.service";

export async function importGuestsCsvAction(fileContent: string) {
  const session = await requireAdminSession();
  const { validRows, errors } = parseGuestsCsv(fileContent);

  let created = 0;
  const insertErrors: { row: number; message: string }[] = [...errors];

  for (const [index, row] of validRows.entries()) {
    const { error } = await createGuestAdmin({
      full_name: sanitizeText(row.full_name, 150),
      family_group: sanitizeText(row.family_group, 150) || null,
      phone: sanitizePhone(row.phone) || null,
      email: sanitizeText(row.email, 200) || null,
      maximum_guests: row.maximum_guests,
      children_allowed: row.children_allowed,
      plus_one_allowed: row.plus_one_allowed,
      table_number: row.table_number ? Number(row.table_number) : null,
      internal_notes: sanitizeText(row.internal_notes, 1000) || null,
      invitation_delivered: false,
      invitation_active: true,
      response_deadline: null,
    });

    if (error) {
      insertErrors.push({ row: index + 2, message: error });
    } else {
      created += 1;
    }
  }

  await logAdminAction({
    userId: session.userId,
    action: "guests_imported",
    entity: "guest",
    details: { created, errorCount: insertErrors.length },
  });

  return { created, errors: insertErrors };
}

export type ExportType = "all" | "confirmed" | "dietary" | "by_table";

export async function exportGuestsAction(type: ExportType): Promise<string> {
  const session = await requireAdminSession();
  const guests = await listGuestsForAdmin();

  await logAdminAction({
    userId: session.userId,
    action: "guests_exported",
    entity: "guest",
    details: { type },
  });

  if (type === "by_table") return exportGuestsByTableToCsv(guests);
  if (type === "confirmed") return exportGuestsToCsv(guests, { onlyConfirmed: true });
  if (type === "dietary") return exportGuestsToCsv(guests, { dietaryOnly: true });
  return exportGuestsToCsv(guests);
}
