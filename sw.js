// Keeps a copy of the app on the phone so it opens with no signal.
// With a connection it loads the newest version; if the connection is
// missing or slow (over 3 seconds) it opens the copy saved on the phone.
const CACHE = 'sow-tracker-v2';
const DATA = 'sow-tracker-data';   // the reminder list the app saves for notifications
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
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE && k !== DATA).map((k) => caches.delete(k))))
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

// A "wake up" arrives from the notification service with no details in it.
// The details come from the reminder list the app saved on this phone.
self.addEventListener('push', (e) => {
  e.waitUntil((async () => {
    let list = [];
    try {
      const cache = await caches.open(DATA);
      const saved = await cache.match(new URL('reminders.json', self.registration.scope).href);
      if (saved) list = await saved.json();
    } catch (err) {}
    const d = new Date();
    const pad = (n) => (n < 10 ? '0' : '') + n;
    const today = d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate());
    const due = list.filter((x) => x.date === today);
    let title = 'Sow Tracker';
    let body = 'Notifications are working. Nothing is due today.';
    if (due.length === 1) { title = due[0].title; body = due[0].body; }
    else if (due.length > 1) { title = due.length + ' due today'; body = due.map((x) => x.title).join('\n'); }
    await self.registration.showNotification(title, { body, tag: 'sow-due-' + today, icon: 'icon-180.png' });
  })());
});

self.addEventListener('notificationclick', (e) => {
  e.notification.close();
  e.waitUntil((async () => {
    const open = await self.clients.matchAll({ type: 'window', includeUncontrolled: true });
    if (open.length) return open[0].focus();
    return self.clients.openWindow(self.registration.scope);
  })());
});
