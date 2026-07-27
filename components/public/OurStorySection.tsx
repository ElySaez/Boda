import { FloralDivider } from "./decorative/FloralDivider";
import { TechBadge } from "./decorative/TechBadge";
import type { SiteContent } from "@/types/domain";

export function OurStorySection({ content }: { content: SiteContent }) {
  return (
    <section id="historia" aria-labelledby="historia-heading" className="section-container">
      <FloralDivider className="mb-8" />
      <h2 id="historia-heading" className="section-heading">
        {content.ourStory.heading}
      </h2>

      <div className="mx-auto max-w-2xl space-y-4 text-center text-lg leading-relaxed text-stone-700">
        {content.ourStory.paragraphs.map((paragraph, i) => (
          <p key={i}>{paragraph}</p>
        ))}
      </div>

      <TechBadge className="mt-8" />
    </section>
  );
}
