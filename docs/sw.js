// Service worker вьювера шефа v6: кэшируем ТОЛЬКО оболочку шефа.
// НОВОЕ: если запрошен путь вне корня /Shinomontazh/ (т.е. чужая подпапка —
// /slots/, /booking/, /admin/, /master/) — не вмешиваемся вообще.
// Раньше SW шефа мог перехватывать и подменять чужие страницы своим кэшем.
var CACHE_NAME = 'shino-boss-v6';
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

  // НОВОЕ v6: чужие подпапки — не наше дело, отдаём сети как есть.
  // Путь должен быть ровно корнем /Shinomontazh/ (возможно, со слэшем на конце)
  // или начинаться с /Shinomontazh/ без следующего сегмента-подпапки.
  var scope = self.location.pathname.replace(/[^\/]*$/, ''); // /Shinomontazh/
  var path = url.pathname;
  if (path !== scope && path !== scope + 'index.html' && path.indexOf(scope) === 0) {
    // это /Shinomontazh/<что-то>/... — подпапка другого приложения
    return;
  }

  // Оболочка шефа: кэш первым, сеть — запасным
  e.respondWith(
    caches.match(e.request).then(function(cached) {
      if (cached) return cached;
      return fetch(e.request).then(function(resp) {
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
