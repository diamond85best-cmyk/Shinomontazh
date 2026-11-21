// Service worker радио: ничего НЕ кэширует (радио онлайн — без сети всё равно
// нет потока; интерфейс всегда свежий — не надо бампить версии).
// Его задача — занять область папки с радио, чтобы service worker шефа
// (в корне хостинга) не подсовывал свою офлайн-страницу при навигации.
// Тот же паттерн, что у админа (админ-pwa-sw.js).
self.addEventListener('install', function(e) { self.skipWaiting(); });
self.addEventListener('activate', function(e) {
  e.waitUntil(self.clients.claim());
});

// ===== Прокси для «Маруся ФМ» (radio-holding.ru) =====
// Серверы radio-holding отдают поток ТОЛЬКО если у запроса есть Referer
// (защита от хотлинка). Браузеры на iOS при загрузке <audio> Referer не шлют —
// из-за этого сервер отвечал 302 на сайт marus.fm и станция не играла.
// Решение: перехватываем запросы к radio-holding в SW и делаем их заново
// с явным Referer. Поток транслируется браузеру напрямую (стриминг).
// Если SW не активен — запрос уйдёт напрямую и сработает на десктопе,
// где Referer браузер подставляет сам.
self.addEventListener('fetch', function(event) {
  var url;
  try { url = new URL(event.request.url); } catch (e) { return; }
  if (url.hostname.indexOf('radio-holding.ru') === -1) return; // не наше дело
  event.respondWith(
    fetch(event.request.url, {
      mode: 'no-cors',
      referrer: 'https://marus.fm/',
      redirect: 'follow'
    }).catch(function() {
      return new Response('', { status: 502, statusText: 'proxy error' });
    })
  );
});
