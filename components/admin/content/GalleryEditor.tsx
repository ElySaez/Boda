"use client";

import { useRef, useState, useTransition } from "react";
import Image from "next/image";
import { useFieldArray, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  galleryHeadingSchema,
  galleryImagesSchema,
  type GalleryImagesInput,
} from "@/schemas/content.schema";
import {
  updateGalleryHeadingAction,
  updateGalleryImagesAction,
  uploadGalleryImageAction,
} from "@/app/admin/(protected)/contenido/actions";
import type { SiteContent } from "@/types/domain";

export function GalleryEditor({ content }: { content: SiteContent }) {
  const [heading, setHeading] = useState(content.gallery.heading);
  const [isHeadingPending, startHeadingTransition] = useTransition();
  const [headingMessage, setHeadingMessage] = useState<string | null>(null);

  const [isUploading, setIsUploading] = useState(false);
  const [imagesMessage, setImagesMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [isImagesPending, startImagesTransition] = useTransition();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { register, handleSubmit, control } = useForm<GalleryImagesInput>({
    resolver: zodResolver(galleryImagesSchema),
    defaultValues: { images: content.gallery.images },
  });
  const { fields, remove, append } = useFieldArray({ control, name: "images" });

  function handleHeadingSubmit(event: React.FormEvent) {
    event.preventDefault();
    setHeadingMessage(null);
    const parsed = galleryHeadingSchema.safeParse({ heading });
    if (!parsed.success) {
      setHeadingMessage(parsed.error.issues[0]?.message ?? "Título inválido");
      return;
    }
    startHeadingTransition(async () => {
      const result = await updateGalleryHeadingAction(parsed.data);
      setHeadingMessage(result.success ? "Título guardado." : result.error);
    });
  }

  function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setImagesMessage(null);
    const formData = new FormData();
    formData.append("file", file);

    startImagesTransition(async () => {
      const result = await uploadGalleryImageAction(formData);
      setIsUploading(false);
      if (result.success) {
        append({ src: result.src, alt: result.alt });
        setImagesMessage({ type: "success", text: "Fotografía agregada a la galería." });
      } else {
        setImagesMessage({ type: "error", text: result.error });
      }
      if (fileInputRef.current) fileInputRef.current.value = "";
    });
  }

  function onSubmitImages(data: GalleryImagesInput) {
    setImagesMessage(null);
    startImagesTransition(async () => {
      const result = await updateGalleryImagesAction(data);
      setImagesMessage(
        result.success ? { type: "success", text: "Galería guardada." } : { type: "error", text: result.error },
      );
    });
  }

  return (
    <div className="space-y-8">
      <form onSubmit={handleHeadingSubmit} className="space-y-3">
        <label htmlFor="galleryHeading" className="mb-1 block text-sm font-semibold text-stone-800">
          Título de la sección
        </label>
        <div className="flex gap-2">
          <input
            id="galleryHeading"
            value={heading}
            onChange={(e) => setHeading(e.target.value)}
            className="flex-1 rounded-xl border-2 border-stone-200 px-3 py-2"
          />
          <button type="submit" disabled={isHeadingPending} className="btn-secondary">
            Guardar título
          </button>
        </div>
        {headingMessage && <p className="text-sm text-stone-600">{headingMessage}</p>}
      </form>

      <div>
        <label className="btn-secondary cursor-pointer">
          {isUploading ? "Subiendo..." : "+ Agregar fotografía"}
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

      <form onSubmit={handleSubmit(onSubmitImages)} noValidate className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          {fields.map((field, index) => (
            <div key={field.id} className="flex gap-3 rounded-xl bg-cream-100 p-3">
              <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-lg bg-barbie-100">
                <Image src={field.src} alt="" fill className="object-cover" />
              </div>
              <div className="flex-1 space-y-2">
                <label className="sr-only" htmlFor={`images.${index}.alt`}>
                  Texto alternativo de la foto {index + 1}
                </label>
                <input
                  id={`images.${index}.alt`}
                  className="w-full rounded-lg border-2 border-stone-200 px-2 py-1 text-sm"
                  {...register(`images.${index}.alt` as const)}
                />
                <button
                  type="button"
                  onClick={() => remove(index)}
                  className="text-xs font-semibold text-red-600"
                >
                  Eliminar
                </button>
              </div>
            </div>
          ))}
        </div>

        {fields.length === 0 && (
          <p className="text-sm text-stone-500">Aún no hay fotografías en la galería.</p>
        )}

        {imagesMessage && (
          <p className={`text-sm ${imagesMessage.type === "success" ? "text-green-700" : "text-red-600"}`}>
            {imagesMessage.text}
          </p>
        )}

        <button type="submit" disabled={isImagesPending} className="btn-primary">
          {isImagesPending ? "Guardando..." : "Guardar cambios de la galería"}
        </button>
      </form>
    </div>
  );
}
