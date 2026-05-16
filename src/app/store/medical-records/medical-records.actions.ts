import { createAction, props } from '@ngrx/store';
import {
  Allergy,
  Consultation,
  FollowUp,
  LabRequest,
  LabResult,
  Prescription,
  VaccinationRecord
} from '../../core/models';

type ConsultationDraft = Omit<Consultation, 'id' | 'createdAt' | 'updatedAt'> & {
  id?: string;
  createdAt?: string;
  updatedAt?: string;
};

type PrescriptionDraft = Omit<Prescription, 'id'> & { id?: string };
type AllergyDraft = Omit<Allergy, 'id'> & { id?: string };
type LabRequestDraft = Omit<LabRequest, 'id' | 'requestedAt' | 'status'> & {
  id?: string;
  requestedAt?: string;
  status?: LabRequest['status'];
};
type LabResultDraft = Omit<LabResult, 'id' | 'resultDate'> & {
  id?: string;
  resultDate?: string;
};
type VaccinationDraft = Omit<VaccinationRecord, 'id'> & { id?: string };
type FollowUpDraft = Omit<FollowUp, 'id'> & { id?: string };

export const loadMedicalRecords = createAction('[Medical Records] Load');

export const loadMedicalRecordsSuccess = createAction(
  '[Medical Records] Load Success',
  props<{
    consultations: Consultation[];
    prescriptions: Prescription[];
    allergies: Allergy[];
    labRequests: LabRequest[];
    labResults: LabResult[];
    vaccinations: VaccinationRecord[];
    followUps: FollowUp[];
  }>()
);

export const loadMedicalRecordsFailure = createAction(
  '[Medical Records] Load Failure',
  props<{ error: string }>()
);

export const saveConsultation = createAction(
  '[Medical Records] Save Consultation',
  props<{ consultation: ConsultationDraft }>()
);

export const saveConsultationSuccess = createAction(
  '[Medical Records] Save Consultation Success',
  props<{ consultation: Consultation }>()
);

export const updateConsultation = createAction(
  '[Medical Records] Update Consultation',
  props<{ consultation: Consultation }>()
);

export const updateConsultationSuccess = createAction(
  '[Medical Records] Update Consultation Success',
  props<{ consultation: Consultation }>()
);

export const lockConsultation = createAction(
  '[Medical Records] Lock Consultation',
  props<{ consultationId: string }>()
);

export const addPrescription = createAction(
  '[Medical Records] Add Prescription',
  props<{ prescription: PrescriptionDraft }>()
);

export const addPrescriptionSuccess = createAction(
  '[Medical Records] Add Prescription Success',
  props<{ prescription: Prescription }>()
);

export const addAllergy = createAction(
  '[Medical Records] Add Allergy',
  props<{ allergy: AllergyDraft }>()
);

export const updateAllergy = createAction(
  '[Medical Records] Update Allergy',
  props<{ allergy: Allergy }>()
);

export const removeAllergy = createAction(
  '[Medical Records] Remove Allergy',
  props<{ allergyId: string }>()
);

export const addLabRequest = createAction(
  '[Medical Records] Add Lab Request',
  props<{ labRequest: LabRequestDraft }>()
);

export const addLabResult = createAction(
  '[Medical Records] Add Lab Result',
  props<{ labResult: LabResultDraft }>()
);

export const addVaccinationRecord = createAction(
  '[Medical Records] Add Vaccination Record',
  props<{ vaccinationRecord: VaccinationDraft }>()
);

export const addFollowUp = createAction(
  '[Medical Records] Add Follow Up',
  props<{ followUp: FollowUpDraft }>()
);
