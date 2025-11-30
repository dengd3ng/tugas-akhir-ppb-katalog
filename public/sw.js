const CACHE_NAME = 'katalog-gadget-v1';
const API_CACHE = 'katalog-gadget-api-v1';
const ASSETS = [
  '/',
  '/index.html',
  '/offline.html',
  '/icons/icon-192.png',
  '/icons/icon-512.png'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS))
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then(keys => Promise.all(
      keys.filter(k => k !== CACHE_NAME && k !== API_CACHE).map(k => caches.delete(k))
    ))
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Navigation requests: network-first, fallback to cache, then offline.html
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then(response => {
          if (response && response.status === 200) {
            const copy = response.clone();
            caches.open(CACHE_NAME).then(cache => cache.put(request, copy));
          }
          return response;
        })
        .catch(() => 
          caches.match(request)
            .then(cached => cached || caches.match('/offline.html'))
        )
    );
    return;
  }

  // API requests (Supabase /rest/v1/): network-first, cache as fallback (aggressive caching)
  if (url.pathname.includes('/rest/v1/')) {
    event.respondWith(
      fetch(request)
        .then((response) => {
          // Always cache successful API responses
          if (response && response.status === 200 && response.type !== 'error') {
            const copy = response.clone();
            caches.open(API_CACHE).then(cache => cache.put(request, copy));
          }
          return response;
        })
        .catch(() => {
          // Offline or network error: return cached version
          return caches.match(request)
            .then(cached => cached || caches.match('/offline.html'));
        })
    );
    return;
  }

  // Other requests (CSS, JS, images): cache-first, then network
  event.respondWith(
    caches.match(request).then((cached) => {
      if (cached) return cached;
      return fetch(request).then((response) => {
        if (!response || response.status !== 200 || response.type === 'opaque') return response;
        const copy = response.clone();
        caches.open(CACHE_NAME).then(cache => cache.put(request, copy));
        return response;
      }).catch(() => caches.match('/offline.html'));
    })
  );
});
