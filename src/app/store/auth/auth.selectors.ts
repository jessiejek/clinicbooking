import { createFeatureSelector, createSelector } from '@ngrx/store';
import { AuthState } from './auth.state';

export const selectAuthState = createFeatureSelector<AuthState>('auth');

export const selectCurrentUser = createSelector(selectAuthState, (s) => s.user);

export const selectIsLoading = createSelector(selectAuthState, (s) => s.isLoading);

export const selectAuthError = createSelector(selectAuthState, (s) => s.error);

export const selectIsAuthenticated = createSelector(selectAuthState, (s) => !!s.user);

export const selectUserRole = createSelector(selectAuthState, (s) => s.user?.role ?? null);
