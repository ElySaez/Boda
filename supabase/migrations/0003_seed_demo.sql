-- =====================================================================
-- 0003_seed_demo.sql
-- Datos de demostración para probar el dashboard, la tabla admin y el
-- flujo público de RSVP end-to-end.
--
-- NO ejecutar este script en producción. Pensado para un proyecto
-- Supabase de desarrollo/staging. Los tokens usados aquí son legibles
-- a propósito (para poder navegar manualmente a /invitacion/<token>
-- durante pruebas); en producción los tokens siempre deben generarse
-- con lib/tokens.ts (aleatorios, no adivinables).
-- =====================================================================

-- Invitado 1: confirmado, con acompañantes y un niño.
with g1 as (
  insert into guests (
    full_name, token, family_group, phone, email,
    maximum_guests, children_allowed, plus_one_allowed,
    table_number, invitation_delivered, invitation_active, response_deadline
  ) values (
    'Familia Pérez González', 'demo-familia-perez-01', 'Familia Pérez',
    '+56911111111', 'perez.familia@example.com',
    4, true, true, 3, true, true, '2026-10-21T23:59:59-03:00'
  )
  returning id
),
r1 as (
  insert into rsvps (
    guest_id, attendance_status, attendee_count, children_count,
    dietary_restrictions, allergies, accessibility_requirements,
    message, privacy_consent, submitted_at
  )
  select id, 'confirmed', 4, 1, 'Una persona vegetariana', 'Ninguna',
         null, '¡Muy felices por ustedes!', true, now() - interval '5 days'
  from g1
  returning id
)
insert into companions (rsvp_id, full_name, is_child, dietary_restrictions, allergies)
select r1.id, v.full_name, v.is_child, v.dietary_restrictions, v.allergies
from r1, (values
  ('Ana Pérez', false, 'Vegetariana', null),
  ('Jorge González', false, null, null),
  ('Martina Pérez', true, null, null)
) as v(full_name, is_child, dietary_restrictions, allergies);

-- Invitado 2: rechazó la invitación.
insert into guests (
  full_name, token, family_group, phone, email,
  maximum_guests, children_allowed, plus_one_allowed,
  invitation_delivered, invitation_active, response_deadline
) values (
  'Camila Rojas', 'demo-camila-rojas-02', 'Amigos U', '+56922222222',
  'camila.rojas@example.com', 1, false, false, true, true,
  '2026-10-21T23:59:59-03:00'
);

insert into rsvps (guest_id, attendance_status, attendee_count, children_count, message, privacy_consent, submitted_at)
select id, 'declined', 0, 0, 'No podré viajar esa fecha, ¡los quiero mucho!', true, now() - interval '2 days'
from guests where token = 'demo-camila-rojas-02';

-- Invitado 3: pendiente de respuesta (sin fila en rsvps).
insert into guests (
  full_name, token, family_group, phone, email,
  maximum_guests, children_allowed, plus_one_allowed,
  invitation_delivered, invitation_active, response_deadline
) values (
  'Diego Fuentes', 'demo-diego-fuentes-03', 'Trabajo Cristian', '+56933333333',
  'diego.fuentes@example.com', 2, false, true, true, true,
  '2026-10-21T23:59:59-03:00'
);

-- Invitado 4: confirmado, sin acompañantes, con restricción alimentaria.
with g4 as (
  insert into guests (
    full_name, token, family_group, phone, email,
    maximum_guests, children_allowed, plus_one_allowed,
    table_number, invitation_delivered, invitation_active, response_deadline
  ) values (
    'Valentina Soto', 'demo-valentina-soto-04', 'Amigas Elisabeth',
    '+56944444444', 'valentina.soto@example.com',
    1, false, false, 5, true, true, '2026-10-21T23:59:59-03:00'
  )
  returning id
)
insert into rsvps (
  guest_id, attendance_status, attendee_count, children_count,
  dietary_restrictions, allergies, message, privacy_consent, submitted_at
)
select id, 'confirmed', 1, 0, 'Sin gluten', 'Alergia a los frutos secos',
       'Ahí estaré, no me lo pierdo.', true, now() - interval '1 day'
from g4;

-- Invitado 5: invitación desactivada (por ejemplo, se envió por error).
insert into guests (
  full_name, token, family_group, invitation_delivered, invitation_active,
  maximum_guests, response_deadline
) values (
  'Invitado de Prueba Desactivado', 'demo-invitado-inactivo-05', 'Pruebas',
  false, false, 1, '2026-10-21T23:59:59-03:00'
);
