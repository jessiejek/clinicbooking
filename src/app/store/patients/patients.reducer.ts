import { createReducer, on } from '@ngrx/store';
import { initialPatientsState } from './patients.state';
import {
  addPatientSuccess,
  loadPatients,
  loadPatientsFailure,
  loadPatientsSuccess,
  updatePatientSuccess
} from './patients.actions';

export const patientsReducer = createReducer(
  initialPatientsState,
  on(loadPatients, (state) => ({ ...state, isLoading: true, error: null })),
  on(loadPatientsSuccess, (state, { patients }) => ({
    ...state,
    patients,
    isLoading: false,
    error: null
  })),
  on(loadPatientsFailure, (state, { error }) => ({
    ...state,
    isLoading: false,
    error
  })),
  on(addPatientSuccess, (state, { patient }) => ({
    ...state,
    patients: [...state.patients.filter((item) => item.id !== patient.id), patient]
  })),
  on(updatePatientSuccess, (state, { patient }) => ({
    ...state,
    patients: state.patients.map((item) => (item.id === patient.id ? patient : item))
  }))
);
