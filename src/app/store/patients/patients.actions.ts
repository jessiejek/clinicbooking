import { createAction, props } from '@ngrx/store';
import { Patient } from '../../core/models';

export const loadPatients = createAction('[Patients] Load Patients');

export const loadPatientsSuccess = createAction(
  '[Patients] Load Patients Success',
  props<{ patients: Patient[] }>()
);

export const loadPatientsFailure = createAction(
  '[Patients] Load Patients Failure',
  props<{ error: string }>()
);

export const addPatient = createAction(
  '[Patients] Add Patient',
  props<{ patient: Omit<Patient, 'id' | 'patientCode'> }>()
);

export const addPatientSuccess = createAction(
  '[Patients] Add Patient Success',
  props<{ patient: Patient }>()
);

export const updatePatient = createAction(
  '[Patients] Update Patient',
  props<{ patient: Patient }>()
);

export const updatePatientSuccess = createAction(
  '[Patients] Update Patient Success',
  props<{ patient: Patient }>()
);

export const searchPatients = createAction(
  '[Patients] Search Patients',
  props<{ query: string }>()
);
