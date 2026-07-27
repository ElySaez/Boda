import { Navbar } from "./Navbar";
import { HeroSection } from "./HeroSection";
import { OurStorySection } from "./OurStorySection";
import { EventInfoSection } from "./EventInfoSection";
import { TimelineSection } from "./TimelineSection";
import { GallerySection } from "./GallerySection";
import { GiftsSection } from "./GiftsSection";
import { FaqSection } from "./FaqSection";
import { Footer } from "./Footer";
import { FloralDivider } from "./decorative/FloralDivider";
import type { SiteContent } from "@/types/domain";

/**
 * Estructura común de la invitación (portada, historia, info, programa,
 * galería, regalos, FAQ), compartida entre la landing pública ("/") y la
 * invitación personal ("/invitacion/[token]"): un invitado que abre su
 * enlace debe ver la misma invitación completa que cualquier visitante,
 * no solo un formulario suelto. Lo único que cambia entre ambas es la
 * sección de confirmación de asistencia, recibida como `rsvpSection`.
 */
export function PublicSiteLayout({
  content,
  rsvpSection,
}: {
  content: SiteContent;
  rsvpSection: React.ReactNode;
}) {
  return (
    <>
      <Navbar content={content} />
      <main>
        <HeroSection content={content} />
        <OurStorySection content={content} />
        <FloralDivider />
        <EventInfoSection content={content} />
        <TimelineSection content={content} />
        <FloralDivider />
        <GallerySection content={content} />
        <GiftsSection content={content} />
        {rsvpSection}
        <FaqSection content={content} />
      </main>
      <Footer content={content} />
    </>
  );
}
