import { z } from "zod";

/**
 * Esquemas de validación del editor de contenido admin (/admin/contenido).
 * Un esquema por sección de la UI, usados en cliente (RHF) y servidor
 * (Server Actions en app/admin/(protected)/contenido/actions.ts).
 */

const requiredText = (max: number) => z.string().trim().min(1, "Este campo es obligatorio").max(max);

export const portadaSchema = z.object({
  brideFirstName: requiredText(60),
  groomFirstName: requiredText(60),
  // Proviene de un <input type="datetime-local">; se convierte a ISO con
  // la zona horaria del evento en la Server Action (ver lib/format.ts).
  eventDateTimeLocal: z.string().refine((v) => !Number.isNaN(Date.parse(v)), "Fecha inválida"),
  country: requiredText(60),
  heroTitle: requiredText(80),
  heroImageAlt: requiredText(200),
});
export type PortadaInput = z.infer<typeof portadaSchema>;

export const storySchema = z.object({
  heading: requiredText(80),
  // Un párrafo por línea no vacía.
  paragraphsText: z.string().trim().min(1, "Escribe al menos un párrafo").max(4000),
});
export type StoryInput = z.infer<typeof storySchema>;

export const venueSchema = z.object({
  name: requiredText(150),
  address: requiredText(250),
  reference: requiredText(250),
  googleMapsUrl: z.string().trim().url("Ingresa una URL válida"),
  dressCode: requiredText(100),
  arrivalTime: requiredText(150),
});
export type VenueInput = z.infer<typeof venueSchema>;

export const scheduleItemSchema = z.object({
  time: requiredText(20),
  title: requiredText(120),
});
export const scheduleSchema = z.object({
  items: z.array(scheduleItemSchema).min(1, "Agrega al menos un evento"),
});
export type ScheduleInput = z.infer<typeof scheduleSchema>;

export const galleryHeadingSchema = z.object({
  heading: requiredText(80),
});

export const galleryImageEditSchema = z.object({
  src: z.string().trim().min(1),
  alt: requiredText(200),
});
export const galleryImagesSchema = z.object({
  images: z.array(galleryImageEditSchema),
});
export type GalleryImagesInput = z.infer<typeof galleryImagesSchema>;

export const giftsSchema = z
  .object({
    enabled: z.boolean(),
    heading: requiredText(80),
    thankYouMessage: requiredText(500),
    showBankDetails: z.boolean(),
    accountHolder: z.string().trim().max(150).optional().default(""),
    rut: z.string().trim().max(20).optional().default(""),
    bank: z.string().trim().max(80).optional().default(""),
    accountType: z.string().trim().max(60).optional().default(""),
    accountNumber: z.string().trim().max(40).optional().default(""),
    bankEmail: z.union([z.literal(""), z.string().trim().email("Correo inválido")]).optional().default(""),
  })
  .superRefine((data, ctx) => {
    if (!data.showBankDetails) return;

    const requiredFields: (keyof typeof data)[] = [
      "accountHolder",
      "rut",
      "bank",
      "accountType",
      "accountNumber",
      "bankEmail",
    ];
    for (const field of requiredFields) {
      if (!data[field]) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: [field],
          message: "Obligatorio si vas a mostrar los datos bancarios",
        });
      }
    }
  });
export type GiftsInput = z.infer<typeof giftsSchema>;

export const faqItemSchema = z.object({
  question: requiredText(200),
  answer: requiredText(1000),
});
export const faqSchema = z.object({
  items: z.array(faqItemSchema),
});
export type FaqInput = z.infer<typeof faqSchema>;

export const contactSchema = z.object({
  email: z.string().trim().email("Correo inválido"),
  rsvpDeadlineLocal: z.string().refine((v) => !Number.isNaN(Date.parse(v)), "Fecha inválida"),
});
export type ContactInput = z.infer<typeof contactSchema>;
