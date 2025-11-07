import { ContentService } from '../models/story-model.js';
import { AuthStore } from '../models/auth-model.js';

export class AddStoryPresenter {
  constructor(view) {
    this.view = view;
    this._storyService = new ContentService();
    this._authStore = new AuthStore();
  }

  async addStory(payload) {
    try {
      this.view.showLoading('Mengirim story...');

      const token = this._authStore.readToken();
      if (!token) {
        throw createError('Silakan login terlebih dahulu untuk menambahkan story', 401);
      }

      // Photo is optional, but if provided, it should be valid
      if (payload?.photoFile && !(payload.photoFile instanceof File)) {
        throw createError('File foto tidak valid.', 400);
      }

      const req = {
        authToken: token,
        text: payload.description,
        file: payload.photoFile,
        lat: payload.lat,
        lon: payload.lon,
      };

      await this._storyService.createStory(req);

      this.view.showSuccess('Story berhasil dikirim 🎉');
      this.view.navigateToHome();
    } catch (err) {
      const msg = (err && err.message) ? err.message : 'Gagal mengirim story';
      this.view.showError(msg);
    }
  }
}

function createError(message, status = 500) {
  const e = new Error(message);
  e.status = status;
  return e;
}
