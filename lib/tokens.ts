import "server-only";
import { randomBytes } from "node:crypto";

/**
 * Genera un token de invitación aleatorio, criptográficamente seguro y
 * apto para URL (base64url), sin relleno. 24 bytes de entropía (~192 bits)
 * hacen que enumerar o adivinar tokens sea inviable.
 *
 * Debe ejecutarse en Node.js runtime (usa el módulo `crypto` de Node),
 * no en Edge runtime.
 */
export function generateGuestToken(): string {
  return randomBytes(24).toString("base64url");
}
