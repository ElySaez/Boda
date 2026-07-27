import { z } from "zod";

/**
 * Esquema de validación del formulario de confirmación de asistencia.
 * Se usa tanto en el cliente (React Hook Form + zodResolver) como en el
 * servidor (Server Action), por lo que nunca debe confiarse únicamente en
 * la validación de cliente.
 *
 * Los límites (cupos máximos, si se permiten acompañantes/niños) dependen
 * de cada invitado, por lo que el esquema se construye con una función
 * factory en lugar de un objeto estático.
 */

const companionSchema = z.object({
  fullName: z
    .string()
    .trim()
    .min(2, "Ingresa el nombre completo del acompañante")
    .max(120, "El nombre es demasiado largo"),
  isChild: z.boolean().default(false),
});

const MESSAGE_MAX_LENGTH = 1000;
const NOTES_MAX_LENGTH = 300;

// Honeypot: campo invisible para personas, que un bot automatizado sí
// suele completar. Si llega con contenido, se descarta el envío.
const honeypotSchema = z.string().max(0).optional().default("");

export function buildRsvpSchema(constraints: {
  maximumGuests: number;
  childrenAllowed: boolean;
  plusOneAllowed: boolean;
}) {
  return z
    .object({
      attendance: z.enum(["confirmed", "declined"], {
        required_error: "Selecciona si asistirás o no",
      }),
      attendeeCount: z.coerce
        .number()
        .int()
        .min(0)
        .max(constraints.maximumGuests, `El máximo de cupos autorizados es ${constraints.maximumGuests}`),
      companions: z.array(companionSchema).max(constraints.maximumGuests),
      dietaryRestrictions: z.string().trim().max(NOTES_MAX_LENGTH).optional().default(""),
      allergies: z.string().trim().max(NOTES_MAX_LENGTH).optional().default(""),
      accessibilityRequirements: z.string().trim().max(NOTES_MAX_LENGTH).optional().default(""),
      phone: z
        .string()
        .trim()
        .min(7, "Ingresa un teléfono de contacto válido")
        .max(20, "El teléfono es demasiado largo")
        .regex(/^[0-9+()\s-]+$/, "El teléfono contiene caracteres no válidos"),
      email: z.union([z.literal(""), z.string().trim().email("Ingresa un correo válido")]).optional(),
      message: z.string().trim().max(MESSAGE_MAX_LENGTH).optional().default(""),
      privacyConsent: z
        .boolean()
        .refine((value) => value === true, {
          message: "Debes autorizar el tratamiento de tus datos para continuar",
        }),
      website: honeypotSchema,
    })
    .superRefine((data, ctx) => {
      if (data.attendance === "declined") return;

      if (data.attendeeCount < 1) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["attendeeCount"],
          message: "Indica al menos 1 asistente si confirmas tu asistencia",
        });
      }

      if (!constraints.plusOneAllowed && data.attendeeCount > 1) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["attendeeCount"],
          message: "Tu invitación no incluye acompañantes",
        });
      }

      const expectedCompanions = Math.max(0, data.attendeeCount - 1);
      if (data.companions.length !== expectedCompanions) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["companions"],
          message: `Debes indicar el nombre de ${expectedCompanions} acompañante(s)`,
        });
      }

      if (!constraints.childrenAllowed && data.companions.some((c) => c.isChild)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["companions"],
          message: "Tu invitación no incluye niños",
        });
      }
    });
}

export type RsvpFormInput = z.infer<ReturnType<typeof buildRsvpSchema>>;
