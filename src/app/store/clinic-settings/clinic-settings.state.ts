import { ClinicSettings } from '../../core/models';

export interface ClinicSettingsState {
  settings: ClinicSettings | null;
  isLoading: boolean;
}

export const initialClinicSettingsState: ClinicSettingsState = {
  settings: null,
  isLoading: false
};
