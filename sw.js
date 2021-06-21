// TODO: Replace Xs.
importScripts('workbox-sw.prod.v2.1.2.js');

// Note: Ignore the error that Glitch raises about WorkboxSW being undefined.
const workbox = new WorkboxSW({
  skipWaiting: true,
  clientsClaim: true
});


workbox.router.registerRoute(
  new RegExp('^(http(s)?:)?\/\/app\.beijingyongan\.com.*'),
  workbox.strategies.cacheFirst({
    cacheName: 'map-cache',
    cacheableResponse: { statuses: [0, 200]}
  })
);


workbox.precache([]);