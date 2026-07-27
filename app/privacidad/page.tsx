import type { Metadata } from "next";
import Link from "next/link";
import { getSiteContent } from "@/services/content.service";

export const metadata: Metadata = {
  title: "Política de privacidad",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function PrivacyPage() {
  const content = await getSiteContent();

  return (
    <main className="mx-auto max-w-2xl px-5 py-16">
      <Link href="/" className="text-sm font-semibold text-barbie-600 underline underline-offset-2">
        ← Volver a la invitación
      </Link>

      <h1 className="mt-6 font-heading text-3xl text-barbie-600">Política de privacidad</h1>

      <div className="mt-6 space-y-4 text-stone-700">
        <p>
          Esta página describe cómo{" "}
          {content.couple.brideFirstName} y {content.couple.groomFirstName}{" "}
          tratan los datos personales que entregas al confirmar tu asistencia a nuestro
          matrimonio.
        </p>

        <h2 className="font-heading text-xl text-stone-900">¿Qué datos recopilamos?</h2>
        <p>
          Nombre de los asistentes, teléfono, correo electrónico opcional, restricciones
          alimentarias, alergias, necesidades de accesibilidad y el mensaje que quieras
          dejarnos. Solo se solicita la información estrictamente necesaria para organizar
          el evento.
        </p>

        <h2 className="font-heading text-xl text-stone-900">¿Para qué se usan?</h2>
        <p>
          Únicamente para gestionar la logística de nuestro matrimonio: número de asistentes,
          disposición de mesas y atención de requerimientos alimentarios o de accesibilidad.
          No se utilizan con fines comerciales ni se comparten con terceros ajenos a la
          organización del evento.
        </p>

        <h2 className="font-heading text-xl text-stone-900">¿Cómo se protegen?</h2>
        <p>
          Tu invitación es accesible solo mediante un enlace personal con un identificador
          aleatorio. Los datos se almacenan en una base de datos con controles de acceso
          restringidos exclusivamente a los novios.
        </p>

        <h2 className="font-heading text-xl text-stone-900">¿Cuánto tiempo se conservan?</h2>
        <p>
          Los datos se conservan solo mientras dure la organización del evento y se eliminan
          una vez finalizado, salvo que decidamos conservarlos como recuerdo con tu
          consentimiento.
        </p>

        <h2 className="font-heading text-xl text-stone-900">Tus derechos</h2>
        <p>
          Puedes solicitar la modificación o eliminación de tus datos escribiendo a{" "}
          <a
            href={`mailto:${content.contact.email}`}
            className="font-semibold text-barbie-600 underline underline-offset-2"
          >
            {content.contact.email}
          </a>
          .
        </p>
      </div>
    </main>
  );
}
