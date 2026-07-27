"use client";

import { useState } from "react";
import type { SiteContent } from "@/types/domain";

const baseLinks = [
  { href: "#inicio", label: "Inicio" },
  { href: "#historia", label: "Historia" },
  { href: "#informacion", label: "Información" },
  { href: "#programa", label: "Programa" },
  { href: "#galeria", label: "Galería" },
];

const trailingLinks = [
  { href: "#confirmar", label: "Confirmar" },
  { href: "#faq", label: "Preguntas" },
];

export function Navbar({ content }: { content: SiteContent }) {
  const [isOpen, setIsOpen] = useState(false);
  const links = [
    ...baseLinks,
    ...(content.gifts.enabled ? [{ href: "#regalos", label: "Regalos" }] : []),
    ...trailingLinks,
  ];

  return (
    <header className="sticky top-0 z-40 bg-cream-100/90 backdrop-blur border-b border-barbie-100">
      <nav
        className="mx-auto flex max-w-5xl items-center justify-between px-5 py-3"
        aria-label="Navegación principal"
      >
        <a
          href="#inicio"
          className="font-heading text-lg text-barbie-600"
          onClick={() => setIsOpen(false)}
        >
          {content.couple.brideFirstName} &amp; {content.couple.groomFirstName}
        </a>

        <button
          type="button"
          className="sm:hidden inline-flex min-h-[44px] min-w-[44px] items-center justify-center rounded-md text-barbie-600"
          aria-expanded={isOpen}
          aria-controls="main-menu"
          onClick={() => setIsOpen((v) => !v)}
        >
          <span className="sr-only">
            {isOpen ? "Cerrar menú" : "Abrir menú"}
          </span>
          <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
            {isOpen ? (
              <path d="M6 6l12 12M6 18 18 6" strokeLinecap="round" />
            ) : (
              <path d="M4 7h16M4 12h16M4 17h16" strokeLinecap="round" />
            )}
          </svg>
        </button>

        <ul
          id="main-menu"
          className={`${
            isOpen ? "flex" : "hidden"
          } absolute left-0 right-0 top-full flex-col gap-1 bg-cream-100 px-5 pb-4 border-b border-barbie-100 sm:static sm:flex sm:flex-row sm:gap-6 sm:border-0 sm:bg-transparent sm:p-0`}
        >
          {links.map((link) => (
            <li key={link.href}>
              <a
                href={link.href}
                onClick={() => setIsOpen(false)}
                className="block py-2 text-sm font-semibold text-stone-700 hover:text-barbie-600 sm:py-0"
              >
                {link.label}
              </a>
            </li>
          ))}
        </ul>
      </nav>
    </header>
  );
}
