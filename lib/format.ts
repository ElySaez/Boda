import { toZonedTime } from "date-fns-tz";

/**
 * Zona horaria en la que se interpretan y muestran todas las fechas del
 * evento. Es una constante técnica (no contenido editable): cambiarla no
 * tiene sentido de negocio salvo que la boda cambie de país, así que vive
 * en código en vez de en site_content.
 */
export const EVENT_TIME_ZONE = "America/Santiago";

/**
 * Formatea una fecha ISO en la zona horaria del evento, independientemente
 * de la zona horaria del servidor que renderiza.
 */
export function formatDateTime(iso: string): string {
  return new Intl.DateTimeFormat("es-CL", {
    dateStyle: "long",
    timeStyle: "short",
    timeZone: EVENT_TIME_ZONE,
  }).format(new Date(iso));
}

export function formatDate(iso: string): string {
  return new Intl.DateTimeFormat("es-CL", {
    dateStyle: "long",
    timeZone: EVENT_TIME_ZONE,
  }).format(new Date(iso));
}

export function formatTime(iso: string): string {
  return new Intl.DateTimeFormat("es-CL", {
    timeStyle: "short",
    timeZone: EVENT_TIME_ZONE,
  }).format(new Date(iso));
}

/**
 * Convierte una fecha ISO (UTC) al formato esperado por un
 * <input type="datetime-local"> ("YYYY-MM-DDTHH:mm"), interpretada en la
 * zona horaria del evento, para precargar formularios de edición.
 */
export function toDatetimeLocalValue(iso: string | null): string {
  if (!iso) return "";
  const zoned = toZonedTime(new Date(iso), EVENT_TIME_ZONE);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${zoned.getFullYear()}-${pad(zoned.getMonth() + 1)}-${pad(zoned.getDate())}T${pad(zoned.getHours())}:${pad(zoned.getMinutes())}`;
}
