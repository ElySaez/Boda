import { buildIcsContent } from "@/lib/calendar";
import { getSiteContent } from "@/services/content.service";

/**
 * Sirve el evento del matrimonio como archivo .ics descargable.
 * Contenido genérico (no personalizado por invitado), por lo que no
 * requiere autenticación ni token.
 */
export async function GET() {
  const content = await getSiteContent();
  const ics = buildIcsContent(content);

  return new Response(ics, {
    status: 200,
    headers: {
      "Content-Type": "text/calendar; charset=utf-8",
      "Content-Disposition": 'attachment; filename="matrimonio-elisabeth-cristian.ics"',
      "Cache-Control": "public, max-age=3600",
    },
  });
}
