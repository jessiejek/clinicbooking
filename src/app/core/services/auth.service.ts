import { HttpContext } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, catchError, map, of, tap, throwError } from 'rxjs';
import { ApiService } from './api.service';
import {
  AuthSessionDto,
  AuthUser,
  AuthUserDto,
  FacebookAuthRequest,
  GoogleAuthRequest,
  RefreshTokenDto,
  Role
} from '../models';
import { SKIP_AUTH_INTERCEPTOR } from '../interceptors/auth-http.tokens';
import { TokenService } from './token.service';

const KNOWN_ROLES: Role[] = ['Admin', 'Staff', 'Doctor', 'Patient'];
const ROLE_CLAIM_KEYS = [
  'role',
  'Role',
  'roles',
  'http://schemas.microsoft.com/ws/2008/06/identity/claims/role',
  'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/role'
];

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly userStorageKey = 'clinic.auth.user';
  private readonly apiService = inject(ApiService);
  private readonly tokenService = inject(TokenService);
  private readonly router = inject(Router);

  login(email: string, password: string): Observable<AuthUser> {
    return this.apiService.post<AuthSessionDto>('/auth/login', {
      email: email.trim(),
      password
    }).pipe(
      tap((response) => this.storeTokens(response.accessToken, response.refreshToken)),
      map((response) => this.toAuthUser(response.user, response.accessToken))
    );
  }

  loginWithGoogle(idToken: string): Observable<AuthUser> {
    const payload: GoogleAuthRequest = {
      provider: 'Google',
      idToken,
      accessToken: null
    };

    return this.apiService.post<AuthSessionDto>('/auth/google', payload).pipe(
      tap((response) => this.storeTokens(response.accessToken, response.refreshToken)),
      map((response) => this.toAuthUser(response.user, response.accessToken))
    );
  }

  loginWithFacebook(accessToken: string, userId: string): Observable<AuthUser> {
    const payload: FacebookAuthRequest = {
      accessToken,
      userId
    };

    return this.apiService.post<AuthSessionDto>('/auth/facebook', payload).pipe(
      tap((response) => this.storeTokens(response.accessToken, response.refreshToken)),
      map((response) => this.toAuthUser(response.user, response.accessToken))
    );
  }

  registerPatient(
    firstName: string,
    middleName: string | undefined,
    lastName: string,
    email: string,
    password: string
  ): Observable<AuthUser> {
    return this.apiService.post<AuthSessionDto>('/auth/register', {
      firstName: firstName.trim(),
      middleName: middleName?.trim() || undefined,
      lastName: lastName.trim(),
      email: email.trim(),
      password
    }).pipe(
      tap((response) => this.storeTokens(response.accessToken, response.refreshToken)),
      map((response) => this.toAuthUser(response.user, response.accessToken))
    );
  }

  refreshTokens(): Observable<void> {
    const refreshToken = this.tokenService.getRefreshToken();
    if (!refreshToken) {
      return throwError(() => new Error('Session expired.'));
    }

    return this.apiService.post<RefreshTokenDto>(
      '/auth/refresh',
      { refreshToken },
      {
        context: new HttpContext().set(SKIP_AUTH_INTERCEPTOR, true)
      }
    ).pipe(
      tap((response) => this.storeTokens(response.accessToken, response.refreshToken)),
      map(() => void 0),
      catchError((error: unknown) => {
        this.clearSession();
        return throwError(() => error);
      })
    );
  }

  restoreSession(): Observable<AuthUser | null> {
    const hasTokens = this.tokenService.hasAccessToken() || this.tokenService.hasRefreshToken();
    if (!hasTokens) {
      this.clearSession();
      return of(null);
    }

    return this.apiService.get<AuthUserDto>('/auth/me').pipe(
      map((user) => this.toAuthUser(user, this.tokenService.getAccessToken() ?? undefined)),
      catchError((error: unknown) => {
        this.clearSession();
        return throwError(() => error);
      })
    );
  }

  setPassword(newPassword: string, confirmPassword: string): Observable<AuthUser> {
    return this.apiService.post<AuthUserDto>('/auth/set-password', {
      newPassword,
      confirmPassword
    }).pipe(map((user) => this.toAuthUser(user, this.tokenService.getAccessToken() ?? undefined)));
  }

  logout(): void {
    const refreshToken = this.tokenService.getRefreshToken();
    const request$ = refreshToken
      ? this.apiService.post<void>(
          '/auth/logout',
          { refreshToken },
          { context: new HttpContext().set(SKIP_AUTH_INTERCEPTOR, true) }
        ).pipe(catchError(() => of(void 0)))
      : of(void 0);

    request$.pipe(
      tap(() => this.clearSession()),
      tap(() => void this.router.navigate(['/auth/login']))
    ).subscribe();
  }

  persistUser(user: AuthUser): void {
    localStorage.setItem(this.userStorageKey, JSON.stringify(user));
  }

  clearSession(): void {
    this.tokenService.clearTokens();
    localStorage.removeItem(this.userStorageKey);
  }

  navigateByRole(user: AuthUser): void {
    if (user.isFirstLogin) {
      void this.router.navigate(['/auth/set-password']);
      return;
    }

    switch (user.role) {
      case 'Admin':
        void this.router.navigate(['/admin/dashboard']);
        break;
      case 'Staff':
        void this.router.navigate(['/staff/dashboard']);
        break;
      case 'Doctor':
        void this.router.navigate(['/doctor/dashboard']);
        break;
      case 'Patient':
        void this.router.navigate(['/patient/dashboard']);
        break;
      default:
        void this.router.navigate(['/auth/login']);
    }
  }

  private storeTokens(accessToken: string, refreshToken: string): void {
    this.tokenService.setTokens(accessToken, refreshToken);
  }

  private toAuthUser(user: AuthUserDto, accessToken?: string): AuthUser {
    const resolvedRole = this.resolveRole(user.role, accessToken);
    return {
      id: user.id,
      fullName: user.fullName,
      email: user.email,
      role: resolvedRole,
      avatarUrl: user.avatarUrl ?? undefined,
      isFirstLogin: user.isFirstLogin
    };
  }

  private resolveRole(roleValue: unknown, accessToken?: string): Role {
    const resolvedFromDto = normalizeRole(roleValue);
    if (resolvedFromDto) {
      return resolvedFromDto;
    }

    if (accessToken) {
      const resolvedFromToken = this.resolveRoleFromToken(accessToken);
      if (resolvedFromToken) {
        return resolvedFromToken;
      }
    }

    throw new Error('Unable to determine authenticated user role.');
  }

  private resolveRoleFromToken(accessToken: string): Role | undefined {
    const payload = decodeJwtPayload(accessToken);
    if (!payload) {
      return undefined;
    }

    for (const key of ROLE_CLAIM_KEYS) {
      const candidate = payload[key];
      const resolved = normalizeRole(candidate);
      if (resolved) {
        return resolved;
      }

      if (Array.isArray(candidate)) {
        for (const value of candidate) {
          const arrayResolved = normalizeRole(value);
          if (arrayResolved) {
            return arrayResolved;
          }
        }
      }
    }

    return undefined;
  }
}

function normalizeRole(value: unknown): Role | undefined {
  if (typeof value !== 'string') {
    return undefined;
  }

  const normalized = value.trim().toLowerCase();
  return KNOWN_ROLES.find((role) => role.toLowerCase() === normalized);
}

function decodeJwtPayload(token: string): Record<string, unknown> | null {
  const parts = token.split('.');
  if (parts.length < 2) {
    return null;
  }

  try {
    const payloadBase64 = parts[1].replace(/-/g, '+').replace(/_/g, '/');
    const padded = payloadBase64.padEnd(payloadBase64.length + ((4 - (payloadBase64.length % 4)) % 4), '=');
    const json = atob(padded);
    const payload = JSON.parse(json) as Record<string, unknown>;
    return payload;
  } catch {
    return null;
  }
}
