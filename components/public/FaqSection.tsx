import type { SiteContent } from "@/types/domain";

export function FaqSection({ content }: { content: SiteContent }) {
  return (
    <section id="faq" aria-labelledby="faq-heading" className="section-container">
      <h2 id="faq-heading" className="section-heading">
        Preguntas frecuentes
      </h2>

      <div className="mx-auto max-w-2xl space-y-3">
        {content.faq.map((item, i) => (
          <details key={i} className="group rounded-xl bg-white/70 p-4 open:bg-white">
            <summary className="cursor-pointer list-none font-semibold text-stone-800 marker:content-none">
              <span className="flex items-center justify-between gap-3">
                {item.question}
                <span aria-hidden="true" className="text-barbie-500 transition-transform group-open:rotate-45">
                  +
                </span>
              </span>
            </summary>
            <p className="mt-3 text-stone-600">{item.answer}</p>
          </details>
        ))}
      </div>
    </section>
  );
}
