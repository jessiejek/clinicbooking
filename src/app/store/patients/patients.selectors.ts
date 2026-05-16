import { createFeatureSelector, createSelector } from '@ngrx/store';
import { Patient } from '../../core/models';
import { PatientsState } from './patients.state';

export const selectPatientsState = createFeatureSelector<PatientsState>('patients');

export const selectAllPatients = createSelector(selectPatientsState, (state) => state.patients);

export const selectPatientById = (id: string) =>
  createSelector(selectAllPatients, (patients: Patient[]) =>
    patients.find((patient) => patient.id === id)
  );

export const selectPatientByCode = (code: string) =>
  createSelector(selectAllPatients, (patients: Patient[]) =>
    patients.find((patient) => patient.patientCode === code)
  );

export const selectPatientsLoading = createSelector(selectPatientsState, (state) => state.isLoading);

export const selectFilteredPatients = (query: string) =>
  createSelector(selectAllPatients, (patients: Patient[]) => {
    const q = query.trim().toLowerCase();
    if (!q) {
      return patients;
    }
    return patients.filter((patient) => {
      const haystack = [
        patient.firstName,
        patient.lastName,
        patient.patientCode,
        patient.email ?? '',
        patient.contactNumber ?? ''
      ]
        .join(' ')
        .toLowerCase();
      return haystack.includes(q);
    });
  });

export const selectPatientsByIds = (patientIds: string[]) =>
  createSelector(selectAllPatients, (patients: Patient[]) => {
    if (patientIds.length === 0) {
      return [];
    }
    const lookup = new Set(patientIds);
    return patients.filter((patient) => lookup.has(patient.id));
  });
