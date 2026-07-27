"use server";

import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { buildRsvpSchema, type RsvpFormInput } from "@/schemas/rsvp.schema";
import { checkRateLimit } from "@/lib/rate-limit";
import { submitRsvp, type SubmitRsvpResult } from "@/services/rsvp.service";

async function getClientIp(): Promise<string> {
  const headerList = await headers();
  const forwardedFor = headerList.get("x-forwarded-for");
  return forwardedFor?.split(",")[0]?.trim() || "unknown";
}

/**
 * Server Action invocada desde RsvpForm (componente de cliente).
 * Revalida completamente los datos con Zod en servidor —el esquema del
 * cliente solo mejora la experiencia de usuario, no es una barrera de
 * seguridad— y aplica límites de solicitudes por token y por IP antes de
 * tocar la base de datos.
 */
export async function submitRsvpAction(
  token: string,
  constraints: { maximumGuests: number; childrenAllowed: boolean; plusOneAllowed: boolean },
  rawInput: unknown,
): Promise<SubmitRsvpResult> {
  const ip = await getClientIp();

  const [tokenLimit, ipLimit] = await Promise.all([
    checkRateLimit(token, "rsvp_submit"),
    checkRateLimit(ip, "rsvp_submit_ip"),
  ]);

  if (!tokenLimit.allowed || !ipLimit.allowed) {
    return {
      success: false,
      error: "Demasiados intentos en poco tiempo. Espera unos minutos e inténtalo de nuevo.",
    };
  }

  const schema = buildRsvpSchema(constraints);
  const parsed = schema.safeParse(rawInput);

  if (!parsed.success) {
    return {
      success: false,
      error: "Revisa los datos del formulario e inténtalo nuevamente.",
    };
  }

  const result = await submitRsvp(token, parsed.data as RsvpFormInput);

  if (result.success) {
    revalidatePath(`/invitacion/${token}`);
  }

  return result;
}
