import Papa from "papaparse";
import { CSV_TEMPLATE_HEADERS, csvGuestRowSchema, type CsvGuestRow } from "@/schemas/csv-import.schema";
import type { GuestWithRsvp } from "@/types/domain";

export interface CsvParseResult {
  validRows: CsvGuestRow[];
  errors: { row: number; message: string }[];
}

/**
 * Parsea un CSV de importación de invitados y valida cada fila con Zod.
 * Las filas inválidas se reportan con su número de línea sin abortar el
 * resto del archivo, para que el usuario pueda corregir solo lo necesario.
 */
export function parseGuestsCsv(fileContent: string): CsvParseResult {
  const { data } = Papa.parse<Record<string, string>>(fileContent, {
    header: true,
    skipEmptyLines: true,
    transformHeader: (header) => header.trim(),
  });

  const validRows: CsvGuestRow[] = [];
  const errors: { row: number; message: string }[] = [];

  data.forEach((rawRow, index) => {
    const result = csvGuestRowSchema.safeParse(rawRow);
    if (result.success) {
      validRows.push(result.data);
    } else {
      const message = result.error.issues.map((issue) => issue.message).join("; ");
      errors.push({ row: index + 2, message }); // +2: encabezado + índice base 1
    }
  });

  return { validRows, errors };
}

export function buildCsvTemplate(): string {
  return Papa.unparse({
    fields: [...CSV_TEMPLATE_HEADERS],
    data: [
      [
        "Juan Pérez",
        "Familia Pérez",
        "+56911111111",
        "juan.perez@example.com",
        "2",
        "true",
        "true",
        "",
        "",
      ],
    ],
  });
}

const statusLabels: Record<GuestWithRsvp["status"], string> = {
  pending: "Pendiente",
  confirmed: "Confirmado",
  declined: "Rechazado",
};

export function exportGuestsToCsv(
  guests: GuestWithRsvp[],
  options?: { onlyConfirmed?: boolean; dietaryOnly?: boolean },
): string {
  let rows = guests;

  if (options?.onlyConfirmed) {
    rows = rows.filter((g) => g.status === "confirmed");
  }

  if (options?.dietaryOnly) {
    rows = rows.filter(
      (g) => (g.rsvp?.dietary_restrictions ?? "").trim() || (g.rsvp?.allergies ?? "").trim(),
    );
  }

  return Papa.unparse(
    rows.map((g) => ({
      nombre: g.full_name,
      grupo_familiar: g.family_group ?? "",
      cupos_asignados: g.maximum_guests,
      cupos_confirmados: g.rsvp?.attendee_count ?? 0,
      estado: statusLabels[g.status],
      telefono: g.phone ?? "",
      correo: g.email ?? "",
      restricciones_alimentarias: g.rsvp?.dietary_restrictions ?? "",
      alergias: g.rsvp?.allergies ?? "",
      mesa: g.table_number ?? "",
      invitacion_entregada: g.invitation_delivered ? "sí" : "no",
      fecha_respuesta: g.rsvp?.submitted_at ?? "",
    })),
  );
}

export function exportGuestsByTableToCsv(guests: GuestWithRsvp[]): string {
  const confirmed = guests
    .filter((g) => g.status === "confirmed")
    .sort((a, b) => (a.table_number ?? 999) - (b.table_number ?? 999));

  return Papa.unparse(
    confirmed.map((g) => ({
      mesa: g.table_number ?? "Sin asignar",
      nombre: g.full_name,
      acompanantes: g.rsvp?.companions.map((c) => c.full_name).join(", ") ?? "",
      cupos_confirmados: g.rsvp?.attendee_count ?? 0,
    })),
  );
}
