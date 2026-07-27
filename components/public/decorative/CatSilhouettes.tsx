/**
 * Siluetas discretas de dos gatitas (Inna y Antu), decorativas.
 * Pensadas para usarse pequeñas, en una esquina, sin dominar la sección.
 */
export function CatSilhouettes({ className }: { className?: string }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 120 48"
      className={className}
      fill="none"
    >
      {/* Gatita 1 */}
      <g className="fill-barbie-400/70">
        <path d="M10 30c-1-6 1-10 5-13l-1-6 5 4c2-1 4-1 6 0l5-4-1 6c4 3 6 7 5 13-2 6-8 9-12 9s-10-3-12-9Z" />
        <circle cx="15" cy="27" r="1.4" className="fill-white" />
        <circle cx="27" cy="27" r="1.4" className="fill-white" />
      </g>
      {/* Gatita 2 */}
      <g className="fill-coral-400/70">
        <path d="M62 32c-1-6 1-10 5-13l-1-6 5 4c2-1 4-1 6 0l5-4-1 6c4 3 6 7 5 13-2 6-8 9-12 9s-10-3-12-9Z" />
        <circle cx="67" cy="29" r="1.4" className="fill-white" />
        <circle cx="79" cy="29" r="1.4" className="fill-white" />
      </g>
    </svg>
  );
}
