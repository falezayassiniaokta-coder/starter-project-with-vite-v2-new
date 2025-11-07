import { ContentService } from '../models/story-model.js';
import { AuthStore } from '../models/auth-model.js';

export class AuthPresenter {
  constructor(view) {
    this.view = view;
    this._api = new ContentService();   
    this._auth = new AuthStore();   
  }

  async login(credentials) {
    try {
      this.view.showLoading('Memproses login...');

      const result = await this._api.signIn({
        email: credentials.email,
        password: credentials.password,
      });

      const token = result?.loginResult?.token;
      if (!token) {
        throw new Error('Terima respons tanpa token dari server');
      }
      this._auth.saveToken(token);

      this.view.showSuccess('Login berhasil. Mengarahkan ke halaman utama...');
      this.view.navigateToHome();
    } catch (err) {
      const message = err?.message || 'Gagal login';
      this.view.showError(message);
    }
  }

  async register(userData) {
    try {
      this.view.showLoading('Mendaftarkan akun...');

      await this._api.signUp({
        name: userData.name,
        email: userData.email,
        password: userData.password,
      });

      this.view.showSuccess('Registrasi berhasil. Silakan login.');
      this.view.navigateToLogin();
    } catch (err) {
      const message = err?.message || 'Gagal registrasi';
      this.view.showError(message);
    }
  }

  logout() {
    this._auth.clearToken();
    this.view.navigateToLogin();
  }
}
