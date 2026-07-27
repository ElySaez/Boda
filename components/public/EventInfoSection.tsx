import { formatDate, formatTime } from "@/lib/format";
import { AddToCalendarButton } from "./AddToCalendarButton";
import type { SiteContent } from "@/types/domain";

export function EventInfoSection({ content }: { content: SiteContent }) {
  const items: { label: string; value: string }[] = [
    { label: "Fecha", value: formatDate(content.event.dateTimeISO) },
    { label: "Hora", value: formatTime(content.event.dateTimeISO) },
    { label: "Recinto", value: content.venue.name },
    { label: "Dirección", value: content.venue.address },
    { label: "Referencia", value: content.venue.reference },
    { label: "Código de vestimenta", value: content.venue.dressCode },
    { label: "Hora recomendada de llegada", value: content.venue.arrivalTime },
  ];

  return (
    <section
      id="informacion"
      aria-labelledby="informacion-heading"
      className="section-container bg-white/60 rounded-[2rem]"
    >
      <h2 id="informacion-heading" className="section-heading">
        Información del matrimonio
      </h2>

      <dl className="mx-auto grid max-w-2xl gap-5 sm:grid-cols-2">
        {items.map((item) => (
          <div key={item.label} className="rounded-2xl bg-cream-100 p-4">
            <dt className="text-xs font-semibold uppercase tracking-wide text-coral-500">
              {item.label}
            </dt>
            <dd className="mt-1 text-stone-800">{item.value}</dd>
          </div>
        ))}
      </dl>

      <div className="mt-10 flex flex-col items-center gap-4">
        <a
          href={content.venue.googleMapsUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="btn-primary"
        >
          Ver ubicación en Google Maps
        </a>
        <AddToCalendarButton content={content} />
      </div>
    </section>
  );
}
