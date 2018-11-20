const cacheName = 'v1';

// Default files to cache
let cacheFiles = [
    './',
    './index.html',
    './restaurant.html',
    './img/1.jpg',
    './img/2.jpg',
    './img/3.jpg',
    './img/4.jpg',
    './img/5.jpg',
    './img/6.jpg',
    './img/7.jpg',
    './img/8.jpg',
    './img/9.jpg',
    './img/10.jpg',
    './js/dbhelper.js',
    './js/idb.js',
    './js/main.js',
    './js/restaurant_info.js',
    './css/styles.css',
    './manifest.json',
    'https://unpkg.com/leaflet@1.3.1/dist/leaflet.css',
    'https://unpkg.com/leaflet@1.3.1/dist/leaflet.js',
    'https://unpkg.com/leaflet@1.3.1/dist/images/marker-icon.png',
    'https://unpkg.com/leaflet@1.3.1/dist/images/marker-icon-2x.png',
    'https://unpkg.com/leaflet@1.3.1/dist/images/marker-shadow.png'
]


//get the assets needed from the network and create a cache for them
self.addEventListener('install', event => {
    console.log('[ServiceWorker] Installed');

    // event.waitUntil Delays the event until the Promise is resolved
    event.waitUntil(

        // Open the cache
        caches.open(cacheName).then(cache => {

            // Add all the default files to the cache
            console.log('[ServiceWorker] Caching cacheFiles');
            return cache.addAll(cacheFiles);
        })
    ); // end event.waitUntil
});


//makes the new service worker become active by clearing old cache
self.addEventListener('activate', event => {
    console.log('[ServiceWorker] Activated');

    event.waitUntil(

        // Get all the cache keys (cacheName)
        caches.keys().then(cacheNames => Promise.all(cacheNames.map(thisCacheName => {

            // If a cached item is saved under a previous cacheName
            if (thisCacheName !== cacheName) {

                // Delete that cached file
                console.log('[ServiceWorker] Removing Cached Files from Cache - ', thisCacheName);
                return caches.delete(thisCacheName);
            }
        })))
    ); // end event.waitUntil
});


//fetch a cached event
self.addEventListener('fetch', event => {
    console.log('[ServiceWorker] Fetch', event.request.url);

    if (event.request.destination !== 'image') {
        event.respondWith(
            caches.open(cacheName)
                .then((cache) => {
                    const url = event.request.url.split('?')[0];
                    if (url.includes('restaurant')) {
                        return cache.match(url);
                    }
                    return cache.match(event.request).then(cacheResponse => {
                        return cacheResponse || fetch(event.request).then(networkResponse => {
                            return caches.open(imagesCacheName).then(cache => {
                                cache.put(event.request, networkResponse.clone());
                                return networkResponse;
                            });
                        });
                    })
                })
        );
    }else{
        // event.respondWidth Responds to the fetch event
        event.respondWith(

            // Check in cache for the request being made
            caches.match(event.request)
                .then(response => {

                    // If the request is in the cache
                    if (response) {
                        console.log("[ServiceWorker] Found in Cache", event.request.url, response);
                        // Return the cached version
                        return response;
                    }

                    // If the request is NOT in the cache, fetch and cache

                    const requestClone = event.request.clone();
                    return fetch(requestClone)
                        .then(response => {

                            if (!response) {
                                console.log("[ServiceWorker] No response from fetch ")
                                return response;
                            }

                            const responseClone = response.clone();

                            //  Open the cache
                            caches.open(cacheName).then(cache => {

                                // Put the fetched response in the cache
                                cache.put(event.request, responseClone);
                                console.log('[ServiceWorker] New Data Cached', event.request.url);

                                // Return the response
                                return response;

                            }); // end caches.open

                        })
                        .catch(err => {
                            console.log('[ServiceWorker] Error Fetching & Caching New Data', err);
                        });


                }) // end caches.match(event.request)
        ); // end event.respondWith
    }
    
});