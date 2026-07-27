import type { DashboardStats } from "@/types/domain";

function StatCard({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-2xl bg-white p-5 shadow-sm">
      <p className="text-xs font-semibold uppercase tracking-wide text-coral-500">{label}</p>
      <p className="mt-2 font-heading text-3xl text-barbie-600">{value}</p>
    </div>
  );
}

export function DashboardStatsGrid({ stats }: { stats: DashboardStats }) {
  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
      <StatCard label="Invitados registrados" value={stats.totalGuestsRegistered} />
      <StatCard label="Cupos disponibles" value={stats.totalSeatsAvailable} />
      <StatCard label="Personas confirmadas" value={stats.confirmedPeople} />
      <StatCard label="Invitados que rechazaron" value={stats.declinedGuests} />
      <StatCard label="Invitados pendientes" value={stats.pendingGuests} />
      <StatCard label="Adultos confirmados" value={stats.confirmedAdults} />
      <StatCard label="Niños confirmados" value={stats.confirmedChildren} />
      <StatCard label="Con restricciones alimentarias" value={stats.peopleWithDietaryRestrictions} />
      <StatCard label="% de confirmación" value={`${stats.confirmationRate}%`} />
      <StatCard label="Mesas utilizadas" value={stats.tablesInUse} />
    </div>
  );
}
