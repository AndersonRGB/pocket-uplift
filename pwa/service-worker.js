const CACHE_NAME = "pocket-uplift-v3";
const APP_SHELL = [
  "../app/index.html",
  "../app/support.html",
  "../app/styles.css",
  "../app/app.js",
  "../app/recommend.js",
  "../app/storage.js",
  "../app/ui.js",
  "../app/data/micro_actions.csv",
  "../app/assets/icons/icon-192.svg",
  "../app/assets/icons/icon-512.svg",
  "./manifest.json",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(APP_SHELL)).then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key)))
      )
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") {
    return;
  }

  event.respondWith(
    fetch(event.request)
      .then((networkResponse) => {
        const clone = networkResponse.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
        return networkResponse;
      })
      .catch(() =>
        caches.match(event.request).then((cachedResponse) => {
          if (cachedResponse) {
            return cachedResponse;
          }

          return caches.match("../app/index.html");
        })
      )
  );
});
