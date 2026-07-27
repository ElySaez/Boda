import type { SiteContent } from "@/types/domain";
import { siteConfig } from "@/config/wedding";

/**
 * Duración por defecto del evento para efectos de calendario (Google Calendar / .ics),
 * cuando no se especifica una hora de término exacta en el contenido.
 */
const EVENT_DURATION_HOURS = 6;

function getEventBounds(content: SiteContent) {
  const start = new Date(content.event.dateTimeISO);
  const end = new Date(start.getTime() + EVENT_DURATION_HOURS * 60 * 60 * 1000);
  return { start, end };
}

function toGoogleCalendarDate(date: Date): string {
  return date.toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";
}

export function buildGoogleCalendarUrl(content: SiteContent): string {
  const { start, end } = getEventBounds(content);
  const params = new URLSearchParams({
    action: "TEMPLATE",
    text: `Matrimonio de ${content.couple.brideFirstName} y ${content.couple.groomFirstName}`,
    dates: `${toGoogleCalendarDate(start)}/${toGoogleCalendarDate(end)}`,
    details: `Ceremonia y celebración del matrimonio de ${content.couple.brideFirstName} y ${content.couple.groomFirstName}.`,
    location: `${content.venue.name}, ${content.venue.address}`,
  });
  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}

function escapeIcsText(text: string): string {
  return text.replace(/[\\;,]/g, (match) => `\\${match}`).replace(/\n/g, "\\n");
}

function toIcsDate(date: Date): string {
  return date.toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";
}

/**
 * Genera el contenido de un archivo .ics estándar (RFC 5545) para el evento
 * general del matrimonio. Es el mismo para todos los invitados: no contiene
 * información personal.
 */
export function buildIcsContent(content: SiteContent): string {
  const { start, end } = getEventBounds(content);
  const uid = `boda-${content.couple.brideFirstName}-${content.couple.groomFirstName}-${start.getTime()}@${new URL(siteConfig.url).hostname}`;

  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Invitacion Boda//ES",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    "BEGIN:VEVENT",
    `UID:${uid}`,
    `DTSTAMP:${toIcsDate(new Date())}`,
    `DTSTART:${toIcsDate(start)}`,
    `DTEND:${toIcsDate(end)}`,
    `SUMMARY:${escapeIcsText(`Matrimonio de ${content.couple.brideFirstName} y ${content.couple.groomFirstName}`)}`,
    `DESCRIPTION:${escapeIcsText(content.ourStory.paragraphs[0] ?? "")}`,
    `LOCATION:${escapeIcsText(`${content.venue.name}, ${content.venue.address}`)}`,
    "END:VEVENT",
    "END:VCALENDAR",
  ];

  return lines.join("\r\n");
}
