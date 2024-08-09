const CACHE_NAME = "super-ttt-v1";
const urlsToCache = [
	"/",
	"/css/styles.css",
	"/js/app.js",
	"/js/gameLogic.js",
	"/images/icon-128x128.png",
	"/images/icon-256x256.png",
	"/images/icon-512x512.png",
];

self.addEventListener("install", (event) => {
	event.waitUntil(
		caches.open(CACHE_NAME).then((cache) => {
			return Promise.all(
				urlsToCache.map((url) => {
					return cache.add(url).catch((error) => {
						console.error(`Failed to cache ${url}: ${error}`);
					});
				})
			);
		})
	);
});

self.addEventListener("fetch", (event) => {
	event.respondWith(
		caches.match(event.request).then((response) => {
			if (response) {
				return response;
			}
			return fetch(event.request).then((response) => {
				if (!response || response.status !== 200 || response.type !== "basic") {
					return response;
				}
				const responseToCache = response.clone();
				caches.open(CACHE_NAME).then((cache) => {
					cache.put(event.request, responseToCache);
				});
				return response;
			});
		})
	);
});
