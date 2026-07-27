import type { Metadata } from "next";
import { listGuestsForAdmin } from "@/services/guests.service";
import { GuestsTable } from "@/components/admin/GuestsTable";

export const metadata: Metadata = {
  title: "Invitados | Panel administrativo",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function AdminGuestsPage() {
  const guests = await listGuestsForAdmin();

  return (
    <div>
      <h1 className="font-heading text-2xl text-stone-900">Invitados</h1>
      <p className="mt-1 text-sm text-stone-500">
        {guests.length} invitados registrados en total.
      </p>

      <div className="mt-6">
        <GuestsTable initialGuests={guests} />
      </div>
    </div>
  );
}
