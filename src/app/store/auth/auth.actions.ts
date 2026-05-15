import { createAction, props } from '@ngrx/store';
import { AuthUser } from '../../core/models';

export const login = createAction('[Auth] Login', props<{ email: string; password: string }>());

export const loginSuccess = createAction('[Auth] Login Success', props<{ user: AuthUser }>());

export const loginFailure = createAction('[Auth] Login Failure', props<{ error: string }>());

export const logout = createAction('[Auth] Logout');

export const register = createAction(
  '[Auth] Register',
  props<{ fullName: string; email: string; password: string }>()
);

export const registerSuccess = createAction(
  '[Auth] Register Success',
  props<{ user: AuthUser }>()
);

export const registerFailure = createAction('[Auth] Register Failure', props<{ error: string }>());

export const setUser = createAction('[Auth] Set User', props<{ user: AuthUser }>());

export const clearError = createAction('[Auth] Clear Error');
