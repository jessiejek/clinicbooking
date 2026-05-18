import { HttpContext } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, catchError, map, of, tap, throwError } from 'rxjs';
import { ApiService } from './api.service';
import { AuthSessionDto, AuthUser, AuthUserDto, RefreshTokenDto, Role } from '../models';
import { SKIP_AUTH_INTERCEPTOR } from '../interceptors/auth-http.tokens';
import { TokenService } from './token.service';

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
      map((response) => this.toAuthUser(response.user))
    );
  }

  registerPatient(fullName: string, email: string, password: string): Observable<AuthUser> {
    return this.apiService.post<AuthSessionDto>('/auth/register', {
      fullName: fullName.trim(),
      email: email.trim(),
      password,
      confirmPassword: password
    }).pipe(
      tap((response) => this.storeTokens(response.accessToken, response.refreshToken)),
      map((response) => this.toAuthUser(response.user))
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
      map((user) => this.toAuthUser(user)),
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
    }).pipe(map((user) => this.toAuthUser(user)));
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

  private storeTokens(accessToken: string, refreshToken: string): void {
    this.tokenService.setTokens(accessToken, refreshToken);
  }

  private toAuthUser(user: AuthUserDto): AuthUser {
    return {
      id: user.id,
      fullName: user.fullName,
      email: user.email,
      role: user.role as Role,
      avatarUrl: user.avatarUrl ?? undefined,
      isFirstLogin: user.isFirstLogin
    };
  }
}
