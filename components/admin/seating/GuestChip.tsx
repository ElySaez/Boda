"use client";

import { useDraggable } from "@dnd-kit/core";
import type { GuestWithRsvp } from "@/types/domain";

export function GuestChip({ guest, isDragging }: { guest: GuestWithRsvp; isDragging?: boolean }) {
  const { attributes, listeners, setNodeRef, transform } = useDraggable({
    id: guest.id,
    data: { guest },
  });

  const partySize = guest.rsvp?.attendee_count ?? 0;

  return (
    <button
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      type="button"
      style={
        transform
          ? { transform: `translate3d(${transform.x}px, ${transform.y}px, 0)` }
          : undefined
      }
      className={`flex w-full touch-none items-center justify-between gap-2 rounded-xl border-2 border-barbie-200 bg-white px-3 py-2 text-left text-sm shadow-sm active:cursor-grabbing ${
        isDragging ? "opacity-40" : ""
      }`}
    >
      <span className="truncate font-medium text-stone-800">{guest.full_name}</span>
      <span className="shrink-0 rounded-full bg-barbie-50 px-2 py-0.5 text-xs font-semibold text-barbie-600">
        {partySize} {partySize === 1 ? "persona" : "personas"}
      </span>
    </button>
  );
}
