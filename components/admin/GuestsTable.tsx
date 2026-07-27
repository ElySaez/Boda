"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { formatDateTime } from "@/lib/format";
import { siteConfig } from "@/config/wedding";
import { GuestFormModal } from "./GuestFormModal";
import {
  deleteGuestAction,
  regenerateTokenAction,
  toggleGuestFieldAction,
} from "@/app/admin/(protected)/invitados/actions";
import type { GuestStatus, GuestWithRsvp } from "@/types/domain";

const statusLabel: Record<GuestStatus, string> = {
  pending: "Pendiente",
  confirmed: "Confirmado",
  declined: "Rechazado",
};

const statusColor: Record<GuestStatus, string> = {
  pending: "bg-stone-100 text-stone-600",
  confirmed: "bg-green-100 text-green-700",
  declined: "bg-red-100 text-red-700",
};

function guestLink(token: string): string {
  return `${siteConfig.url}/invitacion/${token}`;
}

export function GuestsTable({ initialGuests }: { initialGuests: GuestWithRsvp[] }) {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | GuestStatus>("all");
  const [editingGuest, setEditingGuest] = useState<GuestWithRsvp | null | "new">(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const filtered = useMemo(() => {
    return initialGuests.filter((guest) => {
      const matchesSearch = guest.full_name.toLowerCase().includes(search.trim().toLowerCase());
      const matchesStatus = statusFilter === "all" || guest.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [initialGuests, search, statusFilter]);

  function handleSaved() {
    setEditingGuest(null);
    router.refresh();
  }

  async function handleCopyLink(guest: GuestWithRsvp) {
    try {
      await navigator.clipboard.writeText(guestLink(guest.token));
      setCopiedId(guest.id);
      setTimeout(() => setCopiedId(null), 2500);
    } catch {
      setCopiedId(null);
    }
  }

  function handleDelete(guest: GuestWithRsvp) {
    const confirmed = window.confirm(
      `¿Eliminar a "${guest.full_name}"? Esta acción no se puede deshacer.`,
    );
    if (!confirmed) return;

    startTransition(async () => {
      await deleteGuestAction(guest.id);
      router.refresh();
    });
  }

  function handleToggle(guest: GuestWithRsvp, field: "invitation_active" | "invitation_delivered") {
    startTransition(async () => {
      await toggleGuestFieldAction(guest.id, field, !guest[field]);
      router.refresh();
    });
  }

  function handleRegenerateToken(guest: GuestWithRsvp) {
    const confirmed = window.confirm(
      `Esto invalidará el enlace actual de "${guest.full_name}" y generará uno nuevo. ¿Continuar?`,
    );
    if (!confirmed) return;

    startTransition(async () => {
      await regenerateTokenAction(guest.id);
      router.refresh();
    });
  }

  return (
    <div>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-1 flex-col gap-3 sm:flex-row">
          <label className="flex-1">
            <span className="sr-only">Buscar por nombre</span>
            <input
              type="search"
              placeholder="Buscar por nombre..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-xl border-2 border-stone-200 px-4 py-2.5"
            />
          </label>
          <label>
            <span className="sr-only">Filtrar por estado</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as typeof statusFilter)}
              className="w-full rounded-xl border-2 border-stone-200 px-4 py-2.5 sm:w-auto"
            >
              <option value="all">Todos los estados</option>
              <option value="confirmed">Confirmados</option>
              <option value="declined">Rechazados</option>
              <option value="pending">Pendientes</option>
            </select>
          </label>
        </div>

        <button type="button" onClick={() => setEditingGuest("new")} className="btn-primary w-full sm:w-auto">
          + Nuevo invitado
        </button>
      </div>

      {/* Vista de tarjetas para móvil */}
      <ul className="mt-6 space-y-3 sm:hidden">
        {filtered.map((guest) => (
          <li key={guest.id} className="rounded-2xl bg-white p-4 shadow-sm">
            <div className="flex items-start justify-between gap-2">
              <div>
                <p className="font-semibold text-stone-900">{guest.full_name}</p>
                <p className="text-xs text-stone-500">{guest.family_group || "Sin grupo"}</p>
              </div>
              <span className={`rounded-full px-2 py-1 text-xs font-semibold ${statusColor[guest.status]}`}>
                {statusLabel[guest.status]}
              </span>
            </div>
            <dl className="mt-3 grid grid-cols-2 gap-2 text-xs text-stone-600">
              <div>
                <dt className="font-semibold">Cupos</dt>
                <dd>{guest.rsvp?.attendee_count ?? 0} / {guest.maximum_guests}</dd>
              </div>
              <div>
                <dt className="font-semibold">Mesa</dt>
                <dd>{guest.table_number ?? "—"}</dd>
              </div>
              <div>
                <dt className="font-semibold">Teléfono</dt>
                <dd>{guest.phone ?? "—"}</dd>
              </div>
              <div>
                <dt className="font-semibold">Entregada</dt>
                <dd>{guest.invitation_delivered ? "Sí" : "No"}</dd>
              </div>
            </dl>
            <GuestRowActions
              guest={guest}
              isPending={isPending}
              copied={copiedId === guest.id}
              onEdit={() => setEditingGuest(guest)}
              onDelete={() => handleDelete(guest)}
              onCopyLink={() => handleCopyLink(guest)}
              onToggleActive={() => handleToggle(guest, "invitation_active")}
              onToggleDelivered={() => handleToggle(guest, "invitation_delivered")}
              onRegenerateToken={() => handleRegenerateToken(guest)}
            />
          </li>
        ))}
        {filtered.length === 0 && (
          <li className="rounded-2xl bg-white p-6 text-center text-stone-500">Sin resultados.</li>
        )}
      </ul>

      {/* Tabla para escritorio */}
      <div className="mt-6 hidden overflow-x-auto rounded-2xl bg-white shadow-sm sm:block">
        <table className="w-full min-w-[900px] text-left text-sm">
          <thead className="bg-cream-100 text-xs uppercase tracking-wide text-stone-500">
            <tr>
              <th scope="col" className="px-4 py-3">Nombre</th>
              <th scope="col" className="px-4 py-3">Grupo</th>
              <th scope="col" className="px-4 py-3">Cupos</th>
              <th scope="col" className="px-4 py-3">Confirmados</th>
              <th scope="col" className="px-4 py-3">Estado</th>
              <th scope="col" className="px-4 py-3">Teléfono</th>
              <th scope="col" className="px-4 py-3">Restricciones</th>
              <th scope="col" className="px-4 py-3">Mesa</th>
              <th scope="col" className="px-4 py-3">Entregada</th>
              <th scope="col" className="px-4 py-3">Respuesta</th>
              <th scope="col" className="px-4 py-3">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((guest) => (
              <tr key={guest.id} className="border-t border-stone-100">
                <td className="px-4 py-3 font-medium text-stone-900">{guest.full_name}</td>
                <td className="px-4 py-3 text-stone-600">{guest.family_group || "—"}</td>
                <td className="px-4 py-3 text-stone-600">{guest.maximum_guests}</td>
                <td className="px-4 py-3 text-stone-600">{guest.rsvp?.attendee_count ?? 0}</td>
                <td className="px-4 py-3">
                  <span className={`rounded-full px-2 py-1 text-xs font-semibold ${statusColor[guest.status]}`}>
                    {statusLabel[guest.status]}
                  </span>
                </td>
                <td className="px-4 py-3 text-stone-600">{guest.phone ?? "—"}</td>
                <td className="px-4 py-3 max-w-[160px] truncate text-stone-600" title={guest.rsvp?.dietary_restrictions ?? ""}>
                  {guest.rsvp?.dietary_restrictions || "—"}
                </td>
                <td className="px-4 py-3 text-stone-600">{guest.table_number ?? "—"}</td>
                <td className="px-4 py-3 text-stone-600">{guest.invitation_delivered ? "Sí" : "No"}</td>
                <td className="px-4 py-3 text-stone-600">
                  {guest.rsvp?.submitted_at ? formatDateTime(guest.rsvp.submitted_at) : "—"}
                </td>
                <td className="px-4 py-3">
                  <GuestRowActions
                    guest={guest}
                    isPending={isPending}
                    copied={copiedId === guest.id}
                    compact
                    onEdit={() => setEditingGuest(guest)}
                    onDelete={() => handleDelete(guest)}
                    onCopyLink={() => handleCopyLink(guest)}
                    onToggleActive={() => handleToggle(guest, "invitation_active")}
                    onToggleDelivered={() => handleToggle(guest, "invitation_delivered")}
                    onRegenerateToken={() => handleRegenerateToken(guest)}
                  />
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={11} className="px-4 py-8 text-center text-stone-500">
                  Sin resultados.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {editingGuest !== null && (
        <GuestFormModal
          guest={editingGuest === "new" ? null : editingGuest}
          onClose={() => setEditingGuest(null)}
          onSaved={handleSaved}
        />
      )}
    </div>
  );
}

function GuestRowActions({
  guest,
  isPending,
  copied,
  compact,
  onEdit,
  onDelete,
  onCopyLink,
  onToggleActive,
  onToggleDelivered,
  onRegenerateToken,
}: {
  guest: GuestWithRsvp;
  isPending: boolean;
  copied: boolean;
  compact?: boolean;
  onEdit: () => void;
  onDelete: () => void;
  onCopyLink: () => void;
  onToggleActive: () => void;
  onToggleDelivered: () => void;
  onRegenerateToken: () => void;
}) {
  if (compact) {
    return (
      <div className="flex flex-wrap gap-2">
        <button type="button" onClick={onEdit} className="text-xs font-semibold text-barbie-600 underline underline-offset-2">
          Editar
        </button>
        <button type="button" onClick={onCopyLink} className="text-xs font-semibold text-barbie-600 underline underline-offset-2">
          {copied ? "¡Copiado!" : "Copiar enlace"}
        </button>
        <a
          href={guestLink(guest.token)}
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs font-semibold text-barbie-600 underline underline-offset-2"
        >
          Abrir enlace
        </a>
        <button
          type="button"
          onClick={onToggleActive}
          disabled={isPending}
          className="text-xs font-semibold text-stone-600 underline underline-offset-2"
        >
          {guest.invitation_active ? "Desactivar" : "Activar"}
        </button>
        <button
          type="button"
          onClick={onToggleDelivered}
          disabled={isPending}
          className="text-xs font-semibold text-stone-600 underline underline-offset-2"
        >
          {guest.invitation_delivered ? "Marcar no entregada" : "Marcar entregada"}
        </button>
        <button
          type="button"
          onClick={onRegenerateToken}
          disabled={isPending}
          className="text-xs font-semibold text-stone-600 underline underline-offset-2"
        >
          Regenerar enlace
        </button>
        <button
          type="button"
          onClick={onDelete}
          disabled={isPending}
          className="text-xs font-semibold text-red-600 underline underline-offset-2"
        >
          Eliminar
        </button>
      </div>
    );
  }

  // Vista móvil: botones táctiles con área mínima cómoda, no links de texto
  // apretados (más difíciles de tocar con precisión en una pantalla chica).
  const buttonClass =
    "min-h-[40px] rounded-lg border-2 border-stone-200 px-2 text-xs font-semibold text-stone-700 active:bg-stone-100";

  return (
    <div className="mt-3 grid grid-cols-2 gap-2">
      <button type="button" onClick={onEdit} className={`${buttonClass} border-barbie-200 text-barbie-600`}>
        Editar
      </button>
      <button type="button" onClick={onCopyLink} className={`${buttonClass} border-barbie-200 text-barbie-600`}>
        {copied ? "¡Copiado!" : "Copiar enlace"}
      </button>
      <a
        href={guestLink(guest.token)}
        target="_blank"
        rel="noopener noreferrer"
        className={`${buttonClass} flex items-center justify-center border-barbie-200 text-barbie-600`}
      >
        Abrir enlace
      </a>
      <button type="button" onClick={onToggleActive} disabled={isPending} className={buttonClass}>
        {guest.invitation_active ? "Desactivar" : "Activar"}
      </button>
      <button type="button" onClick={onToggleDelivered} disabled={isPending} className={buttonClass}>
        {guest.invitation_delivered ? "No entregada" : "Marcar entregada"}
      </button>
      <button type="button" onClick={onRegenerateToken} disabled={isPending} className={buttonClass}>
        Regenerar enlace
      </button>
      <button
        type="button"
        onClick={onDelete}
        disabled={isPending}
        className={`${buttonClass} col-span-2 border-red-200 text-red-600`}
      >
        Eliminar invitado
      </button>
    </div>
  );
}
