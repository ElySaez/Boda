"use client";

import { useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { importGuestsCsvAction } from "@/app/admin/(protected)/importar/actions";
import { buildCsvTemplate } from "@/lib/csv";

export function ImportCsvForm() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isPending, startTransition] = useTransition();
  const [result, setResult] = useState<{ created: number; errors: { row: number; message: string }[] } | null>(null);

  function handleDownloadTemplate() {
    const blob = new Blob([buildCsvTemplate()], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "plantilla-invitados.csv";
    link.click();
    URL.revokeObjectURL(url);
  }

  function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      const content = String(reader.result ?? "");
      startTransition(async () => {
        const outcome = await importGuestsCsvAction(content);
        setResult(outcome);
        router.refresh();
        if (fileInputRef.current) fileInputRef.current.value = "";
      });
    };
    reader.readAsText(file);
  }

  return (
    <div className="rounded-2xl bg-white p-6 shadow-sm">
      <h2 className="font-heading text-xl text-barbie-600">Importar invitados</h2>
      <p className="mt-1 text-sm text-stone-600">
        Sube un archivo CSV con las columnas de la plantilla. Cada fila crea un nuevo invitado
        con su enlace único.
      </p>

      <div className="mt-4 flex flex-col gap-3 sm:flex-row">
        <button type="button" onClick={handleDownloadTemplate} className="btn-secondary">
          Descargar plantilla CSV
        </button>

        <label className="btn-primary cursor-pointer">
          {isPending ? "Importando..." : "Subir CSV"}
          <input
            ref={fileInputRef}
            type="file"
            accept=".csv,text/csv"
            onChange={handleFileChange}
            disabled={isPending}
            className="sr-only"
          />
        </label>
      </div>

      {result && (
        <div className="mt-4 rounded-xl bg-cream-100 p-4 text-sm">
          <p className="font-semibold text-stone-800">{result.created} invitados creados.</p>
          {result.errors.length > 0 && (
            <ul className="mt-2 list-disc space-y-1 pl-5 text-red-700">
              {result.errors.map((err, i) => (
                <li key={i}>
                  Fila {err.row}: {err.message}
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
