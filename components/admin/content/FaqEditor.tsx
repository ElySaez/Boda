"use client";

import { useState, useTransition } from "react";
import { useFieldArray, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { faqSchema, type FaqInput } from "@/schemas/content.schema";
import { updateFaqAction } from "@/app/admin/(protected)/contenido/actions";
import type { SiteContent } from "@/types/domain";

export function FaqEditor({ content }: { content: SiteContent }) {
  const [isPending, startTransition] = useTransition();
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const { register, handleSubmit, control } = useForm<FaqInput>({
    resolver: zodResolver(faqSchema),
    defaultValues: { items: content.faq },
  });
  const { fields, append, remove } = useFieldArray({ control, name: "items" });

  function onSubmit(data: FaqInput) {
    setMessage(null);
    startTransition(async () => {
      const result = await updateFaqAction(data);
      setMessage(
        result.success ? { type: "success", text: "Preguntas frecuentes guardadas." } : { type: "error", text: result.error },
      );
    });
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
      <div className="space-y-4">
        {fields.map((field, index) => (
          <div key={field.id} className="rounded-xl bg-cream-100 p-4">
            <label className="sr-only" htmlFor={`items.${index}.question`}>
              Pregunta {index + 1}
            </label>
            <input
              id={`items.${index}.question`}
              placeholder="Pregunta"
              className="mb-2 w-full rounded-lg border-2 border-stone-200 px-3 py-2 font-semibold"
              {...register(`items.${index}.question` as const)}
            />
            <label className="sr-only" htmlFor={`items.${index}.answer`}>
              Respuesta {index + 1}
            </label>
            <textarea
              id={`items.${index}.answer`}
              placeholder="Respuesta"
              rows={2}
              className="w-full rounded-lg border-2 border-stone-200 px-3 py-2"
              {...register(`items.${index}.answer` as const)}
            />
            <button
              type="button"
              onClick={() => remove(index)}
              className="mt-2 text-xs font-semibold text-red-600"
            >
              Eliminar pregunta
            </button>
          </div>
        ))}
      </div>

      <button type="button" onClick={() => append({ question: "", answer: "" })} className="btn-secondary">
        + Agregar pregunta
      </button>

      {message && (
        <p className={`text-sm ${message.type === "success" ? "text-green-700" : "text-red-600"}`}>{message.text}</p>
      )}

      <div>
        <button type="submit" disabled={isPending} className="btn-primary">
          {isPending ? "Guardando..." : "Guardar preguntas frecuentes"}
        </button>
      </div>
    </form>
  );
}
