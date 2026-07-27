import Link from "next/link";
import { formatDate } from "@/lib/format";
import type { SiteContent } from "@/types/domain";

export function Footer({ content }: { content: SiteContent }) {
  return (
    <footer className="border-t border-barbie-100 bg-cream-100 px-5 py-8 text-center text-sm text-stone-500">
      <p className="font-heading text-lg text-barbie-500">
        {content.couple.brideFirstName} &amp; {content.couple.groomFirstName}
      </p>
      <p className="mt-1">{formatDate(content.event.dateTimeISO)}</p>
      <p className="mt-4">
        <Link href="/privacidad" className="underline underline-offset-2 hover:text-barbie-600">
          Política de privacidad
        </Link>
      </p>
    </footer>
  );
}
