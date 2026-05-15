import { createReducer } from '@ngrx/store';
import { initialAuthState } from './auth.state';

export const authReducer = createReducer(initialAuthState);
// Actions will be added in Phase 2
