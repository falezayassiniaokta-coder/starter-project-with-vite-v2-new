export class PushManagerService {
    constructor(vapidKey = 'BCCs2eonMI-6H2ctvFaWg-UYdDv387Vno_bzUzALpB442r2lCnsHmtrx8biyPi_E-1fSGABK_Qs_GlvPoJJqxbk') {
      this.vapidKey = vapidKey;
    }
  
    async askPermission() {
      const permission = await Notification.requestPermission();
      if (permission !== 'granted') {
        throw new Error('Notification permission denied by user');
      }
      return permission;
    }
  
    async getWorkerRegistration() {
      const reg = await navigator.serviceWorker.getRegistration();
      if (!reg) throw new Error('No service worker registration found');
      return reg;
    }
  
    _base64ToUint8Array(base64String) {
      const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
      const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
      const raw = atob(base64);
      const array = new Uint8Array(raw.length);
      for (let i = 0; i < raw.length; ++i) array[i] = raw.charCodeAt(i);
      return array;
    }
  
    async ensureSubscription(registration) {
      const reg = registration || (await this.getWorkerRegistration());
      let sub = await reg.pushManager.getSubscription();
      if (!sub) {
        sub = await reg.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: this._base64ToUint8Array(this.vapidKey),
        });
      }
      return sub;
    }
  
    async getActiveSubscription() {
      const reg = await this.getWorkerRegistration();
      return reg.pushManager.getSubscription();
    }
  
    async removeSubscription() {
      const reg = await this.getWorkerRegistration();
      const sub = await reg.pushManager.getSubscription();
      if (!sub) throw new Error('No active push subscription found');
      const endpoint = sub.endpoint;
      await sub.unsubscribe();
      return endpoint;
    }
  }
  