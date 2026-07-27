-- =====================================================================
-- 0001_init.sql
-- Esquema inicial: tablas, restricciones, índices y triggers.
-- =====================================================================

create extension if not exists "pgcrypto"; -- gen_random_uuid()

-- ---------------------------------------------------------------------
-- Función utilitaria: mantiene updated_at al día en cada UPDATE.
-- ---------------------------------------------------------------------
create or replace function set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- ---------------------------------------------------------------------
-- administrators
-- Perfiles administrativos vinculados 1:1 a un usuario de Supabase Auth.
-- No existe un registro público de "quién es admin": se gestiona a mano
-- (ver README, sección "Crear el primer administrador").
-- ---------------------------------------------------------------------
create table administrators (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references auth.users (id) on delete cascade,
  full_name text not null,
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------
-- guests
-- Invitado principal (o grupo familiar) con enlace de invitación único.
-- ---------------------------------------------------------------------
create table guests (
  id uuid primary key default gen_random_uuid(),
  full_name text not null check (char_length(trim(full_name)) > 0),
  token text not null unique,
  family_group text,
  phone text,
  email text,
  maximum_guests smallint not null default 1 check (maximum_guests > 0 and maximum_guests <= 20),
  children_allowed boolean not null default false,
  plus_one_allowed boolean not null default false,
  table_number smallint check (table_number is null or table_number > 0),
  internal_notes text,
  invitation_delivered boolean not null default false,
  invitation_active boolean not null default true,
  response_deadline timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index guests_token_idx on guests (token);
create index guests_full_name_idx on guests (lower(full_name));
create index guests_family_group_idx on guests (family_group);
create index guests_table_number_idx on guests (table_number);

create trigger guests_set_updated_at
  before update on guests
  for each row
  execute function set_updated_at();

-- ---------------------------------------------------------------------
-- rsvps
-- Respuesta de confirmación de un invitado. Existe a lo más UNA fila por
-- invitado (guest_id es UNIQUE): un nuevo envío actualiza la fila existente
-- (upsert), lo que además evita duplicados por diseño.
--
-- Diseño: attendance_status solo admite 'confirmed' | 'declined'. El
-- estado "pending" no se materializa como fila: se infiere en la capa de
-- aplicación por la AUSENCIA de un rsvp para ese guest_id.
--
-- Nota: phone/email del respondiente se guardan en guests.phone/email
-- (fuente única de verdad para el contacto), no duplicados aquí.
-- ---------------------------------------------------------------------
create table rsvps (
  id uuid primary key default gen_random_uuid(),
  guest_id uuid not null unique references guests (id) on delete cascade,
  attendance_status text not null check (attendance_status in ('confirmed', 'declined')),
  attendee_count smallint not null default 0 check (attendee_count >= 0),
  children_count smallint not null default 0 check (children_count >= 0),
  dietary_restrictions text,
  allergies text,
  accessibility_requirements text,
  message text check (message is null or char_length(message) <= 1000),
  privacy_consent boolean not null default false,
  submitted_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint children_within_attendees check (children_count <= attendee_count),
  constraint consent_required_if_confirmed check (
    attendance_status = 'declined' or privacy_consent = true
  )
);

create index rsvps_guest_id_idx on rsvps (guest_id);
create index rsvps_attendance_status_idx on rsvps (attendance_status);

create trigger rsvps_set_updated_at
  before update on rsvps
  for each row
  execute function set_updated_at();

-- ---------------------------------------------------------------------
-- companions
-- Acompañantes nominales asociados a una respuesta confirmada.
-- ---------------------------------------------------------------------
create table companions (
  id uuid primary key default gen_random_uuid(),
  rsvp_id uuid not null references rsvps (id) on delete cascade,
  full_name text not null check (char_length(trim(full_name)) > 0),
  is_child boolean not null default false,
  dietary_restrictions text,
  allergies text,
  created_at timestamptz not null default now()
);

create index companions_rsvp_id_idx on companions (rsvp_id);

-- ---------------------------------------------------------------------
-- rate_limits
-- Registro simple de intentos para limitar abuso del formulario público.
-- Se consulta contando filas recientes por (identifier, action).
-- Solo accesible vía service_role (sin políticas RLS públicas).
-- ---------------------------------------------------------------------
create table rate_limits (
  id bigint generated always as identity primary key,
  identifier text not null,
  action text not null,
  created_at timestamptz not null default now()
);

create index rate_limits_lookup_idx on rate_limits (identifier, action, created_at);

-- Housekeeping: las filas de rate_limits son efímeras: no se referencian
-- desde ningún reporte y pueden purgarse periódicamente (ver README).

-- ---------------------------------------------------------------------
-- audit_log
-- Bitácora de acciones administrativas relevantes (crear/editar/eliminar
-- invitados, exportar datos, etc.).
-- ---------------------------------------------------------------------
create table audit_log (
  id uuid primary key default gen_random_uuid(),
  admin_id uuid references administrators (id) on delete set null,
  action text not null,
  entity text not null,
  entity_id uuid,
  details jsonb,
  created_at timestamptz not null default now()
);

create index audit_log_created_at_idx on audit_log (created_at desc);
create index audit_log_entity_idx on audit_log (entity, entity_id);
