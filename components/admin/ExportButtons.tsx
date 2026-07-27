"use client";

import { useTransition } from "react";
import { exportGuestsAction, type ExportType } from "@/app/admin/(protected)/importar/actions";

const exports: { type: ExportType; label: string; filename: string }[] = [
  { type: "all", label: "Exportar todos los invitados", filename: "invitados-todos.csv" },
  { type: "confirmed", label: "Exportar solo confirmados", filename: "invitados-confirmados.csv" },
  { type: "dietary", label: "Exportar restricciones alimentarias", filename: "invitados-restricciones.csv" },
  { type: "by_table", label: "Exportar organizado por mesa", filename: "invitados-por-mesa.csv" },
];

function downloadCsv(content: string, filename: string) {
  const blob = new Blob([content], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

export function ExportButtons() {
  const [isPending, startTransition] = useTransition();

  function handleExport(type: ExportType, filename: string) {
    startTransition(async () => {
      const csv = await exportGuestsAction(type);
      downloadCsv(csv, filename);
    });
  }

  return (
    <div className="rounded-2xl bg-white p-6 shadow-sm">
      <h2 className="font-heading text-xl text-barbie-600">Exportar</h2>
      <div className="mt-4 flex flex-col gap-3">
        {exports.map((item) => (
          <button
            key={item.type}
            type="button"
            disabled={isPending}
            onClick={() => handleExport(item.type, item.filename)}
            className="btn-secondary text-left"
          >
            {item.label}
          </button>
        ))}
      </div>
    </div>
  );
}
