// Service worker админа: ничего НЕ кэширует (инструмент правок работает
// только онлайн, всегда свежий интерфейс — не надо бампить версии).
// Его задача — занять область /admin/, чтобы service worker шефа
// не подсовывал свою офлайн-страницу при навигации по админке.
self.addEventListener('install', function(e) { self.skipWaiting(); });
self.addEventListener('activate', function(e) {
  e.waitUntil(self.clients.claim());
});
// Обработчика fetch нет: все запросы идут напрямую в сеть
