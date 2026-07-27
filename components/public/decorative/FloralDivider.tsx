/**
 * Divisor floral estilizado, decorativo únicamente (aria-hidden).
 * Se usa entre secciones para reforzar la estética primaveral sin
 * añadir peso visual excesivo.
 */
export function FloralDivider({ className }: { className?: string }) {
  return (
    <div
      aria-hidden="true"
      className={`flex items-center justify-center gap-3 text-coral-400 ${className ?? ""}`}
    >
      <span className="h-px w-12 bg-gradient-to-r from-transparent to-coral-300" />
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" className="text-barbie-400">
        <path
          d="M12 2c1.5 2 1.5 4 0 6-1.5-2-1.5-4 0-6ZM12 16c1.5 2 1.5 4 0 6-1.5-2-1.5-4 0-6ZM2 12c2-1.5 4-1.5 6 0-2 1.5-4 1.5-6 0ZM16 12c2-1.5 4-1.5 6 0-2 1.5-4 1.5-6 0Z"
          fill="currentColor"
        />
        <circle cx="12" cy="12" r="2.5" fill="currentColor" className="text-gold-500" />
      </svg>
      <span className="h-px w-12 bg-gradient-to-l from-transparent to-coral-300" />
    </div>
  );
}
