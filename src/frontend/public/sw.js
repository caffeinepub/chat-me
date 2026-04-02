const CACHE_NAME = 'chat-me-v3';
const urlsToCache = [
  '/',
  '/manifest.json',
  '/assets/generated/chat-me-pwa-icon.dim_512x512.png'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(urlsToCache))
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  if (event.request.url.includes('/api/')) {
    event.respondWith(
      fetch(event.request).catch(() =>
        caches.match(event.request)
      )
    );
  } else {
    event.respondWith(
      fetch(event.request).catch(() =>
        caches.match(event.request).then(r => r || caches.match('/'))
      )
    );
  }
});
