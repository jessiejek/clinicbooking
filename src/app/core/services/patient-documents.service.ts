import { Injectable, inject } from '@angular/core';
import { map, Observable } from 'rxjs';
import {
  PatientDocument,
  PatientDocumentUploadRequest,
  PatientFollowUp,
  PatientLabResult,
  PatientLabResultUploadRequest,
  PatientMedicalRecord,
  PatientPrescription
} from '../models';
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

interface PatientDocumentDto {
  id: string;
  patientId: string;
  bookingId?: NullableString;
  consultationId?: NullableString;
  documentType?: NullableString;
  title?: NullableString;
  description?: NullableString;
  fileUrl?: NullableString;
  fileName?: NullableString;
  fileContentType?: NullableString;
  fileSize?: number | null;
  source?: NullableString;
  uploadedByUserId?: NullableString;
  uploadedAt: string;
  createdAt: string;
}

interface PatientLabResultDto {
  id: string;
  patientId: string;
  bookingId?: NullableString;
  consultationId?: NullableString;
  labOrderItemId?: NullableString;
  resultTitle?: NullableString;
  resultText?: NullableString;
  fileUrl?: NullableString;
  fileName?: NullableString;
  fileContentType?: NullableString;
  status?: NullableString;
  uploadedByUserId?: NullableString;
  uploadedAt: string;
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

  getMyDocuments(): Observable<PatientDocument[]> {
    return this.apiService.get<PatientDocumentDto[]>('/patients/me/documents').pipe(
      map((records) => (Array.isArray(records) ? records.map((record) => mapDocument(record)) : []))
    );
  }

  getPatientDocuments(patientId: string): Observable<PatientDocument[]> {
    return this.apiService.get<PatientDocumentDto[]>(`/patients/${encodeURIComponent(patientId)}/documents`).pipe(
      map((records) => (Array.isArray(records) ? records.map((record) => mapDocument(record)) : []))
    );
  }

  getMyLabResults(): Observable<PatientLabResult[]> {
    return this.apiService.get<PatientLabResultDto[]>('/patients/me/lab-results').pipe(
      map((records) => (Array.isArray(records) ? records.map((record) => mapLabResult(record)) : []))
    );
  }

  getPatientLabResults(patientId: string): Observable<PatientLabResult[]> {
    return this.apiService.get<PatientLabResultDto[]>(`/patients/${encodeURIComponent(patientId)}/lab-results`).pipe(
      map((records) => (Array.isArray(records) ? records.map((record) => mapLabResult(record)) : []))
    );
  }

  uploadMyDocument(request: PatientDocumentUploadRequest): Observable<PatientDocument> {
    return this.apiService.post<PatientDocumentDto>('/patients/me/documents', buildDocumentUploadFormData(request)).pipe(
      map((record) => mapDocument(record))
    );
  }

  uploadPatientDocument(patientId: string, request: PatientDocumentUploadRequest): Observable<PatientDocument> {
    return this.apiService
      .post<PatientDocumentDto>(
        `/patients/${encodeURIComponent(patientId)}/documents`,
        buildDocumentUploadFormData(request)
      )
      .pipe(map((record) => mapDocument(record)));
  }

  uploadMyLabResult(request: PatientLabResultUploadRequest): Observable<PatientLabResult> {
    return this.apiService
      .post<PatientLabResultDto>('/patients/me/lab-results', buildLabResultUploadFormData(request))
      .pipe(map((record) => mapLabResult(record)));
  }

  uploadPatientLabResult(patientId: string, request: PatientLabResultUploadRequest): Observable<PatientLabResult> {
    return this.apiService
      .post<PatientLabResultDto>(
        `/patients/${encodeURIComponent(patientId)}/lab-results`,
        buildLabResultUploadFormData(request)
      )
      .pipe(map((record) => mapLabResult(record)));
  }

  downloadFile(url: string): Observable<Blob> {
    return this.apiService.getBlob(url);
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

function mapDocument(dto: PatientDocumentDto): PatientDocument {
  return {
    id: dto.id,
    patientId: dto.patientId,
    bookingId: normalizeString(dto.bookingId),
    consultationId: normalizeString(dto.consultationId),
    documentType: normalizeString(dto.documentType) ?? 'Other',
    title: normalizeString(dto.title),
    description: normalizeString(dto.description),
    fileUrl: normalizeString(dto.fileUrl) ?? '',
    fileName: normalizeString(dto.fileName) ?? '',
    fileContentType: normalizeString(dto.fileContentType),
    fileSize: normalizeNumber(dto.fileSize),
    source: normalizeString(dto.source) ?? 'StaffUpload',
    uploadedByUserId: normalizeString(dto.uploadedByUserId),
    uploadedAt: dto.uploadedAt,
    createdAt: dto.createdAt
  };
}

function mapLabResult(dto: PatientLabResultDto): PatientLabResult {
  return {
    id: dto.id,
    patientId: dto.patientId,
    bookingId: normalizeString(dto.bookingId),
    consultationId: normalizeString(dto.consultationId),
    labOrderItemId: normalizeString(dto.labOrderItemId),
    resultTitle: normalizeString(dto.resultTitle),
    resultText: normalizeString(dto.resultText),
    fileUrl: normalizeString(dto.fileUrl) ?? '',
    fileName: normalizeString(dto.fileName) ?? '',
    fileContentType: normalizeString(dto.fileContentType),
    status: normalizeString(dto.status) ?? 'Uploaded',
    uploadedByUserId: normalizeString(dto.uploadedByUserId),
    uploadedAt: dto.uploadedAt,
    createdAt: dto.createdAt
  };
}

function buildDocumentUploadFormData(request: PatientDocumentUploadRequest): FormData {
  const formData = new FormData();
  appendOptional(formData, 'bookingId', request.bookingId);
  appendOptional(formData, 'consultationId', request.consultationId);
  appendOptional(formData, 'documentType', request.documentType);
  appendOptional(formData, 'title', request.title);
  appendOptional(formData, 'description', request.description);
  formData.append('file', request.file, request.file.name);
  return formData;
}

function buildLabResultUploadFormData(request: PatientLabResultUploadRequest): FormData {
  const formData = new FormData();
  appendOptional(formData, 'bookingId', request.bookingId);
  appendOptional(formData, 'consultationId', request.consultationId);
  appendOptional(formData, 'resultTitle', request.resultTitle);
  appendOptional(formData, 'resultText', request.resultText);
  formData.append('file', request.file, request.file.name);
  return formData;
}

function appendOptional(formData: FormData, name: string, value: string | undefined): void {
  const trimmed = value?.trim();
  if (trimmed) {
    formData.append(name, trimmed);
  }
}

function normalizeNumber(value: number | null | undefined): number | undefined {
  return typeof value === 'number' && Number.isFinite(value) ? value : undefined;
}

function normalizeString(value: NullableString): string | undefined {
  const trimmed = value?.trim();
  return trimmed ? trimmed : undefined;
}
