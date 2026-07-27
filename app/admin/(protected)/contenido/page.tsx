import type { Metadata } from "next";
import { getSiteContent } from "@/services/content.service";
import { SectionCard } from "@/components/admin/content/SectionCard";
import { PortadaEditor } from "@/components/admin/content/PortadaEditor";
import { StoryEditor } from "@/components/admin/content/StoryEditor";
import { VenueEditor } from "@/components/admin/content/VenueEditor";
import { ScheduleEditor } from "@/components/admin/content/ScheduleEditor";
import { GalleryEditor } from "@/components/admin/content/GalleryEditor";
import { GiftsEditor } from "@/components/admin/content/GiftsEditor";
import { FaqEditor } from "@/components/admin/content/FaqEditor";
import { ContactEditor } from "@/components/admin/content/ContactEditor";

export const metadata: Metadata = {
  title: "Contenido | Panel administrativo",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function AdminContentPage() {
  const content = await getSiteContent();

  return (
    <div>
      <h1 className="font-heading text-2xl text-stone-900">Contenido del sitio</h1>
      <p className="mt-1 text-sm text-stone-500">
        Los cambios se publican de inmediato en la invitación pública.
      </p>

      <div className="mt-6 space-y-4">
        <SectionCard title="Portada y fecha" description="Nombres, fecha del matrimonio y fotografía principal" defaultOpen>
          <PortadaEditor content={content} />
        </SectionCard>

        <SectionCard title="Nuestra historia">
          <StoryEditor content={content} />
        </SectionCard>

        <SectionCard title="Recinto">
          <VenueEditor content={content} />
        </SectionCard>

        <SectionCard title="Programa">
          <ScheduleEditor content={content} />
        </SectionCard>

        <SectionCard title="Galería">
          <GalleryEditor content={content} />
        </SectionCard>

        <SectionCard title="Regalos">
          <GiftsEditor content={content} />
        </SectionCard>

        <SectionCard title="Preguntas frecuentes">
          <FaqEditor content={content} />
        </SectionCard>

        <SectionCard title="Contacto y confirmación">
          <ContactEditor content={content} />
        </SectionCard>
      </div>
    </div>
  );
}
