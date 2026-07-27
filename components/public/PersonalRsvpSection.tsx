import { formatDateTime } from "@/lib/format";
import { isDeadlinePassed } from "@/services/guests.service";
import { RsvpForm } from "./RsvpForm";
import type { GuestWithRsvp, GuestStatus, SiteContent } from "@/types/domain";

const statusLabel: Record<GuestStatus, string> = {
  pending: "Pendiente de respuesta",
  confirmed: "Asistencia confirmada",
  declined: "Asistencia rechazada",
};

export function PersonalRsvpSection({
  guest,
  token,
  content,
}: {
  guest: GuestWithRsvp;
  token: string;
  content: SiteContent;
}) {
  const deadlinePassed = isDeadlinePassed(guest.response_deadline);

  return (
    <section
      id="confirmar"
      aria-labelledby="confirmar-heading"
      className="section-container bg-barbie-50 rounded-[2rem]"
    >
      <div className="mx-auto max-w-2xl rounded-[2rem] bg-white p-6 shadow-sm sm:p-10">
        <p className="text-center text-sm font-semibold uppercase tracking-wide text-coral-500">
          Invitación de {content.couple.brideFirstName} &amp; {content.couple.groomFirstName}
        </p>
        <h2 id="confirmar-heading" className="mt-2 text-center font-heading text-3xl text-barbie-600">
          {guest.full_name}
        </h2>

        <dl className="mx-auto mt-6 grid max-w-md gap-3 text-sm sm:grid-cols-2">
          <div className="rounded-xl bg-cream-100 p-3">
            <dt className="font-semibold text-stone-500">Cupos autorizados</dt>
            <dd className="text-stone-800">{guest.maximum_guests}</dd>
          </div>
          <div className="rounded-xl bg-cream-100 p-3">
            <dt className="font-semibold text-stone-500">Estado actual</dt>
            <dd className="text-stone-800">{statusLabel[guest.status]}</dd>
          </div>
          {guest.response_deadline && (
            <div className="rounded-xl bg-cream-100 p-3 sm:col-span-2">
              <dt className="font-semibold text-stone-500">Fecha límite para confirmar</dt>
              <dd className="text-stone-800">{formatDateTime(guest.response_deadline)}</dd>
            </div>
          )}
        </dl>

        <div className="mt-8">
          {deadlinePassed ? (
            <p className="rounded-xl bg-sunset-50 p-4 text-center text-stone-700">
              La fecha límite para confirmar tu asistencia ya pasó. Si necesitas
              modificar tu respuesta, escríbenos a{" "}
              <a
                href={`mailto:${content.contact.email}`}
                className="font-semibold text-barbie-600 underline underline-offset-2"
              >
                {content.contact.email}
              </a>
              .
            </p>
          ) : (
            <RsvpForm token={token} guest={guest} />
          )}
        </div>
      </div>
    </section>
  );
}
