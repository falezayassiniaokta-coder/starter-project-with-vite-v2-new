import { AuthPresenter } from '../../presenters/auth-presenter.js';

export default class SignUpView {
  constructor() {
    this.presenter = new AuthPresenter(this);
    this._formId = 'form-register';
    this._statusId = 'status-register';
  }

  async render() {
    return `
      <div class="auth-page" data-view="signup">
        <div class="auth-container">
          <div class="auth-card" role="region" aria-labelledby="signup-title">
            <h1 id="signup-title" class="auth-title">Create account</h1>

            <form id="${this._formId}" class="auth-form" novalidate aria-describedby="${this._statusId}">
              <div class="form-group">
                <label for="reg-name">Nama lengkap</label>
                <input id="reg-name" name="name" type="text" required autocomplete="name" />
              </div>

              <div class="form-group">
                <label for="reg-email">Email</label>
                <input id="reg-email" name="email" type="email" required autocomplete="email" />
              </div>

              <div class="form-group">
                <label for="reg-pass">Password</label>
                <input id="reg-pass" name="password" type="password" minlength="8" required autocomplete="new-password" />
              </div>

              <div class="form-actions">
                <button class="btn btn-primary" type="submit">Daftar</button>
              </div>
            </form>

            <p class="auth-link" style="margin-top:12px;">Sudah punya akun? <a href="#/login">Masuk</a></p>

            <div id="${this._statusId}" role="status" aria-live="polite" class="auth-message" style="min-height:1.25rem; margin-top:10px;"></div>
          </div>
        </div>
      </div>
    `;
  }

  showLoading(message = 'Processing...') {
    const el = document.getElementById(this._statusId);
    if (el) el.textContent = String(message);
  }

  showSuccess(message = 'Registration successful') {
    const el = document.getElementById(this._statusId);
    if (el) {
      el.textContent = String(message);
      el.classList.remove('error');
      el.classList.add('success');
    }
  }

  showError(message = 'Registration failed') {
    const el = document.getElementById(this._statusId);
    if (el) {
      el.textContent = String(message);
      el.classList.remove('success');
      el.classList.add('error');
    }
  }

  navigateToLogin() {
    setTimeout(() => {
      window.location.hash = '#/login';
    }, 900);
  }

  async afterRender() {
    const form = document.getElementById(this._formId);
    if (!form) return;

    form.addEventListener('submit', async (evt) => {
      evt.preventDefault();

      const fd = new FormData(form);
      const payload = {
        name: (fd.get('name') || '').toString().trim(),
        email: (fd.get('email') || '').toString().trim(),
        password: (fd.get('password') || '').toString(),
      };

      if (!payload.name) {
        this.showError('Nama harus diisi');
        return;
      }
      if (!payload.email) {
        this.showError('Email harus diisi');
        return;
      }
      if (!payload.password || payload.password.length < 8) {
        this.showError('Password minimal 8 karakter');
        return;
      }

      try {
        this.showLoading('Mendaftarkan akun...');
        await this.presenter.register({ name: payload.name, email: payload.email, password: payload.password });
      } catch (err) {
        this.showError(err?.message || 'Terjadi kesalahan saat mendaftar');
      }
    });
  }
}
