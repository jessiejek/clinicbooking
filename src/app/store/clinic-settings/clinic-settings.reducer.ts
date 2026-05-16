import { createReducer, on } from '@ngrx/store';
import {
  bumpConsentVersionSuccess,
  loadClinicSettings,
  loadClinicSettingsSuccess,
  updateClinicSettingsSuccess
} from './clinic-settings.actions';
import { initialClinicSettingsState } from './clinic-settings.state';

export const clinicSettingsReducer = createReducer(
  initialClinicSettingsState,
  on(loadClinicSettings, (state) => ({ ...state, isLoading: true })),
  on(loadClinicSettingsSuccess, (state, { settings }) => ({
    ...state,
    settings,
    isLoading: false
  })),
  on(updateClinicSettingsSuccess, (state, { settings }) => ({
    ...state,
    settings,
    isLoading: false
  })),
  on(bumpConsentVersionSuccess, (state, { settings }) => ({
    ...state,
    settings,
    isLoading: false
  }))
);
