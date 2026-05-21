import { Injectable, inject } from '@angular/core';
import { map, Observable } from 'rxjs';
import { PatientFollowUp, PatientMedicalRecord, PatientPrescription } from '../models';
import { ApiService } from './api.service';

type NullableString = string | null | undefined;

interface PatientMedicalRecordDto {
  id: string;
  bookingId: string;
  patientId: string;
  doctorId: string;
  doctorName: string;
  appointmentDate: string;
  diagnosis?: NullableString;
  soapNotes?: NullableString;
  doctorNotes?: NullableString;
  followUpInstructions?: NullableString;
  followUpDate?: NullableString;
  notes?: NullableString;
  createdAt: string;
  updatedAt: string;
}

interface PatientPrescriptionItemDto {
  id: string;
  medicineName: string;
  genericName?: NullableString;
  dosageForm?: NullableString;
  strength?: NullableString;
  sig?: NullableString;
  quantity?: number | null;
  frequency?: NullableString;
  duration?: NullableString;
  instructions?: NullableString;
  isControlledSubstance?: boolean | null;
  route?: NullableString;
  routeDescription?: NullableString;
  unitOfMeasure?: NullableString;
  unitOfMeasureDescription?: NullableString;
  brandName?: NullableString;
  frequencyCode?: NullableString;
}

interface PatientPrescriptionDto {
  id: string;
  bookingId: string;
  patientId: string;
  doctorId: string;
  doctorName: string;
  appointmentDate: string;
  medicineName?: NullableString;
  genericName?: NullableString;
  strength?: NullableString;
  unit?: NullableString;
  route?: NullableString;
  frequency?: NullableString;
  duration?: NullableString;
  instructions?: NullableString;
  createdAt: string;
  items?: PatientPrescriptionItemDto[];
}

interface PatientFollowUpDto {
  id: string;
  bookingId: string;
  patientId: string;
  doctorId: string;
  doctorName: string;
  appointmentDate: string;
  followUpDate?: NullableString;
  followUpInstructions?: NullableString;
  notes?: NullableString;
  createdAt: string;
}

@Injectable({ providedIn: 'root' })
export class PatientDocumentsService {
  private readonly apiService = inject(ApiService);

  getMyMedicalRecords(): Observable<PatientMedicalRecord[]> {
    return this.apiService.get<PatientMedicalRecordDto[]>('/medical-records/me').pipe(
      map((records) => (Array.isArray(records) ? records.map((record) => mapMedicalRecord(record)) : []))
    );
  }

  getMyPrescriptions(): Observable<PatientPrescription[]> {
    return this.apiService.get<PatientPrescriptionDto[]>('/prescriptions/me').pipe(
      map((records) => (Array.isArray(records) ? records.map((record) => mapPrescription(record)) : []))
    );
  }

  getMyFollowUps(): Observable<PatientFollowUp[]> {
    return this.apiService.get<PatientFollowUpDto[]>('/follow-ups/me').pipe(
      map((records) => (Array.isArray(records) ? records.map((record) => mapFollowUp(record)) : []))
    );
  }

  downloadConsultationSummaryPdf(bookingId: string): Observable<Blob> {
    return this.apiService.getBlob(`/patient-documents/me/bookings/${encodeURIComponent(bookingId)}/pdf`);
  }

  downloadPrescriptionPdf(prescriptionId: string): Observable<Blob> {
    return this.apiService.getBlob(`/patient-documents/me/prescriptions/${encodeURIComponent(prescriptionId)}/pdf`);
  }

  downloadMedicalRecordPdf(recordId: string): Observable<Blob> {
    return this.apiService.getBlob(`/patient-documents/me/medical-records/${encodeURIComponent(recordId)}/pdf`);
  }

  downloadAllClinicalRecordsPdf(): Observable<Blob> {
    return this.apiService.getBlob('/patient-documents/me/all.pdf');
  }
}

function mapMedicalRecord(dto: PatientMedicalRecordDto): PatientMedicalRecord {
  return {
    id: dto.id,
    bookingId: dto.bookingId,
    patientId: dto.patientId,
    doctorId: dto.doctorId,
    doctorName: dto.doctorName,
    appointmentDate: normalizeString(dto.appointmentDate) ?? '',
    diagnosis: normalizeString(dto.diagnosis),
    soapNotes: normalizeString(dto.soapNotes),
    doctorNotes: normalizeString(dto.doctorNotes),
    followUpInstructions: normalizeString(dto.followUpInstructions),
    followUpDate: normalizeString(dto.followUpDate),
    notes: normalizeString(dto.notes),
    createdAt: dto.createdAt,
    updatedAt: dto.updatedAt
  };
}

function mapPrescription(dto: PatientPrescriptionDto): PatientPrescription {
  return {
    id: dto.id,
    bookingId: dto.bookingId,
    patientId: dto.patientId,
    doctorId: dto.doctorId,
    doctorName: dto.doctorName,
    appointmentDate: normalizeString(dto.appointmentDate) ?? '',
    medicineName: normalizeString(dto.medicineName),
    genericName: normalizeString(dto.genericName),
    strength: normalizeString(dto.strength),
    unit: normalizeString(dto.unit),
    route: normalizeString(dto.route),
    frequency: normalizeString(dto.frequency),
    duration: normalizeString(dto.duration),
    instructions: normalizeString(dto.instructions),
    createdAt: dto.createdAt,
    items: Array.isArray(dto.items) ? dto.items.map((item) => mapPrescriptionItem(item)) : []
  };
}

function mapPrescriptionItem(dto: PatientPrescriptionItemDto): PatientPrescription['items'][number] {
  return {
    id: dto.id,
    medicineName: dto.medicineName,
    genericName: normalizeString(dto.genericName),
    dosageForm: normalizeString(dto.dosageForm),
    strength: normalizeString(dto.strength),
    sig: normalizeString(dto.sig),
    quantity: typeof dto.quantity === 'number' && Number.isFinite(dto.quantity) ? dto.quantity : 1,
    frequency: normalizeString(dto.frequency),
    duration: normalizeString(dto.duration),
    instructions: normalizeString(dto.instructions),
    isControlledSubstance: dto.isControlledSubstance ?? undefined,
    route: normalizeString(dto.route),
    routeDescription: normalizeString(dto.routeDescription),
    unitOfMeasure: normalizeString(dto.unitOfMeasure),
    unitOfMeasureDescription: normalizeString(dto.unitOfMeasureDescription),
    brandName: normalizeString(dto.brandName),
    frequencyCode: normalizeString(dto.frequencyCode)
  };
}

function mapFollowUp(dto: PatientFollowUpDto): PatientFollowUp {
  return {
    id: dto.id,
    bookingId: dto.bookingId,
    patientId: dto.patientId,
    doctorId: dto.doctorId,
    doctorName: dto.doctorName,
    appointmentDate: normalizeString(dto.appointmentDate) ?? '',
    followUpDate: normalizeString(dto.followUpDate),
    followUpInstructions: normalizeString(dto.followUpInstructions),
    notes: normalizeString(dto.notes),
    createdAt: dto.createdAt
  };
}

function normalizeString(value: NullableString): string | undefined {
  const trimmed = value?.trim();
  return trimmed ? trimmed : undefined;
}
