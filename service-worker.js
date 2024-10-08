// service-worker.js
const CACHE_NAME = "super-ttt-cache-v2";
const urlsToCache = [
	"./",
	"./index.html",
	"./css/styles.css",
	"./js/app.js",
	"./js/game.js",
	"./js/aiPlayer.js",
	"./js/ui.js",
	"./common/menuManager.js",
	"./common/multiplayerManager.js",
	"./assets/images/icon-128x128.png",
	"./assets/images/icon-256x256.png",
	"./assets/images/icon-512x512.png",
];

self.addEventListener("install", (event) => {
	event.waitUntil(
		caches.open(CACHE_NAME).then((cache) => cache.addAll(urlsToCache))
	);
});

self.addEventListener("activate", (event) => {
	event.waitUntil(
		caches.keys().then((cacheNames) => {
			return Promise.all(
				cacheNames.map((cacheName) => {
					if (cacheName !== CACHE_NAME) {
						return caches.delete(cacheName);
					}
				})
			);
		})
	);
});

self.addEventListener("fetch", (event) => {
	event.respondWith(
		fetch(event.request)
			.then((response) => {
				// Check if we received a valid response
				if (!response || response.status !== 200 || response.type !== "basic") {
					return response;
				}

				// Clone the response
				const responseToCache = response.clone();

				caches.open(CACHE_NAME).then((cache) => {
					cache.put(event.request, responseToCache);
				});

				return response;
			})
			.catch(() => {
				// If fetch fails, try to return the cached version
				return caches.match(event.request);
			})
	);
});
