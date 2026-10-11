const VERSION = "weekmenu-v5-20261011";
const ASSETS = ["./", "./index.html", "./recipes.js", "./v3.js", "./v3.css", "./manifest.json", "./icon.svg"];
self.addEventListener("install", event => {
  event.waitUntil(caches.open(VERSION).then(cache => cache.addAll(ASSETS)));
  self.skipWaiting();
});
self.addEventListener("activate", event => {
  event.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k !== VERSION).map(k => caches.delete(k)))));
  self.clients.claim();
});
self.addEventListener("fetch", event => {
  const req = event.request;
  if (req.method !== "GET") return;
  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return;
  if (req.mode === "navigate") {
    event.respondWith(fetch(req).then(response => {
      if(response.ok) caches.open(VERSION).then(c => c.put(req, response.clone()));
      return response;
    }).catch(() => caches.match("./index.html")));
    return;
  }
  event.respondWith(caches.match(req, {ignoreSearch:true}).then(cached => cached || fetch(req).then(response => {
    if(response.ok) caches.open(VERSION).then(c => c.put(req,response.clone()));
    return response;
  })));
});