const CACHE_NAME = 'mota-h5-cache-v1';
const CORE_ASSETS = [
    './',
    './index.html',
    './styles.css',
    './main.js',
    './logo.png',
    './manifest.webmanifest',
    './libs/thirdparty/lz-string.min.js',
    './libs/thirdparty/priority-queue.min.js',
    './libs/thirdparty/localforage.min.js',
    './libs/thirdparty/zip.min.js'
];

self.addEventListener('install', function (event) {
    event.waitUntil(
        caches.open(CACHE_NAME).then(function (cache) {
            return cache.addAll(CORE_ASSETS);
        })
    );
    self.skipWaiting();
});

self.addEventListener('activate', function (event) {
    event.waitUntil(
        caches.keys().then(function (keys) {
            return Promise.all(
                keys
                    .filter(function (key) {
                        return key !== CACHE_NAME;
                    })
                    .map(function (key) {
                        return caches.delete(key);
                    })
            );
        })
    );
    self.clients.claim();
});

self.addEventListener('fetch', function (event) {
    if (event.request.method !== 'GET') return;
    event.respondWith(
        caches.match(event.request).then(function (cachedResponse) {
            if (cachedResponse) return cachedResponse;
            return fetch(event.request).then(function (networkResponse) {
                if (!networkResponse || networkResponse.status !== 200) {
                    return networkResponse;
                }
                if (!event.request.url.startsWith(self.location.origin)) {
                    return networkResponse;
                }
                var responseToCache = networkResponse.clone();
                caches.open(CACHE_NAME).then(function (cache) {
                    cache.put(event.request, responseToCache);
                });
                return networkResponse;
            });
        })
    );
});
