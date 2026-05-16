import { createFeatureSelector, createSelector } from '@ngrx/store';
import { ClinicSettings } from '../../core/models';
import { ClinicSettingsState } from './clinic-settings.state';

export const selectClinicSettingsState =
  createFeatureSelector<ClinicSettingsState>('clinicSettings');

export const selectClinicSettings = createSelector(
  selectClinicSettingsState,
  (state) => state.settings
);

export const selectClinicSettingsLoading = createSelector(
  selectClinicSettingsState,
  (state) => state.isLoading
);

export const selectResolvedClinicSettings = createSelector(
  selectClinicSettings,
  (settings): ClinicSettings | null => settings
);
