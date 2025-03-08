self.addEventListener("install", (event) => {
    event.waitUntil(
        caches.open("meme-cache").then((cache) => {
            return cache.addAll(["/", "/offline.html"]); // Ensure you have an offline.html file
        })
    );
});

self.addEventListener("fetch", (event) => {
    event.respondWith(
        fetch(event.request).catch(() => caches.match("/offline.html"))
    );
});
