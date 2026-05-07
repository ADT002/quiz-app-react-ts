// src/services/Storageusecase.ts

class StorageService {
  // 👇 khai báo field + type
  private nameLocalStorage: string;
  private namePermission: string;
  constructor() {
    this.nameLocalStorage = 'authToken';
    this.namePermission = 'permission';
  }

  save(data: any): void {
    this.saveToken(data.token)
    this.savePermission(data.permission)
  }
  // Save token to localStorage
  saveToken(token: string): void {
    localStorage.setItem(this.nameLocalStorage, token);
  }

  // Get token from localStorage
  getToken(): string | null {
    return localStorage.getItem(this.nameLocalStorage);
  }

  savePermission(permission: string): void {
    localStorage.setItem('permission', JSON.stringify(permission));
  }

  // Get token from localStorage
  getPermission(): string | null {
    return localStorage.getItem(this.namePermission);
  }

  // Remove token from localStorage
  removeToken(): void {
    localStorage.removeItem(this.nameLocalStorage);
    localStorage.removeItem(this.namePermission);
  }

  logout(): void {
    Object.keys(localStorage).forEach((key) => {
      if (key !== 'i18nextLng') {
        localStorage.removeItem(key);
      }
    });
  }
}

export default new StorageService();
