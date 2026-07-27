import { CopyBankDetails } from "./CopyBankDetails";
import type { SiteContent } from "@/types/domain";

export function GiftsSection({ content }: { content: SiteContent }) {
  if (!content.gifts.enabled) return null;

  return (
    <section id="regalos" aria-labelledby="regalos-heading" className="section-container">
      <h2 id="regalos-heading" className="section-heading">
        {content.gifts.heading}
      </h2>

      <p className={`mx-auto max-w-xl text-center text-stone-700 ${content.gifts.showBankDetails ? "mb-8" : ""}`}>
        {content.gifts.thankYouMessage}
      </p>

      {content.gifts.showBankDetails && (
        <CopyBankDetails bankDetails={content.gifts.bankDetails} />
      )}
    </section>
  );
}
