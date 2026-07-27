import type { SiteContent } from "@/types/domain";

/**
 * Configuración técnica del sitio (no editable desde el panel admin):
 * depende del entorno de despliegue, no es contenido de la boda.
 */
export const siteConfig = {
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
  name: "Invitación de matrimonio",
} as const;

/**
 * Contenido por defecto del sitio (portada, historia, recinto, programa,
 * galería, regalos, FAQ).
 *
 * Este objeto es SOLO el valor de respaldo/inicial: la fuente de verdad en
 * producción es la tabla `site_content` de Supabase, editable desde
 * `/admin/contenido` (ver services/content.service.ts). Este archivo se usa:
 *   1. Como semilla del `insert` en supabase/migrations/0004_site_content.sql
 *      (debe mantenerse en sync manualmente con esos valores).
 *   2. Como fallback si la fila de `site_content` no puede leerse.
 *
 * Los campos marcados con `// EJEMPLO` son datos de muestra.
 */
export const defaultSiteContent: SiteContent = {
  couple: {
    brideFirstName: "Elisabeth",
    groomFirstName: "Cristian",
  },
  event: {
    dateTimeISO: "2026-11-21T12:00:00-03:00",
    country: "Chile",
  },
  hero: {
    title: "¡Nos casamos!",
    imageSrc: "/images/hero-placeholder.svg", // EJEMPLO
    imageAlt: "Elisabeth y Cristian", // EJEMPLO
  },
  ourStory: {
    heading: "Nuestra historia",
    paragraphs: [
      "Después de compartir sueños, desafíos, código, aventuras y la compañía de nuestras gatitas, decidimos comenzar una nueva etapa juntos. Queremos celebrar este momento rodeados de las personas que forman parte de nuestra historia.",
    ],
  },
  venue: {
    name: "Salón Jardín Primavera", // EJEMPLO
    address: "Camino Los Aromos 1234, Colina, Región Metropolitana", // EJEMPLO
    reference: "Portón blanco junto a la rotonda, a 5 minutos de la Ruta 5.", // EJEMPLO
    googleMapsUrl: "https://maps.google.com/?q=Camino+Los+Aromos+1234+Colina", // EJEMPLO
    dressCode: "Formal / Elegante primaveral", // EJEMPLO
    arrivalTime: "11:30 horas (30 minutos antes del inicio de la ceremonia)", // EJEMPLO
  },
  schedule: [
    { time: "11:30", title: "Llegada de invitados" },
    { time: "12:00", title: "Ceremonia" },
    { time: "13:00", title: "Recepción" },
    { time: "14:00", title: "Almuerzo" },
    { time: "16:00", title: "Celebración" },
  ],
  gallery: {
    heading: "Galería",
    images: [
      { src: "/images/gallery/foto-1.svg", alt: "Elisabeth y Cristian paseando al aire libre" }, // EJEMPLO
      { src: "/images/gallery/foto-2.svg", alt: "Elisabeth y Cristian sonriendo juntos" }, // EJEMPLO
      { src: "/images/gallery/foto-3.svg", alt: "Elisabeth y Cristian en una celebración" }, // EJEMPLO
      { src: "/images/gallery/foto-4.svg", alt: "Detalle de manos entrelazadas" }, // EJEMPLO
      { src: "/images/gallery/foto-5.svg", alt: "Elisabeth y Cristian con sus gatitas" }, // EJEMPLO
      { src: "/images/gallery/foto-6.svg", alt: "Atardecer de primavera" }, // EJEMPLO
    ],
  },
  gifts: {
    enabled: true,
    heading: "Regalos",
    thankYouMessage:
      "No queremos otro regalo que tenerlos con nosotros ese día. Su cariño y su compañía son el mejor regalo que podemos recibir.",
    showBankDetails: false,
    bankDetails: {
      accountHolder: "Elisabeth [Apellido]", // EJEMPLO
      rut: "11.111.111-1", // EJEMPLO
      bank: "Banco Ejemplo", // EJEMPLO
      accountType: "Cuenta Vista", // EJEMPLO
      accountNumber: "000123456789", // EJEMPLO
      email: "regalos.elisabethycristian@example.com", // EJEMPLO
    },
  },
  faq: [
    {
      question: "¿Puedo asistir con acompañante?",
      answer:
        "Solo si tu invitación lo indica expresamente. Revisa el detalle de cupos en tu invitación personal.",
    },
    {
      question: "¿Puedo llevar niños?",
      answer:
        "La asistencia de niños depende de lo indicado en tu invitación personal. Si tienes dudas, contáctanos directamente.",
    },
    {
      question: "¿Cuál es el código de vestimenta?",
      answer: "Formal / Elegante primaveral.", // EJEMPLO
    },
    {
      question: "¿Hay estacionamiento?",
      answer: "Sí, el recinto cuenta con estacionamiento gratuito para los invitados.", // EJEMPLO
    },
    {
      question: "¿Hasta qué fecha puedo confirmar?",
      answer:
        "La fecha límite aparece en tu invitación personal. Te recomendamos confirmar apenas puedas.",
    },
    {
      question: "¿Qué hago si necesito modificar mi respuesta?",
      answer:
        "Puedes volver a ingresar a tu enlace de invitación y actualizar tu respuesta hasta la fecha límite indicada.",
    },
  ],
  rsvp: {
    defaultDeadlineISO: "2026-10-21T23:59:59-03:00",
  },
  contact: {
    email: "elisabethycristian.boda@example.com", // EJEMPLO
  },
};
