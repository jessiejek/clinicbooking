import { Injectable, inject } from '@angular/core';
import { Observable, catchError, map, of } from 'rxjs';
import { ApiService } from '../../../core/services/api.service';
import {
  DayOfWeek,
  Doctor,
  DoctorBlockedDate,
  DoctorSchedule,
  DoctorStatus
} from '../../../core/models';

type NullableString = string | null | undefined;

interface DoctorDto {
  id: string;
  userId?: NullableString;
  fullName?: NullableString;
  firstName?: NullableString;
  middleName?: NullableString;
  lastName?: NullableString;
  specialization?: NullableString;
  bio?: NullableString;
  profilePhotoUrl?: NullableString;
  avatarUrl?: NullableString;
  licenseNumber?: NullableString;
  ptrNumber?: NullableString;
  s2Number?: NullableString;
  consultationFee?: number | null;
  slotDurationMinutes?: number | null;
  slotCapacity?: number | null;
  dailyPatientLimit?: number | null;
  status?: DoctorStatus | string | null;
  averageRating?: number | null;
  reviewCount?: number | null;
}

interface DoctorScheduleDto {
  id: string;
  doctorId?: NullableString;
  dayOfWeek?: DayOfWeek | string | null;
  startTime?: NullableString;
  endTime?: NullableString;
}

interface BlockedDateDto {
  id: string;
  doctorId?: NullableString;
  blockedDate?: NullableString;
  reason?: NullableString;
}

export interface DoctorSummary extends Doctor {}

export type DoctorDetail = Doctor;

export interface CreateDoctorDto {
  fullName: string;
  specialization: string;
  bio?: string;
  licenseNumber?: string;
  ptrNumber?: string;
  s2Number?: string;
  consultationFee: number;
  slotDurationMinutes: number;
  slotCapacity: number;
  dailyPatientLimit: number | null;
  doctorEmail: string;
  tempPassword: string;
}

export type UpdateDoctorDto = Partial<CreateDoctorDto>;

export interface UpsertSchedulesDto {
  schedules: Array<Pick<DoctorSchedule, 'dayOfWeek' | 'startTime' | 'endTime'>>;
}

export interface BlockDateDto {
  blockedDate: string;
  reason?: string;
}

export type BlockedDate = DoctorBlockedDate;

@Injectable({ providedIn: 'root' })
export class AdminDoctorsService {
  private readonly apiService = inject(ApiService);

  getAllDoctors(): Observable<DoctorSummary[]> {
    return this.apiService.get<DoctorDto[]>('/doctors/admin').pipe(
      map((doctors) => doctors.map((doctor) => mapDoctorDto(doctor)))
    );
  }

  getDoctors(): Observable<DoctorSummary[]> {
    return this.getAllDoctors();
  }

  createDoctor(dto: CreateDoctorDto): Observable<DoctorDetail> {
    return this.apiService.post<DoctorDto>('/doctors', dto).pipe(map((doctor) => mapDoctorDto(doctor)));
  }

  addDoctor(doctor: CreateDoctorDto): Observable<DoctorDetail> {
    return this.createDoctor(doctor);
  }

  updateDoctor(id: string, dto: UpdateDoctorDto): Observable<DoctorDetail> {
    return this.apiService.put<DoctorDto>(`/doctors/${id}`, dto).pipe(map((doctor) => mapDoctorDto(doctor)));
  }

  updateDoctorLegacy(doctor: Doctor): Observable<DoctorDetail> {
    return this.updateDoctor(doctor.id, doctor);
  }

  deactivateDoctor(id: string): Observable<void> {
    return this.apiService.delete<void>(`/doctors/${id}`);
  }

  getSchedule(id: string): Observable<DoctorSchedule[]> {
    return this.apiService.get<DoctorScheduleDto[]>(`/doctors/${id}/schedule`).pipe(
      map((schedules) => schedules.map((schedule) => mapDoctorScheduleDto(schedule)))
    );
  }

  updateSchedule(id: string, dto: UpsertSchedulesDto): Observable<DoctorSchedule[]> {
    return this.apiService.put<DoctorScheduleDto[]>(`/doctors/${id}/schedule`, dto).pipe(
      map((schedules) => schedules.map((schedule) => mapDoctorScheduleDto(schedule)))
    );
  }

  getBlockedDates(id: string): Observable<BlockedDate[]> {
    return this.apiService.get<BlockedDateDto[]>(`/doctors/${id}/blocked-dates`).pipe(
      map((dates) => dates.map((date) => mapBlockedDateDto(date)))
    );
  }

  addBlockedDate(id: string, dto: BlockDateDto): Observable<BlockedDate> {
    return this.apiService.post<BlockedDateDto>(`/doctors/${id}/blocked-dates`, dto).pipe(
      map((date) => mapBlockedDateDto(date))
    );
  }

  deleteBlockedDate(doctorId: string, bdId: string): Observable<void> {
    return this.apiService.delete<void>(`/doctors/${doctorId}/blocked-dates/${bdId}`);
  }
}

function mapDoctorDto(dto: DoctorDto): DoctorSummary {
  const fullName = resolveDoctorName(dto);
  return {
    id: dto.id,
    userId: normalizeString(dto.userId) || dto.id,
    fullName,
    specialization: normalizeString(dto.specialization) || '',
    bio: normalizeString(dto.bio),
    profilePhotoUrl: normalizeString(dto.profilePhotoUrl ?? dto.avatarUrl),
    licenseNumber: normalizeString(dto.licenseNumber),
    ptrNumber: normalizeString(dto.ptrNumber),
    s2Number: normalizeString(dto.s2Number),
    consultationFee: dto.consultationFee ?? 0,
    slotDurationMinutes: dto.slotDurationMinutes ?? 30,
    slotCapacity: dto.slotCapacity ?? 1,
    dailyPatientLimit: dto.dailyPatientLimit ?? null,
    status: (dto.status as DoctorStatus) ?? 'Active',
    averageRating: dto.averageRating ?? undefined,
    reviewCount: dto.reviewCount ?? undefined
  };
}

function mapDoctorScheduleDto(dto: DoctorScheduleDto): DoctorSchedule {
  return {
    id: dto.id,
    doctorId: normalizeString(dto.doctorId) || '',
    dayOfWeek: (dto.dayOfWeek as DayOfWeek) ?? 'Monday',
    startTime: normalizeString(dto.startTime) || '00:00',
    endTime: normalizeString(dto.endTime) || '00:00'
  };
}

function mapBlockedDateDto(dto: BlockedDateDto): BlockedDate {
  return {
    id: dto.id,
    doctorId: normalizeString(dto.doctorId) || '',
    blockedDate: normalizeString(dto.blockedDate) || '',
    reason: normalizeString(dto.reason)
  };
}

function resolveDoctorName(dto: DoctorDto): string {
  const explicitName = normalizeString(dto.fullName);
  if (explicitName) {
    return explicitName;
  }

  const parts = [dto.firstName, dto.middleName, dto.lastName]
    .map((value) => normalizeString(value))
    .filter((value): value is string => Boolean(value));

  return parts.length ? parts.join(' ') : 'Doctor';
}

function normalizeString(value: NullableString): string | undefined {
  const trimmed = value?.trim();
  return trimmed ? trimmed : undefined;
}
