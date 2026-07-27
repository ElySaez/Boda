/**
 * Sanitización defensiva de texto libre entregado por invitados antes de
 * almacenarlo. React ya escapa el contenido al renderizarlo (sin
 * dangerouslySetInnerHTML en ningún componente), por lo que esto es una
 * capa adicional de defensa en profundidad: quita etiquetas HTML,
 * caracteres de control y normaliza espacios.
 */

const CONTROL_CHARS_PATTERN = new RegExp(
  "[" + String.fromCharCode(0) + "-" + String.fromCharCode(31) + String.fromCharCode(127) + "]",
  "g",
);

export function sanitizeText(value: string | undefined | null, maxLength = 1000): string {
  if (!value) return "";

  return value
    .replace(/<[^>]*>/g, "")
    .replace(CONTROL_CHARS_PATTERN, "")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, maxLength);
}

export function sanitizePhone(value: string | undefined | null): string {
  if (!value) return "";
  return value
    .replace(/[^0-9+()\s-]/g, "")
    .trim()
    .slice(0, 20);
}
