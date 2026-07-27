import { z } from "zod";

/**
 * Validación de cada fila del CSV de importación de invitados.
 * Las columnas siguen exactamente el orden y nombres de
 * example-guests-import.csv (la plantilla descargable desde el panel).
 */
export const csvGuestRowSchema = z.object({
  full_name: z.string().trim().min(2, "Nombre requerido"),
  family_group: z.string().trim().optional().default(""),
  phone: z.string().trim().optional().default(""),
  email: z.string().trim().optional().default(""),
  maximum_guests: z.coerce.number().int().min(1).max(20),
  children_allowed: z
    .string()
    .trim()
    .toLowerCase()
    .transform((v) => v === "true" || v === "1" || v === "si" || v === "sí"),
  plus_one_allowed: z
    .string()
    .trim()
    .toLowerCase()
    .transform((v) => v === "true" || v === "1" || v === "si" || v === "sí"),
  table_number: z.string().trim().optional().default(""),
  internal_notes: z.string().trim().optional().default(""),
});

export type CsvGuestRow = z.infer<typeof csvGuestRowSchema>;

export const CSV_TEMPLATE_HEADERS = [
  "full_name",
  "family_group",
  "phone",
  "email",
  "maximum_guests",
  "children_allowed",
  "plus_one_allowed",
  "table_number",
  "internal_notes",
] as const;
