import { AuthUser } from '../../core/models';

export interface AuthState {
  user: AuthUser | null;
}

export const initialAuthState: AuthState = {
  user: null
};

