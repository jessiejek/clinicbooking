import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class TokenService {
  private accessToken: string | null = null;
  private readonly storageKey = 'clinic.auth.token';

  constructor() {
    this.accessToken = this.readToken();
  }

  setToken(token: string): void {
    this.accessToken = token;
    localStorage.setItem(this.storageKey, token);
  }

  getToken(): string | null {
    return this.accessToken ?? this.readToken();
  }

  clearToken(): void {
    this.accessToken = null;
    localStorage.removeItem(this.storageKey);
  }

  hasToken(): boolean {
    return this.accessToken !== null;
  }

  private readToken(): string | null {
    return localStorage.getItem(this.storageKey);
  }
}
