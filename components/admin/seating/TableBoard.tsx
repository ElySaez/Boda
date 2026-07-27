"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  DndContext,
  PointerSensor,
  TouchSensor,
  KeyboardSensor,
  useSensor,
  useSensors,
  useDroppable,
  type DragEndEvent,
  type DragStartEvent,
} from "@dnd-kit/core";
import { GuestChip } from "./GuestChip";
import { TableCircle } from "./TableCircle";
import { assignGuestToTableAction } from "@/app/admin/(protected)/mesas/actions";
import type { GuestWithRsvp } from "@/types/domain";

function UnassignedPool({ guests, activeGuestId }: { guests: GuestWithRsvp[]; activeGuestId: string | null }) {
  const { setNodeRef, isOver } = useDroppable({ id: "unassigned" });

  return (
    <div
      ref={setNodeRef}
      className={`rounded-2xl border-2 p-4 ${isOver ? "border-barbie-400 bg-barbie-50" : "border-stone-200 bg-white"}`}
    >
      <h2 className="font-heading text-lg text-stone-800">Sin mesa asignada</h2>
      <p className="mt-1 text-xs text-stone-500">{guests.length} invitados confirmados por ubicar</p>
      <ul className="mt-4 space-y-2">
        {guests.map((guest) => (
          <li key={guest.id}>
            <GuestChip guest={guest} isDragging={guest.id === activeGuestId} />
          </li>
        ))}
        {guests.length === 0 && (
          <li className="text-center text-xs text-stone-400">Todos los invitados confirmados tienen mesa.</li>
        )}
      </ul>
    </div>
  );
}

export function TableBoard({ guests }: { guests: GuestWithRsvp[] }) {
  const router = useRouter();

  // Estado local optimista: guestId -> número de mesa (o null = sin mesa).
  // Se inicializa desde los datos del servidor y se corrige con
  // router.refresh() después de cada asignación confirmada.
  const [assignments, setAssignments] = useState<Record<string, number | null>>(() =>
    Object.fromEntries(guests.map((g) => [g.id, g.table_number])),
  );
  const [extraTables, setExtraTables] = useState<number[]>([]);
  const [activeGuestId, setActiveGuestId] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const guestsById = useMemo(() => new Map(guests.map((g) => [g.id, g])), [guests]);

  const tableNumbers = useMemo(() => {
    const used = new Set<number>();
    Object.values(assignments).forEach((t) => {
      if (t !== null) used.add(t);
    });
    extraTables.forEach((t) => used.add(t));
    return Array.from(used).sort((a, b) => a - b);
  }, [assignments, extraTables]);

  const unassignedGuests = guests.filter((g) => assignments[g.id] === null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 150, tolerance: 8 } }),
    useSensor(KeyboardSensor),
  );

  function handleDragStart(event: DragStartEvent) {
    setActiveGuestId(String(event.active.id));
    setErrorMessage(null);
  }

  async function handleDragEnd(event: DragEndEvent) {
    setActiveGuestId(null);
    const { active, over } = event;
    if (!over) return;

    const guestId = String(active.id);
    const guest = guestsById.get(guestId);
    if (!guest) return;

    const targetTableNumber = over.id === "unassigned" ? null : Number(String(over.id).replace("table-", ""));
    const previousTableNumber = assignments[guestId] ?? null;
    if (targetTableNumber === previousTableNumber) return;

    // Validación optimista en cliente, solo para feedback inmediato: la
    // validación real (que evita condiciones de carrera entre dos admins)
    // ocurre siempre en el servidor dentro de assignGuestToTableAction.
    if (targetTableNumber !== null) {
      const occupied = guests
        .filter((g) => g.id !== guestId && assignments[g.id] === targetTableNumber)
        .reduce((sum, g) => sum + (g.rsvp?.attendee_count ?? 0), 0);
      const partySize = guest.rsvp?.attendee_count ?? 0;
      if (occupied + partySize > 6) {
        setErrorMessage(`La mesa ${targetTableNumber} no tiene cupo para ${partySize} personas más.`);
        return;
      }
    }

    setAssignments((prev) => ({ ...prev, [guestId]: targetTableNumber }));
    setIsSaving(true);

    const result = await assignGuestToTableAction(guestId, targetTableNumber);

    setIsSaving(false);

    if (!result.success) {
      // Revierte el cambio optimista si el servidor lo rechazó.
      setAssignments((prev) => ({ ...prev, [guestId]: previousTableNumber }));
      setErrorMessage(result.error);
      return;
    }

    router.refresh();
  }

  function handleAddTable() {
    const next = tableNumbers.length > 0 ? Math.max(...tableNumbers) + 1 : 1;
    setExtraTables((prev) => [...prev, next]);
  }

  return (
    <DndContext sensors={sensors} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
      {errorMessage && (
        <p role="alert" className="mb-4 rounded-xl bg-red-50 p-3 text-sm text-red-700">
          {errorMessage}
        </p>
      )}
      {isSaving && (
        <p role="status" className="mb-4 text-sm text-stone-500">
          Guardando...
        </p>
      )}

      <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
        <UnassignedPool guests={unassignedGuests} activeGuestId={activeGuestId} />

        <div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {tableNumbers.map((tableNumber) => (
              <TableCircle
                key={tableNumber}
                tableNumber={tableNumber}
                guests={guests.filter((g) => assignments[g.id] === tableNumber)}
                activeGuestId={activeGuestId}
              />
            ))}
          </div>

          <button type="button" onClick={handleAddTable} className="btn-secondary mt-4">
            + Agregar mesa
          </button>
        </div>
      </div>
    </DndContext>
  );
}
