"use client";

import { useRef, useState, useTransition } from "react";
import Image from "next/image";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { portadaSchema, type PortadaInput } from "@/schemas/content.schema";
import { toDatetimeLocalValue } from "@/lib/format";
import { updatePortadaAction, uploadHeroImageAction } from "@/app/admin/(protected)/contenido/actions";
import type { SiteContent } from "@/types/domain";

export function PortadaEditor({ content }: { content: SiteContent }) {
  const [isPending, startTransition] = useTransition();
  const [isUploading, setIsUploading] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [imageSrc, setImageSrc] = useState(content.hero.imageSrc);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<PortadaInput>({
    resolver: zodResolver(portadaSchema),
    defaultValues: {
      brideFirstName: content.couple.brideFirstName,
      groomFirstName: content.couple.groomFirstName,
      eventDateTimeLocal: toDatetimeLocalValue(content.event.dateTimeISO),
      country: content.event.country,
      heroTitle: content.hero.title,
      heroImageAlt: content.hero.imageAlt,
    },
  });

  function onSubmit(data: PortadaInput) {
    setMessage(null);
    startTransition(async () => {
      const result = await updatePortadaAction(data);
      setMessage(
        result.success
          ? { type: "success", text: "Portada guardada." }
          : { type: "error", text: result.error },
      );
    });
  }

  function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setMessage(null);
    const formData = new FormData();
    formData.append("file", file);

    startTransition(async () => {
      const result = await uploadHeroImageAction(formData);
      setIsUploading(false);
      if (result.success) {
        setImageSrc(URL.createObjectURL(file));
        setMessage({ type: "success", text: "Fotografía principal actualizada." });
      } else {
        setMessage({ type: "error", text: result.error });
      }
      if (fileInputRef.current) fileInputRef.current.value = "";
    });
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col items-start gap-4 sm:flex-row">
        <div className="relative h-32 w-32 shrink-0 overflow-hidden rounded-xl bg-barbie-100">
          <Image src={imageSrc} alt="" fill className="object-cover" />
        </div>
        <div>
          <label className="btn-secondary cursor-pointer">
            {isUploading ? "Subiendo..." : "Cambiar fotografía principal"}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp,image/svg+xml"
              onChange={handleFileChange}
              disabled={isUploading}
              className="sr-only"
            />
          </label>
          <p className="mt-2 text-xs text-stone-500">JPG, PNG, WEBP o SVG. Máximo 5 MB.</p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="brideFirstName" className="mb-1 block text-sm font-semibold text-stone-800">
              Nombre de la novia
            </label>
            <input id="brideFirstName" className="w-full rounded-xl border-2 border-stone-200 px-3 py-2" {...register("brideFirstName")} />
            {errors.brideFirstName && <p className="mt-1 text-sm text-red-600">{errors.brideFirstName.message}</p>}
          </div>
          <div>
            <label htmlFor="groomFirstName" className="mb-1 block text-sm font-semibold text-stone-800">
              Nombre del novio
            </label>
            <input id="groomFirstName" className="w-full rounded-xl border-2 border-stone-200 px-3 py-2" {...register("groomFirstName")} />
            {errors.groomFirstName && <p className="mt-1 text-sm text-red-600">{errors.groomFirstName.message}</p>}
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="eventDateTimeLocal" className="mb-1 block text-sm font-semibold text-stone-800">
              Fecha y hora del matrimonio
            </label>
            <input
              id="eventDateTimeLocal"
              type="datetime-local"
              className="w-full rounded-xl border-2 border-stone-200 px-3 py-2"
              {...register("eventDateTimeLocal")}
            />
            {errors.eventDateTimeLocal && <p className="mt-1 text-sm text-red-600">{errors.eventDateTimeLocal.message}</p>}
          </div>
          <div>
            <label htmlFor="country" className="mb-1 block text-sm font-semibold text-stone-800">
              País
            </label>
            <input id="country" className="w-full rounded-xl border-2 border-stone-200 px-3 py-2" {...register("country")} />
          </div>
        </div>

        <div>
          <label htmlFor="heroTitle" className="mb-1 block text-sm font-semibold text-stone-800">
            Frase principal
          </label>
          <input id="heroTitle" className="w-full rounded-xl border-2 border-stone-200 px-3 py-2" {...register("heroTitle")} />
        </div>

        <div>
          <label htmlFor="heroImageAlt" className="mb-1 block text-sm font-semibold text-stone-800">
            Descripción de la foto (para accesibilidad)
          </label>
          <input id="heroImageAlt" className="w-full rounded-xl border-2 border-stone-200 px-3 py-2" {...register("heroImageAlt")} />
        </div>

        {message && (
          <p className={`text-sm ${message.type === "success" ? "text-green-700" : "text-red-600"}`}>
            {message.text}
          </p>
        )}

        <button type="submit" disabled={isPending} className="btn-primary">
          {isPending ? "Guardando..." : "Guardar portada"}
        </button>
      </form>
    </div>
  );
}
