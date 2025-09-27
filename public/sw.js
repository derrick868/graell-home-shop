const CACHE_NAME = "graell-cache-" + Date.now(); // unique each deploy
const ASSETS = ["/"]; // add routes you want always cached

// Install → pre-cache
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS);
    })
  );
  self.skipWaiting(); // activate immediately
});

// Activate → clear old caches automatically
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((key) => key !== CACHE_NAME)
          .map((key) => caches.delete(key))
      )
    )
  );
  self.clients.claim();
});

// Fetch strategy
self.addEventListener("fetch", (event) => {
  const req = event.request;
  const url = new URL(req.url);

  // Skip cross-origin (e.g., Supabase, Netlify assets)
  if (url.origin !== location.origin) return;

  // Scripts & styles → network first, fallback cache
  if (req.destination === "script" || req.destination === "style") {
    event.respondWith(
      fetch(req).then((res) => {
        const copy = res.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(req, copy));
        return res;
      }).catch(() => caches.match(req))
    );
    return;
  }

  // Other files → cache first, fallback network
  event.respondWith(
    caches.match(req).then((res) => res || fetch(req))
  );
});
