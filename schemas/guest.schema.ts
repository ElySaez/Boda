import { z } from "zod";

/**
 * Validación de alta/edición de invitados desde el panel administrativo.
 * Se usa en cliente (formulario) y se revalida en servidor (Server Action).
 */
export const guestSchema = z.object({
  fullName: z.string().trim().min(2, "Ingresa el nombre completo").max(150),
  familyGroup: z.string().trim().max(150).optional().default(""),
  phone: z.string().trim().max(20).optional().default(""),
  email: z.union([z.literal(""), z.string().trim().email("Correo inválido")]).optional(),
  maximumGuests: z.coerce.number().int().min(1, "Debe ser al menos 1").max(20),
  childrenAllowed: z.boolean().default(false),
  plusOneAllowed: z.boolean().default(false),
  tableNumber: z.union([z.literal(""), z.coerce.number().int().min(1)]).optional(),
  internalNotes: z.string().trim().max(1000).optional().default(""),
  invitationDelivered: z.boolean().default(false),
  invitationActive: z.boolean().default(true),
  // Proviene de un <input type="datetime-local"> (sin offset de zona horaria);
  // la conversión a ISO con la zona horaria del evento ocurre en la Server Action.
  responseDeadline: z
    .union([z.literal(""), z.string().refine((v) => !Number.isNaN(Date.parse(v)), "Fecha inválida")])
    .optional(),
});

export type GuestFormInput = z.infer<typeof guestSchema>;
