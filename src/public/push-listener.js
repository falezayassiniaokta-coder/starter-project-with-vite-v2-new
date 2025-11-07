self.addEventListener('push', (evt) => {
    console.log('Service Worker: Push Diterima.');
    
    let payload = {}; // Default payload
    try {
      // Coba parse data JSON
      if (evt.data) {
        payload = evt.data.json();
      }
    } catch (e) {
      console.warn('Gagal mem-parse data push sebagai JSON.', e);
    }
  
    const notifTitle = payload.title || 'Notifikasi Baru';
    const notifOptions = {
      body: payload.options?.body || 'Ada cerita baru untukmu!',
      icon: '/images/logo-192.png', // Pastikan ikon ini ada
      badge: '/images/logo-192.png', // Pastikan ikon ini ada
    };
  
    evt.waitUntil(
      self.registration.showNotification(notifTitle, notifOptions)
    );
  });