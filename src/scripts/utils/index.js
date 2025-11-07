export function showFormattedDate(value, locale = 'en-US', opts = {}) {
  const date = value instanceof Date ? value : new Date(value);
  const formatOptions = Object.assign(
    { year: 'numeric', month: 'long', day: 'numeric' },
    opts
  );

  const formatter = new Intl.DateTimeFormat(locale, formatOptions);
  return formatter.format(date);
}

export function sleep(ms = 1000) {
  return new Promise((resolve) => {
    setTimeout(resolve, Number(ms) || 0);
  });
}

const STORAGE_KEY = 'auth_token';

const _storage = {
  read() {
    return localStorage.getItem(STORAGE_KEY);
  },
  write(value) {
    if (value === undefined || value === null || value === '') {
      localStorage.removeItem(STORAGE_KEY);
    } else {
      localStorage.setItem(STORAGE_KEY, String(value));
    }
  },
};

export const authStorage = {
  get token() {
    return _storage.read();
  },
  set token(val) {
    _storage.write(val);
  },
  clear() {
    _storage.write(null);
  },
  isAuthenticated() {
    return Boolean(_storage.read());
  },
};
