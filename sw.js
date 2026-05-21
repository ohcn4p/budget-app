const CACHE = 'budget-v3';

self.addEventListener('install', e => {
  e.waitUntil(
    fetch('/budget-app/index.html')
      .then(r => r.text())
      .then(() => caches.open(CACHE).then(cache => 
        cache.addAll([
          '/budget-app/',
          '/budget-app/index.html',
          '/budget-app/manifest.json',
          '/budget-app/icon-192.png',
          '/budget-app/icon-512.png'
        ])
      ))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', e => {
  // Always serve from cache first, fall back to network
  e.respondWith(
    caches.match(e.request, { ignoreSearch: true }).then(cached => {
      if (cached) return cached;
      return fetch(e.request).then(response => {
        // Cache any successful response
        if (response && response.status === 200) {
          const clone = response.clone();
          caches.open(CACHE).then(cache => cache.put(e.request, clone));
        }
        return response;
      }).catch(() => caches.match('/budget-app/index.html'));
    })
  );
});
