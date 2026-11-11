/* Fonctionnement hors ligne : page toujours à jour si internet, sinon copie en cache */
const C = "locjeux-temple-du-carton-ab493e6909";
const FICHIERS = ["./", "catalogue.json", "config.js", "icons/apple-touch-icon.png", "icons/icon-192.png", "icons/icon-512.png", "icons/maskable-512.png", "index.html", "lib/fonts/Oswald-400.ttf", "lib/fonts/Oswald-600.ttf", "lib/fonts/WorkSans-400.ttf", "lib/fonts/WorkSans-500.ttf", "lib/jsQR.js", "lib/qrcode.js", "manifest.webmanifest"];
self.addEventListener("install", e => {
  e.waitUntil(caches.open(C).then(c => c.addAll(FICHIERS)).then(() => self.skipWaiting()));
});
self.addEventListener("activate", e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k.startsWith("locjeux-temple-du-carton-") && k !== C).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener("fetch", e => {
  const r = e.request;
  if (r.method !== "GET" || new URL(r.url).origin !== location.origin) return;
  if (r.mode === "navigate" || new URL(r.url).pathname.endsWith("catalogue.json")) {
    const cle = r.mode === "navigate" ? "index.html" : "catalogue.json";
    e.respondWith(fetch(r).then(res => { const cp = res.clone(); if (res.ok) caches.open(C).then(c => c.put(cle, cp)); return res; })
      .catch(() => caches.match(cle)));
    return;
  }
  e.respondWith(caches.match(r).then(m => m || fetch(r).then(res => {
    if (res.ok) { const cp = res.clone(); caches.open(C).then(c => c.put(r, cp)); }
    return res;
  })));
});
