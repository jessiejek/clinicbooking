import { Injectable, inject } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, map, throwError, timer } from 'rxjs';
import { AuthUser, Role } from '../models';
import { MockDataService } from './mock-data.service';
import { TokenService } from './token.service';
import {
  clearAuthSession,
  loadStoredAuthToken,
  saveAuthSession
} from '../../store/auth/auth-storage';

@Injectable({ providedIn: 'root' })
export class AuthService {
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

    return timer(800).pipe(map(() => authUser));
  }

  persistSession(user: AuthUser): void {
    saveAuthSession(user, this.tokenService.getToken() ?? loadStoredAuthToken());
  }

  logout(): void {
    this.tokenService.clearToken();
    clearAuthSession();
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

    return timer(800).pipe(map(() => newUser));
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
