import type { Metadata } from "next";
import { getDashboardStats } from "@/services/stats.service";
import { DashboardStatsGrid } from "@/components/admin/DashboardStats";

export const metadata: Metadata = {
  title: "Dashboard | Panel administrativo",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function AdminDashboardPage() {
  const stats = await getDashboardStats();

  return (
    <div>
      <h1 className="font-heading text-2xl text-stone-900">Dashboard</h1>
      <p className="mt-1 text-sm text-stone-500">Resumen general de confirmaciones.</p>

      <div className="mt-6">
        <DashboardStatsGrid stats={stats} />
      </div>
    </div>
  );
}
