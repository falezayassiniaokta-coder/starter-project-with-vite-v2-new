import { parseActivePathname } from '../../routes/url-parser.js';
import { ContentService } from '../../models/story-model.js';
import { AuthStore } from '../../models/auth-model.js';
import { GeoMapManager } from '../../models/map-model.js';
import FavoriteStoryIdb from '../../data/idb.js'; // Kita akan butuh ini

export default class DetailPage {
  constructor() {
    this._api = new ContentService();
    this._auth = new AuthStore();
    this.mapModel = new GeoMapManager();
    this._story = null; // Untuk menyimpan data cerita
  }

  async render() {
    // Tampilkan loading dulu, konten diisi nanti
    return `
      <div class="container">
        <div id="story-detail-container" class="story-detail-container">
          <p class="loading-text">Memuat cerita...</p>
        </div>
      </div>
    `;
  }

  async afterRender() {
    const url = parseActivePathname(); // Menggunakan fungsi yang sudah diimpor
    const storyId = url.id;
    const container = document.getElementById('story-detail-container');
    const token = this._auth.readToken();

    if (!token) {
      container.innerHTML = '<p class="error-message">Anda harus login untuk melihat detail cerita.</p>';
      return;
    }

    try {
      const response = await this._api.getStoryDetail({ token, id: storyId });
      if (response.error) {
        throw new Error(response.message);
      }
      
      this._story = response.story;
      
      // 1. Render detail cerita ke dalam container
      this._renderStoryDetail(container, this._story);

      // 2. SETELAH HTML di-render, baru panggil fungsi untuk peta dan tombol
      if (this._story.lat && this._story.lon) {
        this._renderMap(this._story.lat, this._story.lon);
      }
      
      // Panggil fungsi untuk menambahkan tombol di sini
      await this._addSaveButton(this._story);

    } catch (err) {
      container.innerHTML = `<p class="error-message">Gagal memuat cerita: ${err.message}</p>`;
    }
  }

  _renderStoryDetail(container, story) {
    container.innerHTML = `
      <h1 class="story-title">${story.name}</h1>
      <img src="${story.photoUrl}" alt="${story.description}" class="story-photo">
      <div class="story-meta">
        <p class="story-author">Oleh: ${story.name}</p>
        <p class="story-date">${new Date(story.createdAt).toLocaleString('id-ID')}</p>
      </div>
      <p class="story-description">${story.description}</p>
      
      <div id="detail-map" class="detail-map"></div>
      <div id="save-button-container" class="save-button-container"></div>
    `;
    
    // Sembunyikan kontainer peta jika tidak ada data lokasi
    if (!story.lat || !story.lon) {
      document.getElementById('detail-map').style.display = 'none';
    }
  }

  _renderMap(lat, lon) {
    if (window.L) {
      try {
        const map = this.mapModel.create('detail-map', { center: [lat, lon], zoom: 15 });
        this.mapModel.addTiles('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png');
        this.mapModel.placeMarker([lat, lon]);
      } catch (err) {
        console.error('Gagal memuat peta detail', err);
      }
    }
  }

  // Fungsi ini sekarang dipanggil dari afterRender
  async _addSaveButton(story) {
    const saveContainer = document.getElementById('save-button-container');
    if (!saveContainer) {
        console.error('Elemen #save-button-container tidak ditemukan!');
        return;
    }
    
    const isSaved = await FavoriteStoryIdb.getStory(story.id);

    if (isSaved) {
      saveContainer.innerHTML = '<button class="btn" disabled>Tersimpan Offline</button>';
    } else {
      const saveButton = document.createElement('button');
      saveButton.className = 'btn btn-primary';
      saveButton.innerText = 'Simpan untuk Offline';
      saveButton.addEventListener('click', async () => {
        await FavoriteStoryIdb.putStory(story);
        alert('Cerita berhasil disimpan!');
        this._addSaveButton(story); // Render ulang tombol
      });
      saveContainer.innerHTML = '';
      saveContainer.appendChild(saveButton);
    }
  }
}