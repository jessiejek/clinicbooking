import { createFeatureSelector, createSelector } from '@ngrx/store';
import {
  Allergy,
  Consultation,
  FollowUp,
  LabRequest,
  LabResult,
  Prescription,
  VaccinationRecord
} from '../../core/models';
import { MedicalRecordsState } from './medical-records.state';

export const selectMedicalRecordsState =
  createFeatureSelector<MedicalRecordsState>('medicalRecords');

export const selectAllConsultations = createSelector(
  selectMedicalRecordsState,
  (state) => state.consultations
);

export const selectConsultationById = (id: string) =>
  createSelector(selectAllConsultations, (consultations: Consultation[]) =>
    consultations.find((consultation) => consultation.id === id)
  );

export const selectConsultationByBookingId = (bookingId: string) =>
  createSelector(selectAllConsultations, (consultations: Consultation[]) =>
    consultations.find((consultation) => consultation.bookingId === bookingId)
  );

export const selectConsultationsByPatientId = (patientId: string) =>
  createSelector(selectAllConsultations, (consultations: Consultation[]) =>
    consultations
      .filter((consultation) => consultation.patientId === patientId)
      .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
  );

export const selectConsultationsByDoctorId = (doctorId: string) =>
  createSelector(selectAllConsultations, (consultations: Consultation[]) =>
    consultations
      .filter((consultation) => consultation.doctorId === doctorId)
      .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
  );

export const selectAllPrescriptions = createSelector(
  selectMedicalRecordsState,
  (state) => state.prescriptions
);

export const selectAllLabRequests = createSelector(
  selectMedicalRecordsState,
  (state) => state.labRequests
);

export const selectPrescriptionsByPatientId = (patientId: string) =>
  createSelector(selectAllPrescriptions, (prescriptions: Prescription[]) =>
    prescriptions
      .filter((prescription) => prescription.patientId === patientId)
      .sort((a, b) => new Date(b.issuedAt).getTime() - new Date(a.issuedAt).getTime())
  );

export const selectPrescriptionsByConsultationId = (consultationId: string) =>
  createSelector(selectAllPrescriptions, (prescriptions: Prescription[]) =>
    prescriptions
      .filter((prescription) => prescription.consultationId === consultationId)
      .sort((a, b) => new Date(b.issuedAt).getTime() - new Date(a.issuedAt).getTime())
  );

export const selectAllergiesByPatientId = (patientId: string) =>
  createSelector(selectMedicalRecordsState, (state) =>
    state.allergies.filter((allergy: Allergy) => allergy.patientId === patientId)
  );

export const selectLabResultsByPatientId = (patientId: string) =>
  createSelector(selectMedicalRecordsState, (state) =>
    state.labResults
      .filter((result: LabResult) => result.patientId === patientId)
      .sort((a, b) => new Date(b.resultDate).getTime() - new Date(a.resultDate).getTime())
  );

export const selectLabRequestsByPatientId = (patientId: string) =>
  createSelector(selectAllLabRequests, (labRequests: LabRequest[]) =>
    labRequests
      .filter((request) => request.patientId === patientId)
      .sort((a, b) => new Date(b.requestedAt).getTime() - new Date(a.requestedAt).getTime())
  );

export const selectLabRequestsByConsultationId = (consultationId: string) =>
  createSelector(selectAllLabRequests, (labRequests: LabRequest[]) =>
    labRequests
      .filter((request) => request.consultationId === consultationId)
      .sort((a, b) => new Date(b.requestedAt).getTime() - new Date(a.requestedAt).getTime())
  );

export const selectVaccinationsByPatientId = (patientId: string) =>
  createSelector(selectMedicalRecordsState, (state) =>
    state.vaccinations
      .filter((record: VaccinationRecord) => record.patientId === patientId)
      .sort((a, b) => new Date(b.dateGiven).getTime() - new Date(a.dateGiven).getTime())
  );

export const selectFollowUpsByPatientId = (patientId: string) =>
  createSelector(selectMedicalRecordsState, (state) =>
    state.followUps
      .filter((followUp: FollowUp) => followUp.patientId === patientId)
      .sort((a, b) => new Date(b.followUpDate).getTime() - new Date(a.followUpDate).getTime())
  );

export const selectMedicalRecordsLoading = createSelector(
  selectMedicalRecordsState,
  (state) => state.isLoading
);
