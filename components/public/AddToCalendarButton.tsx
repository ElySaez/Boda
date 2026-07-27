import { buildGoogleCalendarUrl } from "@/lib/calendar";
import type { SiteContent } from "@/types/domain";

export function AddToCalendarButton({ content }: { content: SiteContent }) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row">
      <a
        href={buildGoogleCalendarUrl(content)}
        target="_blank"
        rel="noopener noreferrer"
        className="btn-secondary"
      >
        Agregar a Google Calendar
      </a>
      <a href="/api/ics" download className="btn-secondary">
        Descargar archivo .ics
      </a>
    </div>
  );
}
