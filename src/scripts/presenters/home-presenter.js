import { ContentService } from '../models/story-model.js';
import { AuthStore } from '../models/auth-model.js';
import { PushManagerService } from '../models/notification-model.js';
import FavoriteStoryIdb from '../data/idb.js'; 

export class HomePresenter {
  constructor(view) {
    this.view = view;
    this._api = new ContentService();
    this._auth = new AuthStore();
    this._notifier = new PushManagerService();

    this._current = 1;
    this._limit = 10;
  }

  async loadStories() {
    this.view.showLoading();

    const token = this._auth.readToken();
    if (!token) {
      this.view.showGuestView();
      return;
    }
    this.view.showAuthenticatedView();

    try {
      // --- STRATEGI 1: MENCOBA AMBIL DARI JARINGAN (NETWORK) ---
      const useLocation = this.view.getLocationToggle() ? 1 : 0;
      const res = await this._api.listStories({
        token,
        page: this._current,
        size: this._limit,
        location: useLocation,
      });

      const list = Array.isArray(res?.listStory) ? res.listStory : [];

      // 2. TAMPILKAN DATA DARI API
      this.view.displayStories(list);
      this.view.renderPagination(this._current > 1, list.length === this._limit);

      if (list.length > 0) {
        this.view.renderMap(list);
      }
    } catch (err) {
      // --- STRATEGI 2: GAGAL, AMBIL DARI CACHE (INDEXEDDB) ---
      console.error('Gagal mengambil data dari jaringan, mencoba dari cache...', err);
      const cachedStories = await FavoriteStoryIdb.getAllStories();
      if (cachedStories && cachedStories.length > 0) {
        this.view.displayStories(cachedStories);
        // Nonaktifkan pagination saat offline
        this.view.renderPagination(false, false);
        if (this.view.getLocationToggle()) {
            this.view.renderMap(cachedStories);
        }
      } else {
        this.view.showError(err?.message || 'Gagal memuat stories. Periksa koneksi internet Anda.');
      }
    }
  }

  // --- SEMUA METHOD LAIN DI BAWAH INI TIDAK PERLU DIUBAH ---

  async onPageChange(direction) {
    if (direction === 'prev' && this._current > 1) {
      this._current -= 1;
    } else if (direction === 'next') {
      this._current += 1;
    }
    await this.loadStories();
  }

  async onLocationToggle() {
    this._current = 1;
    await this.loadStories();
  }

  async subscribeWebPush() {
    try {
      await this._notifier.askPermission();
      const reg = await this._notifier.getWorkerRegistration();
      const subscription = await this._notifier.ensureSubscription(reg);

      const token = this._auth.readToken();
      if (!token) throw new Error('Login terlebih dahulu untuk berlangganan notifikasi');

      const payload = subscription.toJSON ? subscription.toJSON() : subscription;
      const result = await this._api.subscribePush({
        authToken: token,
        subscription: payload,
      });

      this.view.showMessage('Berhasil subscribe: ' + (result?.message || 'OK'));
    } catch (err) {
      this.view.showMessage(err?.message || 'Gagal subscribe');
    }
  }

  async unsubscribeWebPush() {
    try {
      const endpoint = await this._notifier.removeSubscription();

      const token = this._auth.readToken();
      if (!token) throw new Error('Login diperlukan untuk berhenti berlangganan');

      const res = await this._api.unsubscribePush({
        authToken: token,
        endpoint,
      });

      this.view.showMessage('Berhenti berlangganan: ' + (res?.message || 'OK'));
    } catch (err) {
      this.view.showMessage(err?.message || 'Gagal unsubscribe');
    }
  }
}