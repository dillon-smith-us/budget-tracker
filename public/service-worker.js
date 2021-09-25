const FILES_TO_CACHE = [
    "/",
    "index.html",
    "db.js",
    "styles.css",
    "index.js",
    "icons/icon-192x192.png",
    "icons/icon-512x512.png",
    "manifest.webmanifest",
    "https://stackpath.bootstrapcdn.com/font-awesome/4.7.0/css/font-awesome.min.css",
    "https://cdn.jsdelivr.net/npm/chart.js@2.8.0",

];

const CACHE_NAME = "static-cache-v2";
const DATA_CACHE_NAME = "data-cache-v1";

// INSTALL
self.addEventListener("install", function (event) {
    event.waitUntil(
        caches.open(CACHE_NAME).then(cache=> {
            console.log("offline info precached succesfull, yay!")
            return cache.addAll(FILES_TO_CACHE);
        })
    )
    .then(() => self.skipWaiting()) 
});

// ACTIVATE
self.addEventListener("activate", function (event) {
    //remove old caches
    event.waitUntil(
        caches.keys().then(keyList => {
            return Promise.all(
                keyList.map(key => {
                    if (key !== CACHE_NAME && key !== DATA_CACHE_NAME) {
                        console.log("deleting previous cache", key)
                        return caches.delete(key);
                    }
                })
            )
        })
    )
    .then(()=>self.clients.claim());
});

self.addEventListener("fetch", (event) => {
    // cache succesful GET request to the API
    if (event.request.url.includes("/api/")) {
        event.respondWith(
            caches.open(DATA_CACHE_NAME).then((cache) => {
                    return fetch(event.request)
                    .then(response => {
                        // if response is good, clone and store it in cache
                        if (response.status === 200) {
                            cache.put(event.request.url, response.clone());
                        }
                        return response;
                    })
                    .catch((err) => {
                        return cache.match(event.request);
                        
                    });
                })
        );
        return;
    }
    event.respondWith(
        caches.open(CACHE_NAME).then((cache) => {
            return cache.match(event.request).then(response=> {
                return response || fetch(event.request);
            }) 
        })
    )
})