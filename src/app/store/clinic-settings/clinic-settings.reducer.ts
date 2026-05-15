import { Action, createReducer } from '@ngrx/store';
import { ClinicSettingsState, initialClinicSettingsState } from './clinic-settings.state';

export const clinicSettingsFeatureKey = 'clinicSettings';

const internalReducer = createReducer<ClinicSettingsState>(initialClinicSettingsState);

export function clinicSettingsReducer(
  state: ClinicSettingsState | undefined,
  action: Action
): ClinicSettingsState {
  return internalReducer(state, action);
}

