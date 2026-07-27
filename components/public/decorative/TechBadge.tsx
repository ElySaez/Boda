/**
 * Guiño discreto a las profesiones de la pareja: una taza de café (Java,
 * Cristian) y un escudo (ciberseguridad, Elisabeth). Íconos pequeños en
 * tono dorado para no romper la estética romántica de la sección.
 */
export function TechBadge({ className }: { className?: string }) {
  return (
    <div
      aria-hidden="true"
      className={`flex items-center justify-center gap-4 text-gold-600/70 ${className ?? ""}`}
    >
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
        <title>Café, en honor al desarrollo en Java</title>
        <path d="M4 9h13v5a5 5 0 0 1-5 5H9a5 5 0 0 1-5-5V9Z" />
        <path d="M17 10.5h1.5a2.5 2.5 0 0 1 0 5H17" />
        <path d="M8 4.5c-.6.7-.6 1.3 0 2M11.5 4.5c-.6.7-.6 1.3 0 2" />
      </svg>
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
        <title>Escudo, en honor a la ciberseguridad</title>
        <path d="M12 3l7 3v6c0 4.5-3 7.5-7 9-4-1.5-7-4.5-7-9V6l7-3Z" />
        <path d="m9.5 12 1.8 1.8L14.5 10" />
      </svg>
    </div>
  );
}
