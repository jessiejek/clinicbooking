import { Injectable, inject } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, map, throwError, timer } from 'rxjs';
import { AuthUser, Role } from '../models';
import { MockDataService } from './mock-data.service';
import { TokenService } from './token.service';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly userStorageKey = 'clinic.auth.user';
  private readonly mockData = inject(MockDataService);
  private readonly tokenService = inject(TokenService);
  private readonly router = inject(Router);

  /** Reads seeded accounts (includes `password` for mock validation only). */
  private getSeedAccounts(): Array<{
    id: string;
    fullName: string;
    email: string;
    password: string;
    role: Role;
    isFirstLogin: boolean;
  }> {
    return this.mockData.seedUsers;
  }

  login(email: string, password: string): Observable<AuthUser> {
    const user = this.getSeedAccounts().find(
      (u) => u.email.toLowerCase() === email.trim().toLowerCase()
    );

    if (!user || user.password !== password) {
      return throwError(() => new Error('Invalid email or password.'));
    }

    const authUser: AuthUser = {
      id: user.id,
      fullName: user.fullName,
      email: user.email,
      role: user.role,
      isFirstLogin: user.isFirstLogin
    };

    const fakeToken = `mock-token-${user.id}-${Date.now()}`;
    this.tokenService.setToken(fakeToken);
    this.persistUser(authUser);

    return timer(800).pipe(map(() => authUser));
  }

  logout(): void {
    this.tokenService.clearToken();
    localStorage.removeItem(this.userStorageKey);
    void this.router.navigate(['/auth/login']);
  }

  register(fullName: string, email: string, password: string): Observable<AuthUser> {
    const existing = this.getSeedAccounts().find(
      (u) => u.email.toLowerCase() === email.trim().toLowerCase()
    );
    if (existing) {
      return throwError(() => new Error('An account with this email already exists.'));
    }

    const newUser: AuthUser = {
      id: `user-${Date.now()}`,
      fullName,
      email: email.trim(),
      role: 'Patient',
      isFirstLogin: false
    };

    this.tokenService.setToken(`mock-token-${newUser.id}-${Date.now()}`);
    this.persistUser(newUser);
    return timer(800).pipe(map(() => newUser));
  }

  restoreSession(): AuthUser | null {
    const token = this.tokenService.getToken();
    if (!token) {
      return null;
    }

    const rawUser = localStorage.getItem(this.userStorageKey);
    if (!rawUser) {
      return null;
    }

    try {
      return JSON.parse(rawUser) as AuthUser;
    } catch {
      return null;
    }
  }

  persistUser(user: AuthUser): void {
    localStorage.setItem(this.userStorageKey, JSON.stringify(user));
  }

  navigateByRole(user: AuthUser): void {
    if (user.isFirstLogin) {
      void this.router.navigate(['/auth/set-password']);
      return;
    }
    switch (user.role) {
      case 'Admin':
        void this.router.navigate(['/admin']);
        break;
      case 'Staff':
        void this.router.navigate(['/staff']);
        break;
      case 'Doctor':
        void this.router.navigate(['/doctor']);
        break;
      case 'Patient':
        void this.router.navigate(['/patient']);
        break;
      default:
        void this.router.navigate(['/auth/login']);
    }
  }
}
