"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

const links = [
  { href: "/admin", label: "Dashboard" },
  { href: "/admin/invitados", label: "Invitados" },
  { href: "/admin/mesas", label: "Mesas" },
  { href: "/admin/contenido", label: "Contenido" },
  { href: "/admin/importar", label: "Importar / Exportar" },
];

export function AdminNav({ adminName }: { adminName: string }) {
  const pathname = usePathname();
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [isSigningOut, setIsSigningOut] = useState(false);

  async function handleSignOut() {
    setIsSigningOut(true);
    const supabase = createSupabaseBrowserClient();
    await supabase.auth.signOut();
    router.push("/admin/login");
    router.refresh();
  }

  return (
    <header className="sticky top-0 z-30 border-b border-barbie-100 bg-white">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:px-6">
        <div>
          <p className="font-heading text-lg text-barbie-600">Panel administrativo</p>
          <p className="text-xs text-stone-500">Hola, {adminName}</p>
        </div>

        <button
          type="button"
          className="sm:hidden inline-flex min-h-[44px] min-w-[44px] items-center justify-center text-barbie-600"
          aria-expanded={isOpen}
          aria-controls="admin-menu"
          onClick={() => setIsOpen((v) => !v)}
        >
          <span className="sr-only">{isOpen ? "Cerrar menú" : "Abrir menú"}</span>
          <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
            <path d="M4 7h16M4 12h16M4 17h16" strokeLinecap="round" />
          </svg>
        </button>

        <nav
          id="admin-menu"
          aria-label="Navegación administrativa"
          className={`${isOpen ? "flex" : "hidden"} absolute left-0 right-0 top-full flex-col gap-1 border-b border-barbie-100 bg-white px-4 pb-4 sm:static sm:flex sm:flex-row sm:items-center sm:gap-6 sm:border-0 sm:p-0`}
        >
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setIsOpen(false)}
              className={`py-2 text-sm font-semibold sm:py-0 ${
                pathname === link.href ? "text-barbie-600" : "text-stone-600 hover:text-barbie-600"
              }`}
            >
              {link.label}
            </Link>
          ))}
          <button
            type="button"
            onClick={handleSignOut}
            disabled={isSigningOut}
            className="min-h-[44px] rounded-full border-2 border-barbie-200 px-4 py-2 text-left text-sm font-semibold text-barbie-600 sm:min-h-0 sm:py-1.5"
          >
            {isSigningOut ? "Saliendo..." : "Cerrar sesión"}
          </button>
        </nav>
      </div>
    </header>
  );
}
