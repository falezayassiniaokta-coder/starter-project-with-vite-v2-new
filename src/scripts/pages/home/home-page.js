import { HomePresenter } from '../../presenters/home-presenter.js';

export default class StoriesPage {
  constructor() {
    this.presenter = new HomePresenter(this);
    this._state = { page: 1, size: 10 };
    this._ids = {
      stories: 'stories-main',
      pagination: 'pagination-main',
      locationToggle: 'location-toggle-main',
      map: 'map-main',
    };
  }

  async render() {
    return `
      <div class="container">
        <div class="page-header">
          <h1 id="page-title">Stories</h1>
          <p class="page-subtitle">Temukan dan bagikan cerita menarik dari komunitas</p>
        </div>

        <div class="toolbar">
          <label>
            <span class="sr-only">Location toggle</span>
            <input id="${this._ids.locationToggle}" type="checkbox" /> Tampilkan lokasi
          </label>

          <div>
            <a href="#/add-story" class="btn">Add Story</a>
            <a id="home-login-btn" href="#/login" class="btn">Login</a>
            <a id="home-register-btn" href="#/register" class="btn">Register</a>
          </div>
        </div>

        <ul id="${this._ids.stories}" class="stories-grid" aria-live="polite"></ul>
        <div id="${this._ids.pagination}"></div>
        <div id="${this._ids.map}" class="mini-map" style="height:360px;"></div>
      </div>
    `;
  }
  _setLoading() {
    const el = document.getElementById(this._ids.stories);
    if (el) el.innerHTML = '<p>Loading...</p>';
  }

  _renderStories(items = []) {
    const el = document.getElementById(this._ids.stories);
    if (!el) return;
    el.innerHTML = items.map(s => `
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

  _renderPagination(hasPrev, hasNext) {
    const nav = document.getElementById(this._ids.pagination);
    if (!nav) return;
    nav.innerHTML = '';

    const prev = document.createElement('button');
    prev.textContent = 'Prev';
    prev.disabled = !hasPrev;
    prev.addEventListener('click', () => { this._state.page -= 1; this._load(); });

    const next = document.createElement('button');
    next.textContent = 'Next';
    next.disabled = !hasNext;
    next.addEventListener('click', () => { this._state.page += 1; this._load(); });

    nav.append(prev, next);
  }

  async _renderMapIfNeeded(items = []) {
    const mapContainer = document.getElementById(this._ids.map);
    if (!mapContainer) return;

    if (!window.L) return;

    try {
      if (this._leafletMap) {
        this._leafletMap.remove();
        this._leafletMap = null;
      }
      mapContainer.innerHTML = '';
      const map = L.map(this._ids.map).setView([-2.5, 118], 4.5);

      const osm = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 19, attribution: '© OpenStreetMap' }).addTo(map);
      const toner = L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', { subdomains: 'abcd', maxZoom: 20, attribution: '© CARTO' });
      const terrain = L.tileLayer('https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png', { maxZoom: 17, attribution: '© OpenTopoMap' });

      const markers = L.layerGroup().addTo(map);

      items.filter(s => typeof s.lat === 'number' && typeof s.lon === 'number').forEach(s => {
        L.marker([s.lat, s.lon]).addTo(markers).bindPopup(`<b>${s.name}</b><br/>${s.description}`);
      });

      L.control.layers({ 'OSM': osm, 'Light': toner, 'Topo': terrain }, { 'Stories': markers }, { collapsed: false }).addTo(map);
      this._leafletMap = map;
    } catch (err) {
      console.error('Map fallback error', err);
      mapContainer.innerHTML = '<p>Error loading map.</p>';
    }
  }

  showLoading() { this._setLoading(); }

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
    
    // Hide Add Story button for guests
    const addStoryBtn = document.querySelector('a[href="#/add-story"]');
    if (addStoryBtn) {
      addStoryBtn.style.display = 'none';
    }
    
    // Hide push notification buttons for guests
    const subscribeBtn = document.getElementById('push-subscribe');
    const unsubscribeBtn = document.getElementById('push-unsubscribe');
    if (subscribeBtn) subscribeBtn.style.display = 'none';
    if (unsubscribeBtn) unsubscribeBtn.style.display = 'none';
  }

  showAuthenticatedView() {
    // Hide login and register buttons
    document.getElementById('home-login-btn')?.style.display = 'none';
    document.getElementById('home-register-btn')?.style.display = 'none';
    
    // Ensure Add Story button is visible
    const addStoryBtn = document.querySelector('a[href="#/add-story"]');
    if (addStoryBtn) {
      addStoryBtn.style.display = 'inline-block';
      addStoryBtn.style.visibility = 'visible';
    }
    
    // Show push notification buttons
    const subscribeBtn = document.getElementById('push-subscribe');
    const unsubscribeBtn = document.getElementById('push-unsubscribe');
    if (subscribeBtn) subscribeBtn.style.display = 'inline-block';
    if (unsubscribeBtn) unsubscribeBtn.style.display = 'inline-block';
  }

  displayStories(stories) {
    this._renderStories(stories);
  }

  renderPagination(hasPrev, hasNext) {
    this._renderPagination(hasPrev, hasNext);
  }

  renderMap(stories) {
    this._renderMapIfNeeded(stories);
  }

  getLocationToggle() {
    return !!document.getElementById(this._ids.locationToggle)?.checked;
  }

  showError(message) {
    const el = document.getElementById(this._ids.stories);
    if (el) el.innerHTML = `<p role="alert">${message}</p>`;
  }

  showMessage(message) {
    alert(message);
  }

  navigateToHome() { setTimeout(() => (window.location.hash = '#/'), 900); }
  navigateToLogin() { setTimeout(() => (window.location.hash = '#/login'), 900); }

  async afterRender() {
    const toggle = document.getElementById(this._ids.locationToggle);
    const subscribeBtn = document.getElementById('push-subscribe');
    const unsubscribeBtn = document.getElementById('push-unsubscribe');

    if (toggle) toggle.addEventListener('change', () => { this.presenter.onLocationToggle(); this._state.page = 1; });

    if (subscribeBtn) subscribeBtn.addEventListener('click', () => this.presenter.subscribeWebPush());
    if (unsubscribeBtn) unsubscribeBtn.addEventListener('click', () => this.presenter.unsubscribeWebPush());

    await this.presenter.loadStories();
  }
}
