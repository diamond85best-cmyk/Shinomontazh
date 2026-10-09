// Service worker приложения записи: ничего НЕ кэширует (работает только онлайн,
// офлайн-данные живут в localStorage очереди). Задача — занять scope /booking/.
self.addEventListener('install', function(e) { self.skipWaiting(); });
self.addEventListener('activate', function(e) {
  e.waitUntil(self.clients.claim());
});
