import { Injectable, inject } from '@angular/core';
import { BehaviorSubject, Observable, map } from 'rxjs';
import {
  Allergy,
  Consultation,
  FollowUp,
  LabRequest,
  LabResult,
  Prescription,
  VaccinationRecord
} from '../models';
import { MockDataService } from './mock-data.service';

export interface MedicalRecordsState {
  consultations: Consultation[];
  prescriptions: Prescription[];
  allergies: Allergy[];
  labRequests: LabRequest[];
  labResults: LabResult[];
  vaccinations: VaccinationRecord[];
  followUps: FollowUp[];
  isLoading: boolean;
  error: string | null;
}

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

const buildId = (prefix: string, currentId?: string): string =>
  currentId && currentId.trim().length > 0 ? currentId : `${prefix}-${Date.now()}`;

const sortNewestFirstByDate = <T>(items: T[], readDate: (item: T) => string): T[] =>
  [...items].sort((a, b) => new Date(readDate(b)).getTime() - new Date(readDate(a)).getTime());

@Injectable({ providedIn: 'root' })
export class MedicalRecordsService {
  private readonly mockData = inject(MockDataService);
  private readonly stateSubject = new BehaviorSubject<MedicalRecordsState>(this.readState(false));

  readonly state$ = this.stateSubject.asObservable();
  readonly isLoading$ = this.state$.pipe(map((state) => state.isLoading));
  readonly consultations$ = this.state$.pipe(map((state) => state.consultations));
  readonly prescriptions$ = this.state$.pipe(map((state) => state.prescriptions));
  readonly labRequests$ = this.state$.pipe(map((state) => state.labRequests));

  get snapshot(): MedicalRecordsState {
    return this.stateSubject.value;
  }

  refresh(): void {
    this.stateSubject.next(this.readState(false));
  }

  getConsultationByBookingId(bookingId: string): Observable<Consultation | undefined> {
    return this.consultations$.pipe(
      map((consultations) => consultations.find((item) => item.bookingId === bookingId))
    );
  }

  getConsultationsByPatientId(patientId: string): Observable<Consultation[]> {
    return this.consultations$.pipe(
      map((items) =>
        items
          .filter((item) => item.patientId === patientId)
          .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
      )
    );
  }

  getConsultationsByDoctorId(doctorId: string): Observable<Consultation[]> {
    return this.consultations$.pipe(
      map((items) =>
        items
          .filter((item) => item.doctorId === doctorId)
          .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
      )
    );
  }

  getPrescriptionsByPatientId(patientId: string): Observable<Prescription[]> {
    return this.prescriptions$.pipe(
      map((items) =>
        items
          .filter((item) => item.patientId === patientId)
          .sort((a, b) => new Date(b.issuedAt).getTime() - new Date(a.issuedAt).getTime())
      )
    );
  }

  getPrescriptionsByConsultationId(consultationId: string): Observable<Prescription[]> {
    return this.prescriptions$.pipe(
      map((items) =>
        items
          .filter((item) => item.consultationId === consultationId)
          .sort((a, b) => new Date(b.issuedAt).getTime() - new Date(a.issuedAt).getTime())
      )
    );
  }

  getAllergiesByPatientId(patientId: string): Observable<Allergy[]> {
    return this.state$.pipe(
      map((state) => state.allergies.filter((item) => item.patientId === patientId))
    );
  }

  getLabResultsByPatientId(patientId: string): Observable<LabResult[]> {
    return this.state$.pipe(
      map((state) =>
        state.labResults
          .filter((item) => item.patientId === patientId)
          .sort((a, b) => new Date(b.resultDate).getTime() - new Date(a.resultDate).getTime())
      )
    );
  }

  getLabRequestsByPatientId(patientId: string): Observable<LabRequest[]> {
    return this.labRequests$.pipe(
      map((items) =>
        items
          .filter((item) => item.patientId === patientId)
          .sort((a, b) => new Date(b.requestedAt).getTime() - new Date(a.requestedAt).getTime())
      )
    );
  }

  getLabRequestsByConsultationId(consultationId: string): Observable<LabRequest[]> {
    return this.labRequests$.pipe(
      map((items) =>
        items
          .filter((item) => item.consultationId === consultationId)
          .sort((a, b) => new Date(b.requestedAt).getTime() - new Date(a.requestedAt).getTime())
      )
    );
  }

  getVaccinationsByPatientId(patientId: string): Observable<VaccinationRecord[]> {
    return this.state$.pipe(
      map((state) =>
        state.vaccinations
          .filter((item) => item.patientId === patientId)
          .sort((a, b) => new Date(b.dateGiven).getTime() - new Date(a.dateGiven).getTime())
      )
    );
  }

  getFollowUpsByPatientId(patientId: string): Observable<FollowUp[]> {
    return this.state$.pipe(
      map((state) =>
        state.followUps
          .filter((item) => item.patientId === patientId)
          .sort((a, b) => new Date(b.followUpDate).getTime() - new Date(a.followUpDate).getTime())
      )
    );
  }

  saveConsultation(consultation: ConsultationDraft): Consultation {
    const now = new Date().toISOString();
    const saved = this.mockData.saveConsultation({
      id: buildId('consult', consultation.id),
      bookingId: consultation.bookingId,
      patientId: consultation.patientId,
      doctorId: consultation.doctorId,
      consultationDate: consultation.consultationDate,
      consultationTime: consultation.consultationTime,
      chiefComplaint: consultation.chiefComplaint,
      subjective: consultation.subjective,
      objective: consultation.objective,
      assessment: consultation.assessment,
      plan: consultation.plan,
      vitalSigns: consultation.vitalSigns,
      diagnoses: consultation.diagnoses ?? [],
      prescriptionIds: consultation.prescriptionIds ?? [],
      labRequestIds: consultation.labRequestIds ?? [],
      followUpDate: consultation.followUpDate,
      status: consultation.status ?? 'Draft',
      isLocked: consultation.status === 'Completed' ? true : consultation.isLocked ?? false,
      createdAt: consultation.createdAt ?? now,
      updatedAt: consultation.updatedAt ?? now,
      historyOfPresentIllness: consultation.historyOfPresentIllness,
      peGeneralFindings: consultation.peGeneralFindings,
      visitSummaryUrl: consultation.visitSummaryUrl
    });
    this.refresh();
    return saved;
  }

  updateConsultation(consultation: Consultation): Consultation {
    const saved = this.mockData.saveConsultation({
      ...consultation,
      updatedAt: consultation.updatedAt || new Date().toISOString()
    });
    this.refresh();
    return saved;
  }

  lockConsultation(consultationId: string): void {
    const consultation = this.mockData.getConsultationById(consultationId);
    if (!consultation) {
      return;
    }
    this.mockData.saveConsultation({
      ...consultation,
      isLocked: true,
      status: 'Locked',
      updatedAt: new Date().toISOString()
    });
    this.refresh();
  }

  addPrescription(prescription: PrescriptionDraft): Prescription {
    const saved = this.mockData.savePrescription({
      ...prescription,
      id: buildId('rx', prescription.id),
      issuedAt: prescription.issuedAt ?? new Date().toISOString(),
      status: prescription.status ?? 'Active',
      items: (prescription.items ?? []).map((item, index) => ({
        ...item,
        id: item.id || `rx-item-${Date.now()}-${index + 1}`,
        medicineName: item.medicineName || item.genericName || ''
      }))
    });
    this.refresh();
    return saved;
  }

  addAllergy(allergy: AllergyDraft): void {
    this.mockData.saveAllergy({ ...allergy, id: buildId('allergy', allergy.id) });
    this.refresh();
  }

  updateAllergy(allergy: Allergy): void {
    this.mockData.saveAllergy(allergy);
    this.refresh();
  }

  removeAllergy(allergyId: string): void {
    this.mockData.removeAllergy(allergyId);
    this.refresh();
  }

  addLabRequest(labRequest: LabRequestDraft): void {
    this.mockData.saveLabRequest({
      ...labRequest,
      id: buildId('labreq', labRequest.id),
      requestedAt: labRequest.requestedAt ?? new Date().toISOString(),
      status: labRequest.status ?? 'Requested'
    });
    this.refresh();
  }

  addLabResult(labResult: LabResultDraft): void {
    this.mockData.saveLabResult({
      ...labResult,
      id: buildId('labres', labResult.id),
      resultDate: labResult.resultDate ?? new Date().toISOString()
    });
    this.refresh();
  }

  addVaccinationRecord(vaccinationRecord: VaccinationDraft): void {
    this.mockData.saveVaccinationRecord({
      ...vaccinationRecord,
      id: buildId('vac', vaccinationRecord.id)
    });
    this.refresh();
  }

  addFollowUp(followUp: FollowUpDraft): void {
    this.mockData.saveFollowUp({ ...followUp, id: buildId('fu', followUp.id) });
    this.refresh();
  }

  private readState(isLoading: boolean): MedicalRecordsState {
    return {
      consultations: sortNewestFirstByDate(this.mockData.getConsultations(), (item) => item.updatedAt),
      prescriptions: sortNewestFirstByDate(this.mockData.getPrescriptions(), (item) => item.issuedAt),
      allergies: this.mockData.getAllergies(),
      labRequests: this.mockData.getLabRequests(),
      labResults: this.mockData.getLabResults(),
      vaccinations: this.mockData.getVaccinations(),
      followUps: this.mockData.getFollowUps(),
      isLoading,
      error: null
    };
  }
}
