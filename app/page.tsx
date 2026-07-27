import { PublicSiteLayout } from "@/components/public/PublicSiteLayout";
import { RsvpCallToAction } from "@/components/public/RsvpCallToAction";
import { getSiteContent } from "@/services/content.service";

// El contenido puede cambiar desde /admin/contenido en cualquier momento;
// se resuelve en cada solicitud en vez de quedar fijo en el build.
export const dynamic = "force-dynamic";

export default async function HomePage() {
  const content = await getSiteContent();

  return (
    <PublicSiteLayout content={content} rsvpSection={<RsvpCallToAction content={content} />} />
  );
}
