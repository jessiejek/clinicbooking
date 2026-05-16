import { Injectable, inject } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { of } from 'rxjs';
import { catchError, map, switchMap, tap } from 'rxjs/operators';
import { AuthService } from '../../core/services/auth.service';
import {
  login,
  loginFailure,
  loginSuccess,
  logout,
  register,
  registerFailure,
  registerSuccess,
  setUser
} from './auth.actions';

@Injectable()
export class AuthEffects {
  private readonly actions$ = inject(Actions);
  private readonly authService = inject(AuthService);

  login$ = createEffect(() =>
    this.actions$.pipe(
      ofType(login),
      switchMap(({ email, password }) =>
        this.authService.login(email, password).pipe(
          map((user) => loginSuccess({ user })),
          catchError((err: unknown) =>
            of(
              loginFailure({
                error: err instanceof Error ? err.message : 'Login failed.'
              })
            )
          )
        )
      )
    )
  );

  register$ = createEffect(() =>
    this.actions$.pipe(
      ofType(register),
      switchMap(({ fullName, email, password }) =>
        this.authService.register(fullName, email, password).pipe(
          map((user) => registerSuccess({ user })),
          catchError((err: unknown) =>
            of(
              registerFailure({
                error: err instanceof Error ? err.message : 'Registration failed.'
              })
            )
          )
        )
      )
    )
  );

  /** Run after state is updated so guards see the authenticated user. */
  navigateAfterAuthSuccess$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(loginSuccess, registerSuccess),
        tap(({ user }) => {
          this.authService.persistSession(user);
          this.authService.navigateByRole(user);
        })
      ),
    { dispatch: false }
  );

  persistUpdatedUser$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(setUser),
        tap(({ user }) => this.authService.persistSession(user))
      ),
    { dispatch: false }
  );

  logout$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(logout),
        tap(() => this.authService.logout())
      ),
    { dispatch: false }
  );
}
