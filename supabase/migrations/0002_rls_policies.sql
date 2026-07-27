-- =====================================================================
-- 0002_rls_policies.sql
-- Row Level Security: solo administradores autenticados pueden leer o
-- escribir datos de invitados/RSVPs a través del cliente con anon key.
--
-- El flujo público (consultar/enviar una invitación por token) NUNCA pasa
-- por el cliente anon: se resuelve en Server Actions/Route Handlers que
-- usan el cliente service_role (lib/supabase/admin.ts), el cual bypassa
-- RLS por completo pero valida el token manualmente en código. Por eso
-- estas tablas NO tienen políticas de lectura pública: cualquier acceso
-- desde el navegador sin sesión de admin queda denegado por defecto.
-- =====================================================================

-- ---------------------------------------------------------------------
-- Función helper: ¿el usuario autenticado actual es administrador?
-- SECURITY DEFINER para poder consultar `administrators` sin quedar
-- atrapada en su propia política RLS (evita recursión infinita).
-- ---------------------------------------------------------------------
create or replace function is_admin()
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1 from administrators where user_id = auth.uid()
  );
$$;

-- Revocar ejecución pública directa innecesaria; se usa solo dentro de policies.
revoke all on function is_admin() from public;
grant execute on function is_admin() to authenticated, anon;

-- ---------------------------------------------------------------------
-- administrators
-- ---------------------------------------------------------------------
alter table administrators enable row level security;

create policy "admins can view administrator list"
  on administrators for select
  to authenticated
  using (is_admin());

create policy "admins can view their own row even before being listed"
  on administrators for select
  to authenticated
  using (user_id = auth.uid());

-- No se exponen políticas de insert/update/delete: la creación de
-- administradores se realiza manualmente por un superadministrador
-- (SQL Editor de Supabase o service_role), nunca desde el cliente.

-- ---------------------------------------------------------------------
-- guests
-- ---------------------------------------------------------------------
alter table guests enable row level security;

create policy "admins full access on guests"
  on guests for all
  to authenticated
  using (is_admin())
  with check (is_admin());

-- ---------------------------------------------------------------------
-- rsvps
-- ---------------------------------------------------------------------
alter table rsvps enable row level security;

create policy "admins full access on rsvps"
  on rsvps for all
  to authenticated
  using (is_admin())
  with check (is_admin());

-- ---------------------------------------------------------------------
-- companions
-- ---------------------------------------------------------------------
alter table companions enable row level security;

create policy "admins full access on companions"
  on companions for all
  to authenticated
  using (is_admin())
  with check (is_admin());

-- ---------------------------------------------------------------------
-- rate_limits
-- Enable RLS sin políticas: ni anon ni authenticated pueden acceder.
-- Solo el cliente service_role (que bypassa RLS) puede leer/escribir.
-- ---------------------------------------------------------------------
alter table rate_limits enable row level security;

-- ---------------------------------------------------------------------
-- audit_log
-- Los admins pueden leer la bitácora; la escritura se hace siempre desde
-- Server Actions con service_role (bypass RLS) para garantizar que el
-- registro no pueda ser alterado por el propio cliente autenticado.
-- ---------------------------------------------------------------------
alter table audit_log enable row level security;

create policy "admins can view audit log"
  on audit_log for select
  to authenticated
  using (is_admin());
