"use client";

import { useState } from "react";
import Image from "next/image";
import { GalleryModal } from "./GalleryModal";
import type { SiteContent } from "@/types/domain";

export function GallerySection({ content }: { content: SiteContent }) {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const images = content.gallery.images;
  const selected = selectedIndex !== null ? images[selectedIndex] : null;

  return (
    <section id="galeria" aria-labelledby="galeria-heading" className="section-container">
      <h2 id="galeria-heading" className="section-heading">
        {content.gallery.heading}
      </h2>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {images.map((image, index) => (
          <button
            key={image.src}
            type="button"
            onClick={() => setSelectedIndex(index)}
            className="relative aspect-square overflow-hidden rounded-xl bg-barbie-100 transition-transform hover:scale-[1.02] focus-visible:scale-[1.02]"
          >
            <Image
              src={image.src}
              alt={image.alt}
              fill
              sizes="(min-width: 640px) 240px, 45vw"
              className="object-cover"
            />
            <span className="sr-only">Ampliar fotografía: {image.alt}</span>
          </button>
        ))}
      </div>

      {selected && (
        <GalleryModal
          src={selected.src}
          alt={selected.alt}
          onClose={() => setSelectedIndex(null)}
        />
      )}
    </section>
  );
}
