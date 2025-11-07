import { AuthPresenter } from '../../presenters/auth-presenter.js';

export default class SignInView {
  constructor() {
    this.presenter = new AuthPresenter(this);
    this._formId = 'form-login';
    this._statusId = 'status-login';
  }

  async render() {
    return `
      <div class="auth-page" data-view="signin">
        <div class="auth-container">
          <div class="auth-card" role="region" aria-labelledby="signin-title">
            <h1 id="signin-title" class="auth-title">Sign in</h1>

            <form id="${this._formId}" class="auth-form" novalidate aria-describedby="${this._statusId}">
              <div class="form-group">
                <label for="signin-email">Email</label>
                <input id="signin-email" name="email" type="email" inputmode="email" required autocomplete="email" />
              </div>

              <div class="form-group">
                <label for="signin-pass">Password</label>
                <input id="signin-pass" name="password" type="password" minlength="8" required autocomplete="current-password" />
              </div>

              <div class="form-actions" style="display:flex; gap:12px; align-items:center;">
                <button class="btn btn-primary" type="submit" aria-label="Sign in">Sign in</button>
                <a class="btn btn-outline" href="#/forgot">Forgot?</a>
              </div>
            </form>

            <p class="auth-link" style="margin-top:12px;">Belum punya akun? <a href="#/register">Daftar</a></p>

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

  showSuccess(message = 'Logged in') {
    const el = document.getElementById(this._statusId);
    if (el) {
      el.textContent = String(message);
      el.classList.remove('error');
      el.classList.add('success');
    }
  }

  showError(message = 'Failed to login') {
    const el = document.getElementById(this._statusId);
    if (el) {
      el.textContent = String(message);
      el.classList.remove('success');
      el.classList.add('error');
    }
  }

  navigateToHome() {
    setTimeout(() => {
      window.location.hash = '#/';
    }, 900);
  }

  async afterRender() {
    const form = document.getElementById(this._formId);
    if (!form) return;

    form.addEventListener('submit', async (evt) => {
      evt.preventDefault();

      const fd = new FormData(form);
      const payload = {
        email: (fd.get('email') || '').toString().trim(),
        password: (fd.get('password') || '').toString(),
      };

      if (!payload.email) {
        this.showError('Email harus diisi');
        return;
      }
      if (!payload.password || payload.password.length < 8) {
        this.showError('Password minimal 8 karakter');
        return;
      }

      try {
        this.showLoading('Logging in...');
        await this.presenter.login({ email: payload.email, password: payload.password });
      } catch (err) {
        this.showError(err?.message || 'Terjadi kesalahan');
      }
    });
  }
}
