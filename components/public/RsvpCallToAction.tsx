import type { SiteContent } from "@/types/domain";

/**
 * La invitación pública ("/") es de contenido general y no identifica
 * invitados: por seguridad y privacidad no existe un buscador de "encuentra
 * tu invitación por nombre" (permitiría enumerar invitados). Cada persona
 * recibe un enlace personal /invitacion/[token]; esta sección solo explica
 * cómo usarlo y ofrece un contacto de respaldo.
 */
export function RsvpCallToAction({ content }: { content: SiteContent }) {
  return (
    <section
      id="confirmar"
      aria-labelledby="confirmar-heading"
      className="section-container bg-barbie-50 rounded-[2rem] text-center"
    >
      <h2 id="confirmar-heading" className="section-heading">
        Confirma tu asistencia
      </h2>
      <p className="mx-auto max-w-xl text-stone-700">
        Te enviamos un enlace personal de invitación por WhatsApp o correo
        electrónico: úsalo para confirmar tu asistencia, indicar acompañantes
        y contarnos si tienes alguna restricción alimentaria o necesidad de
        accesibilidad.
      </p>
      <p className="mx-auto mt-4 max-w-xl text-stone-600">
        ¿No encuentras tu enlace?{" "}
        <a
          href={`mailto:${content.contact.email}`}
          className="font-semibold text-barbie-600 underline underline-offset-2"
        >
          Escríbenos a {content.contact.email}
        </a>{" "}
        y te lo reenviamos.
      </p>
    </section>
  );
}
