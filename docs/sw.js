// Service worker вьювера шефа: кэшируем ТОЛЬКО оболочку (HTML/иконки).
// Данные (fetch_json) всегда идут мимо кэша — никаких устаревших сумм.
var CACHE_NAME = 'shino-boss-v2';
var SHELL = [
  './',
  './index.html',
  './manifest.json',
  './icon-180.png',
  './icon-192.png',
  './icon-512.png'
];

self.addEventListener('install', function(e) {
  e.waitUntil(
    caches.open(CACHE_NAME).then(function(cache) { return cache.addAll(SHELL); })
  );
  self.skipWaiting();
});

self.addEventListener('activate', function(e) {
  e.waitUntil(
    caches.keys().then(function(keys) {
      return Promise.all(keys.map(function(k) {
        if (k !== CACHE_NAME) return caches.delete(k);
      }));
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', function(e) {
  var url = new URL(e.request.url);

  // Всё стороннее (сервер GAS) — только сеть, не перехватываем
  if (url.origin !== self.location.origin) return;

  // Оболочка: кэш первым, сеть — запасным
  e.respondWith(
    caches.match(e.request).then(function(cached) {
      if (cached) return cached;
      return fetch(e.request).then(function(resp) {
        // Навигация при офлайне — отдаём закэшированную страницу
        if (e.request.mode === 'navigate') {
          return caches.match('./index.html');
        }
        return resp;
      }).catch(function() {
        if (e.request.mode === 'navigate') {
          return caches.match('./index.html');
        }
        return Response.error();
      });
    })
  );
});
