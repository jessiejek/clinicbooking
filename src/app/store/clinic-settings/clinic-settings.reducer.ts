import { createReducer } from '@ngrx/store';
import { initialClinicSettingsState } from './clinic-settings.state';

export const clinicSettingsReducer = createReducer(initialClinicSettingsState);
