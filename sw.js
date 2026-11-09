// Keeps a copy of the app on the phone so it opens with no signal.
// With a connection it loads the newest version; if the connection is
// missing or slow (over 3 seconds) it opens the copy saved on the phone.
const CACHE = 'sow-tracker-v2';
const FILES = ['./', 'index.html', 'manifest.webmanifest', 'icon-180.png', 'icon-512.png'];
const WAIT_MS = 3000;

self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE)
      .then((c) => c.addAll(FILES.map((f) => new Request(f, { cache: 'reload' }))))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (e) => {
  const req = e.request;
  if (req.method !== 'GET' || new URL(req.url).origin !== location.origin) return;
  e.respondWith((async () => {
    const cache = await caches.open(CACHE);
    const saved = await cache.match(req, { ignoreSearch: true });
    const fresh = fetch(req.url, { cache: 'no-cache' }).then((res) => {
      if (res && res.ok) cache.put(req, res.clone());
      return res;
    });
    if (!saved) return fresh;
    const slow = new Promise((resolve) => setTimeout(() => resolve(null), WAIT_MS));
    const res = await Promise.race([fresh.catch(() => null), slow]);
    return res && res.ok ? res : saved;
  })());
});
