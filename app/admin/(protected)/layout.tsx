import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { AdminNav } from "@/components/admin/AdminNav";

/**
 * Layout de todas las rutas administrativas protegidas (/admin,
 * /admin/invitados, /admin/importar). No cubre /admin/login, que vive
 * fuera de este grupo de rutas para no requerir sesión.
 *
 * middleware.ts ya redirige a /admin/login si no hay sesión; esta
 * comprobación es una segunda capa (además de RLS) que valida
 * explícitamente que el usuario autenticado esté en `administrators`,
 * mostrando un mensaje claro si no lo está en vez de dashboards vacíos.
 */
export default async function ProtectedAdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/admin/login");
  }

  const { data: admin } = await supabase
    .from("administrators")
    .select("id, full_name")
    .eq("user_id", user.id)
    .maybeSingle()
    .returns<{ id: string; full_name: string }>();

  if (!admin) {
    return (
      <main className="mx-auto flex min-h-screen max-w-md flex-col items-center justify-center px-5 text-center">
        <h1 className="font-heading text-2xl text-barbie-600">Sin autorización</h1>
        <p className="mt-3 text-stone-600">
          Tu cuenta ({user.email}) no está registrada como administrador de esta
          invitación. Pide a los novios que te agreguen en la tabla{" "}
          <code>administrators</code>.
        </p>
      </main>
    );
  }

  return (
    <div className="min-h-screen bg-cream-100">
      <AdminNav adminName={admin.full_name} />
      <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6">{children}</div>
    </div>
  );
}
