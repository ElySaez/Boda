-- =====================================================================
-- 0004_site_content.sql
-- Contenido editable del sitio (textos, fotos, recinto, programa, FAQ,
-- datos bancarios) administrable desde /admin/contenido, y el bucket de
-- Storage donde se guardan las imágenes subidas desde el panel.
--
-- Diseño: tabla "singleton" (una sola fila, id fijo = 1) con el contenido
-- completo en una columna jsonb. Es más simple de mantener que una tabla
-- por sección para un sitio de una sola página con volumen de escritura
-- bajísimo (solo lo editan los novios, ocasionalmente).
-- =====================================================================

create table site_content (
  id smallint primary key default 1,
  content jsonb not null,
  updated_at timestamptz not null default now(),
  constraint site_content_singleton check (id = 1)
);

create trigger site_content_set_updated_at
  before update on site_content
  for each row
  execute function set_updated_at();

alter table site_content enable row level security;

-- Solo administradores pueden leer o escribir directamente la tabla vía
-- RLS. La página pública NUNCA lee esta tabla con la anon key: la resuelve
-- en el servidor con el cliente service_role (mismo patrón que guests),
-- así que no se necesita ni se agrega una política de lectura pública.
create policy "admins full access on site_content"
  on site_content for all
  to authenticated
  using (is_admin())
  with check (is_admin());

-- Contenido inicial: refleja los valores por defecto de config/wedding.ts
-- (defaultSiteContent). Los novios lo editan desde /admin/contenido.
insert into site_content (id, content) values (
  1,
  '{
    "couple": {
      "brideFirstName": "Elisabeth",
      "groomFirstName": "Cristian"
    },
    "event": {
      "dateTimeISO": "2026-11-21T12:00:00-03:00",
      "country": "Chile"
    },
    "hero": {
      "title": "¡Nos casamos!",
      "imageSrc": "/images/hero-placeholder.svg",
      "imageAlt": "Elisabeth y Cristian"
    },
    "ourStory": {
      "heading": "Nuestra historia",
      "paragraphs": [
        "Después de compartir sueños, desafíos, código, aventuras y la compañía de nuestras gatitas, decidimos comenzar una nueva etapa juntos. Queremos celebrar este momento rodeados de las personas que forman parte de nuestra historia."
      ]
    },
    "venue": {
      "name": "Salón Jardín Primavera",
      "address": "Camino Los Aromos 1234, Colina, Región Metropolitana",
      "reference": "Portón blanco junto a la rotonda, a 5 minutos de la Ruta 5.",
      "googleMapsUrl": "https://maps.google.com/?q=Camino+Los+Aromos+1234+Colina",
      "dressCode": "Formal / Elegante primaveral",
      "arrivalTime": "11:30 horas (30 minutos antes del inicio de la ceremonia)"
    },
    "schedule": [
      { "time": "11:30", "title": "Llegada de invitados" },
      { "time": "12:00", "title": "Ceremonia" },
      { "time": "13:00", "title": "Recepción" },
      { "time": "14:00", "title": "Almuerzo" },
      { "time": "16:00", "title": "Celebración" }
    ],
    "gallery": {
      "heading": "Galería",
      "images": [
        { "src": "/images/gallery/foto-1.svg", "alt": "Elisabeth y Cristian paseando al aire libre" },
        { "src": "/images/gallery/foto-2.svg", "alt": "Elisabeth y Cristian sonriendo juntos" },
        { "src": "/images/gallery/foto-3.svg", "alt": "Elisabeth y Cristian en una celebración" },
        { "src": "/images/gallery/foto-4.svg", "alt": "Detalle de manos entrelazadas" },
        { "src": "/images/gallery/foto-5.svg", "alt": "Elisabeth y Cristian con sus gatitas" },
        { "src": "/images/gallery/foto-6.svg", "alt": "Atardecer de primavera" }
      ]
    },
    "gifts": {
      "enabled": true,
      "heading": "Regalos",
      "thankYouMessage": "No queremos otro regalo que tenerlos con nosotros ese día. Su cariño y su compañía son el mejor regalo que podemos recibir.",
      "showBankDetails": false,
      "bankDetails": {
        "accountHolder": "Elisabeth [Apellido]",
        "rut": "11.111.111-1",
        "bank": "Banco Ejemplo",
        "accountType": "Cuenta Vista",
        "accountNumber": "000123456789",
        "email": "regalos.elisabethycristian@example.com"
      }
    },
    "faq": [
      { "question": "¿Puedo asistir con acompañante?", "answer": "Solo si tu invitación lo indica expresamente. Revisa el detalle de cupos en tu invitación personal." },
      { "question": "¿Puedo llevar niños?", "answer": "La asistencia de niños depende de lo indicado en tu invitación personal. Si tienes dudas, contáctanos directamente." },
      { "question": "¿Cuál es el código de vestimenta?", "answer": "Formal / Elegante primaveral." },
      { "question": "¿Hay estacionamiento?", "answer": "Sí, el recinto cuenta con estacionamiento gratuito para los invitados." },
      { "question": "¿Hasta qué fecha puedo confirmar?", "answer": "La fecha límite aparece en tu invitación personal. Te recomendamos confirmar apenas puedas." },
      { "question": "¿Qué hago si necesito modificar mi respuesta?", "answer": "Puedes volver a ingresar a tu enlace de invitación y actualizar tu respuesta hasta la fecha límite indicada." }
    ],
    "rsvp": {
      "defaultDeadlineISO": "2026-10-21T23:59:59-03:00"
    },
    "contact": {
      "email": "elisabethycristian.boda@example.com"
    }
  }'::jsonb
)
on conflict (id) do nothing;

-- ---------------------------------------------------------------------
-- Storage: bucket público para las imágenes de la boda (hero + galería).
-- Público en lectura (son fotos destinadas a mostrarse en la invitación),
-- pero solo administradores pueden subir/reemplazar/eliminar archivos.
-- ---------------------------------------------------------------------
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'wedding-media',
  'wedding-media',
  true,
  5242880, -- 5 MB por archivo
  array['image/jpeg', 'image/png', 'image/webp', 'image/svg+xml']
)
on conflict (id) do nothing;

create policy "public can view wedding-media files"
  on storage.objects for select
  to public
  using (bucket_id = 'wedding-media');

create policy "admins can upload wedding-media files"
  on storage.objects for insert
  to authenticated
  with check (bucket_id = 'wedding-media' and public.is_admin());

create policy "admins can update wedding-media files"
  on storage.objects for update
  to authenticated
  using (bucket_id = 'wedding-media' and public.is_admin())
  with check (bucket_id = 'wedding-media' and public.is_admin());

create policy "admins can delete wedding-media files"
  on storage.objects for delete
  to authenticated
  using (bucket_id = 'wedding-media' and public.is_admin());
