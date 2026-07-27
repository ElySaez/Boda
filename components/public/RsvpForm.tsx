"use client";

import { useEffect, useState, useTransition } from "react";
import { useFieldArray, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { buildRsvpSchema, type RsvpFormInput } from "@/schemas/rsvp.schema";
import { submitRsvpAction } from "@/app/invitacion/[token]/actions";
import type { GuestWithRsvp } from "@/types/domain";

interface RsvpFormProps {
  token: string;
  guest: GuestWithRsvp;
}

function buildDefaultValues(guest: GuestWithRsvp): RsvpFormInput {
  const rsvp = guest.rsvp;
  return {
    attendance: rsvp?.attendance_status ?? "confirmed",
    attendeeCount: rsvp?.attendee_count ?? 1,
    companions:
      rsvp?.companions.map((c) => ({ fullName: c.full_name, isChild: c.is_child })) ?? [],
    dietaryRestrictions: rsvp?.dietary_restrictions ?? "",
    allergies: rsvp?.allergies ?? "",
    accessibilityRequirements: rsvp?.accessibility_requirements ?? "",
    phone: guest.phone ?? "",
    email: guest.email ?? "",
    message: rsvp?.message ?? "",
    privacyConsent: rsvp?.privacy_consent ?? false,
    website: "",
  };
}

export function RsvpForm({ token, guest }: RsvpFormProps) {
  const constraints = {
    maximumGuests: guest.maximum_guests,
    childrenAllowed: guest.children_allowed,
    plusOneAllowed: guest.plus_one_allowed,
  };

  const schema = buildRsvpSchema(constraints);
  const [isPending, startTransition] = useTransition();
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [successStatus, setSuccessStatus] = useState<"confirmed" | "declined" | null>(null);

  const {
    register,
    handleSubmit,
    watch,
    control,
    formState: { errors },
  } = useForm<RsvpFormInput>({
    resolver: zodResolver(schema),
    defaultValues: buildDefaultValues(guest),
  });

  const { fields, append, remove } = useFieldArray({ control, name: "companions" });

  const attendance = watch("attendance");
  const attendeeCount = watch("attendeeCount");

  useEffect(() => {
    if (attendance !== "confirmed") return;
    const expected = Math.max(0, Number(attendeeCount || 0) - 1);
    if (fields.length < expected) {
      for (let i = fields.length; i < expected; i++) {
        append({ fullName: "", isChild: false });
      }
    } else if (fields.length > expected) {
      for (let i = fields.length - 1; i >= expected; i--) {
        remove(i);
      }
    }
    // Se ejecuta solo cuando cambian asistencia/cantidad, no en cada render.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [attendance, attendeeCount]);

  function onSubmit(data: RsvpFormInput) {
    setSubmitError(null);
    startTransition(async () => {
      const result = await submitRsvpAction(token, constraints, data);
      if (result.success) {
        setSuccessStatus(result.status);
      } else {
        setSubmitError(result.error);
      }
    });
  }

  if (successStatus) {
    return (
      <div role="status" className="rounded-2xl bg-white p-6 text-center shadow-sm">
        <p className="font-heading text-2xl text-barbie-600">
          {successStatus === "confirmed" ? "¡Gracias por confirmar!" : "Gracias por avisarnos"}
        </p>
        <p className="mt-2 text-stone-700">
          {successStatus === "confirmed"
            ? "Registramos tu asistencia. Puedes volver a este enlace si necesitas modificar tu respuesta antes de la fecha límite."
            : "Lamentamos que no puedas acompañarnos. Puedes volver a este enlace si tu situación cambia antes de la fecha límite."}
        </p>
        <button
          type="button"
          onClick={() => setSuccessStatus(null)}
          className="btn-secondary mt-6"
        >
          Modificar mi respuesta
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-6 text-left">
      {/* Honeypot: oculto para personas, visible para bots. */}
      <div className="hidden" aria-hidden="true">
        <label htmlFor="website">No completar este campo</label>
        <input id="website" type="text" tabIndex={-1} autoComplete="off" {...register("website")} />
      </div>

      <fieldset>
        <legend className="mb-2 font-semibold text-stone-800">¿Asistirás?</legend>
        <div className="flex flex-col gap-2 sm:flex-row">
          <label className="flex min-h-[48px] flex-1 items-center gap-2 rounded-xl border-2 border-barbie-200 px-4 py-2 has-[:checked]:border-barbie-500 has-[:checked]:bg-barbie-50">
            <input type="radio" value="confirmed" {...register("attendance")} />
            Confirmo que asistiré
          </label>
          <label className="flex min-h-[48px] flex-1 items-center gap-2 rounded-xl border-2 border-barbie-200 px-4 py-2 has-[:checked]:border-barbie-500 has-[:checked]:bg-barbie-50">
            <input type="radio" value="declined" {...register("attendance")} />
            No podré asistir
          </label>
        </div>
        {errors.attendance && (
          <p className="mt-1 text-sm text-red-600">{errors.attendance.message}</p>
        )}
      </fieldset>

      {attendance === "confirmed" && (
        <>
          <div>
            <label htmlFor="attendeeCount" className="mb-1 block font-semibold text-stone-800">
              Cantidad de asistentes (máximo {guest.maximum_guests})
            </label>
            <input
              id="attendeeCount"
              type="number"
              min={1}
              max={guest.maximum_guests}
              className="w-full rounded-xl border-2 border-stone-200 px-4 py-3"
              {...register("attendeeCount")}
            />
            {errors.attendeeCount && (
              <p className="mt-1 text-sm text-red-600">{errors.attendeeCount.message}</p>
            )}
          </div>

          {guest.plus_one_allowed && fields.length > 0 && (
            <div className="space-y-3">
              <p className="font-semibold text-stone-800">Acompañantes</p>
              {fields.map((field, index) => (
                <div key={field.id} className="flex flex-col gap-2 sm:flex-row sm:items-center">
                  <label className="sr-only" htmlFor={`companions.${index}.fullName`}>
                    Nombre del acompañante {index + 1}
                  </label>
                  <input
                    id={`companions.${index}.fullName`}
                    type="text"
                    placeholder={`Nombre del acompañante ${index + 1}`}
                    className="flex-1 rounded-xl border-2 border-stone-200 px-4 py-3"
                    {...register(`companions.${index}.fullName` as const)}
                  />
                  {guest.children_allowed && (
                    <label className="flex items-center gap-2 whitespace-nowrap text-sm text-stone-700">
                      <input
                        type="checkbox"
                        {...register(`companions.${index}.isChild` as const)}
                      />
                      Es niño/a
                    </label>
                  )}
                </div>
              ))}
              {errors.companions && (
                <p className="text-sm text-red-600">
                  {(errors.companions as { message?: string }).message ??
                    "Revisa los datos de los acompañantes"}
                </p>
              )}
            </div>
          )}
        </>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="phone" className="mb-1 block font-semibold text-stone-800">
            Teléfono
          </label>
          <input
            id="phone"
            type="tel"
            autoComplete="tel"
            className="w-full rounded-xl border-2 border-stone-200 px-4 py-3"
            {...register("phone")}
          />
          {errors.phone && <p className="mt-1 text-sm text-red-600">{errors.phone.message}</p>}
        </div>

        <div>
          <label htmlFor="email" className="mb-1 block font-semibold text-stone-800">
            Correo electrónico (opcional)
          </label>
          <input
            id="email"
            type="email"
            autoComplete="email"
            className="w-full rounded-xl border-2 border-stone-200 px-4 py-3"
            {...register("email")}
          />
          {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>}
        </div>
      </div>

      <div>
        <label htmlFor="dietaryRestrictions" className="mb-1 block font-semibold text-stone-800">
          Restricciones alimentarias
        </label>
        <textarea
          id="dietaryRestrictions"
          rows={2}
          className="w-full rounded-xl border-2 border-stone-200 px-4 py-3"
          {...register("dietaryRestrictions")}
        />
      </div>

      <div>
        <label htmlFor="allergies" className="mb-1 block font-semibold text-stone-800">
          Alergias
        </label>
        <textarea
          id="allergies"
          rows={2}
          className="w-full rounded-xl border-2 border-stone-200 px-4 py-3"
          {...register("allergies")}
        />
      </div>

      <div>
        <label htmlFor="accessibilityRequirements" className="mb-1 block font-semibold text-stone-800">
          Necesidades de accesibilidad
        </label>
        <textarea
          id="accessibilityRequirements"
          rows={2}
          className="w-full rounded-xl border-2 border-stone-200 px-4 py-3"
          {...register("accessibilityRequirements")}
        />
      </div>

      <div>
        <label htmlFor="message" className="mb-1 block font-semibold text-stone-800">
          Mensaje para los novios
        </label>
        <textarea
          id="message"
          rows={3}
          className="w-full rounded-xl border-2 border-stone-200 px-4 py-3"
          {...register("message")}
        />
        {errors.message && <p className="mt-1 text-sm text-red-600">{errors.message.message}</p>}
      </div>

      <label className="flex items-start gap-3 text-sm text-stone-700">
        <input type="checkbox" className="mt-1" {...register("privacyConsent")} />
        <span>
          Autorizo el almacenamiento de los datos entregados con la finalidad de gestionar el
          evento, según la{" "}
          <a href="/privacidad" className="underline underline-offset-2" target="_blank" rel="noopener noreferrer">
            política de privacidad
          </a>
          .
        </span>
      </label>
      {errors.privacyConsent && (
        <p className="text-sm text-red-600">{errors.privacyConsent.message}</p>
      )}

      {submitError && (
        <p role="alert" className="rounded-xl bg-red-50 p-3 text-sm text-red-700">
          {submitError}
        </p>
      )}

      <button type="submit" disabled={isPending} className="btn-primary w-full">
        {isPending ? "Enviando..." : "Enviar respuesta"}
      </button>
    </form>
  );
}
