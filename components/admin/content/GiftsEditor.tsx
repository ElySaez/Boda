"use client";

import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { giftsSchema, type GiftsInput } from "@/schemas/content.schema";
import { updateGiftsAction } from "@/app/admin/(protected)/contenido/actions";
import type { SiteContent } from "@/types/domain";

export function GiftsEditor({ content }: { content: SiteContent }) {
  const [isPending, startTransition] = useTransition();
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<GiftsInput>({
    resolver: zodResolver(giftsSchema),
    defaultValues: {
      enabled: content.gifts.enabled,
      heading: content.gifts.heading,
      thankYouMessage: content.gifts.thankYouMessage,
      showBankDetails: content.gifts.showBankDetails,
      accountHolder: content.gifts.bankDetails.accountHolder,
      rut: content.gifts.bankDetails.rut,
      bank: content.gifts.bankDetails.bank,
      accountType: content.gifts.bankDetails.accountType,
      accountNumber: content.gifts.bankDetails.accountNumber,
      bankEmail: content.gifts.bankDetails.email,
    },
  });

  const showBankDetails = watch("showBankDetails");

  function onSubmit(data: GiftsInput) {
    setMessage(null);
    startTransition(async () => {
      const result = await updateGiftsAction(data);
      setMessage(
        result.success ? { type: "success", text: "Regalos guardado." } : { type: "error", text: result.error },
      );
    });
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
      <label className="flex items-center gap-2 text-sm font-semibold text-stone-800">
        <input type="checkbox" {...register("enabled")} />
        Mostrar la sección de regalos en el sitio
      </label>

      <div>
        <label htmlFor="giftsHeading" className="mb-1 block text-sm font-semibold text-stone-800">
          Título de la sección
        </label>
        <input id="giftsHeading" className="w-full rounded-xl border-2 border-stone-200 px-3 py-2" {...register("heading")} />
      </div>

      <div>
        <label htmlFor="thankYouMessage" className="mb-1 block text-sm font-semibold text-stone-800">
          Mensaje {showBankDetails ? "de agradecimiento" : "para invitados (ej: \"su presencia es el mejor regalo\")"}
        </label>
        <textarea id="thankYouMessage" rows={3} className="w-full rounded-xl border-2 border-stone-200 px-3 py-2" {...register("thankYouMessage")} />
      </div>

      <label className="flex items-center gap-2 text-sm font-semibold text-stone-800">
        <input type="checkbox" {...register("showBankDetails")} />
        Mostrar datos bancarios (desactívalo si no van a recibir regalos por transferencia)
      </label>

      {showBankDetails && (
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="accountHolder" className="mb-1 block text-sm font-semibold text-stone-800">Titular</label>
            <input id="accountHolder" className="w-full rounded-xl border-2 border-stone-200 px-3 py-2" {...register("accountHolder")} />
            {errors.accountHolder && <p className="mt-1 text-sm text-red-600">{errors.accountHolder.message}</p>}
          </div>
          <div>
            <label htmlFor="rut" className="mb-1 block text-sm font-semibold text-stone-800">RUT</label>
            <input id="rut" className="w-full rounded-xl border-2 border-stone-200 px-3 py-2" {...register("rut")} />
            {errors.rut && <p className="mt-1 text-sm text-red-600">{errors.rut.message}</p>}
          </div>
          <div>
            <label htmlFor="bank" className="mb-1 block text-sm font-semibold text-stone-800">Banco</label>
            <input id="bank" className="w-full rounded-xl border-2 border-stone-200 px-3 py-2" {...register("bank")} />
            {errors.bank && <p className="mt-1 text-sm text-red-600">{errors.bank.message}</p>}
          </div>
          <div>
            <label htmlFor="accountType" className="mb-1 block text-sm font-semibold text-stone-800">Tipo de cuenta</label>
            <input id="accountType" className="w-full rounded-xl border-2 border-stone-200 px-3 py-2" {...register("accountType")} />
            {errors.accountType && <p className="mt-1 text-sm text-red-600">{errors.accountType.message}</p>}
          </div>
          <div>
            <label htmlFor="accountNumber" className="mb-1 block text-sm font-semibold text-stone-800">Número de cuenta</label>
            <input id="accountNumber" className="w-full rounded-xl border-2 border-stone-200 px-3 py-2" {...register("accountNumber")} />
            {errors.accountNumber && <p className="mt-1 text-sm text-red-600">{errors.accountNumber.message}</p>}
          </div>
          <div>
            <label htmlFor="bankEmail" className="mb-1 block text-sm font-semibold text-stone-800">Correo</label>
            <input id="bankEmail" type="email" className="w-full rounded-xl border-2 border-stone-200 px-3 py-2" {...register("bankEmail")} />
            {errors.bankEmail && <p className="mt-1 text-sm text-red-600">{errors.bankEmail.message}</p>}
          </div>
        </div>
      )}

      {message && (
        <p className={`text-sm ${message.type === "success" ? "text-green-700" : "text-red-600"}`}>{message.text}</p>
      )}

      <button type="submit" disabled={isPending} className="btn-primary">
        {isPending ? "Guardando..." : "Guardar regalos"}
      </button>
    </form>
  );
}
