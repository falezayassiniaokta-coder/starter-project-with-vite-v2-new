// url-parser.js (refactor)

/**
 * Ambil bagian pathname dari hash. 
 * Contoh:
 *  - location.hash = '#/stories/123' -> '/stories/123'
 *  - location.hash = '' -> '/'
 */
export function getActivePathname() {
  const raw = (location.hash || '').replace(/^#/, '').trim();
  return raw === '' ? '/' : raw;
}

/**
 * Memecah pathname menjadi objek { resource, id }.
 * Implementasi ini menggunakan regex untuk variasi dari split yang biasa.
 */
function splitPath(pathname) {
  // normalize leading/trailing slashes
  const normalized = pathname.replace(/\/+$/, '').replace(/^\/+/, '');
  if (!normalized) return { resource: null, id: null };

  const parts = normalized.split('/');
  return {
    resource: parts[0] || null,
    id: parts[1] || null,
  };
}

/**
 * Bangun route key yang sesuai dengan format routes map.
 * Jika ada id -> '/resource/:id', jika tidak -> '/resource'. Jika tidak ada resource -> '/'
 */
function buildRouteKey({ resource, id }) {
  if (!resource) return '/';
  return id ? `/${resource}/:id` : `/${resource}`;
}

/**
 * Kembalikan route normalized saat ini (dipakai oleh App)
 * Contoh hasil: '/', '/stories', '/stories/:id'
 */
export function getActiveRoute() {
  const pathname = getActivePathname();
  const segments = splitPath(pathname);
  return buildRouteKey(segments);
}

/**
 * Ambil object pasangan resource/id dari hash saat ini
 * (mirip parseActivePathname di kode asli)
 */
export function parseActivePathname() {
  const pathname = getActivePathname();
  return splitPath(pathname);
}

/**
 * Konversi sebuah pathname (string) menjadi route key yang sesuai.
 * Berguna untuk memetakan route statis.
 */
export function getRoute(pathname) {
  const segments = splitPath(pathname || '/');
  return buildRouteKey(segments);
}

/**
 * Sama seperti parseActivePathname tapi menerima arg pathname.
 */
export function parsePathname(pathname) {
  return splitPath(pathname || '/');
}
