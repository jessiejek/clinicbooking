import { createAction, props } from '@ngrx/store';
import { ClinicSettings } from '../../core/models';

export const loadClinicSettings = createAction('[Clinic Settings] Load');

export const loadClinicSettingsSuccess = createAction(
  '[Clinic Settings] Load Success',
  props<{ settings: ClinicSettings }>()
);

export const updateClinicSettings = createAction(
  '[Clinic Settings] Update',
  props<{ settings: ClinicSettings }>()
);

export const updateClinicSettingsSuccess = createAction(
  '[Clinic Settings] Update Success',
  props<{ settings: ClinicSettings }>()
);

export const bumpConsentVersion = createAction('[Clinic Settings] Bump Consent Version');

export const bumpConsentVersionSuccess = createAction(
  '[Clinic Settings] Bump Consent Version Success',
  props<{ settings: ClinicSettings }>()
);
