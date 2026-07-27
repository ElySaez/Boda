"use server";

import { revalidatePath } from "next/cache";
import { fromZonedTime } from "date-fns-tz";
import { requireAdminSession } from "@/lib/auth";
import { logAdminAction } from "@/lib/audit";
import { sanitizeText } from "@/lib/sanitize";
import { EVENT_TIME_ZONE } from "@/lib/format";
import { uploadWeddingImage } from "@/lib/storage";
import { getSiteContent, updateSiteContentSections } from "@/services/content.service";
import {
  portadaSchema,
  storySchema,
  venueSchema,
  scheduleSchema,
  galleryHeadingSchema,
  galleryImagesSchema,
  giftsSchema,
  faqSchema,
  contactSchema,
} from "@/schemas/content.schema";

type ActionResult = { success: true } | { success: false; error: string };

function revalidateContentPages() {
  revalidatePath("/");
  revalidatePath("/privacidad");
  revalidatePath("/admin/contenido");
}

export async function updatePortadaAction(rawInput: unknown): Promise<ActionResult> {
  const session = await requireAdminSession();
  const parsed = portadaSchema.safeParse(rawInput);
  if (!parsed.success) return { success: false, error: "Revisa los datos del formulario." };

  const current = await getSiteContent();
  const { error } = await updateSiteContentSections({
    couple: {
      brideFirstName: sanitizeText(parsed.data.brideFirstName, 60),
      groomFirstName: sanitizeText(parsed.data.groomFirstName, 60),
    },
    event: {
      dateTimeISO: fromZonedTime(parsed.data.eventDateTimeLocal, EVENT_TIME_ZONE).toISOString(),
      country: sanitizeText(parsed.data.country, 60),
    },
    hero: {
      ...current.hero,
      title: sanitizeText(parsed.data.heroTitle, 80),
      imageAlt: sanitizeText(parsed.data.heroImageAlt, 200),
    },
  });

  if (error) return { success: false, error };

  await logAdminAction({ userId: session.userId, action: "content_updated", entity: "site_content", details: { section: "portada" } });
  revalidateContentPages();
  return { success: true };
}

export async function uploadHeroImageAction(formData: FormData): Promise<ActionResult> {
  const session = await requireAdminSession();
  const file = formData.get("file");
  if (!(file instanceof File) || file.size === 0) {
    return { success: false, error: "Selecciona una imagen." };
  }

  const { url, error: uploadError } = await uploadWeddingImage(file, "hero");
  if (uploadError || !url) return { success: false, error: uploadError ?? "No se pudo subir la imagen." };

  const current = await getSiteContent();
  const { error } = await updateSiteContentSections({
    hero: { ...current.hero, imageSrc: url },
  });
  if (error) return { success: false, error };

  await logAdminAction({ userId: session.userId, action: "content_updated", entity: "site_content", details: { section: "hero_image" } });
  revalidateContentPages();
  return { success: true };
}

export async function updateStoryAction(rawInput: unknown): Promise<ActionResult> {
  const session = await requireAdminSession();
  const parsed = storySchema.safeParse(rawInput);
  if (!parsed.success) return { success: false, error: "Revisa los datos del formulario." };

  const paragraphs = parsed.data.paragraphsText
    .split("\n")
    .map((p) => sanitizeText(p, 1000))
    .filter((p) => p.length > 0);

  const { error } = await updateSiteContentSections({
    ourStory: { heading: sanitizeText(parsed.data.heading, 80), paragraphs },
  });
  if (error) return { success: false, error };

  await logAdminAction({ userId: session.userId, action: "content_updated", entity: "site_content", details: { section: "historia" } });
  revalidateContentPages();
  return { success: true };
}

export async function updateVenueAction(rawInput: unknown): Promise<ActionResult> {
  const session = await requireAdminSession();
  const parsed = venueSchema.safeParse(rawInput);
  if (!parsed.success) return { success: false, error: "Revisa los datos del formulario." };

  const { error } = await updateSiteContentSections({
    venue: {
      name: sanitizeText(parsed.data.name, 150),
      address: sanitizeText(parsed.data.address, 250),
      reference: sanitizeText(parsed.data.reference, 250),
      googleMapsUrl: parsed.data.googleMapsUrl.trim(),
      dressCode: sanitizeText(parsed.data.dressCode, 100),
      arrivalTime: sanitizeText(parsed.data.arrivalTime, 150),
    },
  });
  if (error) return { success: false, error };

  await logAdminAction({ userId: session.userId, action: "content_updated", entity: "site_content", details: { section: "recinto" } });
  revalidateContentPages();
  return { success: true };
}

export async function updateScheduleAction(rawInput: unknown): Promise<ActionResult> {
  const session = await requireAdminSession();
  const parsed = scheduleSchema.safeParse(rawInput);
  if (!parsed.success) return { success: false, error: "Revisa los datos del formulario." };

  const { error } = await updateSiteContentSections({
    schedule: parsed.data.items.map((item) => ({
      time: sanitizeText(item.time, 20),
      title: sanitizeText(item.title, 120),
    })),
  });
  if (error) return { success: false, error };

  await logAdminAction({ userId: session.userId, action: "content_updated", entity: "site_content", details: { section: "programa" } });
  revalidateContentPages();
  return { success: true };
}

export async function updateGalleryHeadingAction(rawInput: unknown): Promise<ActionResult> {
  const session = await requireAdminSession();
  const parsed = galleryHeadingSchema.safeParse(rawInput);
  if (!parsed.success) return { success: false, error: "Revisa los datos del formulario." };

  const current = await getSiteContent();
  const { error } = await updateSiteContentSections({
    gallery: { ...current.gallery, heading: sanitizeText(parsed.data.heading, 80) },
  });
  if (error) return { success: false, error };

  await logAdminAction({ userId: session.userId, action: "content_updated", entity: "site_content", details: { section: "galeria_titulo" } });
  revalidateContentPages();
  return { success: true };
}

export async function updateGalleryImagesAction(rawInput: unknown): Promise<ActionResult> {
  const session = await requireAdminSession();
  const parsed = galleryImagesSchema.safeParse(rawInput);
  if (!parsed.success) return { success: false, error: "Revisa los datos del formulario." };

  const current = await getSiteContent();
  const { error } = await updateSiteContentSections({
    gallery: {
      ...current.gallery,
      images: parsed.data.images.map((img) => ({ src: img.src, alt: sanitizeText(img.alt, 200) })),
    },
  });
  if (error) return { success: false, error };

  await logAdminAction({ userId: session.userId, action: "content_updated", entity: "site_content", details: { section: "galeria_fotos" } });
  revalidateContentPages();
  return { success: true };
}

type UploadGalleryImageResult =
  | { success: true; src: string; alt: string }
  | { success: false; error: string };

export async function uploadGalleryImageAction(formData: FormData): Promise<UploadGalleryImageResult> {
  const session = await requireAdminSession();
  const file = formData.get("file");
  if (!(file instanceof File) || file.size === 0) {
    return { success: false, error: "Selecciona una imagen." };
  }

  const { url, error: uploadError } = await uploadWeddingImage(file, "gallery");
  if (uploadError || !url) return { success: false, error: uploadError ?? "No se pudo subir la imagen." };

  const alt = "Fotografía de Elisabeth y Cristian";
  const current = await getSiteContent();
  const { error } = await updateSiteContentSections({
    gallery: {
      ...current.gallery,
      images: [...current.gallery.images, { src: url, alt }],
    },
  });
  if (error) return { success: false, error };

  await logAdminAction({ userId: session.userId, action: "content_updated", entity: "site_content", details: { section: "galeria_agregar_foto" } });
  revalidateContentPages();
  return { success: true, src: url, alt };
}

export async function updateGiftsAction(rawInput: unknown): Promise<ActionResult> {
  const session = await requireAdminSession();
  const parsed = giftsSchema.safeParse(rawInput);
  if (!parsed.success) return { success: false, error: "Revisa los datos del formulario." };

  const { error } = await updateSiteContentSections({
    gifts: {
      enabled: parsed.data.enabled,
      heading: sanitizeText(parsed.data.heading, 80),
      thankYouMessage: sanitizeText(parsed.data.thankYouMessage, 500),
      showBankDetails: parsed.data.showBankDetails,
      bankDetails: {
        accountHolder: sanitizeText(parsed.data.accountHolder, 150),
        rut: sanitizeText(parsed.data.rut, 20),
        bank: sanitizeText(parsed.data.bank, 80),
        accountType: sanitizeText(parsed.data.accountType, 60),
        accountNumber: sanitizeText(parsed.data.accountNumber, 40),
        email: parsed.data.bankEmail.trim(),
      },
    },
  });
  if (error) return { success: false, error };

  await logAdminAction({ userId: session.userId, action: "content_updated", entity: "site_content", details: { section: "regalos" } });
  revalidateContentPages();
  return { success: true };
}

export async function updateFaqAction(rawInput: unknown): Promise<ActionResult> {
  const session = await requireAdminSession();
  const parsed = faqSchema.safeParse(rawInput);
  if (!parsed.success) return { success: false, error: "Revisa los datos del formulario." };

  const { error } = await updateSiteContentSections({
    faq: parsed.data.items.map((item) => ({
      question: sanitizeText(item.question, 200),
      answer: sanitizeText(item.answer, 1000),
    })),
  });
  if (error) return { success: false, error };

  await logAdminAction({ userId: session.userId, action: "content_updated", entity: "site_content", details: { section: "faq" } });
  revalidateContentPages();
  return { success: true };
}

export async function updateContactAction(rawInput: unknown): Promise<ActionResult> {
  const session = await requireAdminSession();
  const parsed = contactSchema.safeParse(rawInput);
  if (!parsed.success) return { success: false, error: "Revisa los datos del formulario." };

  const { error } = await updateSiteContentSections({
    contact: { email: parsed.data.email.trim() },
    rsvp: {
      defaultDeadlineISO: fromZonedTime(parsed.data.rsvpDeadlineLocal, EVENT_TIME_ZONE).toISOString(),
    },
  });
  if (error) return { success: false, error };

  await logAdminAction({ userId: session.userId, action: "content_updated", entity: "site_content", details: { section: "contacto" } });
  revalidateContentPages();
  return { success: true };
}
