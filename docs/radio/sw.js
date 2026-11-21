// Service worker радио: ничего НЕ кэширует (радио онлайн — без сети всё равно
// нет потока; интерфейс всегда свежий — не надо бампить версии).
// Его задача — занять область папки с радио, чтобы service worker шефа
// (в корне хостинга) не подсовывал свою офлайн-страницу при навигации.
// Тот же паттерн, что у админа (админ-pwa-sw.js).
self.addEventListener('install', function(e) { self.skipWaiting(); });
self.addEventListener('activate', function(e) {
  e.waitUntil(self.clients.claim());
});
// Обработчика fetch нет: все запросы идут напрямую в сеть
