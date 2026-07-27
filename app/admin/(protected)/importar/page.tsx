import type { Metadata } from "next";
import { ImportCsvForm } from "@/components/admin/ImportCsvForm";
import { ExportButtons } from "@/components/admin/ExportButtons";

export const metadata: Metadata = {
  title: "Importar / Exportar | Panel administrativo",
  robots: { index: false, follow: false },
};

export default function AdminImportExportPage() {
  return (
    <div>
      <h1 className="font-heading text-2xl text-stone-900">Importar / Exportar</h1>
      <p className="mt-1 text-sm text-stone-500">
        Sube invitados en lote o descarga la información en distintos formatos.
      </p>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <ImportCsvForm />
        <ExportButtons />
      </div>
    </div>
  );
}
