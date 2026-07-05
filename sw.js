// ============================================
// INSTALPON Service Worker
// ============================================
// IMPORTANTE: cada vez que subas cambios importantes al sitio
// (nuevo catálogo, precios, textos, etc.), sube también este
// archivo cambiando el número de CACHE_VERSION más abajo
// (v3 -> v4 -> v5 ...). Eso obliga a todos los navegadores a
// descartar la copia vieja y traer la nueva automáticamente.
// ============================================

const CACHE_VERSION = 'v3'; // <-- sube este número en cada actualización importante
const CACHE_NAME = `instalpon-${CACHE_VERSION}`;

const urlsToCache = [
  '/',
  '/index.html',
  '/logo-instalpon.jpeg',
  'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css'
];

// ===== INSTALL: guarda archivos base y activa el nuevo SW de inmediato =====
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(urlsToCache))
      .then(() => self.skipWaiting()) // no espera a que cierres pestañas viejas
  );
});

// ===== ACTIVATE: borra cachés antiguas y toma control inmediato =====
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys()
      .then(cacheNames => Promise.all(
        cacheNames
          .filter(name => name !== CACHE_NAME) // borra cualquier versión anterior
          .map(name => caches.delete(name))
      ))
      .then(() => self.clients.claim()) // controla las pestañas ya abiertas ahora mismo
  );
});

// ===== FETCH: siempre intenta traer lo más nuevo del servidor primero =====
// Solo si no hay internet, usa la copia guardada en caché (modo offline).
self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return;

  event.respondWith(
    fetch(event.request)
      .then(networkResponse => {
        const responseClone = networkResponse.clone();
        caches.open(CACHE_NAME).then(cache => {
          cache.put(event.request, responseClone);
        });
        return networkResponse;
      })
      .catch(() => caches.match(event.request))
  );
});
