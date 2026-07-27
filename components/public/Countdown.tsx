"use client";

import { useEffect, useState } from "react";

interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

function getTimeLeft(targetISO: string): TimeLeft {
  const diff = Math.max(0, new Date(targetISO).getTime() - Date.now());
  return {
    days: Math.floor(diff / (1000 * 60 * 60 * 24)),
    hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
    minutes: Math.floor((diff / (1000 * 60)) % 60),
    seconds: Math.floor((diff / 1000) % 60),
  };
}

const units: { key: keyof TimeLeft; label: string }[] = [
  { key: "days", label: "Días" },
  { key: "hours", label: "Horas" },
  { key: "minutes", label: "Minutos" },
  { key: "seconds", label: "Segundos" },
];

export function Countdown({ targetISO }: { targetISO: string }) {
  // Se inicializa en null y se calcula tras el montaje para evitar
  // discrepancias de hidratación entre servidor y cliente.
  const [timeLeft, setTimeLeft] = useState<TimeLeft | null>(null);

  useEffect(() => {
    setTimeLeft(getTimeLeft(targetISO));
    const interval = setInterval(() => {
      setTimeLeft(getTimeLeft(targetISO));
    }, 1000);
    return () => clearInterval(interval);
  }, [targetISO]);

  return (
    <div
      role="timer"
      aria-live="polite"
      aria-label="Tiempo restante para el matrimonio"
      className="flex justify-center gap-3 sm:gap-5"
    >
      {units.map(({ key, label }) => (
        <div
          key={key}
          className="flex w-16 flex-col items-center rounded-2xl bg-white/80 py-3 shadow-sm sm:w-20"
        >
          <span className="font-heading text-2xl text-barbie-600 sm:text-3xl tabular-nums">
            {timeLeft ? String(timeLeft[key]).padStart(2, "0") : "--"}
          </span>
          <span className="text-xs font-semibold uppercase tracking-wide text-stone-500">
            {label}
          </span>
        </div>
      ))}
    </div>
  );
}
