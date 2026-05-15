import { Action, createReducer } from '@ngrx/store';
import { AuthState, initialAuthState } from './auth.state';

export const authFeatureKey = 'auth';

const internalReducer = createReducer<AuthState>(initialAuthState);

export function authReducer(state: AuthState | undefined, action: Action): AuthState {
  return internalReducer(state, action);
}

