import type { Metadata } from "next";
import Link from "next/link";
import { getGuestByToken } from "@/services/guests.service";
import { getSiteContent } from "@/services/content.service";
import { PublicSiteLayout } from "@/components/public/PublicSiteLayout";
import { PersonalRsvpSection } from "@/components/public/PersonalRsvpSection";

export const metadata: Metadata = {
  title: "Mi invitación",
  robots: { index: false, follow: false },
};

// El contenido depende del token en cada solicitud; nunca debe cachearse
// ni pre-renderizarse de forma estática.
export const dynamic = "force-dynamic";

export default async function InvitationPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  const [guest, content] = await Promise.all([getGuestByToken(token), getSiteContent()]);

  if (!guest || !guest.invitation_active) {
    return (
      <main className="mx-auto flex min-h-[70vh] max-w-md flex-col items-center justify-center px-5 text-center">
        <h1 className="font-heading text-2xl text-barbie-600">
          No pudimos encontrar tu invitación
        </h1>
        <p className="mt-3 text-stone-600">
          Verifica que el enlace esté completo y correcto. Si el problema
          persiste, escríbenos a{" "}
          <a
            href={`mailto:${content.contact.email}`}
            className="font-semibold text-barbie-600 underline underline-offset-2"
          >
            {content.contact.email}
          </a>
          .
        </p>
        <Link href="/" className="btn-secondary mt-6">
          Volver a la invitación
        </Link>
      </main>
    );
  }

  return (
    <PublicSiteLayout
      content={content}
      rsvpSection={<PersonalRsvpSection guest={guest} token={token} content={content} />}
    />
  );
}
