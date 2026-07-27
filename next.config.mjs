/** @type {import('next').NextConfig} */
const isDev = process.env.NODE_ENV !== "production";

const securityHeaders = [
  // Evita que la web sea embebida en iframes de terceros (clickjacking).
  { key: "X-Frame-Options", value: "DENY" },
  // Evita MIME-sniffing.
  { key: "X-Content-Type-Options", value: "nosniff" },
  // Limita la información de referer enviada a terceros.
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  // Restringe APIs sensibles del navegador que la app no utiliza.
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=(), interest-cohort=()",
  },
  // Fuerza HTTPS en navegadores que ya visitaron el sitio.
  {
    key: "Strict-Transport-Security",
    value: "max-age=63072000; includeSubDomains; preload",
  },
  {
    key: "Content-Security-Policy",
    value: [
      "default-src 'self'",
      // Next.js requiere 'unsafe-inline' para estilos inyectados en runtime.
      "style-src 'self' 'unsafe-inline'",
      // 'unsafe-eval' es exigido por Fast Refresh/HMR del servidor de desarrollo
      // de Next.js (usa eval() para aplicar actualizaciones de módulos). En
      // producción no se sirve JS por eval, así que se omite para no debilitar
      // la CSP innecesariamente.
      `script-src 'self' 'unsafe-inline'${isDev ? " 'unsafe-eval'" : ""}`,
      "img-src 'self' data: blob: https://*.supabase.co",
      "font-src 'self' data:",
      "connect-src 'self' https://*.supabase.co",
      "frame-ancestors 'none'",
      "base-uri 'self'",
      "form-action 'self'",
    ].join("; "),
  },
];

const nextConfig = {
  reactStrictMode: true,
  experimental: {
    serverActions: {
      // Las fotos subidas desde /admin/contenido (portada/galería) viajan
      // como FormData a través de una Server Action. El límite por defecto
      // de Next.js es 1 MB; lib/storage.ts ya valida un máximo de 5 MB por
      // archivo, así que se deja algo de margen aquí para que sea esa
      // validación (con mensaje claro) la que se dispare primero.
      bodySizeLimit: "6mb",
    },
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "*.supabase.co",
        pathname: "/storage/v1/object/public/**",
      },
    ],
    // Las imágenes de ejemplo incluidas en /public son SVG; next/image
    // exige habilitarlo explícitamente y fija una CSP propia para ellas.
    dangerouslyAllowSVG: true,
    contentDispositionType: "attachment",
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: securityHeaders,
      },
    ];
  },
};

export default nextConfig;
