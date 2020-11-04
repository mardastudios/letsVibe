const window = self;
self.importScripts('js/lib/gun.js', 'js/lib/sea.js');
var CACHE_NAME = 'vibe-cache-v1';

// stale-while-revalidate
if (self.location.host.indexOf('localhost') !== 0) {
  self.addEventListener('fetch', function(event) {
    event.respondWith(
      caches.open(CACHE_NAME).then(function(cache) {
        return cache.match(event.request).then(function(response) {
          var fetchPromise = fetch(event.request).then(function(networkResponse) {
            cache.put(event.request, networkResponse.clone());
            return networkResponse;
          })
          return response || fetchPromise;
        })
      })
    );
  });
}

self.onmessage = function(msg) {
  if (msg.data.key) {
    self.irisKey = msg.data.key;
  }
}

self.addEventListener('push', async ev => {
  const data = ev.data.json();
  console.log('got push', data);
  if (self.irisKey && data.from && data.from.epub) {
    const secret = await Gun.SEA.secret(data.from.epub, self.irisKey);
    data.title = await Gun.SEA.decrypt(data.title, secret);
    data.body = await Gun.SEA.decrypt(data.body, secret);
  }
});