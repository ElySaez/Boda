"use client";

import { useState } from "react";
import type { SiteContent } from "@/types/domain";

export function CopyBankDetails({ bankDetails }: { bankDetails: SiteContent["gifts"]["bankDetails"] }) {
  const [copied, setCopied] = useState(false);

  const fields: { label: string; value: string }[] = [
    { label: "Titular", value: bankDetails.accountHolder },
    { label: "RUT", value: bankDetails.rut },
    { label: "Banco", value: bankDetails.bank },
    { label: "Tipo de cuenta", value: bankDetails.accountType },
    { label: "Número de cuenta", value: bankDetails.accountNumber },
    { label: "Correo", value: bankDetails.email },
  ];

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(fields.map((f) => `${f.label}: ${f.value}`).join("\n"));
      setCopied(true);
      setTimeout(() => setCopied(false), 3000);
    } catch {
      setCopied(false);
    }
  }

  return (
    <div className="mx-auto max-w-md rounded-2xl bg-cream-100 p-6 text-left shadow-sm">
      <dl className="space-y-2">
        {fields.map((field) => (
          <div key={field.label} className="flex justify-between gap-4 text-sm">
            <dt className="font-semibold text-stone-500">{field.label}</dt>
            <dd className="text-stone-800">{field.value}</dd>
          </div>
        ))}
      </dl>

      <button type="button" onClick={handleCopy} className="btn-secondary mt-5 w-full">
        {copied ? "¡Datos copiados!" : "Copiar datos bancarios"}
      </button>

      <p role="status" aria-live="polite" className="sr-only">
        {copied ? "Datos bancarios copiados al portapapeles" : ""}
      </p>
    </div>
  );
}
