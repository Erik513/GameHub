/* global self, caches, build */
const scope = new URL(self.registration.scope);
const cachePrefix = `gamehub:${scope.pathname}:`;
const cacheName = cachePrefix + build.version;
const entry = new URL("index.html", scope).href;
const assets = new Set(build.files.map((file) => new URL(file, scope).href));

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(cacheName)
      .then((cache) =>
        cache.addAll([...assets].map((url) => new Request(url, { cache: "reload" }))),
      ),
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      const keys = await caches.keys();
      await Promise.all(
        keys
          .filter((key) => key.startsWith(cachePrefix) && key !== cacheName)
          .map((key) => caches.delete(key)),
      );
      await self.clients.claim();
    })(),
  );
});

self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET") return;
  const url = new URL(request.url);
  if (url.origin !== scope.origin) return;
  const isEntry =
    request.mode === "navigate" &&
    (url.pathname === scope.pathname || url.pathname === new URL(entry).pathname);
  const asset = isEntry ? entry : request.url;
  if (!assets.has(asset)) return;
  event.respondWith(
    (async () => {
      const cache = await caches.open(cacheName);
      return (await cache.match(asset)) ?? fetch(request);
    })(),
  );
});
