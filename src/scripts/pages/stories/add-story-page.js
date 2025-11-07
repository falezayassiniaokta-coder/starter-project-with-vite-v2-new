import { AddStoryPresenter } from '../../presenters/add-story-presenter.js';
import { GeoMapManager } from '../../models/map-model.js';

export default class AddStoryView {
  constructor() {
    this.presenter = new AddStoryPresenter(this);
    this.mapModel = new GeoMapManager();

    this._formId = 'addstory-form-v2';
    this._latId = 'input-lat-v2';
    this._lonId = 'input-lon-v2';
    this._miniMapId = 'mini-map-v2';
    this._statusId = 'addstory-status-v2';
    this._videoId = 'camera-video-v2';
    this._canvasId = 'camera-canvas-v2';
    this._photoId = 'photo-preview-v2';
    this._openBtnId = 'open-camera-v2';
    this._captureBtnId = 'capture-photo-v2';
    this._closeBtnId = 'close-camera-v2';
    this._fileUploadId = 'file-upload-v2';
  }

  async render() {
    return `
      <div class="add-story-page" data-view="add-v2">
        <div class="add-story-container">
          <div class="add-story-card">
            <h1 class="add-story-title">Tambah Cerita</h1>
            <form id="${this._formId}" class="add-story-form" enctype="multipart/form-data" novalidate>
              <div class="form-group">
                <label for="desc-v2">Deskripsi</label>
                <textarea id="desc-v2" name="description" required placeholder="Ceritakan momen coding Anda..."></textarea>
              </div>

              <section class="camera-section" aria-labelledby="camera-label-v2">
                <div style="display:flex; justify-content:space-between; align-items:center;">
                  <h3 id="camera-label-v2" class="camera-label">Foto (opsional)</h3>
                  <small class="map-instruction">Bisa ambil dari kamera atau upload</small>
                </div>

                <!-- File Upload Input -->
                <div class="file-upload-section" style="margin:8px 0;">
                  <label for="file-upload-v2" class="btn btn-outline" style="display:inline-block; cursor:pointer;">
                    📁 Upload File
                    <input id="file-upload-v2" type="file" accept="image/*" style="display:none;" />
                  </label>
                </div>

                <div class="camera-controls" style="margin:8px 0;">
                  <button id="${this._openBtnId}" type="button" class="btn btn-outline">📷 Buka Kamera</button>
                  <button id="${this._captureBtnId}" type="button" class="btn btn-primary" disabled>Ambil</button>
                  <button id="${this._closeBtnId}" type="button" class="btn btn-outline" disabled>Tutup</button>
                </div>

                <video id="${this._videoId}" playsinline class="camera-preview" style="display:none;"></video>
                <canvas id="${this._canvasId}" class="camera-canvas" style="display:none;"></canvas>
                <img id="${this._photoId}" alt="Preview foto" class="photo-preview" style="display:none; margin-top:8px; max-width:100%; border-radius:8px;"/>
              </section>

              <section class="location-section" aria-labelledby="loc-label-v2">
                <h3 id="loc-label-v2" class="location-label">Lokasi (opsional)</h3>
                <div class="location-inputs" style="margin-bottom:8px;">
                  <div class="form-group">
                    <label for="${this._latId}">Latitude</label>
                    <input id="${this._latId}" name="lat" type="number" step="any" placeholder="Contoh: -6.200000" />
                  </div>
                  <div class="form-group">
                    <label for="${this._lonId}">Longitude</label>
                    <input id="${this._lonId}" name="lon" type="number" step="any" placeholder="Contoh: 106.816666" />
                  </div>
                </div>
                <p class="map-instruction">Klik peta di bawah untuk mengisi koordinat</p>
                <div id="${this._miniMapId}" class="mini-map" style="margin-top:8px;"></div>
              </section>

              <div style="margin-top:14px;">
                <button class="btn btn-primary submit-btn" type="submit">Kirim Cerita</button>
              </div>
            </form>

            <div id="${this._statusId}" role="status" class="add-story-message" style="margin-top:12px; min-height:1.25rem;"></div>
          </div>
        </div>
      </div>
    `;
  }

  showLoading(msg = 'Mengirim...') {
    const el = document.getElementById(this._statusId);
    if (el) el.textContent = msg;
  }

  showSuccess(msg = 'Berhasil!') {
    const el = document.getElementById(this._statusId);
    if (el) {
      el.textContent = msg;
      el.classList.remove('error');
      el.classList.add('success');
    }
  }

  showError(msg = 'Gagal') {
    const el = document.getElementById(this._statusId);
    if (el) {
      el.textContent = msg;
      el.classList.remove('success');
      el.classList.add('error');
    }
  }

  navigateToHome() {
    setTimeout(() => (window.location.hash = '#/'), 800);
  }

  async afterRender() {
    const form = document.getElementById(this._formId);
    const latInput = document.getElementById(this._latId);
    const lonInput = document.getElementById(this._lonId);

    const openBtn = document.getElementById(this._openBtnId);
    const captureBtn = document.getElementById(this._captureBtnId);
    const closeBtn = document.getElementById(this._closeBtnId);
    const fileUpload = document.getElementById(this._fileUploadId);
    const videoEl = document.getElementById(this._videoId);
    const canvasEl = document.getElementById(this._canvasId);
    const photoEl = document.getElementById(this._photoId);
    const miniMapEl = document.getElementById(this._miniMapId);

    let stream = null;
    let capturedFile = null;
    let marker = null;

    const stopCamera = () => {
      if (stream) {
        stream.getTracks().forEach(t => t.stop());
        stream = null;
      }
      if (videoEl) videoEl.style.display = 'none';
      captureBtn.disabled = true;
      closeBtn.disabled = true;
    };

    openBtn?.addEventListener('click', async () => {
      try {
        stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
        videoEl.srcObject = stream;
        await videoEl.play();
        videoEl.style.display = 'block';
        captureBtn.disabled = false;
        closeBtn.disabled = false;
      } catch (err) {
        this.showError('Gagal membuka kamera: ' + (err?.message || err));
      }
    });

    captureBtn?.addEventListener('click', async () => {
      try {
        const w = videoEl.videoWidth;
        const h = videoEl.videoHeight;
        canvasEl.width = w;
        canvasEl.height = h;
        const ctx = canvasEl.getContext('2d');
        ctx.drawImage(videoEl, 0, 0, w, h);

        await new Promise(resolve => {
          canvasEl.toBlob(blob => {
            if (!blob) return resolve();
            capturedFile = new File([blob], `capture-${Date.now()}.jpg`, { type: blob.type || 'image/jpeg' });
            photoEl.src = URL.createObjectURL(blob);
            photoEl.style.display = 'block';
            resolve();
          }, 'image/jpeg', 0.9);
        });
      } catch (err) {
        this.showError('Gagal mengambil foto');
      } finally {
        stopCamera();
      }
    });

    closeBtn?.addEventListener('click', () => stopCamera());
    window.addEventListener('hashchange', stopCamera, { once: true });

    // Handle file upload
    fileUpload?.addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (file) {
        capturedFile = file;
        const url = URL.createObjectURL(file);
        photoEl.src = url;
        photoEl.style.display = 'block';
        // Clear camera if it was open
        stopCamera();
      }
    });

    if (window.L && miniMapEl) {
      try {
        const map = this.mapModel.create(this._miniMapId, { center: [-2.5, 118], zoom: 4.5 });
        this.mapModel.addTiles('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 19, attribution: '© OpenStreetMap' });

        map.on('click', ev => {
          const { lat, lng } = ev.latlng;
          latInput.value = lat.toFixed(6);
          lonInput.value = lng.toFixed(6);

          if (marker) marker.setLatLng([lat, lng]);
          else marker = this.mapModel.placeMarker([lat, lng]);
        });
      } catch (err) {
        console.error('Mini-map error', err);
      }
    }

    form?.addEventListener('submit', async (e) => {
      e.preventDefault();
      const desc = form.description.value?.trim();
      const lat = latInput.value ? parseFloat(latInput.value) : undefined;
      const lon = lonInput.value ? parseFloat(lonInput.value) : undefined;

      if (!desc) {
        this.showError('Deskripsi wajib diisi');
        return;
      }

      try {
        this.showLoading('Mengirim cerita...');
        await this.presenter.addStory({
          description: desc,
          photoFile: capturedFile,
          lat,
          lon
        });
      } catch (err) {
        this.showError(err?.message || 'Terjadi kesalahan saat mengirim');
      }
    });
  }
}
