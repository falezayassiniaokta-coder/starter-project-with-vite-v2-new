import CONFIG from '../config';

const DEFAULT_JSON_HEADERS = { 'Content-Type': 'application/json' };

const ROUTES = {
  register: () => `${CONFIG.BASE_URL}/register`,
  login: () => `${CONFIG.BASE_URL}/login`,
  stories: () => `${CONFIG.BASE_URL}/stories`,
  storiesGuest: () => `${CONFIG.BASE_URL}/stories/guest`,
  storyById: (id) => `${CONFIG.BASE_URL}/stories/${id}`,
  pushSubscribe: () => `${CONFIG.BASE_URL}/notifications/subscribe`,
};

async function requestJson(url, opts = {}) {
  const res = await fetch(url, opts);

  let payload = null;
  try {
    payload = await res.json();
  } catch (err) {

    payload = { ok: res.ok };
  }

  if (!res.ok || payload?.error) {
    const msg = payload?.message || payload?.error || `HTTP ${res.status}`;

    const error = new Error(msg);
    error.status = res.status;
    error.payload = payload;
    throw error;
  }

  return payload;
}

function buildUrlWithParams(base, params = {}) {
  const url = new URL(base);
  Object.entries(params).forEach(([k, v]) => {
    if (v !== undefined && v !== null) url.searchParams.set(k, String(v));
  });
  return url.toString();
}

export async function createAccount({ fullName, email, pass }) {
  return requestJson(ROUTES.register(), {
    method: 'POST',
    headers: DEFAULT_JSON_HEADERS,
    body: JSON.stringify({ name: fullName, email, password: pass }),
  });
}

export async function signIn({ email, pass }) {
  return requestJson(ROUTES.login(), {
    method: 'POST',
    headers: DEFAULT_JSON_HEADERS,
    body: JSON.stringify({ email, password: pass }),
  });
}

export async function fetchStories({ token, page, size, location } = {}) {
  const url = buildUrlWithParams(ROUTES.stories(), { page, size, location });
  const headers = token ? { Authorization: `Bearer ${token}` } : {};
  return requestJson(url, { headers });
}

export async function fetchStory({ token, id }) {
  if (!id) throw new Error('fetchStory requires an id');
  const headers = token ? { Authorization: `Bearer ${token}` } : {};
  return requestJson(ROUTES.storyById(id), { headers });
}

export async function postStory({ token, text, photoFile, lat, lon }) {
  if (!token) throw new Error('Authentication token is required for posting stories');

  const form = new FormData();
  if (text != null) form.append('description', String(text));
  if (photoFile) form.append('photo', photoFile);
  if (lat != null) form.append('lat', String(lat));
  if (lon != null) form.append('lon', String(lon));

  return requestJson(ROUTES.stories(), {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` }, 
    body: form,
  });
}

export async function postStoryAsGuest({ text, photoFile, lat, lon }) {
  const form = new FormData();
  if (text != null) form.append('description', String(text));
  if (photoFile) form.append('photo', photoFile);
  if (lat != null) form.append('lat', String(lat));
  if (lon != null) form.append('lon', String(lon));

  return requestJson(ROUTES.storiesGuest(), {
    method: 'POST',
    body: form,
  });
}

export async function enablePushNotifications({ token, subscription }) {
  if (!token) throw new Error('Token required');
  if (!subscription || !subscription.endpoint) throw new Error('Invalid subscription');

  const body = {
    endpoint: subscription.endpoint,
    keys: {
      p256dh: subscription.keys?.p256dh,
      auth: subscription.keys?.auth,
    },
  };

  return requestJson(ROUTES.pushSubscribe(), {
    method: 'POST',
    headers: {
      ...DEFAULT_JSON_HEADERS,
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(body),
  });
}

export async function disablePushNotifications({ token, endpoint }) {
  if (!token) throw new Error('Token required');
  if (!endpoint) throw new Error('Endpoint required');

  return requestJson(ROUTES.pushSubscribe(), {
    method: 'DELETE',
    headers: {
      ...DEFAULT_JSON_HEADERS,
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ endpoint }),
  });
}
