import Image from "next/image";
import { formatDate, formatTime } from "@/lib/format";
import { Countdown } from "./Countdown";
import { CatSilhouettes } from "./decorative/CatSilhouettes";
import type { SiteContent } from "@/types/domain";

export function HeroSection({ content }: { content: SiteContent }) {
  return (
    <section
      id="inicio"
      aria-label="Inicio"
      className="relative overflow-hidden bg-gradient-to-b from-barbie-50 via-cream-100 to-cream-100 px-5 pb-16 pt-14 text-center sm:pt-20"
    >
      <div className="mx-auto max-w-3xl">
        <p className="animate-fade-in-up font-semibold uppercase tracking-[0.2em] text-coral-500">
          {content.hero.title}
        </p>

        <h1 className="animate-fade-in-up mt-3 font-heading text-4xl text-barbie-600 sm:text-6xl">
          {content.couple.brideFirstName}{" "}
          <span className="text-gold-500">&amp;</span>{" "}
          {content.couple.groomFirstName}
        </h1>

        <p className="mt-4 text-lg text-stone-600">
          {formatDate(content.event.dateTimeISO)} · {formatTime(content.event.dateTimeISO)}
        </p>

        <div className="relative mx-auto mt-8 aspect-[4/3] w-full max-w-md overflow-hidden rounded-[2rem] bg-barbie-100 shadow-lg sm:aspect-[16/10]">
          <Image
            src={content.hero.imageSrc}
            alt={content.hero.imageAlt}
            fill
            priority
            sizes="(min-width: 640px) 480px, 100vw"
            className="object-cover"
          />
        </div>

        <div className="mt-8">
          <Countdown targetISO={content.event.dateTimeISO} />
        </div>

        <a href="#confirmar" className="btn-primary mt-10">
          Confirmar asistencia
        </a>

        <CatSilhouettes className="mx-auto mt-10 h-10 w-auto animate-gentle-float" />
      </div>
    </section>
  );
}
