import type { Metadata } from "next";
import { listGuestsForAdmin } from "@/services/guests.service";
import { TableBoard } from "@/components/admin/seating/TableBoard";

export const metadata: Metadata = {
  title: "Mesas | Panel administrativo",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function AdminSeatingPage() {
  const guests = await listGuestsForAdmin();
  const confirmedGuests = guests.filter((guest) => guest.status === "confirmed");

  return (
    <div>
      <h1 className="font-heading text-2xl text-stone-900">Mesas</h1>
      <p className="mt-1 text-sm text-stone-500">
        Arrastra a cada invitado confirmado hacia la mesa donde se sentará. Cada mesa es redonda, con 6 puestos.
      </p>

      <div className="mt-6">
        <TableBoard guests={confirmedGuests} />
      </div>
    </div>
  );
}
