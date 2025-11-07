import CONFIG from '../config.js';
import * as Api from '../data/api.js';
import { AuthStore } from './auth-model.js';

export class ContentService {
    constructor(base = CONFIG.BASE_URL) {
      this.baseUrl = base;
    }
  
    async _request(path, init = {}) {
      const res = await fetch(`${this.baseUrl}${path}`, init);
      let payload;
      try {
        payload = await res.json();
      } catch (e) {
        payload = null;
      }
      if (!res.ok) {
        const msg = payload?.message || `Request failed with status ${res.status}`;
        const err = new Error(msg);
        err.status = res.status;
        err.payload = payload;
        throw err;
      }
      return payload;
    }
  
    async signUp(userObj) {
      return this._request('/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userObj),
      });
    }
  
    async signIn(creds) {
      return this._request('/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(creds),
      });
    }

    async getStoryDetail(params) {
      return Api.fetchStory(params);
    }
  
    async addStory(params) {
      return Api.postStory(params);
    }
  
    async listStories({ token, page = 1, size = 10, location = 0 } = {}) {
      const params = new URLSearchParams();
      params.set('page', page);
      params.set('size', size);
      params.set('location', location);
  
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      return this._request(`/stories?${params.toString()}`, { headers });
    }
  
    async readStory(id, token) {
      if (!id) throw new Error('Story id is required');
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      return this._request(`/stories/${id}`, { headers });
    }
  
    async createStory({ authToken, text, file, lat, lon }) {
      if (!authToken) throw new Error('authToken required to create story');
      const fd = new FormData();
      if (text != null) fd.append('description', text);
      if (file) fd.append('photo', file);
      if (lat != null) fd.append('lat', String(lat));
      if (lon != null) fd.append('lon', String(lon));
  
      return this._request('/stories', {
        method: 'POST',
        headers: { Authorization: `Bearer ${authToken}` }, // do not set Content-Type
        body: fd,
      });
    }
  
    async createStoryGuest({ text, file, lat, lon }) {
      const fd = new FormData();
      if (text != null) fd.append('description', text);
      if (file) fd.append('photo', file);
      if (lat != null) fd.append('lat', String(lat));
      if (lon != null) fd.append('lon', String(lon));
      return this._request('/stories/guest', {
        method: 'POST',
        body: fd,
      });
    }
  
    async subscribePush({ authToken, subscription }) {
      if (!authToken) throw new Error('Token required');
      const body = {
        endpoint: subscription.endpoint,
        keys: {
          p256dh: subscription.keys?.p256dh,
          auth: subscription.keys?.auth,
        },
      };
      return this._request('/notifications/subscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify(body),
      });
    }
  
    async unsubscribePush({ authToken, endpoint }) {
      if (!authToken) throw new Error('Token required');
      return this._request('/notifications/subscribe', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify({ endpoint }),
      });
    }
  }
  