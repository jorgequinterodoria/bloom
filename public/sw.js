const CACHE = "bloom-static-v1";
const STATIC_PREFIXES = ["/_next/static/", "/icons/"];

self.addEventListener("install", () => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)),
        ),
      )
      .then(() => self.clients.claim()),
  );
});

self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET") return;
  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;
  // Navegaciones y /api siempre van a red: sin cachear HTML autenticado.
  if (!STATIC_PREFIXES.some((prefix) => url.pathname.startsWith(prefix))) return;

  event.respondWith(
    caches
      .match(request)
      .then((cached) => {
        const network = fetch(request)
          .then((res) => {
            if (res.ok) {
              const copy = res.clone();
              event.waitUntil(
                caches
                  .open(CACHE)
                  .then((c) => c.put(request, copy))
                  .catch(() => {}),
              );
            }
            return res;
          })
          .catch(() => cached ?? Response.error());
        return cached ?? network;
      })
      .catch(() => Response.error()),
  );
});
