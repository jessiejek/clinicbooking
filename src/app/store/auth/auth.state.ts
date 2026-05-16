import { AuthUser } from '../../core/models';
import { loadStoredAuthToken, loadStoredAuthUser } from './auth-storage';

export interface AuthState {
  user: AuthUser | null;
  accessToken: string | null;
  isLoading: boolean;
  error: string | null;
}

export const initialAuthState: AuthState = {
  user: loadStoredAuthUser(),
  accessToken: loadStoredAuthToken(),
  isLoading: false,
  error: null
};
