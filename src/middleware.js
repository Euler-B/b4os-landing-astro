// src/middleware.js
import { defineMiddleware } from "astro:middleware";

// Lista de extensiones de archivos estáticos
const STATIC_EXTENSIONS = [
  ".webp",
  ".jpg",
  ".jpeg",
  ".png",
  ".gif",
  ".svg",
  ".ico",
  ".js",
  ".css",
  ".woff",
  ".woff2",
  ".ttf",
  ".eot",
  ".pdf",
  ".zip",
  ".mp4",
  ".webm",
  ".mp3",
  ".wav",
];

// Lista de directorios estáticos
const STATIC_PATHS = [
  "/images/",
  "/img/",
  "/assets/",
  "/static/",
  "/js/",
  "/css/",
  "/fonts/",
  "/favicon",
  "/robots.txt",
  "/sitemap.xml",
  "/.well-known/",
];

export const onRequest = defineMiddleware(async (context, next) => {
  const url = context.url;
  const pathname = url.pathname;

  // Verificar si es un archivo estático
  const isStaticFile =
    STATIC_EXTENSIONS.some((ext) => pathname.endsWith(ext)) ||
    STATIC_PATHS.some((path) => pathname.startsWith(path));

  // Si es un archivo estático y contiene un prefijo de idioma, redirigir
  if (isStaticFile) {
    const regex = /^\/(en|pt)(\/.+)$/;
    const matches = regex.exec(pathname);
    if (matches) {
      const assetPath = matches[2];
      // Redirigir a la ruta sin prefijo de idioma
      return Response.redirect(new URL(assetPath, url.origin), 301);
    }
  }

  return next();
});
