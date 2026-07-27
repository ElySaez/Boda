"use client";

import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { venueSchema, type VenueInput } from "@/schemas/content.schema";
import { updateVenueAction } from "@/app/admin/(protected)/contenido/actions";
import type { SiteContent } from "@/types/domain";

const fields: { name: keyof VenueInput; label: string; type?: string }[] = [
  { name: "name", label: "Nombre del recinto" },
  { name: "address", label: "Dirección" },
  { name: "reference", label: "Referencia / indicaciones" },
  { name: "googleMapsUrl", label: "Enlace de Google Maps", type: "url" },
  { name: "dressCode", label: "Código de vestimenta" },
  { name: "arrivalTime", label: "Hora recomendada de llegada" },
];

export function VenueEditor({ content }: { content: SiteContent }) {
  const [isPending, startTransition] = useTransition();
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<VenueInput>({
    resolver: zodResolver(venueSchema),
    defaultValues: content.venue,
  });

  function onSubmit(data: VenueInput) {
    setMessage(null);
    startTransition(async () => {
      const result = await updateVenueAction(data);
      setMessage(
        result.success ? { type: "success", text: "Recinto guardado." } : { type: "error", text: result.error },
      );
    });
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
      {fields.map((field) => (
        <div key={field.name}>
          <label htmlFor={field.name} className="mb-1 block text-sm font-semibold text-stone-800">
            {field.label}
          </label>
          <input
            id={field.name}
            type={field.type ?? "text"}
            className="w-full rounded-xl border-2 border-stone-200 px-3 py-2"
            {...register(field.name)}
          />
          {errors[field.name] && <p className="mt-1 text-sm text-red-600">{errors[field.name]?.message}</p>}
        </div>
      ))}

      {message && (
        <p className={`text-sm ${message.type === "success" ? "text-green-700" : "text-red-600"}`}>{message.text}</p>
      )}

      <button type="submit" disabled={isPending} className="btn-primary">
        {isPending ? "Guardando..." : "Guardar recinto"}
      </button>
    </form>
  );
}
