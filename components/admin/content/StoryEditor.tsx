"use client";

import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { storySchema, type StoryInput } from "@/schemas/content.schema";
import { updateStoryAction } from "@/app/admin/(protected)/contenido/actions";
import type { SiteContent } from "@/types/domain";

export function StoryEditor({ content }: { content: SiteContent }) {
  const [isPending, startTransition] = useTransition();
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<StoryInput>({
    resolver: zodResolver(storySchema),
    defaultValues: {
      heading: content.ourStory.heading,
      paragraphsText: content.ourStory.paragraphs.join("\n"),
    },
  });

  function onSubmit(data: StoryInput) {
    setMessage(null);
    startTransition(async () => {
      const result = await updateStoryAction(data);
      setMessage(
        result.success ? { type: "success", text: "Historia guardada." } : { type: "error", text: result.error },
      );
    });
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
      <div>
        <label htmlFor="storyHeading" className="mb-1 block text-sm font-semibold text-stone-800">
          Título de la sección
        </label>
        <input id="storyHeading" className="w-full rounded-xl border-2 border-stone-200 px-3 py-2" {...register("heading")} />
      </div>

      <div>
        <label htmlFor="paragraphsText" className="mb-1 block text-sm font-semibold text-stone-800">
          Texto (un párrafo por línea)
        </label>
        <textarea
          id="paragraphsText"
          rows={6}
          className="w-full rounded-xl border-2 border-stone-200 px-3 py-2"
          {...register("paragraphsText")}
        />
        {errors.paragraphsText && <p className="mt-1 text-sm text-red-600">{errors.paragraphsText.message}</p>}
      </div>

      {message && (
        <p className={`text-sm ${message.type === "success" ? "text-green-700" : "text-red-600"}`}>{message.text}</p>
      )}

      <button type="submit" disabled={isPending} className="btn-primary">
        {isPending ? "Guardando..." : "Guardar historia"}
      </button>
    </form>
  );
}
