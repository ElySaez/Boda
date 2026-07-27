"use client";

import { useState, useTransition } from "react";
import { useFieldArray, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { scheduleSchema, type ScheduleInput } from "@/schemas/content.schema";
import { updateScheduleAction } from "@/app/admin/(protected)/contenido/actions";
import type { SiteContent } from "@/types/domain";

export function ScheduleEditor({ content }: { content: SiteContent }) {
  const [isPending, startTransition] = useTransition();
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<ScheduleInput>({
    resolver: zodResolver(scheduleSchema),
    defaultValues: { items: content.schedule },
  });

  const { fields, append, remove } = useFieldArray({ control, name: "items" });

  function onSubmit(data: ScheduleInput) {
    setMessage(null);
    startTransition(async () => {
      const result = await updateScheduleAction(data);
      setMessage(
        result.success ? { type: "success", text: "Programa guardado." } : { type: "error", text: result.error },
      );
    });
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
      <div className="space-y-3">
        {fields.map((field, index) => (
          <div key={field.id} className="flex items-start gap-2">
            <input
              aria-label={`Hora del evento ${index + 1}`}
              placeholder="12:00"
              className="w-24 rounded-xl border-2 border-stone-200 px-3 py-2"
              {...register(`items.${index}.time` as const)}
            />
            <input
              aria-label={`Título del evento ${index + 1}`}
              placeholder="Ceremonia"
              className="flex-1 rounded-xl border-2 border-stone-200 px-3 py-2"
              {...register(`items.${index}.title` as const)}
            />
            <button
              type="button"
              onClick={() => remove(index)}
              className="min-h-[44px] px-3 text-sm font-semibold text-red-600"
            >
              Quitar
            </button>
          </div>
        ))}
      </div>
      {errors.items && <p className="text-sm text-red-600">Revisa los eventos del programa.</p>}

      <button
        type="button"
        onClick={() => append({ time: "", title: "" })}
        className="btn-secondary"
      >
        + Agregar evento
      </button>

      {message && (
        <p className={`text-sm ${message.type === "success" ? "text-green-700" : "text-red-600"}`}>{message.text}</p>
      )}

      <div>
        <button type="submit" disabled={isPending} className="btn-primary">
          {isPending ? "Guardando..." : "Guardar programa"}
        </button>
      </div>
    </form>
  );
}
