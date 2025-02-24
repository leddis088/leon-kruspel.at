const CACHE_NAME = 'lk-site-cache-v1';
const urlsToCache = [
  './',
  'css/main.css',
  'css/critical.css',
  'css/index.css',
  'css/project.css',
  'css/additional.css',
  'css/cookie-notice.css',
  'js/main.js',
  'js/navigation.js',
  'js/cookie-notice.js',
  'js/index.js',
  'js/project.js',
  '/img/placeholder.jpg',
  '/img/AI_Server_fanSide.jpg',
  '/img/Serverrack_front.jpg',
  // Add other available images
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        return Promise.all(
          urlsToCache.map(url => {
            return cache.add(url).catch(error => {
              console.log(`Failed to cache: ${url}`, error);
            });
          })
        );
      })
  );
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        if (response) {
          return response;
        }
        
        const fetchRequest = event.request.clone();

        return fetch(fetchRequest).then(response => {
          if (!response || response.status !== 200 || response.type !== 'basic') {
            return response;
          }

          const responseToCache = response.clone();

          caches.open(CACHE_NAME)
            .then(cache => {
              cache.put(event.request, responseToCache);
            });

          return response;
        }).catch(() => {
          if (event.request.url.match(/\.(jpg|jpeg|png|gif)$/)) {
            return caches.match('/img/placeholder.jpg');
          }
        });
      })
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
}); 