"use client";

import { useDroppable } from "@dnd-kit/core";
import { GuestChip } from "./GuestChip";
import type { GuestWithRsvp } from "@/types/domain";

const SEATS_PER_TABLE = 6;

function seatPosition(index: number) {
  const angle = (index / SEATS_PER_TABLE) * 2 * Math.PI - Math.PI / 2;
  const radius = 46; // porcentaje del radio del círculo
  const x = 50 + radius * Math.cos(angle);
  const y = 50 + radius * Math.sin(angle);
  return { left: `${x}%`, top: `${y}%` };
}

export function TableCircle({
  tableNumber,
  guests,
  activeGuestId,
}: {
  tableNumber: number;
  guests: GuestWithRsvp[];
  activeGuestId: string | null;
}) {
  const { setNodeRef, isOver } = useDroppable({
    id: `table-${tableNumber}`,
    data: { tableNumber },
  });

  const occupied = guests.reduce((sum, g) => sum + (g.rsvp?.attendee_count ?? 0), 0);
  const isFull = occupied >= SEATS_PER_TABLE;
  const isOverCapacity = isOver && occupied >= SEATS_PER_TABLE;

  return (
    <div
      ref={setNodeRef}
      className={`rounded-2xl border-2 p-4 transition-colors ${
        isOverCapacity
          ? "border-red-300 bg-red-50"
          : isOver
            ? "border-barbie-400 bg-barbie-50"
            : "border-stone-200 bg-white"
      }`}
    >
      <div className="relative mx-auto h-36 w-36">
        <div
          className={`absolute inset-3 flex flex-col items-center justify-center rounded-full border-4 border-dashed ${
            isFull ? "border-gold-400 bg-gold-50" : "border-barbie-200 bg-barbie-50"
          }`}
        >
          <span className="font-heading text-lg text-barbie-600">Mesa {tableNumber}</span>
          <span className="text-xs font-semibold text-stone-500">
            {occupied} / {SEATS_PER_TABLE}
          </span>
        </div>
        {Array.from({ length: SEATS_PER_TABLE }).map((_, i) => (
          <span
            key={i}
            aria-hidden="true"
            style={seatPosition(i)}
            className={`absolute h-4 w-4 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white ${
              i < occupied ? "bg-barbie-500" : "bg-stone-200"
            }`}
          />
        ))}
      </div>

      <ul className="mt-4 space-y-2">
        {guests.map((guest) => (
          <li key={guest.id}>
            <GuestChip guest={guest} isDragging={guest.id === activeGuestId} />
          </li>
        ))}
        {guests.length === 0 && (
          <li className="text-center text-xs text-stone-400">Arrastra invitados aquí</li>
        )}
      </ul>
    </div>
  );
}
