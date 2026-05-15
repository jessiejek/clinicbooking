import { ClinicSettings } from '../../core/models';

export interface ClinicSettingsState {
  settings: ClinicSettings | null;
}

export const initialClinicSettingsState: ClinicSettingsState = {
  settings: null
};

