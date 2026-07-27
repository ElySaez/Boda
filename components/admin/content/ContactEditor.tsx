"use client";

import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { contactSchema, type ContactInput } from "@/schemas/content.schema";
import { toDatetimeLocalValue } from "@/lib/format";
import { updateContactAction } from "@/app/admin/(protected)/contenido/actions";
import type { SiteContent } from "@/types/domain";

export function ContactEditor({ content }: { content: SiteContent }) {
  const [isPending, startTransition] = useTransition();
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ContactInput>({
    resolver: zodResolver(contactSchema),
    defaultValues: {
      email: content.contact.email,
      rsvpDeadlineLocal: toDatetimeLocalValue(content.rsvp.defaultDeadlineISO),
    },
  });

  function onSubmit(data: ContactInput) {
    setMessage(null);
    startTransition(async () => {
      const result = await updateContactAction(data);
      setMessage(
        result.success ? { type: "success", text: "Guardado." } : { type: "error", text: result.error },
      );
    });
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
      <div>
        <label htmlFor="contactEmail" className="mb-1 block text-sm font-semibold text-stone-800">
          Correo de contacto (respaldo si un invitado pierde su enlace)
        </label>
        <input id="contactEmail" type="email" className="w-full rounded-xl border-2 border-stone-200 px-3 py-2" {...register("email")} />
        {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>}
      </div>

      <div>
        <label htmlFor="rsvpDeadlineLocal" className="mb-1 block text-sm font-semibold text-stone-800">
          Fecha límite de confirmación por defecto
        </label>
        <input
          id="rsvpDeadlineLocal"
          type="datetime-local"
          className="w-full rounded-xl border-2 border-stone-200 px-3 py-2"
          {...register("rsvpDeadlineLocal")}
        />
        <p className="mt-1 text-xs text-stone-500">
          Se usa como referencia general; cada invitado puede tener una fecha límite particular desde la tabla de invitados.
        </p>
      </div>

      {message && (
        <p className={`text-sm ${message.type === "success" ? "text-green-700" : "text-red-600"}`}>{message.text}</p>
      )}

      <button type="submit" disabled={isPending} className="btn-primary">
        {isPending ? "Guardando..." : "Guardar"}
      </button>
    </form>
  );
}
