const CACHE_NAME = 'death-clock-v2';
const ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/shared/styles.css',
  '/shared/core.js',
  '/shared/quiz.js',
  '/shared/sharing.js',
  '/shared/social.js',
  '/shared/deathy.js',
  '/shared/dashboard.js',
  '/shared/challenges.js',
  '/shared/engagement.js',
  '/shared/quickwins.js',
  '/shared/interactions.js',
  '/icon-192.png',
  '/icon-512.png',
  '/og-image.png',
  '/logo.svg'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(ASSETS))
  );
  self.skipWaiting();
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', event => {
  // Network-first for API calls
  if (event.request.url.includes('supabase.co') || event.request.url.includes('stripe.com')) {
    event.respondWith(fetch(event.request));
    return;
  }
  // Stale-while-revalidate for app assets
  event.respondWith(
    caches.open(CACHE_NAME).then(cache =>
      cache.match(event.request).then(cached => {
        const fetched = fetch(event.request).then(response => {
          if (response.ok) cache.put(event.request, response.clone());
          return response;
        }).catch(() => cached);
        return cached || fetched;
      })
    )
  );
});
