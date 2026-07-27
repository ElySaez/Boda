"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { guestSchema, type GuestFormInput } from "@/schemas/guest.schema";
import { toDatetimeLocalValue } from "@/lib/format";
import { createGuestAction, updateGuestAction } from "@/app/admin/(protected)/invitados/actions";
import type { GuestWithRsvp } from "@/types/domain";

interface GuestFormModalProps {
  guest: GuestWithRsvp | null; // null = crear nuevo
  onClose: () => void;
  onSaved: () => void;
}

function buildDefaultValues(guest: GuestWithRsvp | null): GuestFormInput {
  if (!guest) {
    return {
      fullName: "",
      familyGroup: "",
      phone: "",
      email: "",
      maximumGuests: 1,
      childrenAllowed: false,
      plusOneAllowed: false,
      tableNumber: "",
      internalNotes: "",
      invitationDelivered: false,
      invitationActive: true,
      responseDeadline: "",
    };
  }

  return {
    fullName: guest.full_name,
    familyGroup: guest.family_group ?? "",
    phone: guest.phone ?? "",
    email: guest.email ?? "",
    maximumGuests: guest.maximum_guests,
    childrenAllowed: guest.children_allowed,
    plusOneAllowed: guest.plus_one_allowed,
    tableNumber: guest.table_number ?? "",
    internalNotes: guest.internal_notes ?? "",
    invitationDelivered: guest.invitation_delivered,
    invitationActive: guest.invitation_active,
    responseDeadline: toDatetimeLocalValue(guest.response_deadline),
  };
}

export function GuestFormModal({ guest, onClose, onSaved }: GuestFormModalProps) {
  const isEdit = Boolean(guest);
  const dialogRef = useRef<HTMLDivElement>(null);
  const [isPending, startTransition] = useTransition();
  const [formError, setFormError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<GuestFormInput>({
    resolver: zodResolver(guestSchema),
    defaultValues: buildDefaultValues(guest),
  });

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
    }
    document.addEventListener("keydown", handleKeyDown);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [onClose]);

  function onSubmit(data: GuestFormInput) {
    setFormError(null);
    startTransition(async () => {
      const result = isEdit
        ? await updateGuestAction(guest!.id, data)
        : await createGuestAction(data);

      if (result.success) {
        onSaved();
      } else {
        setFormError(result.error);
      }
    });
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="guest-form-title"
      className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-stone-900/60 p-4 py-8"
      onClick={onClose}
    >
      <div
        ref={dialogRef}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-lg rounded-2xl bg-white p-4 shadow-lg sm:p-6"
      >
        <div className="flex items-center justify-between">
          <h2 id="guest-form-title" className="font-heading text-xl text-barbie-600">
            {isEdit ? "Editar invitado" : "Nuevo invitado"}
          </h2>
          <button type="button" onClick={onClose} className="min-h-[44px] min-w-[44px] text-stone-500">
            <span className="sr-only">Cerrar</span>×
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} noValidate className="mt-4 space-y-4">
          <div>
            <label htmlFor="fullName" className="mb-1 block text-sm font-semibold text-stone-800">
              Nombre completo
            </label>
            <input
              id="fullName"
              className="w-full rounded-xl border-2 border-stone-200 px-3 py-2"
              {...register("fullName")}
            />
            {errors.fullName && <p className="mt-1 text-sm text-red-600">{errors.fullName.message}</p>}
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div>
              <label htmlFor="familyGroup" className="mb-1 block text-sm font-semibold text-stone-800">
                Grupo familiar
              </label>
              <input id="familyGroup" className="w-full rounded-xl border-2 border-stone-200 px-3 py-2" {...register("familyGroup")} />
            </div>
            <div>
              <label htmlFor="maximumGuests" className="mb-1 block text-sm font-semibold text-stone-800">
                Cupos máximos
              </label>
              <input
                id="maximumGuests"
                type="number"
                min={1}
                max={20}
                className="w-full rounded-xl border-2 border-stone-200 px-3 py-2"
                {...register("maximumGuests")}
              />
              {errors.maximumGuests && (
                <p className="mt-1 text-sm text-red-600">{errors.maximumGuests.message}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div>
              <label htmlFor="phone" className="mb-1 block text-sm font-semibold text-stone-800">
                Teléfono
              </label>
              <input id="phone" className="w-full rounded-xl border-2 border-stone-200 px-3 py-2" {...register("phone")} />
            </div>
            <div>
              <label htmlFor="email" className="mb-1 block text-sm font-semibold text-stone-800">
                Correo
              </label>
              <input id="email" type="email" className="w-full rounded-xl border-2 border-stone-200 px-3 py-2" {...register("email")} />
              {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>}
            </div>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div>
              <label htmlFor="tableNumber" className="mb-1 block text-sm font-semibold text-stone-800">
                Mesa
              </label>
              <input id="tableNumber" type="number" min={1} className="w-full rounded-xl border-2 border-stone-200 px-3 py-2" {...register("tableNumber")} />
            </div>
            <div>
              <label htmlFor="responseDeadline" className="mb-1 block text-sm font-semibold text-stone-800">
                Fecha límite
              </label>
              <input
                id="responseDeadline"
                type="datetime-local"
                className="w-full rounded-xl border-2 border-stone-200 px-3 py-2"
                {...register("responseDeadline")}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" {...register("plusOneAllowed")} />
              Acompañante
            </label>
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" {...register("childrenAllowed")} />
              Niños
            </label>
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" {...register("invitationDelivered")} />
              Entregada
            </label>
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" {...register("invitationActive")} />
              Activa
            </label>
          </div>

          <div>
            <label htmlFor="internalNotes" className="mb-1 block text-sm font-semibold text-stone-800">
              Observaciones internas
            </label>
            <textarea id="internalNotes" rows={2} className="w-full rounded-xl border-2 border-stone-200 px-3 py-2" {...register("internalNotes")} />
          </div>

          {formError && (
            <p role="alert" className="rounded-xl bg-red-50 p-3 text-sm text-red-700">
              {formError}
            </p>
          )}

          <div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row sm:justify-end">
            <button type="button" onClick={onClose} className="btn-secondary w-full sm:w-auto">
              Cancelar
            </button>
            <button type="submit" disabled={isPending} className="btn-primary w-full sm:w-auto">
              {isPending ? "Guardando..." : "Guardar"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
