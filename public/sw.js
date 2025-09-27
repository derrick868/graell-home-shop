const CACHE_NAME = "app-cache-v1";
const ASSETS = [
  "/",
  "/index.html",
  "/manifest.json",
];

// Install event: cache base assets
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS);
    })
  );
});

// Activate event: clean old caches
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    )
  );
});

// Fetch event: try cache, then network
self.addEventListener("fetch", (event) => {
  const req = event.request;

  // Bypass non-GET requests
  if (req.method !== "GET") return;

  event.respondWith(
    caches.match(req).then((cached) => {
      if (cached) return cached;

      return fetch(req)
        .then((res) => {
          // Only cache JS, CSS, images, fonts, and HTML
          if (res.ok && (req.url.endsWith(".js") || req.url.endsWith(".css") || req.url.match(/\.(png|jpg|jpeg|gif|svg|webp|woff2?|ttf)$/) || req.destination === "document")) {
            const resClone = res.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(req, resClone));
          }
          return res;
        })
        .catch(() => {
          // Optional: fallback offline page if HTML request
          if (req.destination === "document") {
            return caches.match("/index.html");
          }
        });
    })
  );
});
