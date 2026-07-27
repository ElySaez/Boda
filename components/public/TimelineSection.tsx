import type { SiteContent } from "@/types/domain";

export function TimelineSection({ content }: { content: SiteContent }) {
  return (
    <section id="programa" aria-labelledby="programa-heading" className="section-container">
      <h2 id="programa-heading" className="section-heading">
        Programa
      </h2>

      <ol className="mx-auto max-w-md space-y-6 border-l-2 border-barbie-200 pl-6">
        {content.schedule.map((item, i) => (
          <li key={i} className="relative">
            <span
              aria-hidden="true"
              className="absolute -left-[1.95rem] top-1 h-3 w-3 rounded-full bg-barbie-500"
            />
            <p className="font-heading text-xl text-barbie-600">{item.time}</p>
            <p className="text-stone-700">{item.title}</p>
          </li>
        ))}
      </ol>
    </section>
  );
}
