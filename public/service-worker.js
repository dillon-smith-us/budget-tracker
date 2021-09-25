const FILES_TO_CACHE = [
    '/',
    'index.html',
    'index.html',
    'db.js',
    'styles.css',
    '/icons/icon-192x192.png',
    '/icons/icon-512x512.png',
    'manifest.webmanifest',
    'https://stackpath.bootstrapcdn.com/font-awesome/4.7.0/css/font-awesome.min.css',
    'https://cdn.jsdelivr.net/npm/chart.js@2.8.0'
];

const CACHE_NAME = 'static-cache-v13';
const DATA_CACHE_NAME = 'data-cache-v8';

// INSTALL
self.addEventListener('install', (e) => {
    e.waitUntil(
        caches.open(CAHCE_NAME).then((cache)=> {
            return cache.addAll(FILES_TO_CACHE);
        })
    );
    self.skipWaiting();
});

// ACTIVATE
self.addEventListener('activate', (e) => {
    //remove old caches
    e.waitUntil(
        caches.keys().then((keyList) => {
            return Promise.all(
                keyList.map((key) => {
                    if (key !== CACHE_NAME && key !== DATA_CACHE_NAME) {
                        return caches.delete(key);
                    }
                })
            )
        })
    );
    self.clients.claim();
});

self.addEventListener('fetch', (e) => {
    // cache succesful GET request to the API
    if (e.req.url.includes('/api/') && e.req.method === 'GET') {
        e.respondWith(
            caches
                .open(DATA_CACHE_NAME)
                .then((cache) => {
                    return fetch(e.req)
                    .then((res) => {
                        // if response is good, clone and store it in cache
                        if (res.status === 200) {
                            cache.put(e.req, res.clone());
                        }
                        return res;
                    })
                    .catch(() => {
                        return cache.match(e.req);
                    });
                })
                .catch((err) => console.log(err))
        );
        return;
    }
    e.respondWith(
        caches.match(e.req).then((res)=> {
            return res || fetch(e.req);
        })
    )
})