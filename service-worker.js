self.addEventListener('install', event => {
  console.log('Service Worker instalado');
  self.skipWaiting(); // Para activar inmediatamente
});

self.addEventListener('fetch', event => {
  // No interceptamos ni cacheamos nada para no interferir con peticiones online
});
