"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";

interface GalleryModalProps {
  src: string;
  alt: string;
  onClose: () => void;
}

export function GalleryModal({ src, alt, onClose }: GalleryModalProps) {
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    closeButtonRef.current?.focus();

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
    }

    document.addEventListener("keydown", handleKeyDown);
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [onClose]);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={alt}
      className="fixed inset-0 z-50 flex items-center justify-center bg-stone-900/80 p-4"
      onClick={onClose}
    >
      <div
        className="relative max-h-[85vh] w-full max-w-3xl"
        onClick={(event) => event.stopPropagation()}
      >
        <button
          ref={closeButtonRef}
          type="button"
          onClick={onClose}
          className="absolute -top-12 right-0 min-h-[44px] min-w-[44px] rounded-full bg-white/90 px-4 py-2 text-sm font-semibold text-stone-800 sm:top-2 sm:right-2"
        >
          Cerrar
        </button>
        <div className="relative aspect-[4/3] w-full overflow-hidden rounded-2xl bg-stone-800">
          <Image src={src} alt={alt} fill sizes="768px" className="object-contain" />
        </div>
      </div>
    </div>
  );
}
