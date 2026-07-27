import type { Database } from "./database.types";

export type Guest = Database["public"]["Tables"]["guests"]["Row"];
export type GuestInsert = Database["public"]["Tables"]["guests"]["Insert"];
export type GuestUpdate = Database["public"]["Tables"]["guests"]["Update"];

export type Rsvp = Database["public"]["Tables"]["rsvps"]["Row"];
export type RsvpInsert = Database["public"]["Tables"]["rsvps"]["Insert"];

export type Companion = Database["public"]["Tables"]["companions"]["Row"];
export type CompanionInsert =
  Database["public"]["Tables"]["companions"]["Insert"];

export type Administrator =
  Database["public"]["Tables"]["administrators"]["Row"];

export type AuditLogEntry = Database["public"]["Tables"]["audit_log"]["Row"];

/**
 * Estado de confirmación derivado. La tabla `rsvps` solo almacena una fila
 * cuando el invitado ya respondió (confirmed/declined); la ausencia de fila
 * significa "pending". Este tipo unifica ambos casos para la capa de UI.
 */
export type GuestStatus = "pending" | "confirmed" | "declined";

export interface GuestWithRsvp extends Guest {
  rsvp: (Rsvp & { companions: Companion[] }) | null;
  status: GuestStatus;
}

/**
 * Contenido editable del sitio público (portada, historia, recinto,
 * programa, galería, regalos, FAQ). Vive en la tabla `site_content`
 * (columna jsonb) y se administra desde /admin/contenido. No incluye
 * datos derivados del entorno (URL del sitio) ni la zona horaria (ver
 * lib/format.ts), que son constantes técnicas, no contenido de negocio.
 */
export interface SiteContent {
  couple: {
    brideFirstName: string;
    groomFirstName: string;
  };
  event: {
    /** Fecha y hora del evento en ISO 8601, con offset de zona horaria. */
    dateTimeISO: string;
    country: string;
  };
  hero: {
    title: string;
    imageSrc: string;
    imageAlt: string;
  };
  ourStory: {
    heading: string;
    paragraphs: string[];
  };
  venue: {
    name: string;
    address: string;
    reference: string;
    googleMapsUrl: string;
    dressCode: string;
    arrivalTime: string;
  };
  schedule: { time: string; title: string }[];
  gallery: {
    heading: string;
    images: { src: string; alt: string }[];
  };
  gifts: {
    enabled: boolean;
    heading: string;
    thankYouMessage: string;
    /** Si es false, la sección solo muestra thankYouMessage (sin datos bancarios ni botón de copiar). */
    showBankDetails: boolean;
    bankDetails: {
      accountHolder: string;
      rut: string;
      bank: string;
      accountType: string;
      accountNumber: string;
      email: string;
    };
  };
  faq: { question: string; answer: string }[];
  rsvp: {
    defaultDeadlineISO: string;
  };
  contact: {
    email: string;
  };
}

export interface DashboardStats {
  totalGuestsRegistered: number;
  totalSeatsAvailable: number;
  confirmedPeople: number;
  declinedGuests: number;
  pendingGuests: number;
  confirmedAdults: number;
  confirmedChildren: number;
  peopleWithDietaryRestrictions: number;
  confirmationRate: number;
  tablesInUse: number;
}
