import { HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, catchError, map, of, shareReplay, throwError } from 'rxjs';
import { delay } from 'rxjs/operators';
import {
  Announcement,
  ClinicSettings,
  DayOfWeek,
  Doctor,
  DoctorSchedule,
  DoctorStatus,
  Review,
  Service,
  ServiceCategory
} from '../../../core/models';
import { ApiService } from '../../../core/services/api.service';
import { ClinicSettingsService } from '../../../core/services/clinic-settings.service';
import { MockDataService } from '../../../core/services/mock-data.service';

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
  fee?: number | null;
  slotDurationMinutes?: number | null;
  slotCapacity?: number | null;
  dailyPatientLimit?: number | null;
  status?: DoctorStatus | string | null;
  isActive?: boolean | null;
  workingDays?: string[] | null;
  schedule?: DoctorScheduleDto[] | null;
  averageRating?: number | null;
  reviewCount?: number | null;
  services?: ServiceDto[] | null;
}

interface ServiceDto {
  id: string;
  name?: NullableString;
  description?: NullableString;
  estimatedDurationMinutes?: number | null;
  price?: number | null;
  category?: ServiceCategory | string | null;
  doctorIds?: string[] | null;
  isActive?: boolean | null;
}

interface DoctorScheduleDto {
  id: string;
  doctorId?: NullableString;
  dayOfWeek?: DayOfWeek | string | null;
  startTime?: NullableString;
  endTime?: NullableString;
}

interface AvailableSlotDto {
  slotStartTime?: NullableString;
  slotEndTime?: NullableString;
  isAvailable?: boolean | null;
  bookedCount?: number | null;
  capacity?: number | null;
  // Backward-compatible aliases for older payloads.
  time?: NullableString;
  endTime?: NullableString;
  IsAvailable?: boolean | null;
}

export interface DoctorSummary extends Doctor {}

export type DoctorDetail = (Doctor & { services?: Service[] }) | undefined;

export interface AvailableSlot {
  slotStartTime: string;
  slotEndTime: string;
  isAvailable: boolean;
  bookedCount: number;
  capacity: number;
  time: string;
  endTime: string;
  IsAvailable: boolean;
}

@Injectable({ providedIn: 'root' })
export class PublicService {
  private readonly apiService = inject(ApiService);
  private readonly clinicSettingsService = inject(ClinicSettingsService);
  private readonly mockData = inject(MockDataService);

  private doctorsCache$?: Observable<DoctorSummary[]>;
  private servicesCache$?: Observable<Service[]>;

  getDoctors(forceRefresh = false): Observable<DoctorSummary[]> {
    if (forceRefresh) {
      this.doctorsCache$ = undefined;
    }

    if (!this.doctorsCache$) {
      this.doctorsCache$ = this.apiService.get<DoctorDto[]>('/doctors').pipe(
        map((doctors) => doctors.map((doctor) => mapDoctorDto(doctor))),
        catchError((error: unknown) => {
          this.doctorsCache$ = undefined;
          return throwError(() => error);
        }),
        shareReplay({ bufferSize: 1, refCount: false })
      );
    }

    return this.doctorsCache$;
  }

  refreshDoctors(): Observable<DoctorSummary[]> {
    return this.getDoctors(true);
  }

  getDoctorById(id: string): Observable<DoctorDetail> {
    return this.refreshDoctorById(id).pipe(
      catchError(() => of(undefined))
    );
  }

  refreshDoctorById(id: string): Observable<DoctorDetail> {
    return this.apiService.get<DoctorDto>(`/doctors/${id}`).pipe(
      map((doctor) => mapDoctorDetailDto(doctor)),
    );
  }

  getServices(): Observable<Service[]> {
    if (!this.servicesCache$) {
      this.servicesCache$ = this.apiService.get<ServiceDto[]>('/services').pipe(
        map((services) => services.map((service) => mapServiceDto(service))),
        catchError((error: unknown) => {
          this.servicesCache$ = undefined;
          return throwError(() => error);
        }),
        shareReplay({ bufferSize: 1, refCount: false })
      );
    }

    return this.servicesCache$;
  }

  getAvailableSlots(doctorId: string, date: string): Observable<AvailableSlot[]> {
    const params = new HttpParams().set('date', date);
    return this.apiService.get<AvailableSlotDto[]>(`/doctors/${doctorId}/available-slots`, { params }).pipe(
      map((slots) => slots.map((slot) => mapAvailableSlotDto(slot)))
    );
  }

  getAnnouncements(): Observable<Announcement[]> {
    return of(this.mockData.announcements.filter((a) => a.isActive)).pipe(delay(300));
  }

  getClinicSettings(): Observable<ClinicSettings> {
    return this.clinicSettingsService.settings$;
  }

  getDoctorReviews(doctorId: string): Observable<Review[]> {
    return of(this.mockData.reviews.filter((r) => r.doctorId === doctorId)).pipe(delay(200));
  }

  getDoctorServices(doctorId: string): Observable<Service[]> {
    return this.getServices().pipe(
      map((services) => services.filter((service) => service.doctorIds.includes(doctorId))),
      catchError(() => of([]))
    );
  }

  getDoctorSchedules(doctorId: string): Observable<DoctorSchedule[]> {
    return this.apiService.get<DoctorScheduleDto[]>(`/doctors/${doctorId}/schedule`).pipe(
      map((schedules) => schedules.map((schedule) => mapDoctorScheduleDto(schedule))),
      catchError(() => of([]))
    );
  }
}

const DOCTOR_STATUSES: DoctorStatus[] = ['Active', 'Inactive', 'OnLeave'];

function mapDoctorDto(dto: DoctorDto): DoctorSummary {
  const fullName = resolveDoctorName(dto);
  const status = normalizeDoctorStatus(dto.status) ?? (dto.isActive === false ? 'Inactive' : 'Active');
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
    consultationFee: dto.consultationFee ?? dto.fee ?? 0,
    slotDurationMinutes: dto.slotDurationMinutes ?? 30,
    slotCapacity: dto.slotCapacity ?? 1,
    dailyPatientLimit: dto.dailyPatientLimit ?? null,
    status,
    isActive: dto.isActive ?? status === 'Active',
    workingDays: normalizeStringArray(dto.workingDays),
    schedule: dto.schedule?.map((schedule) => mapDoctorScheduleDto(schedule)),
    averageRating: dto.averageRating ?? undefined,
    reviewCount: dto.reviewCount ?? undefined
  };
}

function mapDoctorDetailDto(dto: DoctorDto): DoctorDetail {
  return {
    ...mapDoctorDto(dto),
    services: (dto.services ?? []).map((service) => mapServiceDto(service))
  };
}

function mapServiceDto(dto: ServiceDto): Service {
  return {
    id: dto.id,
    name: normalizeString(dto.name) || '',
    description: normalizeString(dto.description),
    estimatedDurationMinutes: dto.estimatedDurationMinutes ?? 0,
    price: dto.price ?? 0,
    category: (dto.category as ServiceCategory) ?? 'Consultation',
    doctorIds: dto.doctorIds ?? []
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

function mapAvailableSlotDto(dto: AvailableSlotDto): AvailableSlot {
  const slotStartTime = normalizeString(dto.slotStartTime ?? dto.time) || '';
  const slotEndTime = normalizeString(dto.slotEndTime ?? dto.endTime) || '';
  const isAvailable = dto.isAvailable ?? dto.IsAvailable ?? true;

  return {
    slotStartTime,
    slotEndTime,
    isAvailable,
    bookedCount: dto.bookedCount ?? 0,
    capacity: dto.capacity ?? 0,
    time: slotStartTime,
    endTime: slotEndTime,
    IsAvailable: isAvailable
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

function normalizeStringArray(values: unknown): string[] | undefined {
  if (!Array.isArray(values)) {
    return undefined;
  }

  const normalized = values
    .map((value) => (typeof value === 'string' ? value.trim() : ''))
    .filter((value) => value.length > 0);

  return normalized.length ? normalized : undefined;
}

function normalizeDoctorStatus(value: unknown): DoctorStatus | undefined {
  if (typeof value !== 'string') {
    return undefined;
  }

  const normalized = value.trim().toLowerCase();
  return DOCTOR_STATUSES.find((item) => item.toLowerCase() === normalized);
}
