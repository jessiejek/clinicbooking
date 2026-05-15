import { createReducer, on } from '@ngrx/store';
import { AuthState, initialAuthState } from './auth.state';
import {
  clearError,
  login,
  loginFailure,
  loginSuccess,
  logout,
  register,
  registerFailure,
  registerSuccess,
  setUser
} from './auth.actions';

export const authReducer = createReducer(
  initialAuthState,
  on(login, (state) => ({ ...state, isLoading: true, error: null })),
  on(loginSuccess, (state, { user }) => ({
    ...state,
    isLoading: false,
    user,
    error: null
  })),
  on(loginFailure, (state, { error }) => ({
    ...state,
    isLoading: false,
    error
  })),
  on(logout, () => initialAuthState),
  on(register, (state) => ({ ...state, isLoading: true, error: null })),
  on(registerSuccess, (state, { user }) => ({
    ...state,
    isLoading: false,
    user,
    error: null
  })),
  on(registerFailure, (state, { error }) => ({
    ...state,
    isLoading: false,
    error
  })),
  on(setUser, (state, { user }) => ({ ...state, user })),
  on(clearError, (state) => ({ ...state, error: null }))
);
