# Invitación de matrimonio — Elisabeth & Cristian

Invitación digital de matrimonio full-stack: landing pública, confirmación de
asistencia por enlace personal (token) y panel administrativo protegido.

**Stack**: Next.js (App Router) · TypeScript · Tailwind CSS · Supabase
(Postgres + Auth) · React Hook Form · Zod · Vercel.

---

## Índice

1. [Estructura del proyecto](#1-estructura-del-proyecto)
2. [Ejecutar el proyecto localmente](#2-ejecutar-el-proyecto-localmente)
3. [Crear el proyecto en Supabase](#3-crear-el-proyecto-en-supabase)
4. [Variables de entorno](#4-variables-de-entorno)
5. [Crear el primer administrador](#5-crear-el-primer-administrador)
6. [Desplegar en Vercel](#6-desplegar-en-vercel)
7. [Conectar un dominio personalizado](#7-conectar-un-dominio-personalizado)
8. [Editar el contenido de la boda](#8-editar-el-contenido-de-la-boda)
9. [Importar invitados](#9-importar-invitados)
10. [Checklist de seguridad antes de publicar](#10-checklist-de-seguridad-antes-de-publicar)
11. [Checklist de pruebas](#11-checklist-de-pruebas)
12. [Datos de demostración](#12-datos-de-demostración)

---

## 1. Estructura del proyecto

```
app/            Rutas (App Router): landing pública, /invitacion/[token], /admin, /api
components/     Componentes de UI, separados en public/ y admin/
lib/            Utilidades de servidor: Supabase, tokens, sanitización, rate limit, csv, auth, audit
services/       Acceso a datos por entidad (guests, rsvp, stats)
types/          Tipos de dominio y tipos generados de Supabase
schemas/        Esquemas Zod (RSVP, invitados, CSV)
config/         config/wedding.ts — todo el contenido editable de la boda
supabase/       Migraciones SQL (esquema, RLS, datos demo)
public/         Imágenes estáticas
```

---

## 2. Ejecutar el proyecto localmente

Requisitos: Node.js 18.18+ y una cuenta de Supabase (gratuita).

```bash
npm install
cp .env.example .env.local   # completar con tus credenciales (paso 3 y 4)
npm run dev
```

Abre `http://localhost:3000`. El panel administrativo está en
`http://localhost:3000/admin`.

Comandos útiles:

```bash
npm run build       # build de producción
npm run lint        # ESLint
npm run typecheck   # TypeScript sin emitir archivos
```

---

## 3. Crear el proyecto en Supabase

1. Crea una cuenta en [supabase.com](https://supabase.com) y un nuevo proyecto.
2. Ve a **SQL Editor** y ejecuta, en este orden, el contenido de:
   1. `supabase/migrations/0001_init.sql` (tablas, índices, restricciones)
   2. `supabase/migrations/0002_rls_policies.sql` (Row Level Security)
   3. *(opcional, solo para pruebas)* `supabase/migrations/0003_seed_demo.sql`
      — **no ejecutar en producción**.
   4. `supabase/migrations/0004_site_content.sql` (contenido editable del
      sitio + bucket de Storage `wedding-media` para las fotos)
3. En **Project Settings → API** copia:
   - `Project URL` → `NEXT_PUBLIC_SUPABASE_URL`
   - `anon public` key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `service_role` key → `SUPABASE_SERVICE_ROLE_KEY` (⚠️ secreta, nunca la
     publiques ni la antepongas con `NEXT_PUBLIC_`)
4. (Opcional) Regenera los tipos TypeScript desde el esquema real:
   ```bash
   npx supabase gen types typescript --project-id <TU_PROJECT_ID> --schema public > types/database.types.ts
   ```
   Si regeneras los tipos, revisa que conserven el campo `Relationships` por
   tabla — algunas versiones de `@supabase/postgrest-js` lo requieren para
   tipar correctamente `.from()` (ver comentario al inicio de
   `types/database.types.ts`).

---

## 4. Variables de entorno

Copia `.env.example` a `.env.local` (desarrollo) y configura las mismas
claves como variables de entorno del proyecto en Vercel (producción).

| Variable | Dónde se usa | Secreta |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Cliente y servidor | No |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Cliente y servidor | No (protegida por RLS) |
| `SUPABASE_SERVICE_ROLE_KEY` | Solo servidor | **Sí** |
| `NEXT_PUBLIC_SITE_URL` | Enlaces absolutos (.ics, enlaces de invitado) | No |
| `RSVP_RATE_LIMIT_MAX` | Límite de intentos de RSVP por ventana | No |
| `RSVP_RATE_LIMIT_WINDOW_MINUTES` | Duración de la ventana de límite | No |

`SUPABASE_SERVICE_ROLE_KEY` nunca se referencia desde ningún archivo con
`"use client"` (ver `lib/supabase/admin.ts`, protegido con el import
`server-only`, que hace fallar el build si se importa desde el cliente).

---

## 5. Crear el primer administrador

No existe un formulario de "registro" de administradores por diseño: se
crean manualmente para evitar que cualquiera se autoasigne acceso al panel.

1. En el dashboard de Supabase, ve a **Authentication → Users → Add user**
   y crea el usuario con el correo y contraseña de uno de los novios
   (marca "Auto Confirm User").
2. En **SQL Editor**, vincúlalo como administrador:
   ```sql
   insert into administrators (user_id, full_name)
   values ('<uuid-del-usuario-creado>', 'Elisabeth');
   ```
   El UUID aparece en la lista de usuarios de Authentication.
3. Repite el paso 2 (con un nuevo usuario) para el segundo novio.
4. Inicia sesión en `/admin/login` con ese correo y contraseña.

---

## 6. Desplegar en Vercel

1. Sube el repositorio a GitHub/GitLab/Bitbucket.
2. En [vercel.com](https://vercel.com), **Add New → Project** e importa el repositorio.
3. En **Environment Variables**, agrega las mismas variables de la sección 4
   (marca `SUPABASE_SERVICE_ROLE_KEY` como *sensitive*).
4. Despliega. Vercel detecta Next.js automáticamente (no requiere configuración adicional).
5. Actualiza `NEXT_PUBLIC_SITE_URL` con la URL final de Vercel y vuelve a desplegar
   (los enlaces de invitado y el archivo `.ics` la usan para generar URLs absolutas).

---

## 7. Conectar un dominio personalizado

1. En el proyecto de Vercel: **Settings → Domains → Add**.
2. Ingresa tu dominio (por ejemplo `elisabethycristian.cl`).
3. Configura en tu proveedor DNS el registro que Vercel indique
   (normalmente un `CNAME` hacia `cname.vercel-dns.com` para subdominios,
   o registros `A`/`ALIAS` para el dominio raíz).
4. Espera la verificación (Vercel emite el certificado HTTPS automáticamente).
5. Actualiza `NEXT_PUBLIC_SITE_URL` al nuevo dominio y vuelve a desplegar.

---

## 8. Editar el contenido de la boda

Todo el contenido editable (nombres, fecha, recinto, dirección, programa,
galería, datos bancarios, FAQ y textos) se administra **desde el panel, en
`/admin/contenido`** — no requiere tocar código ni volver a desplegar. Cada
sección (Portada, Historia, Recinto, Programa, Galería, Regalos, FAQ,
Contacto) se guarda de forma independiente y se publica de inmediato.

Las fotografías (portada y galería) se suben directamente desde esa misma
página: se guardan en el bucket de Supabase Storage `wedding-media` (público
en lectura, solo administradores pueden subir/reemplazar/eliminar).

`config/wedding.ts` deja de ser el contenido "en vivo": ahora es solo el
valor por defecto/semilla (usado por la migración `0004_site_content.sql` y
como respaldo si la fila de `site_content` no pudiera leerse). No es
necesario editarlo para operar el sitio.

---

## 9. Importar invitados

Desde `/admin/importar` puedes:

- Descargar la plantilla CSV (botón en el panel) o usar `example-guests-import.csv`
  incluido en la raíz del proyecto como referencia.
- Subir un CSV con las columnas: `full_name, family_group, phone, email,
  maximum_guests, children_allowed, plus_one_allowed, table_number, internal_notes`.
- Cada fila válida crea un invitado con un token único generado automáticamente.
- Las filas con errores se reportan con su número de línea sin detener el resto de la importación.

---

## 10. Checklist de seguridad antes de publicar

- [ ] `supabase/migrations/0003_seed_demo.sql` **no** se ejecutó en el proyecto de producción.
- [ ] `SUPABASE_SERVICE_ROLE_KEY` está configurada solo como variable de servidor (nunca `NEXT_PUBLIC_*`).
- [ ] Verificaste en el navegador (pestaña Network / "view source") que el `service_role key` no aparece en ningún bundle de cliente.
- [ ] Las políticas RLS de `0002_rls_policies.sql` están activas (`select * from pg_policies` en Supabase para confirmarlo).
- [ ] Se creó al menos un administrador real y se probó el login en `/admin/login`.
- [ ] `NEXT_PUBLIC_SITE_URL` apunta al dominio final de producción.
- [ ] Los textos de ejemplo se reemplazaron por datos reales desde `/admin/contenido` (recinto, dirección, banco, contacto, fotos).
- [ ] Se verificó que un usuario anónimo no puede subir archivos al bucket `wedding-media` (solo leerlos).
- [ ] Se probó que un token de invitación inválido o inexistente muestra el mensaje genérico de "invitación no encontrada" (sin filtrar información).
- [ ] Se probó que un invitado no puede confirmar más personas que su cupo asignado.
- [ ] Se confirmó que `/admin` redirige a `/admin/login` sin sesión.
- [ ] Se revisaron los encabezados de seguridad en producción (CSP, X-Frame-Options, HSTS) con las herramientas de desarrollador del navegador.
- [ ] Se ajustaron `RSVP_RATE_LIMIT_MAX` / `RSVP_RATE_LIMIT_WINDOW_MINUTES` a valores razonables para el tamaño real del evento.
- [ ] Se revisó la política de privacidad (`/privacidad`) y coincide con el uso real de los datos.
- [ ] Se estableció un plan para depurar la tabla `rate_limits` periódicamente (o dejar que crezca solo hasta después del evento).

---

## 11. Checklist de pruebas

**Sitio público**
- [ ] La cuenta regresiva muestra días/horas/minutos/segundos correctos y no rompe la hidratación (sin warnings en consola).
- [ ] Los botones de Google Maps y "Agregar a Google Calendar" abren la ubicación/evento correctos.
- [ ] El archivo `.ics` descargado se puede importar en Calendar/Outlook.
- [ ] La galería abre cada imagen en modal, cierra con Escape y con clic fuera, y devuelve el foco al cerrar.
- [ ] "Copiar datos bancarios" copia el texto correcto y muestra confirmación visual.
- [ ] Las preguntas frecuentes se expanden/colapsan y son navegables por teclado.
- [ ] La navegación entre secciones funciona con scroll suave y por teclado (Tab).

**Confirmación de asistencia**
- [ ] Un token válido muestra los datos correctos del invitado (nombre, cupos, estado, fecha límite).
- [ ] Un token inválido o de un invitado inactivo muestra el mensaje genérico de error.
- [ ] Confirmar con más personas que el cupo autorizado es rechazado (cliente y servidor).
- [ ] Confirmar sin marcar la autorización de datos es rechazado.
- [ ] Es posible modificar una respuesta ya enviada antes de la fecha límite.
- [ ] Después de la fecha límite, el formulario se reemplaza por el aviso correspondiente.
- [ ] Enviar el formulario muchas veces seguidas activa el límite de solicitudes.
- [ ] Los acompañantes ingresados se guardan y se muestran correctamente al volver a entrar.

**Panel administrativo**
- [ ] No se puede acceder a `/admin` sin iniciar sesión.
- [ ] Un usuario autenticado pero no registrado en `administrators` ve el mensaje de "sin autorización".
- [ ] El dashboard refleja los datos de `supabase/migrations/0003_seed_demo.sql` (en un proyecto de pruebas).
- [ ] Crear, editar, eliminar (con confirmación) y buscar/filtrar invitados funciona correctamente.
- [ ] "Copiar enlace" y "Abrir enlace" apuntan al token correcto.
- [ ] "Regenerar enlace" invalida el token anterior (el enlace viejo deja de funcionar).
- [ ] Activar/desactivar invitación y marcar entregada se reflejan de inmediato en la tabla.
- [ ] La importación CSV reporta errores por fila sin detener el resto.
- [ ] Las cuatro exportaciones (todos, confirmados, restricciones, por mesa) descargan CSVs con las columnas esperadas.
- [ ] La tabla es usable en una pantalla de teléfono (vista de tarjetas) y de escritorio (vista de tabla).
- [ ] Cada sección de `/admin/contenido` guarda por separado y el cambio se refleja en la landing pública sin redesplegar.
- [ ] Subir una fotografía (portada o galería) desde `/admin/contenido` funciona y la imagen se ve en el sitio público.
- [ ] Los cambios de fecha del matrimonio en "Portada y fecha" actualizan la cuenta regresiva y el archivo `.ics`.

---

## 12. Datos de demostración

`supabase/migrations/0003_seed_demo.sql` incluye 5 invitados de ejemplo
(confirmado con acompañantes y un niño, rechazado, pendiente, confirmado con
restricción alimentaria, e invitación desactivada) para poder probar el
dashboard y la tabla administrativa de inmediato en un proyecto de
**desarrollo o staging**. Sus tokens son legibles a propósito
(`demo-familia-perez-01`, etc.) para poder navegar manualmente a
`/invitacion/<token>`. **No ejecutar este script en producción.**
