const CACHE_NAME = 'fuoriQuota-cache-v1';
const FILES_TO_CACHE = [
  'gestionale.html',
  'style.css',
  'script.js',
  'LogoFqUfficiale.png',
  'manifest.json'
];

// INSTALL
self.addEventListener('install', evt => {
  evt.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      console.log('Caching app files');
      return cache.addAll(FILES_TO_CACHE);
    })
  );
  self.skipWaiting();
});

// ACTIVATE
self.addEventListener('activate', evt => {
  evt.waitUntil(
    caches.keys().then(keyList => {
      return Promise.all(keyList.map(key => {
        if(key !== CACHE_NAME){
          console.log('Removing old cache', key);
          return caches.delete(key);
        }
      }));
    })
  );
  self.clients.claim();
});

// FETCH
self.addEventListener('fetch', evt => {
  evt.respondWith(
    caches.match(evt.request).then(resp => {
      return resp || fetch(evt.request);
    })
  );
});