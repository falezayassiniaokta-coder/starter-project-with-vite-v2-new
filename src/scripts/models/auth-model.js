export class AuthStore {
    constructor(storage = window.localStorage) {
      this.storage = storage;
      this.storageKey = 'app_auth_token'; 
    }
  
    readToken() {
      return this.storage.getItem(this.storageKey);
    }
  
    saveToken(token) {
      if (!token) return;
      this.storage.setItem(this.storageKey, token);
    }
  
    clearToken() {
      this.storage.removeItem(this.storageKey);
    }
  
    hasToken() {
      return Boolean(this.readToken());
    }
  }
  