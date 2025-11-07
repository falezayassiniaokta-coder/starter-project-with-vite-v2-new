import { HomePresenter } from '../../presenters/home-presenter.js';
import { GeoMapManager } from '../../models/map-model.js';

export default class StoriesMVPView {
  constructor() {
    this.presenter = new HomePresenter(this);
    this.mapModel = new GeoMapManager();
    this._mapId = 'stories-map-mvp';
    this._storiesListId = 'stories-list-mvp';
    this._paginationId = 'pagination-mvp';
    this._locationToggleId = 'location-toggle-mvp';
  }

  async render() {
    return `
      <section class="container">
        <div class="page-header" role="banner">
          <h1 id="page-title">Stories</h1>
          <p class="page-subtitle">Temukan dan bagikan cerita menarik dari komunitas</p>
        </div>

        <div class="toolbar">
          <label for="${this._locationToggleId}">
            <span class="sr-only">Toggle shown stories by location</span>
            <input id="${this._locationToggleId}" type="checkbox" /> Tampilkan lokasi
          </label>

          <div>
            <a href="#/add-story" class="btn">Add Story</a>
            <a id="home-login-btn" href="#/login" class="btn">Login</a>
            <a id="home-register-btn" href="#/register" class="btn">Register</a>
          </div>
        </div>

        <ul id="${this._storiesListId}" class="stories-grid" aria-live="polite"></ul>

        <nav id="${this._paginationId}" aria-label="Pagination"></nav>

        <div id="${this._mapId}" class="mini-map" style="height:360px;"></div>
      </section>
    `;
  }

  showLoading() {
    const el = document.getElementById(this._storiesListId);
    if (el) el.innerHTML = '<p>Loading...</p>';
  }

  showGuestView() {
    const main = document.querySelector('.main-content');
    if (!main) return;
    main.innerHTML = `
      <div class="welcome-page">
        <div class="welcome-hero">
          <h1>Selamat Datang di Dicoding Story</h1>
          <p>Platform berbagi cerita terbaik untuk komunitas developer Indonesia</p>
          <div class="welcome-buttons">
            <a href="#/register" class="btn btn-primary">Daftar Sekarang</a>
            <a href="#/login" class="btn btn-outline">Masuk</a>
          </div>
        </div>
      </div>
    `;
  }

  showAuthenticatedView() {
    document.querySelector('#home-login-btn')?.setAttribute('aria-hidden', 'true');
    document.querySelector('#home-register-btn')?.setAttribute('aria-hidden', 'true');
    document.querySelector('.page-header')?.classList.remove('hidden');
  }

  displayStories(stories) {
    const list = document.getElementById(this._storiesListId);
    if (!list) return;
    list.innerHTML = stories.map(s => `
      <li class="story-card">
        <a class="story-link" href="#/stories/${s.id}">
          <img src="${s.photoUrl}" alt="Foto oleh ${s.name}" loading="lazy" />
          <div class="story-content">
            <h3>${s.name}</h3>
            <p>${s.description}</p>
            <time style="font-size:12px;color:#666;" datetime="${s.createdAt}">${new Date(s.createdAt).toLocaleString('id-ID')}</time>
          </div>
        </a>
      </li>
    `).join('');
  }

  renderPagination(hasPrev, hasNext) {
    const nav = document.getElementById(this._paginationId);
    if (!nav) return;
    nav.innerHTML = '';

    const btn = (label, disabled, onClick) => {
      const b = document.createElement('button');
      b.textContent = label;
      b.disabled = !!disabled;
      b.addEventListener('click', onClick);
      return b;
    };

    nav.appendChild(btn('Prev', !hasPrev, () => this.presenter.onPageChange('prev')));
    nav.appendChild(btn('Next', !hasNext, () => this.presenter.onPageChange('next')));
  }

  renderMap(stories = []) {
    const mapEl = document.getElementById(this._mapId);
    if (!mapEl || !window.L) return;

    try {
      this.mapModel.destroy();
      mapEl.innerHTML = '';

      const map = this.mapModel.create(this._mapId, { center: [-2.5, 118], zoom: 4.5 });

      const osm = this.mapModel.addTiles('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19, attribution: '© OpenStreetMap'
      });
      const carto = this.mapModel.addTiles('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png', {
        subdomains: 'abcd', maxZoom: 20, attribution: '© CARTO'
      });
      const topo = this.mapModel.addTiles('https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png', {
        maxZoom: 17, attribution: '© OpenTopoMap'
      });

      const group = this.mapModel.createLayerGroup();

      stories.filter(s => typeof s.lat === 'number' && typeof s.lon === 'number').forEach(s => {
        this.mapModel.placeMarker([s.lat, s.lon], `<strong>${s.name}</strong><br/>${s.description}`);
      });

      const baseLayers = { 'OSM': osm, 'Carto Light': carto, 'Topo': topo };
      const overlays = { 'Stories': group };
      this.mapModel.addLayerSwitcher(baseLayers, overlays);
    } catch (err) {
      console.error('Map error:', err);
      mapEl.innerHTML = '<p>Error loading map. Please refresh.</p>';
    }
  }

  getLocationToggle() {
    return !!document.getElementById(this._locationToggleId)?.checked;
  }

  showError(message) {
    const el = document.getElementById(this._storiesListId);
    if (el) el.innerHTML = `<p role="alert">${message}</p>`;
  }

  showMessage(message) {
    const toast = document.createElement('div');
    toast.textContent = message;
    toast.style.position = 'fixed';
    toast.style.right = '16px';
    toast.style.bottom = '16px';
    toast.style.padding = '10px 14px';
    toast.style.borderRadius = '8px';
    toast.style.background = 'var(--g-2, #6a8a52)';
    toast.style.color = 'white';
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 2200);
  }

  navigateToHome() {
    setTimeout(() => (window.location.hash = '#/'), 800);
  }

  navigateToLogin() {
    setTimeout(() => (window.location.hash = '#/login'), 800);
  }

  async afterRender() {
    const toggle = document.getElementById(this._locationToggleId);
    const subscribeBtn = document.getElementById('push-subscribe');
    const unsubscribeBtn = document.getElementById('push-unsubscribe');

    if (toggle) toggle.addEventListener('change', () => this.presenter.onLocationToggle());
    if (subscribeBtn) subscribeBtn.addEventListener('click', () => this.presenter.subscribeWebPush());
    if (unsubscribeBtn) unsubscribeBtn.addEventListener('click', () => this.presenter.unsubscribeWebPush());
    await this.presenter.loadStories();
  }
}
