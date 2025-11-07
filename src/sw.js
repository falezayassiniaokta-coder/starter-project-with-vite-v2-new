import { precacheAndRoute, cleanupOutdatedCaches } from 'workbox-precaching';
import { registerRoute } from 'workbox-routing';
import { StaleWhileRevalidate, NetworkFirst, CacheFirst } from 'workbox-strategies';
import { ExpirationPlugin } from 'workbox-expiration';

// 1. Precache kerangka aplikasi (HTML, CSS, JS)
if (self.__WB_MANIFEST) {
  cleanupOutdatedCaches();
  precacheAndRoute(self.__WB_MANIFEST);
} else {
  console.warn('Workbox precache manifest not found. Precaching will be skipped in dev mode.');
}

// 2. Strategi NetworkFirst untuk Halaman (PENTING untuk Offline)
// Coba jaringan dulu, jika gagal, ambil dari cache.
registerRoute(
  ({ request }) => request.mode === 'navigate',
  new NetworkFirst({
    cacheName: 'pages',
  })
);

// 3. Strategi CacheFirst untuk Aset (Font, Ikon)
// Ambil dari cache dulu untuk kecepatan.
registerRoute(
  ({ request }) => request.destination === 'style' || request.destination === 'script' || request.destination === 'worker',
  new CacheFirst({
    cacheName: 'assets',
  })
);

// 4. Strategi StaleWhileRevalidate untuk Gambar
// Tampilkan gambar dari cache, sambil update di background.
registerRoute(
  ({ request }) => request.destination === 'image',
  new StaleWhileRevalidate({
    cacheName: 'images',
    plugins: [
      new ExpirationPlugin({
        maxEntries: 60,
        maxAgeSeconds: 30 * 24 * 60 * 60, // 30 hari
      }),
    ],
  })
);

// 5. Listener untuk Push Notification (REVISI)
self.addEventListener('push', (evt) => {
  console.log('Service Worker: Push Diterima.');
  
  let payload = {};
  try {
    if (evt.data) {
      payload = evt.data.json();
    }
  } catch (e) {
    console.warn('Gagal mem-parse data push sebagai JSON.', e);
  }

  const notifTitle = payload.title || 'Notifikasi Baru';
  const notifOptions = {
    body: payload.options?.body || 'Ada cerita baru untukmu!',
    icon: '/images/logo-192.png',
    badge: '/images/logo-192.png',
  };

  evt.waitUntil(
    self.registration.showNotification(notifTitle, notifOptions)
  );
});