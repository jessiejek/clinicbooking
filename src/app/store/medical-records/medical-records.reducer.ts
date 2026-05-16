import { createReducer, on } from '@ngrx/store';
import { Consultation, Prescription } from '../../core/models';
import {
  addAllergy,
  addFollowUp,
  addLabRequest,
  addLabResult,
  addPrescriptionSuccess,
  addVaccinationRecord,
  loadMedicalRecords,
  loadMedicalRecordsFailure,
  loadMedicalRecordsSuccess,
  lockConsultation,
  removeAllergy,
  saveConsultation,
  saveConsultationSuccess,
  updateAllergy,
  updateConsultation,
  updateConsultationSuccess
} from './medical-records.actions';
import { initialMedicalRecordsState } from './medical-records.state';

const replaceById = <T extends { id: string }>(items: T[], item: T): T[] => [
  ...items.filter((entry) => entry.id !== item.id),
  item
];

const sortNewestFirstByDate = <T>(items: T[], readDate: (item: T) => string): T[] =>
  [...items].sort((a, b) => new Date(readDate(b)).getTime() - new Date(readDate(a)).getTime());

const upsertConsultation = (
  consultations: Consultation[],
  consultation: Consultation
): Consultation[] =>
  sortNewestFirstByDate(replaceById(consultations, consultation), (item) => item.updatedAt);

const upsertPrescription = (
  prescriptions: Prescription[],
  prescription: Prescription
): Prescription[] =>
  sortNewestFirstByDate(replaceById(prescriptions, prescription), (item) => item.issuedAt);

export const medicalRecordsReducer = createReducer(
  initialMedicalRecordsState,
  on(loadMedicalRecords, (state) => ({ ...state, isLoading: true, error: null })),
  on(loadMedicalRecordsSuccess, (state, payload) => ({
    ...state,
    consultations: sortNewestFirstByDate(payload.consultations, (item) => item.updatedAt),
    prescriptions: sortNewestFirstByDate(payload.prescriptions, (item) => item.issuedAt),
    allergies: payload.allergies,
    labRequests: payload.labRequests,
    labResults: payload.labResults,
    vaccinations: payload.vaccinations,
    followUps: payload.followUps,
    isLoading: false,
    error: null
  })),
  on(loadMedicalRecordsFailure, (state, { error }) => ({
    ...state,
    isLoading: false,
    error
  })),
  on(saveConsultation, (state) => ({ ...state, isLoading: true, error: null })),
  on(saveConsultationSuccess, (state, { consultation }) => ({
    ...state,
    consultations: upsertConsultation(state.consultations, consultation),
    isLoading: false,
    error: null
  })),
  on(updateConsultation, (state) => ({ ...state, isLoading: true, error: null })),
  on(updateConsultationSuccess, (state, { consultation }) => ({
    ...state,
    consultations: upsertConsultation(state.consultations, consultation),
    isLoading: false,
    error: null
  })),
  on(lockConsultation, (state, { consultationId }) => ({
    ...state,
    consultations: state.consultations.map((consultation) =>
      consultation.id === consultationId
        ? {
            ...consultation,
            isLocked: true,
            status: 'Locked' as Consultation['status'],
            updatedAt: new Date().toISOString()
          }
        : consultation
    )
  })),
  on(addPrescriptionSuccess, (state, { prescription }) => ({
    ...state,
    prescriptions: upsertPrescription(state.prescriptions, prescription)
  })),
  on(addAllergy, (state, { allergy }) => ({
    ...state,
    allergies: replaceById(
      state.allergies,
      { ...allergy, id: allergy.id ?? `allergy-${Date.now()}` } as typeof state.allergies[number]
    )
  })),
  on(updateAllergy, (state, { allergy }) => ({
    ...state,
    allergies: replaceById(state.allergies, allergy)
  })),
  on(removeAllergy, (state, { allergyId }) => ({
    ...state,
    allergies: state.allergies.filter((allergy) => allergy.id !== allergyId)
  })),
  on(addLabRequest, (state, { labRequest }) => ({
    ...state,
    labRequests: replaceById(
      state.labRequests,
      {
        ...labRequest,
        id: labRequest.id ?? `labreq-${Date.now()}`,
        requestedAt: labRequest.requestedAt ?? new Date().toISOString(),
        status: labRequest.status ?? 'Requested'
      } as typeof state.labRequests[number]
    )
  })),
  on(addLabResult, (state, { labResult }) => ({
    ...state,
    labResults: replaceById(
      state.labResults,
      {
        ...labResult,
        id: labResult.id ?? `labres-${Date.now()}`,
        resultDate: labResult.resultDate ?? new Date().toISOString()
      } as typeof state.labResults[number]
    )
  })),
  on(addVaccinationRecord, (state, { vaccinationRecord }) => ({
    ...state,
    vaccinations: replaceById(
      state.vaccinations,
      { ...vaccinationRecord, id: vaccinationRecord.id ?? `vac-${Date.now()}` } as typeof state.vaccinations[number]
    )
  })),
  on(addFollowUp, (state, { followUp }) => ({
    ...state,
    followUps: replaceById(
      state.followUps,
      { ...followUp, id: followUp.id ?? `fu-${Date.now()}` } as typeof state.followUps[number]
    )
  }))
);
