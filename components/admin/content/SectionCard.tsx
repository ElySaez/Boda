export function SectionCard({
  title,
  description,
  defaultOpen,
  children,
}: {
  title: string;
  description?: string;
  defaultOpen?: boolean;
  children: React.ReactNode;
}) {
  return (
    <details
      open={defaultOpen}
      className="group rounded-2xl bg-white shadow-sm open:pb-6"
    >
      <summary className="cursor-pointer list-none px-6 py-4 marker:content-none">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h2 className="font-heading text-lg text-barbie-600">{title}</h2>
            {description && <p className="text-sm text-stone-500">{description}</p>}
          </div>
          <span aria-hidden="true" className="text-barbie-500 transition-transform group-open:rotate-45">
            +
          </span>
        </div>
      </summary>
      <div className="border-t border-stone-100 px-6 pt-4">{children}</div>
    </details>
  );
}
